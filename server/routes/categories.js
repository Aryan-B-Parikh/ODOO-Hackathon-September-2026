import express from 'express';
import prisma from '../db.js';
import { authMiddleware, checkRole } from '../middleware/auth.js';

const router = express.Router();

// GET all categories
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cats = await prisma.assetCategory.findMany({
      where: { isDeleted: false }
    });

    const formatted = cats.map(c => ({
      id: c.id,
      name: c.name,
      code: c.description && c.description.startsWith('Code: ') ? c.description.replace('Code: ', '') : c.name.slice(0, 3).toUpperCase(),
      customFields: c.customFieldSchema || []
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve categories.' });
  }
});

// POST create category
router.post('/', authMiddleware, checkRole(['Admin', 'Asset Manager']), async (req, res) => {
  const { name, code, customFields } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required.' });
  }

  try {
    const existing = await prisma.assetCategory.findUnique({ where: { name } });
    if (existing && !existing.isDeleted) {
      return res.status(400).json({ error: 'Category name already exists.' });
    }

    const newCat = await prisma.assetCategory.create({
      data: {
        name,
        description: code ? `Code: ${code}` : null,
        customFieldSchema: customFields || [],
        organizationId: req.user.organizationId
      }
    });

    res.status(201).json({
      id: newCat.id,
      name: newCat.name,
      code: code || newCat.name.slice(0, 3).toUpperCase(),
      customFields: newCat.customFieldSchema
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create category.' });
  }
});

// PUT update category
router.put('/:id', authMiddleware, checkRole(['Admin', 'Asset Manager']), async (req, res) => {
  const { id } = req.params;
  const { name, code, customFields } = req.body;

  try {
    const updated = await prisma.assetCategory.update({
      where: { id },
      data: {
        name,
        description: code ? `Code: ${code}` : undefined,
        customFieldSchema: customFields || undefined
      }
    });

    res.json({
      id: updated.id,
      name: updated.name,
      code: code || (updated.description && updated.description.startsWith('Code: ') ? updated.description.replace('Code: ', '') : updated.name.slice(0, 3).toUpperCase()),
      customFields: updated.customFieldSchema
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update category.' });
  }
});

// DELETE category
router.delete('/:id', authMiddleware, checkRole(['Admin']), async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.assetCategory.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });
    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete category.' });
  }
});

export default router;
