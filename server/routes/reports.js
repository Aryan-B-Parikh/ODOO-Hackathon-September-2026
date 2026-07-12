import express from 'express';
import prisma from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/reports/summary
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    // Total Assets
    const totalAssets = await prisma.asset.count({ where: { isDeleted: false } });

    // Total Value
    const valueResult = await prisma.asset.aggregate({
      _sum: { acquisitionCost: true },
      where: { isDeleted: false }
    });
    const totalValue = valueResult._sum.acquisitionCost || 0;

    // Active Allocations
    const activeAllocations = await prisma.assetAllocation.count({
      where: { status: 'ACTIVE', isDeleted: false }
    });

    // Under Maintenance
    const underMaintenance = await prisma.maintenanceRequest.count({
      where: { status: { not: 'RESOLVED' }, isDeleted: false }
    });

    // Utilization Rate
    const utilizationRate = totalAssets > 0 ? Math.round((activeAllocations / totalAssets) * 100) : 0;

    // Category Distribution
    const categories = await prisma.asset.groupBy({
      by: ['categoryId'],
      where: { isDeleted: false },
      _count: true
    });
    const catIds = categories.map(c => c.categoryId);
    const catRecords = await prisma.assetCategory.findMany({
      where: { id: { in: catIds } }
    });
    const catMap = {};
    catRecords.forEach(c => { catMap[c.id] = c.name; });
    const categoryDistribution = categories.map(c => ({
      name: catMap[c.categoryId] || 'Unknown',
      count: c._count
    }));

    // Department Distribution
    const deptGroups = await prisma.asset.groupBy({
      by: ['departmentId'],
      where: { isDeleted: false, departmentId: { not: null } },
      _count: true
    });
    const deptIds = deptGroups.map(d => d.departmentId);
    const deptRecords = await prisma.department.findMany({
      where: { id: { in: deptIds } }
    });
    const deptMap = {};
    deptRecords.forEach(d => { deptMap[d.id] = d.name; });
    const departmentDistribution = deptGroups.map(d => ({
      name: deptMap[d.departmentId] || 'Unknown',
      count: d._count
    }));

    // Idle Assets (Available + no allocation in last 90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const idleAssets = await prisma.asset.findMany({
      where: {
        isDeleted: false,
        status: 'AVAILABLE',
        allocations: {
          none: {
            createdAt: { gte: ninetyDaysAgo }
          }
        }
      },
      include: { category: true, location: true },
      take: 20
    });

    // Near Retirement (assets purchased > 4 years ago)
    const fourYearsAgo = new Date();
    fourYearsAgo.setFullYear(fourYearsAgo.getFullYear() - 4);
    const nearRetirement = await prisma.asset.findMany({
      where: {
        isDeleted: false,
        status: { not: 'DISPOSED' },
        acquisitionDate: { lt: fourYearsAgo }
      },
      include: { category: true, location: true },
      take: 20
    });

    // Booking Heatmap (bookings per weekday)
    const allBookings = await prisma.resourceBooking.findMany({
      where: { isDeleted: false },
      select: { startTime: true }
    });
    const weekdayMap = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };
    const bookingHeatmap = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    allBookings.forEach(b => {
      const day = weekdayMap[new Date(b.startTime).getDay()];
      bookingHeatmap[day]++;
    });

    // Maintenance Trends (costs per month for current year)
    const currentYear = new Date().getFullYear();
    const maintenanceRequests = await prisma.maintenanceRequest.findMany({
      where: {
        isDeleted: false,
        createdAt: { gte: new Date(currentYear, 0, 1) }
      },
      select: { createdAt: true, estimatedCost: true, actualCost: true }
    });
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const maintenanceTrends = monthNames.map(m => ({ month: m, count: 0, cost: 0 }));
    maintenanceRequests.forEach(t => {
      const m = new Date(t.createdAt).getMonth();
      maintenanceTrends[m].count++;
      maintenanceTrends[m].cost += parseFloat(t.actualCost || t.estimatedCost || 0);
    });

    res.json({
      totalAssets,
      totalValue: parseFloat(totalValue),
      activeAllocations,
      underMaintenance,
      utilizationRate,
      categoryDistribution,
      departmentDistribution,
      idleAssets: idleAssets.map(a => ({
        id: a.id,
        name: a.name,
        category: a.category.name,
        location: a.location.name,
        purchaseDate: a.acquisitionDate ? a.acquisitionDate.toISOString().split('T')[0] : null
      })),
      nearRetirement: nearRetirement.map(a => ({
        id: a.id,
        name: a.name,
        category: a.category.name,
        location: a.location.name,
        purchaseDate: a.acquisitionDate ? a.acquisitionDate.toISOString().split('T')[0] : null,
        ageYears: a.acquisitionDate ? Math.round((Date.now() - new Date(a.acquisitionDate)) / (365.25 * 24 * 60 * 60 * 1000)) : null
      })),
      bookingHeatmap,
      maintenanceTrends
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate report summary.' });
  }
});

// GET /api/reports/export/csv — Export assets as CSV
router.get('/export/csv', authMiddleware, async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      where: { isDeleted: false },
      include: {
        category: true,
        location: true,
        department: true
      }
    });

    const statusMap = {
      AVAILABLE: 'Active', ALLOCATED: 'Allocated', RESERVED: 'Reserved',
      UNDER_MAINTENANCE: 'Maintenance', LOST: 'Lost', RETIRED: 'Retired', DISPOSED: 'Disposed'
    };

    const csvHeader = 'Name,Category,Status,Location,Department,Serial Number,QR Code,Barcode,Acquisition Date,Acquisition Cost,Condition\n';
    const csvRows = assets.map(a => {
      return [
        `"${(a.name || '').replace(/"/g, '""')}"`,
        `"${a.category?.name || ''}"`,
        `"${statusMap[a.status] || a.status}"`,
        `"${a.location?.name || ''}"`,
        `"${a.department?.name || 'Unassigned'}"`,
        `"${a.serialNumber || ''}"`,
        `"${a.qrCode || ''}"`,
        `"${a.barcode || ''}"`,
        `"${a.acquisitionDate ? a.acquisitionDate.toISOString().split('T')[0] : ''}"`,
        a.acquisitionCost || 0,
        `"${a.condition || ''}"`
      ].join(',');
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=assetflow_report.csv');
    res.send(csvHeader + csvRows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to export CSV report.' });
  }
});

export default router;
