import express from 'express';
import prisma from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET user notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifs = await prisma.notification.findMany({
      where: { recipientId: req.user.employeeId, isRead: false },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = notifs.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type === 'ALERT' ? 'warning' : (n.type === 'MAINTENANCE' ? 'info' : 'success'),
      timestamp: 'Just now', // simplified display
      read: n.isRead
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve notifications.' });
  }
});

// PUT mark notification as read
router.put('/:id/read', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to mark notification as read.' });
  }
});

// DELETE clear all notifications for employee
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: { recipientId: req.user.employeeId }
    });
    res.json({ success: true, message: 'All notifications cleared.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to clear notifications.' });
  }
});

export default router;
