import express from 'express';
import prisma from '../db.js';
import { authMiddleware, checkRole } from '../middleware/auth.js';
import { logActivity } from '../utils/activity.js';

const router = express.Router();

// GET all departments
router.get('/', authMiddleware, async (req, res) => {
  try {
    const depts = await prisma.department.findMany({
      where: { isDeleted: false },
      include: {
        parent: true,
        head: true
      }
    });

    // Format output to match frontend naming expectations
    const formatted = depts.map(d => ({
      id: d.id,
      name: d.name,
      code: d.code,
      parentDepartment: d.parent ? d.parent.name : 'None',
      manager: d.head ? d.head.name : 'None',
      status: d.status === 'ACTIVE' ? 'Active' : 'Inactive',
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve departments.' });
  }
});

// POST create department
router.post('/', authMiddleware, checkRole(['Admin', 'Asset Manager']), async (req, res) => {
  const { name, code, parentDepartment, manager, status } = req.body;
  if (!name || !code) {
    return res.status(400).json({ error: 'Name and code are required.' });
  }

  try {
    const existing = await prisma.department.findUnique({ where: { code } });
    if (existing && !existing.isDeleted) {
      return res.status(400).json({ error: 'Department code already exists.' });
    }

    // Resolve parent department ID
    let parentId = null;
    if (parentDepartment && parentDepartment !== 'None') {
      const parentDeptObj = await prisma.department.findFirst({
        where: { name: parentDepartment, isDeleted: false }
      });
      if (parentDeptObj) parentId = parentDeptObj.id;
    }

    // Resolve manager ID
    let headId = null;
    if (manager && manager !== 'None') {
      const managerObj = await prisma.employee.findFirst({
        where: { name: manager, isDeleted: false }
      });
      if (managerObj) headId = managerObj.id;
    }

    const newDept = await prisma.$transaction(async (tx) => {
      const dept = await tx.department.create({
        data: {
          name,
          code,
          status: status === 'Inactive' ? 'INACTIVE' : 'ACTIVE',
          parentId,
          headId,
          organizationId: req.user.organizationId
        }
      });

      await logActivity({
        userId: req.user.userId,
        action: 'CREATE_DEPARTMENT',
        entityType: 'Department',
        entityId: dept.id,
        newValue: { name, code },
        moduleName: 'ADMIN'
      }, tx);

      return dept;
    });

    res.status(201).json({
      id: newDept.id,
      name: newDept.name,
      code: newDept.code,
      parentDepartment: parentDepartment || 'None',
      manager: manager || 'None',
      status: status || 'Active'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create department.' });
  }
});

// PUT update department
router.put('/:id', authMiddleware, checkRole(['Admin', 'Asset Manager']), async (req, res) => {
  const { id } = req.params;
  const { name, code, parentDepartment, manager, status } = req.body;

  try {
    let parentId = undefined;
    if (parentDepartment !== undefined) {
      if (parentDepartment === 'None') {
        parentId = null;
      } else {
        const parentDeptObj = await prisma.department.findFirst({
          where: { name: parentDepartment, isDeleted: false }
        });
        if (parentDeptObj) parentId = parentDeptObj.id;
      }
    }

    let headId = undefined;
    if (manager !== undefined) {
      if (manager === 'None') {
        headId = null;
      } else {
        const managerObj = await prisma.employee.findFirst({
          where: { name: manager, isDeleted: false }
        });
        if (managerObj) headId = managerObj.id;
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const dept = await tx.department.update({
        where: { id },
        data: {
          name,
          code,
          status: status ? (status === 'Inactive' ? 'INACTIVE' : 'ACTIVE') : undefined,
          parentId,
          headId
        }
      });

      await logActivity({
        userId: req.user.userId,
        action: 'UPDATE_DEPARTMENT',
        entityType: 'Department',
        entityId: id,
        moduleName: 'ADMIN'
      }, tx);

      return dept;
    });

    res.json({
      id: updated.id,
      name: updated.name,
      code: updated.code,
      parentDepartment: parentDepartment || 'None',
      manager: manager || 'None',
      status: status || 'Active'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update department.' });
  }
});

// DELETE department
router.delete('/:id', authMiddleware, checkRole(['Admin']), async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.department.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date() }
      });

      await logActivity({
        userId: req.user.userId,
        action: 'DELETE_DEPARTMENT',
        entityType: 'Department',
        entityId: id,
        moduleName: 'ADMIN'
      }, tx);
    });
    res.json({ success: true, message: 'Department deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete department.' });
  }
});

export default router;
