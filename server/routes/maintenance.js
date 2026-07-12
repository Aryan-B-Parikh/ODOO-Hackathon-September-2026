import express from 'express';
import prisma from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { logActivity } from '../utils/activity.js';

const router = express.Router();

// Helper to map DB maintenance status to frontend Kanban status
const mapStatusToFrontend = (dbStatus) => {
  if (['PENDING', 'APPROVED', 'REJECTED'].includes(dbStatus)) return 'Backlog';
  if (['TECHNICIAN_ASSIGNED', 'IN_PROGRESS'].includes(dbStatus)) return 'In Progress';
  if (dbStatus === 'RESOLVED') return 'Review';
  return 'Completed'; // Custom final closed status
};

// Helper to map frontend Kanban status to DB maintenance status
const mapStatusToDb = (feStatus, hasTech) => {
  if (feStatus === 'In Progress') return 'IN_PROGRESS';
  if (feStatus === 'Review') return 'RESOLVED';
  if (feStatus === 'Completed') return 'RESOLVED'; // Resolved counts as Completed in standard flow
  return hasTech ? 'TECHNICIAN_ASSIGNED' : 'PENDING'; // Backlog maps based on assignment
};

// Helper to map DB priority to frontend priority
const mapPriorityToFrontend = (dbPriority) => {
  if (dbPriority === 'CRITICAL' || dbPriority === 'HIGH') return 'High';
  if (dbPriority === 'LOW') return 'Low';
  return 'Medium';
};

// Helper to map frontend priority to DB priority
const mapPriorityToDb = (fePriority) => {
  if (fePriority === 'High') return 'HIGH';
  if (fePriority === 'Low') return 'LOW';
  return 'MEDIUM';
};

// GET all maintenance tickets
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tickets = await prisma.maintenanceRequest.findMany({
      where: { isDeleted: false },
      include: {
        asset: true,
        technician: true,
        workLogs: {
          include: { technician: true }
        },
        attachments: true
      }
    });

    const formatted = tickets.map(t => {
      const totalLaborHours = t.workLogs.reduce((sum, wl) => sum + (parseFloat(wl.laborHours) || 0), 0);
      const comments = t.workLogs.map(wl => ({
        author: wl.technician.name,
        text: wl.notes || '',
        date: wl.createdAt.toLocaleString('en-US')
      }));

      // Calculate progress rate
      let progress = 0;
      const feStatus = mapStatusToFrontend(t.status);
      if (feStatus === 'In Progress') progress = 50;
      if (feStatus === 'Review') progress = 85;
      if (feStatus === 'Completed') progress = 100;

      return {
        id: t.id,
        title: t.description.split('\n')[0] || 'Maintenance Task',
        priority: mapPriorityToFrontend(t.priority),
        progress,
        status: feStatus,
        assignedTo: t.technician ? t.technician.name : 'Unassigned',
        avatar: t.technician?.avatar || '',
        due: t.resolvedAt ? 'Completed' : 'Due in 3 days',
        comments,
        laborHours: totalLaborHours || t.workLogs.length, // Fallback if hours not specified
        estimatedCost: t.estimatedCost ? t.estimatedCost.toString() : '0',
        actualCost: t.actualCost ? t.actualCost.toString() : '0',
        attachments: t.attachments.map(a => a.name),
        resolutionNotes: t.resolutionNotes || '',
        assetId: t.assetId,
        assetName: t.asset.name
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve maintenance tickets.' });
  }
});

// POST create maintenance ticket
router.post('/', authMiddleware, async (req, res) => {
  const { title, priority, status, assignedTo, assetId, estimatedCost } = req.body;
  if (!title || !assetId) {
    return res.status(400).json({ error: 'Title and Asset ID are required.' });
  }

  try {
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    // Resolve technician
    let technicianId = null;
    if (assignedTo && assignedTo !== 'Unassigned') {
      const tech = await prisma.employee.findFirst({
        where: { name: assignedTo, isDeleted: false }
      });
      if (tech) technicianId = tech.id;
    }

    const dbStatus = mapStatusToDb(status || 'Backlog', !!technicianId);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Maintenance Request
      const request = await tx.maintenanceRequest.create({
        data: {
          assetId,
          raisedById: req.user.employeeId,
          description: title,
          priority: mapPriorityToDb(priority || 'Medium'),
          status: dbStatus,
          technicianId,
          estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
          organizationId: req.user.organizationId
        },
        include: { asset: true, technician: true }
      });

      // 2. Business Rule: Lock asset as UNDER_MAINTENANCE
      await tx.asset.update({
        where: { id: assetId },
        data: { status: 'UNDER_MAINTENANCE' }
      });

      await logActivity({
        userId: req.user.userId,
        action: 'CREATE_MAINTENANCE',
        entityType: 'MaintenanceRequest',
        entityId: request.id,
        moduleName: 'MAINTENANCE'
      }, tx);

      return request;
    });

    res.status(201).json({
      id: result.id,
      title: result.description,
      priority: priority || 'Medium',
      progress: 0,
      status: status || 'Backlog',
      assignedTo: assignedTo || 'Unassigned',
      avatar: result.technician?.avatar || '',
      due: 'Due in 3 days',
      comments: [],
      laborHours: 0,
      estimatedCost: estimatedCost || '0',
      actualCost: '0',
      attachments: [],
      resolutionNotes: '',
      assetId,
      assetName: result.asset.name
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create maintenance ticket.' });
  }
});

// PUT update ticket (includes costs logging, comments/resolutionNotes updates)
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { priority, assignedTo, estimatedCost, actualCost, laborHours, resolutionNotes, status } = req.body;

  try {
    const ticket = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { asset: true }
    });
    if (!ticket) {
      return res.status(404).json({ error: 'Maintenance ticket not found.' });
    }

    // Resolve technician
    let technicianId = undefined;
    if (assignedTo !== undefined) {
      if (assignedTo === 'Unassigned') {
        technicianId = null;
      } else {
        const tech = await prisma.employee.findFirst({
          where: { name: assignedTo, isDeleted: false }
        });
        if (tech) technicianId = tech.id;
      }
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update MaintenanceRequest fields
      const updatedStatus = status ? mapStatusToDb(status, !!technicianId) : undefined;
      
      const reqUpdate = await tx.maintenanceRequest.update({
        where: { id },
        data: {
          priority: priority ? mapPriorityToDb(priority) : undefined,
          technicianId,
          estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
          actualCost: actualCost ? parseFloat(actualCost) : undefined,
          resolutionNotes,
          status: updatedStatus,
          resolvedAt: status === 'Completed' ? new Date() : undefined
        }
      });

      // 2. If status was changed to Completed/Review, release the asset back to AVAILABLE
      if (status === 'Completed') {
        await tx.asset.update({
          where: { id: ticket.assetId },
          data: { status: 'AVAILABLE' }
        });
      }

      // 3. Log labor hours as work log if provided
      if (laborHours && req.user.employeeId) {
        await tx.maintenanceWorkLog.create({
          data: {
            maintenanceRequestId: id,
            technicianId: req.user.employeeId,
            status: updatedStatus || ticket.status,
            notes: resolutionNotes || 'Labor logged',
            laborHours: parseFloat(laborHours),
            organizationId: req.user.organizationId
          }
        });
      }

      await logActivity({
        userId: req.user.userId,
        action: 'UPDATE_MAINTENANCE',
        entityType: 'MaintenanceRequest',
        entityId: id,
        moduleName: 'MAINTENANCE'
      }, tx);
    });

    res.json({ success: true, message: 'Ticket updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update maintenance ticket.' });
  }
});

// POST move ticket column (Kanban Drag and Drop support)
router.post('/:id/status', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Backlog, In Progress, Review, Completed

  try {
    const ticket = await prisma.maintenanceRequest.findUnique({
      where: { id }
    });
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const dbStatus = mapStatusToDb(status, !!ticket.technicianId);

    await prisma.$transaction(async (tx) => {
      await tx.maintenanceRequest.update({
        where: { id },
        data: {
          status: dbStatus,
          resolvedAt: status === 'Completed' ? new Date() : undefined
        }
      });

      // If status moved to Completed, release the asset to AVAILABLE
      if (status === 'Completed') {
        await tx.asset.update({
          where: { id: ticket.assetId },
          data: { status: 'AVAILABLE' }
        });
      } else {
        // Keep it locked under maintenance
        await tx.asset.update({
          where: { id: ticket.assetId },
          data: { status: 'UNDER_MAINTENANCE' }
        });
      }

      await logActivity({
        userId: req.user.userId,
        action: 'UPDATE_MAINTENANCE_STATUS',
        entityType: 'MaintenanceRequest',
        entityId: id,
        newValue: { status },
        moduleName: 'MAINTENANCE'
      }, tx);
    });

    res.json({ success: true, message: `Ticket moved to ${status}.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to move ticket status.' });
  }
});

// POST add comment / work log
router.post('/:id/comment', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Comment text is required.' });
  }

  try {
    const ticket = await prisma.maintenanceRequest.findUnique({ where: { id } });
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const log = await prisma.$transaction(async (tx) => {
      const createdLog = await tx.maintenanceWorkLog.create({
        data: {
          maintenanceRequestId: id,
          technicianId: req.user.employeeId,
          status: ticket.status,
          notes: text,
          laborHours: 0,
          organizationId: req.user.organizationId
        },
        include: { technician: true }
      });

      await logActivity({
        userId: req.user.userId,
        action: 'ADD_MAINTENANCE_COMMENT',
        entityType: 'MaintenanceRequest',
        entityId: id,
        newValue: { comment: text },
        moduleName: 'MAINTENANCE'
      }, tx);

      return createdLog;
    });

    res.status(201).json({
      author: log.technician.name,
      text: log.notes,
      date: log.createdAt.toLocaleString('en-US')
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to post comment.' });
  }
});

export default router;
