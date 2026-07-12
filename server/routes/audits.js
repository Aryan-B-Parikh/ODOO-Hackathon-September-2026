import express from 'express';
import prisma from '../db.js';
import { authMiddleware, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Helper to map DB condition to frontend condition
const mapConditionToFrontend = (dbCond) => {
  const mapping = {
    NEW: 'Excellent',
    EXCELLENT: 'Excellent',
    GOOD: 'Good',
    FAIR: 'Fair',
    POOR: 'Poor',
    DAMAGED: 'Damaged'
  };
  return mapping[dbCond] || 'Good';
};

// Helper to map frontend condition to DB condition
const mapConditionToDb = (feCond) => {
  const mapping = {
    Excellent: 'EXCELLENT',
    Good: 'GOOD',
    Fair: 'FAIR',
    Poor: 'POOR',
    Damaged: 'DAMAGED'
  };
  return mapping[feCond] || 'GOOD';
};

// GET all audit cycles
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cycles = await prisma.auditCycle.findMany({
      where: { isDeleted: false },
      include: {
        scopeDepartment: true,
        results: {
          include: { asset: true }
        }
      }
    });

    const formatted = cycles.map(c => ({
      id: c.id,
      cycleName: c.name,
      startDate: c.startDate.toISOString().split('T')[0],
      endDate: c.endDate.toISOString().split('T')[0],
      status: c.status === 'ACTIVE' ? 'In Progress' : (c.status === 'COMPLETED' ? 'Completed' : 'Planned'),
      department: c.scopeDepartment ? c.scopeDepartment.name : 'All Departments',
      items: c.results.map(r => ({
        assetId: r.assetId,
        assetName: r.asset.name,
        verified: r.status === 'VERIFIED',
        condition: mapConditionToFrontend(r.asset.condition), // Expected condition
        remarks: r.notes || ''
      })),
      timeline: [
        { date: c.createdAt.toISOString().split('T')[0], event: 'Audit Cycle Initiated' }
      ]
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve audits.' });
  }
});

// POST start new audit cycle
router.post('/', authMiddleware, checkRole(['Admin', 'Auditor']), async (req, res) => {
  const { cycleName, startDate, endDate, department } = req.body;
  if (!cycleName || !department) {
    return res.status(400).json({ error: 'Cycle Name and Department are required.' });
  }

  try {
    // Resolve department
    const dept = await prisma.department.findFirst({
      where: { name: department, isDeleted: false }
    });
    if (!dept) {
      return res.status(400).json({ error: `Department '${department}' does not exist.` });
    }

    // Get all assets in department
    const assets = await prisma.asset.findMany({
      where: { departmentId: dept.id, isDeleted: false }
    });

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default

    const result = await prisma.$transaction(async (tx) => {
      const cycle = await tx.auditCycle.create({
        data: {
          name: cycleName,
          startDate: start,
          endDate: end,
          scopeDepartmentId: dept.id,
          status: 'ACTIVE',
          createdById: req.user.employeeId,
          organizationId: req.user.organizationId
        }
      });

      // Create AuditAssetResult in PENDING status for all assets
      if (assets.length > 0) {
        await tx.auditAssetResult.createMany({
          data: assets.map(a => ({
            auditCycleId: cycle.id,
            assetId: a.id,
            auditorId: req.user.employeeId,
            status: 'PENDING',
            organizationId: req.user.organizationId
          }))
        });
      }

      return cycle;
    });

    res.status(201).json({
      id: result.id,
      cycleName: result.name,
      startDate: result.startDate.toISOString().split('T')[0],
      endDate: result.endDate.toISOString().split('T')[0],
      status: 'In Progress',
      department: department,
      items: assets.map(a => ({
        assetId: a.id,
        assetName: a.name,
        verified: false,
        condition: mapConditionToFrontend(a.condition),
        remarks: ''
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to initiate audit cycle.' });
  }
});

// PUT save checklist progress & raise discrepancies
router.put('/:id/checklist', authMiddleware, checkRole(['Admin', 'Auditor']), async (req, res) => {
  const { id } = req.params;
  const { items } = req.body; // Array of { assetId, verified, condition (audited condition), remarks }

  try {
    const cycle = await prisma.auditCycle.findUnique({
      where: { id },
      include: { results: true }
    });
    if (!cycle) {
      return res.status(404).json({ error: 'Audit cycle not found.' });
    }

    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        // Find result record
        const resultRecord = await tx.auditAssetResult.findFirst({
          where: { auditCycleId: id, assetId: item.assetId }
        });

        if (!resultRecord) continue;

        // Fetch registered asset
        const asset = await tx.asset.findUnique({ where: { id: item.assetId } });
        if (!asset) continue;

        const isVerified = !!item.verified;
        const auditedCond = mapConditionToDb(item.condition);
        const hasMismatch = auditedCond !== asset.condition;
        const isDamaged = auditedCond === 'DAMAGED' || auditedCond === 'POOR';

        // Update AuditAssetResult
        await tx.auditAssetResult.update({
          where: { id: resultRecord.id },
          data: {
            status: isVerified ? 'VERIFIED' : 'PENDING',
            notes: `Audited Condition: ${item.condition}. ${item.remarks || ''}`,
            verifiedAt: isVerified ? new Date() : null
          }
        });

        // Raise Discrepancy if mismatch or damaged
        if (isVerified && (hasMismatch || isDamaged)) {
          // Check if discrepancy already open
          const existingDisc = await tx.auditDiscrepancy.findFirst({
            where: { auditAssetResultId: resultRecord.id, resolutionStatus: 'OPEN' }
          });

          if (!existingDisc) {
            await tx.auditDiscrepancy.create({
              data: {
                auditCycleId: id,
                assetId: item.assetId,
                auditAssetResultId: resultRecord.id,
                reportedStatus: isDamaged ? 'DAMAGED' : 'MISSING', // mapped categories
                resolutionStatus: 'OPEN',
                organizationId: req.user.organizationId
              }
            });
          }
        }
      }

      // Check if all items in cycle are verified
      const allResults = await tx.auditAssetResult.findMany({ where: { auditCycleId: id } });
      const allVerified = allResults.every(r => r.status === 'VERIFIED');
      if (allVerified) {
        await tx.auditCycle.update({
          where: { id },
          data: {
            status: 'COMPLETED',
            closedById: req.user.employeeId,
            closedAt: new Date()
          }
        });
      }
    });

    res.json({ success: true, message: 'Audit checklist progress saved.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update audit progress.' });
  }
});

// GET all discrepancies
router.get('/discrepancies', authMiddleware, async (req, res) => {
  try {
    const discs = await prisma.auditDiscrepancy.findMany({
      where: { resolutionStatus: 'OPEN', isDeleted: false },
      include: {
        auditCycle: true,
        asset: true,
        auditAssetResult: true
      }
    });

    const formatted = discs.map(d => {
      // Extract audited condition from result notes
      const notes = d.auditAssetResult.notes || '';
      const match = notes.match(/Audited Condition: ([a-zA-Z]+)\./);
      const auditedCondition = match ? match[1] : 'Damaged';

      return {
        id: d.id,
        auditId: d.auditCycleId,
        auditName: d.auditCycle.name,
        assetId: d.assetId,
        assetName: d.asset.name,
        expectedCondition: mapConditionToFrontend(d.asset.condition),
        actualCondition: auditedCondition,
        remarks: notes.split('. ').slice(1).join('. '),
        reason: d.reportedStatus === 'DAMAGED' ? 'Asset Damaged' : 'Condition Mismatch'
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve discrepancies.' });
  }
});

// POST reconcile discrepancy
router.post('/discrepancies/:id/reconcile', authMiddleware, checkRole(['Admin', 'Auditor']), async (req, res) => {
  const { id } = req.params;
  const { actualCondition, resolutionNotes } = req.body;

  try {
    const disc = await prisma.auditDiscrepancy.findUnique({
      where: { id },
      include: { asset: true, auditAssetResult: true }
    });

    if (!disc || disc.resolutionStatus !== 'OPEN') {
      return res.status(404).json({ error: 'Active discrepancy record not found.' });
    }

    const reconciledCond = mapConditionToDb(actualCondition);

    await prisma.$transaction(async (tx) => {
      // 1. Resolve discrepancy record
      await tx.auditDiscrepancy.update({
        where: { id },
        data: {
          resolutionStatus: 'RESOLVED',
          resolvedById: req.user.employeeId,
          resolvedAt: new Date(),
          resolutionNotes: resolutionNotes || 'Reconciled condition'
        }
      });

      // 2. Sync main Asset configuration
      await tx.asset.update({
        where: { id: disc.assetId },
        data: {
          condition: reconciledCond
        }
      });

      // 3. Update result notes to indicate resolution
      await tx.auditAssetResult.update({
        where: { id: disc.auditAssetResultId },
        data: {
          notes: `${disc.auditAssetResult.notes || ''} Reconciled: Condition set to ${actualCondition}.`
        }
      });
    });

    res.json({ success: true, message: 'Discrepancy reconciled successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to reconcile discrepancy.' });
  }
});

export default router;
