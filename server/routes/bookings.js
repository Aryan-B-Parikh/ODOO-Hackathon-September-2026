import express from 'express';
import crypto from 'crypto';
import prisma from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { logActivity } from '../utils/activity.js';

const router = express.Router();

// Helper to map DB booking status to frontend status
const mapStatusToFrontend = (dbStatus) => {
  const mapping = {
    UPCOMING: 'Upcoming',
    ONGOING: 'Ongoing',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
  };
  return mapping[dbStatus] || 'Upcoming';
};

// GET all bookings
router.get('/', authMiddleware, async (req, res) => {
  try {
    const bkgs = await prisma.resourceBooking.findMany({
      include: {
        asset: true,
        bookedBy: true
      }
    });

    const formatted = bkgs.map(b => {
      let reminder = 15;
      if (b.seriesId) {
        if (b.seriesId.includes('_')) {
          reminder = parseInt(b.seriesId.split('_')[1]) || 15;
        } else {
          reminder = parseInt(b.seriesId) || 15;
        }
      }
      return {
        id: b.id,
        resourceName: b.asset.name,
        resourceId: b.asset.id,
        employeeId: b.bookedBy.email,
        employeeName: b.bookedBy.name,
        startDate: b.startTime.toISOString().replace('.000Z', '').replace('Z', ''),
        endDate: b.endTime.toISOString().replace('.000Z', '').replace('Z', ''),
        recurrence: b.recurrenceRule || 'None',
        reminderMinutes: reminder,
        status: mapStatusToFrontend(b.status)
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve resource bookings.' });
  }
});

// POST create booking with overlap prevention and recurring series expansion
router.post('/', authMiddleware, async (req, res) => {
  const { resourceId, employeeId, startDate, endDate, recurrence, reminderMinutes, purpose } = req.body;

  if (!resourceId || !startDate || !endDate) {
    return res.status(400).json({ error: 'Resource, Start Date, and End Date are required.' });
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ error: 'End time must be after start time.' });
    }

    // Resolve booker employee
    const bookerEmail = employeeId || req.user.email;
    const employee = await prisma.employee.findFirst({
      where: { email: { equals: bookerEmail, mode: 'insensitive' }, isDeleted: false }
    });
    if (!employee) {
      return res.status(404).json({ error: 'Booker employee account not found.' });
    }

    // Check recurrence and build occurrences list
    const occurrences = [];
    const occurrencesCount = (recurrence && recurrence !== 'None') ? 5 : 1;
    const seriesUuid = crypto.randomUUID();
    const compositeSeriesId = `${seriesUuid}_${reminderMinutes || 15}`;

    for (let i = 0; i < occurrencesCount; i++) {
      const occurrenceStart = new Date(start);
      const occurrenceEnd = new Date(end);

      if (recurrence === 'Daily') {
        occurrenceStart.setDate(start.getDate() + i);
        occurrenceEnd.setDate(end.getDate() + i);
      } else if (recurrence === 'Weekly') {
        occurrenceStart.setDate(start.getDate() + i * 7);
        occurrenceEnd.setDate(end.getDate() + i * 7);
      }

      // Business Rule: Overlap Check for each occurrence
      const overlapping = await prisma.resourceBooking.findFirst({
        where: {
          assetId: resourceId,
          status: { not: 'CANCELLED' },
          startTime: { lt: occurrenceEnd },
          endTime: { gt: occurrenceStart }
        }
      });

      if (overlapping) {
        return res.status(409).json({ 
          error: `Conflict Detected! Overlapping reservation found for occurrence ${i + 1} (${occurrenceStart.toLocaleDateString()}).` 
        });
      }

      occurrences.push({
        start: occurrenceStart,
        end: occurrenceEnd
      });
    }

    // Write all occurrences inside a single atomic transaction
    const createdBookings = await prisma.$transaction(async (tx) => {
      const bkgs = await Promise.all(
        occurrences.map(occ => 
          tx.resourceBooking.create({
            data: {
              assetId: resourceId,
              bookedById: employee.id,
              startTime: occ.start,
              endTime: occ.end,
              status: 'UPCOMING',
              notes: purpose || '',
              recurrenceRule: recurrence || 'None',
              seriesId: compositeSeriesId,
              organizationId: req.user.organizationId
            },
            include: { asset: true, bookedBy: true }
          })
        )
      );

      await logActivity({
        userId: req.user.userId,
        action: 'CREATE_BOOKING',
        entityType: 'ResourceBooking',
        entityId: bkgs[0].id,
        moduleName: 'BOOKINGS'
      }, tx);

      return bkgs;
    });

    const mainBkg = createdBookings[0];
    res.status(201).json({
      id: mainBkg.id,
      resourceName: mainBkg.asset.name,
      resourceId: mainBkg.asset.id,
      employeeId: mainBkg.bookedBy.email,
      employeeName: mainBkg.bookedBy.name,
      startDate: mainBkg.startTime.toISOString().replace('.000Z', '').replace('Z', ''),
      endDate: mainBkg.endTime.toISOString().replace('.000Z', '').replace('Z', ''),
      recurrence: mainBkg.recurrenceRule || 'None',
      reminderMinutes: reminderMinutes || 15,
      status: 'Upcoming'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create resource booking.' });
  }
});

// POST cancel booking
router.post('/:id/cancel', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.$transaction(async (tx) => {
      const bkg = await tx.resourceBooking.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });
      await logActivity({
        userId: req.user.userId,
        action: 'CANCEL_BOOKING',
        entityType: 'ResourceBooking',
        entityId: id,
        moduleName: 'BOOKINGS'
      }, tx);
      return bkg;
    });
    res.json({ success: true, status: 'Cancelled', message: 'Booking cancelled successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to cancel booking.' });
  }
});

// POST check-in booking (mark as ONGOING)
router.post('/:id/checkin', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.resourceBooking.update({
        where: { id },
        data: { status: 'ONGOING' }
      });
      await logActivity({
        userId: req.user.userId,
        action: 'CHECKIN_BOOKING',
        entityType: 'ResourceBooking',
        entityId: id,
        moduleName: 'BOOKINGS'
      }, tx);
    });
    res.json({ success: true, status: 'Ongoing', message: 'Checked in successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to check in.' });
  }
});

// POST complete booking
router.post('/:id/complete', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.resourceBooking.update({
        where: { id },
        data: { status: 'COMPLETED' }
      });
      await logActivity({
        userId: req.user.userId,
        action: 'COMPLETE_BOOKING',
        entityType: 'ResourceBooking',
        entityId: id,
        moduleName: 'BOOKINGS'
      }, tx);
    });
    res.json({ success: true, status: 'Completed', message: 'Booking completed.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to complete booking.' });
  }
});

// GET check resource availability for a time slot
router.get('/availability/:resourceId', authMiddleware, async (req, res) => {
  const { resourceId } = req.params;
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate and endDate query params are required.' });
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const conflicts = await prisma.resourceBooking.findMany({
      where: {
        assetId: resourceId,
        status: { not: 'CANCELLED' },
        startTime: { lt: end },
        endTime: { gt: start }
      },
      include: { bookedBy: true }
    });

    res.json({
      available: conflicts.length === 0,
      conflicts: conflicts.map(c => ({
        id: c.id,
        bookedBy: c.bookedBy.name,
        start: c.startTime.toISOString(),
        end: c.endTime.toISOString(),
        status: mapStatusToFrontend(c.status)
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to check availability.' });
  }
});

export default router;

