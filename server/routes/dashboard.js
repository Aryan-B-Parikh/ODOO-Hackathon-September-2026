import express from 'express';
import prisma from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET dashboard statistics & activity logs
// Optional query param: ?days=30  (limits data to last N days)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || null;
    const since = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;
    const dateFilter = since ? { gte: since } : undefined;

    const totalAssets = await prisma.asset.count({ where: { isDeleted: false, ...(since && { createdAt: dateFilter }) } });
    
    const assetsWithCost = await prisma.asset.findMany({
      where: { isDeleted: false, NOT: { acquisitionCost: null } },
      select: { acquisitionCost: true }
    });
    const totalValue = assetsWithCost.reduce((sum, a) => sum + parseFloat(a.acquisitionCost.toString()), 0);

    const activeAllocations = await prisma.assetAllocation.count({
      where: { status: 'ACTIVE', isDeleted: false }
    });

    const pendingMaintenance = await prisma.maintenanceRequest.count({
      where: { status: { in: ['PENDING', 'APPROVED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS'] }, isDeleted: false }
    });

    const utilizationRate = totalAssets > 0 ? Math.round((activeAllocations / totalAssets) * 100) : 0;

    // Get recent activities
    const recentAllocs = await prisma.assetAllocation.findMany({
      where: { isDeleted: false },
      include: { asset: true, employee: true },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    const recentMaintenances = await prisma.maintenanceRequest.findMany({
      where: { isDeleted: false },
      include: { asset: true },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    // Synthesize recent activities
    const recentActivity = [];
    
    recentAllocs.forEach(a => {
      recentActivity.push({
        id: a.id,
        user: a.employee ? a.employee.name : 'System',
        action: a.status === 'ACTIVE' ? 'Checkout' : 'Return',
        details: `${a.asset.name} was ${a.status === 'ACTIVE' ? 'allocated' : 'returned'}`,
        timestamp: a.createdAt.toISOString().split('T')[0]
      });
    });

    recentMaintenances.forEach(m => {
      recentActivity.push({
        id: m.id,
        user: 'Maintenance Dept',
        action: 'Log Request',
        details: `Ticket opened for ${m.asset.name}`,
        timestamp: m.createdAt.toISOString().split('T')[0]
      });
    });

    // Sort by timestamp desc and take 5
    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const sliceActivity = recentActivity.slice(0, 5);

    // Get overdue allocations
    const overdueAllocations = await prisma.assetAllocation.findMany({
      where: {
        status: 'ACTIVE',
        isDeleted: false,
        expectedReturnDate: { lt: new Date() }
      },
      include: {
        asset: true,
        employee: true
      },
      orderBy: { expectedReturnDate: 'asc' },
      take: 5
    });

    // Get upcoming returns (active checkouts returning in the next 7 days)
    const upcomingReturns = await prisma.assetAllocation.findMany({
      where: {
        status: 'ACTIVE',
        isDeleted: false,
        expectedReturnDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        asset: true,
        employee: true
      },
      orderBy: { expectedReturnDate: 'asc' },
      take: 5
    });

    // Get pending transfers
    const pendingTransfers = await prisma.assetTransferRequest.findMany({
      where: {
        status: 'PENDING',
        isDeleted: false
      },
      include: {
        asset: true,
        requestor: true,
        targetEmployee: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Get active bookings
    const activeBookings = await prisma.resourceBooking.findMany({
      where: {
        status: { in: ['UPCOMING', 'ONGOING'] },
        isDeleted: false
      },
      include: {
        asset: true,
        bookedBy: true
      },
      orderBy: { startTime: 'asc' },
      take: 5
    });

    res.json({
      totalAssets,
      totalValue,
      activeAllocations,
      pendingMaintenance,
      utilizationRate,
      recentActivity: sliceActivity,
      overdueAllocations,
      upcomingReturns,
      pendingTransfers,
      activeBookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve dashboard stats.' });
  }
});

export default router;
