import express from 'express';
import prisma from '../db.js';
import { authMiddleware, checkRole } from '../middleware/auth.js';
import {
  sendAllocationEmail,
  sendReturnConfirmEmail,
  sendTransferRequestEmail
} from '../mailer.js';

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

// GET all allocations
router.get('/', authMiddleware, async (req, res) => {
  try {
    const allocs = await prisma.assetAllocation.findMany({
      where: { isDeleted: false },
      include: {
        asset: true,
        employee: {
          include: { department: true }
        },
        department: true
      }
    });

    const formattedAllocs = allocs.map(a => {
      const isOverdue = !a.actualReturnDate && a.expectedReturnDate && new Date(a.expectedReturnDate) < new Date();
      let status = 'Active';
      if (a.actualReturnDate) {
        status = 'Returned';
      } else if (isOverdue) {
        status = 'Overdue';
      }

      return {
        id: a.id,
        assetId: a.asset.id,
        assetName: a.asset.name,
        employeeId: a.employee ? a.employee.email : '',
        employeeName: a.employee ? a.employee.name : 'Unassigned',
        department: a.department ? a.department.name : (a.employee?.department?.name || 'None'),
        checkoutDate: a.allocatedAt.toISOString().split('T')[0],
        expectedReturn: a.expectedReturnDate ? a.expectedReturnDate.toISOString().split('T')[0] : '',
        actualReturn: a.actualReturnDate ? a.actualReturnDate.toISOString().split('T')[0] : null,
        checkoutCondition: mapConditionToFrontend(a.checkoutCondition),
        checkinCondition: a.checkinCondition ? mapConditionToFrontend(a.checkinCondition) : null,
        checkoutNotes: a.checkoutNotes || '',
        checkinNotes: a.checkinNotes || '',
        status
      };
    });

    // Fetch transfer requests that are pending to display them in the frontend list too
    const transfers = await prisma.assetTransferRequest.findMany({
      where: { status: 'PENDING', isDeleted: false },
      include: {
        asset: true,
        requestor: true,
        targetEmployee: true,
        targetDepartment: true
      }
    });

    const formattedTransfers = transfers.map(t => ({
      id: t.id,
      assetId: t.asset.id,
      assetName: t.asset.name,
      employeeId: t.targetEmployee ? t.targetEmployee.email : '',
      employeeName: t.targetEmployee ? t.targetEmployee.name : 'Unassigned',
      department: t.targetDepartment ? t.targetDepartment.name : 'None',
      checkoutDate: t.createdAt.toISOString().split('T')[0],
      expectedReturn: '',
      actualReturn: null,
      checkoutCondition: mapConditionToFrontend(t.asset.condition),
      checkinCondition: null,
      checkoutNotes: t.requestNotes || '',
      checkinNotes: '',
      status: 'Pending Approval' // maps to transfer status expected by frontend
    }));

    res.json([...formattedAllocs, ...formattedTransfers]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch allocations.' });
  }
});

// POST checkout / allocate asset
router.post('/', authMiddleware, checkRole(['Admin', 'Asset Manager']), async (req, res) => {
  const { assetId, employeeId, department, expectedReturn, checkoutCondition, checkoutNotes } = req.body;
  if (!assetId) {
    return res.status(400).json({ error: 'Asset ID is required.' });
  }

  try {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId }
    });

    if (!asset || asset.isDeleted) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    // Business Rule: Double Allocation Blocked
    if (asset.status !== 'AVAILABLE') {
      return res.status(409).json({ error: `Asset is currently ${asset.status.toLowerCase()} and cannot be allocated.` });
    }

    // Resolve Employee
    let targetEmployee = null;
    if (employeeId) {
      targetEmployee = await prisma.employee.findFirst({
        where: { OR: [{ id: employeeId }, { email: employeeId }], isDeleted: false }
      });
    }

    // Resolve Department
    let targetDepartment = null;
    if (department && department !== 'None') {
      targetDepartment = await prisma.department.findFirst({
        where: { name: department, isDeleted: false }
      });
    }

    const checkoutCond = checkoutCondition ? mapConditionToDb(checkoutCondition) : asset.condition;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Allocation record
      const alloc = await tx.assetAllocation.create({
        data: {
          assetId,
          employeeId: targetEmployee ? targetEmployee.id : null,
          departmentId: targetDepartment ? targetDepartment.id : null,
          allocatedById: req.user.employeeId,
          expectedReturnDate: expectedReturn ? new Date(expectedReturn) : null,
          checkoutCondition: checkoutCond,
          checkoutNotes,
          organizationId: req.user.organizationId
        }
      });

      // 2. Mark asset status as ALLOCATED
      await tx.asset.update({
        where: { id: assetId },
        data: {
          status: 'ALLOCATED',
          departmentId: targetDepartment ? targetDepartment.id : (targetEmployee?.departmentId || null)
        }
      });

      return alloc;
    });

    res.status(201).json({
      id: result.id,
      assetId,
      assetName: asset.name,
      employeeId: targetEmployee ? targetEmployee.email : '',
      employeeName: targetEmployee ? targetEmployee.name : 'Unassigned',
      department: targetDepartment ? targetDepartment.name : (targetEmployee?.department?.name || 'None'),
      checkoutDate: result.allocatedAt.toISOString().split('T')[0],
      expectedReturn: expectedReturn || '',
      actualReturn: null,
      checkoutCondition: checkoutCondition || 'Excellent',
      checkinCondition: null,
      checkoutNotes: checkoutNotes || '',
      checkinNotes: '',
      status: 'Active'
    });

    // Fire email notification (non-blocking)
    if (targetEmployee && targetEmployee.email) {
      sendAllocationEmail({
        to: targetEmployee.email,
        employeeName: targetEmployee.name,
        assetName: asset.name,
        expectedReturn: expectedReturn || 'Not specified'
      }).catch(console.error);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to allocate asset.' });
  }
});

// POST return allocation
router.post('/:id/return', authMiddleware, checkRole(['Admin', 'Asset Manager']), async (req, res) => {
  const { id } = req.params;
  const { actualReturn, checkinCondition, checkinNotes } = req.body;

  try {
    const alloc = await prisma.assetAllocation.findUnique({
      where: { id },
      include: { asset: true }
    });

    if (!alloc) {
      return res.status(404).json({ error: 'Allocation record not found.' });
    }

    const checkinCond = checkinCondition ? mapConditionToDb(checkinCondition) : 'GOOD';
    const returnDate = actualReturn ? new Date(actualReturn) : new Date();

    await prisma.$transaction(async (tx) => {
      // 1. Update allocation record
      await tx.assetAllocation.update({
        where: { id },
        data: {
          actualReturnDate: returnDate,
          checkinCondition: checkinCond,
          checkinNotes: checkinNotes || '',
          status: 'RETURNED'
        }
      });

      // 2. Update Asset status to AVAILABLE and sync audited physical condition
      await tx.asset.update({
        where: { id: alloc.assetId },
        data: {
          status: 'AVAILABLE',
          condition: checkinCond
        }
      });
    });

    res.json({
      success: true,
      message: 'Asset returned successfully.',
      status: 'Returned'
    });

    // Fire return confirmation email (non-blocking)
    if (alloc.employee && alloc.employee.email) {
      sendReturnConfirmEmail({
        to: alloc.employee.email,
        employeeName: alloc.employee.name,
        assetName: alloc.asset.name,
        returnDate: new Date().toLocaleDateString()
      }).catch(console.error);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to return asset.' });
  }
});

// POST submit transfer request
router.post('/transfers', authMiddleware, async (req, res) => {
  const { assetId, employeeId, department, checkoutNotes } = req.body;

  try {
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    // Resolve target employee
    let targetEmp = null;
    if (employeeId) {
      targetEmp = await prisma.employee.findFirst({
        where: { email: employeeId, isDeleted: false }
      });
    }

    // Resolve target dept
    let targetDept = null;
    if (department && department !== 'None') {
      targetDept = await prisma.department.findFirst({
        where: { name: department, isDeleted: false }
      });
    }

    const transfer = await prisma.assetTransferRequest.create({
      data: {
        assetId,
        requestorId: req.user.employeeId,
        targetEmployeeId: targetEmp ? targetEmp.id : null,
        targetDepartmentId: targetDept ? targetDept.id : null,
        requestNotes: checkoutNotes,
        organizationId: req.user.organizationId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Transfer request submitted.',
      transferId: transfer.id
    });

    // Notify admins about the pending transfer (non-blocking)
    try {
      const admins = await prisma.user.findMany({
        where: {
          status: 'ACTIVE',
          isDeleted: false,
          userRoles: { some: { role: { name: { equals: 'Admin', mode: 'insensitive' } } } }
        },
        select: { email: true }
      });
      const requestor = await prisma.employee.findUnique({ where: { id: req.user.employeeId } });
      for (const admin of admins) {
        sendTransferRequestEmail({
          to: admin.email,
          assetName: asset.name,
          requestorName: requestor ? requestor.name : req.user.email,
          targetName: targetEmp ? targetEmp.name : (targetDept ? targetDept.name : 'Unknown')
        }).catch(console.error);
      }
    } catch (_) { /* silent — email is best-effort */ }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit transfer request.' });
  }
});

// POST action (approve/reject) transfer request
router.post('/transfers/:id/action', authMiddleware, checkRole(['Admin', 'Asset Manager']), async (req, res) => {
  const { id } = req.params;
  const { action, rejectReason } = req.body; // action: 'approve' or 'reject'

  try {
    const tr = await prisma.assetTransferRequest.findUnique({
      where: { id },
      include: { asset: true }
    });

    if (!tr || tr.status !== 'PENDING') {
      return res.status(404).json({ error: 'Pending transfer request not found.' });
    }

    if (action === 'reject') {
      await prisma.assetTransferRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          actionedById: req.user.employeeId,
          actionedAt: new Date(),
          rejectionReason: rejectReason
        }
      });
      return res.json({ success: true, message: 'Transfer request rejected.' });
    }

    // If approved: deactivate previous allocation and create a new one
    await prisma.$transaction(async (tx) => {
      // 1. Find active allocation of this asset
      const activeAlloc = await tx.assetAllocation.findFirst({
        where: { assetId: tr.assetId, status: 'ACTIVE' }
      });
      if (activeAlloc) {
        await tx.assetAllocation.update({
          where: { id: activeAlloc.id },
          data: {
            status: 'RETURNED',
            actualReturnDate: new Date(),
            checkinCondition: tr.asset.condition,
            checkinNotes: 'Transferred to another employee'
          }
        });
      }

      // 2. Create new active allocation
      await tx.assetAllocation.create({
        data: {
          assetId: tr.assetId,
          employeeId: tr.targetEmployeeId,
          departmentId: tr.targetDepartmentId,
          allocatedById: req.user.employeeId,
          checkoutCondition: tr.asset.condition,
          checkoutNotes: tr.requestNotes || 'Approved transfer assignment',
          organizationId: tr.organizationId
        }
      });

      // 3. Update Asset Ownership
      await tx.asset.update({
        where: { id: tr.assetId },
        data: {
          departmentId: tr.targetDepartmentId,
          status: 'ALLOCATED'
        }
      });

      // 4. Update Transfer Request
      await tx.assetTransferRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          actionedById: req.user.employeeId,
          actionedAt: new Date()
        }
      });
    });

    res.json({ success: true, message: 'Transfer request approved.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to action transfer request.' });
  }
});

export default router;
