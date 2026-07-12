import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db.js';
import { authMiddleware, checkRole } from '../middleware/auth.js';
import { sendAdminPromotionEmail } from '../mailer.js';

const router = express.Router();

// GET all employees
router.get('/', authMiddleware, async (req, res) => {
  try {
    const emps = await prisma.employee.findMany({
      where: { isDeleted: false },
      include: {
        user: {
          include: {
            userRoles: {
              include: { role: true }
            }
          }
        },
        department: true,
        manager: true
      }
    });

    const formatted = emps.map(emp => ({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      phone: emp.phone || '',
      status: emp.status === 'ACTIVE' ? 'Active' : 'Inactive',
      role: emp.user?.userRoles[0]?.role.name || 'Employee',
      department: emp.department ? emp.department.name : 'None',
      manager: emp.manager ? emp.manager.name : 'None',
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve employees.' });
  }
});

// POST create employee
router.post('/', authMiddleware, checkRole(['Admin']), async (req, res) => {
  const { name, email, password, role, phone, status, department, manager } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  try {
    // Check if email already exists
    const existingEmp = await prisma.employee.findFirst({
      where: { email: { equals: email, mode: 'insensitive' }, isDeleted: false }
    });
    if (existingEmp) {
      return res.status(400).json({ error: 'Employee with this email already exists.' });
    }

    // Resolve department
    let departmentId = null;
    if (department && department !== 'None') {
      const deptObj = await prisma.department.findFirst({
        where: { name: department, isDeleted: false }
      });
      if (deptObj) departmentId = deptObj.id;
    }

    // Resolve manager
    let managerId = null;
    if (manager && manager !== 'None') {
      const managerObj = await prisma.employee.findFirst({
        where: { name: manager, isDeleted: false }
      });
      if (managerObj) managerId = managerObj.id;
    }

    // Resolve role
    const selectedRole = role || 'Employee';
    const dbRole = await prisma.role.findFirst({
      where: { name: { equals: selectedRole, mode: 'insensitive' } }
    });
    if (!dbRole) {
      return res.status(400).json({ error: `Invalid role specified: ${selectedRole}` });
    }

    const employeeStatus = status === 'Inactive' ? 'LEAVE' : 'ACTIVE';
    const userStatus = status === 'Inactive' ? 'DEACTIVATED' : 'ACTIVE';

    const result = await prisma.$transaction(async (tx) => {
      const newEmp = await tx.employee.create({
        data: {
          name,
          email,
          phone: phone || null,
          status: employeeStatus,
          departmentId,
          managerId,
          organizationId: req.user.organizationId
        }
      });

      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash: bcrypt.hashSync(password || 'password123', 10),
          status: userStatus,
          organizationId: req.user.organizationId,
          employeeId: newEmp.id
        }
      });

      await tx.userRole.create({
        data: {
          userId: newUser.id,
          roleId: dbRole.id
        }
      });

      return newEmp;
    });

    res.status(201).json({
      id: result.id,
      name: result.name,
      email: result.email,
      phone: result.phone || '',
      status: status || 'Active',
      role: selectedRole,
      department: department || 'None',
      manager: manager || 'None'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create employee account.' });
  }
});

// PUT update employee (by email or ID)
router.put('/:id', authMiddleware, checkRole(['Admin']), async (req, res) => {
  const { id } = req.params;
  const { name, role, phone, status, department, manager } = req.body;

  try {
    // Determine if id parameter is email or ID
    const isEmail = id.includes('@');
    const employee = await prisma.employee.findFirst({
      where: isEmail ? { email: id, isDeleted: false } : { id, isDeleted: false },
      include: { user: true }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    let departmentId = undefined;
    if (department !== undefined) {
      if (department === 'None') {
        departmentId = null;
      } else {
        const deptObj = await prisma.department.findFirst({
          where: { name: department, isDeleted: false }
        });
        if (deptObj) departmentId = deptObj.id;
      }
    }

    let managerId = undefined;
    if (manager !== undefined) {
      if (manager === 'None') {
        managerId = null;
      } else {
        const managerObj = await prisma.employee.findFirst({
          where: { name: manager, isDeleted: false }
        });
        if (managerObj) managerId = managerObj.id;
      }
    }

    const employeeStatus = status ? (status === 'Inactive' ? 'LEAVE' : 'ACTIVE') : undefined;
    const userStatus = status ? (status === 'Inactive' ? 'DEACTIVATED' : 'ACTIVE') : undefined;

    await prisma.$transaction(async (tx) => {
      // 1. Update Employee
      await tx.employee.update({
        where: { id: employee.id },
        data: {
          name,
          phone,
          status: employeeStatus,
          departmentId,
          managerId
        }
      });

      // 2. Update User (if exists)
      if (employee.user) {
        await tx.user.update({
          where: { id: employee.user.id },
          data: {
            status: userStatus
          }
        });

        // Update User Role if passed
        if (role) {
          const dbRole = await prisma.role.findFirst({
            where: { name: { equals: role, mode: 'insensitive' } }
          });
          if (dbRole) {
            // Check if promoting to Admin role
            const currentRoles = await tx.userRole.findMany({
              where: { userId: employee.user.id },
              include: { role: true }
            });
            const isTargetAdmin = currentRoles.some(ur => ur.role.name.toUpperCase() === 'ADMIN');
            if (role.toUpperCase() === 'ADMIN' && !isTargetAdmin) {
              const secondAdminSig = req.headers['x-second-admin-signature'] || req.body.secondAdminSignature;
              if (!secondAdminSig) {
                throw { status: 403, message: "Dual-Authorization Required: Promoting an employee to Admin requires secondary Administrator signature verification. Please provide a second Admin email." };
              }
              // Verify signature
              const verifyingAdmin = await prisma.user.findFirst({
                where: {
                  email: { equals: secondAdminSig, mode: 'insensitive' },
                  status: 'ACTIVE',
                  isDeleted: false,
                  userRoles: { some: { role: { name: { equals: 'Admin', mode: 'insensitive' } } } }
                }
              });
              if (!verifyingAdmin || verifyingAdmin.id === req.user.userId) {
                throw { status: 403, message: "Invalid Sign-off: The secondary signature must belong to a valid, active Administrator other than the promoting Admin." };
              }
              console.log(`[JOINT SIGN-OFF AUDIT] Joint Admin Promotion Approved. Initiator: ${req.user.email}, Co-Signer: ${secondAdminSig}, Target: ${employee.email}`);
              // Fire audit email (non-blocking, stored for later in mailer)
              sendAdminPromotionEmail({
                to: employee.email,
                promotedName: employee.name,
                initiatorEmail: req.user.email,
                coSignerEmail: secondAdminSig
              }).catch(console.error);
            }

            // Delete previous roles
            await tx.userRole.deleteMany({ where: { userId: employee.user.id } });
            // Add new role
            await tx.userRole.create({
              data: {
                userId: employee.user.id,
                roleId: dbRole.id
              }
            });
          }
        }
      }
    });

    res.json({
      id: employee.id,
      name: name || employee.name,
      email: employee.email,
      phone: phone || employee.phone || '',
      status: status || (employee.status === 'ACTIVE' ? 'Active' : 'Inactive'),
      role: role || 'Employee',
      department: department || 'None',
      manager: manager || 'None'
    });
  } catch (error) {
    console.error(error);
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update employee.' });
  }
});

// DELETE employee
router.delete('/:id', authMiddleware, checkRole(['Admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const isEmail = id.includes('@');
    const employee = await prisma.employee.findFirst({
      where: isEmail ? { email: id, isDeleted: false } : { id, isDeleted: false },
      include: { user: true }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.employee.update({
        where: { id: employee.id },
        data: { isDeleted: true, deletedAt: new Date() }
      });

      if (employee.user) {
        await tx.user.update({
          where: { id: employee.user.id },
          data: { isDeleted: true, deletedAt: new Date() }
        });
      }
    });

    res.json({ success: true, message: 'Employee account deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete employee.' });
  }
});

export default router;
