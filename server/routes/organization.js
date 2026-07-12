import express from 'express';
import prisma from '../db.js';
import { authMiddleware, checkRole } from '../middleware/auth.js';
import { logActivity } from '../utils/activity.js';

const router = express.Router();

// GET organization details
router.get('/', authMiddleware, async (req, res) => {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: req.user.organizationId }
    });
    
    if (!org || org.isDeleted) {
      return res.status(404).json({ error: 'Organization not found.' });
    }

    res.json({
      id: org.id,
      name: org.name,
      code: org.code
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve organization.' });
  }
});

// PUT update organization details
router.put('/', authMiddleware, checkRole(['Admin']), async (req, res) => {
  const { name, code } = req.body;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.update({
        where: { id: req.user.organizationId },
        data: {
          name,
          code
        }
      });

      await logActivity({
        userId: req.user.userId,
        action: 'UPDATE_ORGANIZATION',
        entityType: 'Organization',
        entityId: org.id,
        newValue: { name, code },
        moduleName: 'ADMIN'
      }, tx);

      return org;
    });

    res.json({
      success: true,
      id: updated.id,
      name: updated.name,
      code: updated.code
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update organization.' });
  }
});

export default router;
