import express from 'express';
import prisma from '../db.js';
import { authMiddleware, checkRole } from '../middleware/auth.js';
import { uploadAssetFiles } from '../upload.js';
import { logActivity } from '../utils/activity.js';

const router = express.Router();

// Helper to map DB asset status to frontend status
const mapStatusToFrontend = (dbStatus) => {
  if (['AVAILABLE', 'ALLOCATED', 'RESERVED'].includes(dbStatus)) return 'Active';
  if (dbStatus === 'UNDER_MAINTENANCE') return 'Maintenance';
  return 'Decommissioned'; // LOST, RETIRED, DISPOSED
};

// Helper to map frontend status to DB status
const mapStatusToDb = (feStatus, hasAssignee) => {
  if (feStatus === 'Maintenance') return 'UNDER_MAINTENANCE';
  if (feStatus === 'Decommissioned') return 'DISPOSED';
  return hasAssignee ? 'ALLOCATED' : 'AVAILABLE'; // Active maps based on assignment
};

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

// GET paginated/filtered assets
router.get('/', authMiddleware, async (req, res) => {
  try {
    const assets = await prisma.asset.findMany({
      where: { isDeleted: false },
      include: {
        category: true,
        location: true,
        department: true,
        allocations: {
          where: { status: 'ACTIVE' },
          include: { employee: true }
        },
        auditResults: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        images: true,
        documents: true
      }
    });

    const formatted = assets.map(a => {
      const activeAlloc = a.allocations[0];
      const assigneeName = activeAlloc
        ? (activeAlloc.employee ? activeAlloc.employee.name : activeAlloc.department?.name || 'Assigned')
        : 'Unassigned';

      return {
        id: a.id,
        name: a.name,
        category: a.category.name,
        status: mapStatusToFrontend(a.status),
        assignedTo: assigneeName,
        location: a.location.name,
        condition: mapConditionToFrontend(a.condition),
        purchaseDate: a.acquisitionDate ? a.acquisitionDate.toISOString().split('T')[0] : '',
        purchaseCost: a.acquisitionCost ? a.acquisitionCost.toString() : '0.00',
        serialNumber: a.serialNumber || '',
        barcode: a.barcode || '',
        qrCode: a.qrCode || '',
        bookable: a.sharedBookable,
        department: a.department ? a.department.name : 'None',
        customValues: a.customFieldValues || {},
        photos: a.images.map(img => img.url),
        documents: a.documents.map(doc => doc.name),
        lastAudit: a.auditResults[0] ? new Date(a.auditResults[0].createdAt).toLocaleDateString('en-US') : 'Never'
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch asset directory.' });
  }
});

// GET asset by QR code, barcode, or Tag (Scanner endpoint)
router.get('/scan/:tag', authMiddleware, async (req, res) => {
  const { tag } = req.params;
  try {
    const asset = await prisma.asset.findFirst({
      where: {
        OR: [
          { assetTag: tag },
          { barcode: tag },
          { qrCode: tag },
          { id: tag }
        ],
        isDeleted: false
      },
      include: {
        category: true,
        location: true,
        department: true,
        allocations: {
          where: { status: 'ACTIVE' },
          include: { employee: true }
        },
        auditResults: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        images: true,
        documents: true
      }
    });

    if (!asset) {
      return res.status(404).json({ error: 'Asset tag not found.' });
    }

    const activeAlloc = asset.allocations[0];
    const assigneeName = activeAlloc ? (activeAlloc.employee ? activeAlloc.employee.name : 'Assigned') : 'Unassigned';

    res.json({
      id: asset.id,
      name: asset.name,
      category: asset.category.name,
      status: mapStatusToFrontend(asset.status),
      assignedTo: assigneeName,
      location: asset.location.name,
      condition: mapConditionToFrontend(asset.condition),
      purchaseDate: asset.acquisitionDate ? asset.acquisitionDate.toISOString().split('T')[0] : '',
      purchaseCost: asset.acquisitionCost ? asset.acquisitionCost.toString() : '0.00',
      serialNumber: asset.serialNumber || '',
      barcode: asset.barcode || '',
      qrCode: asset.qrCode || '',
      bookable: asset.sharedBookable,
      department: asset.department ? asset.department.name : 'None',
      customValues: asset.customFieldValues || {},
      photos: asset.images.map(img => img.url),
      documents: asset.documents.map(doc => doc.name),
      lastAudit: asset.auditResults[0] ? new Date(asset.auditResults[0].createdAt).toLocaleDateString('en-US') : 'Never'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process asset scan.' });
  }
});

// POST register asset
router.post('/', authMiddleware, checkRole(['Admin', 'Asset Manager']), async (req, res) => {
  const {
    name,
    category,
    status,
    assignedTo,
    serialNumber,
    barcode,
    qrCode,
    purchaseDate,
    purchaseCost,
    vendor,
    location,
    department,
    condition,
    bookable,
    customValues,
    photos,
    documents
  } = req.body;

  if (!name || !category || !location) {
    return res.status(400).json({ error: 'Name, Category, and Location are required.' });
  }

  try {
    // Resolve category
    const catObj = await prisma.assetCategory.findFirst({
      where: { name: category, isDeleted: false }
    });
    if (!catObj) {
      return res.status(400).json({ error: `Category '${category}' does not exist.` });
    }

    // Resolve location (auto-create)
    let locObj = await prisma.location.findFirst({
      where: { name: location, isDeleted: false }
    });
    if (!locObj) {
      locObj = await prisma.location.create({
        data: {
          name: location,
          code: location.slice(0, 3).toUpperCase() + Math.floor(10 + Math.random() * 90),
          organizationId: req.user.organizationId
        }
      });
    }

    // Resolve vendor (auto-create)
    let vendorId = null;
    if (vendor && vendor !== 'None') {
      let vendorObj = await prisma.vendor.findFirst({
        where: { name: vendor, isDeleted: false, organizationId: req.user.organizationId }
      });
      if (!vendorObj) {
        vendorObj = await prisma.vendor.create({
          data: {
            name: vendor,
            organizationId: req.user.organizationId
          }
        });
      }
      vendorId = vendorObj.id;
    }

    // Resolve department
    let departmentId = null;
    if (department && department !== 'None') {
      const deptObj = await prisma.department.findFirst({
        where: { name: department, isDeleted: false }
      });
      if (deptObj) departmentId = deptObj.id;
    }

    const tag = `AF-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAsset = await prisma.$transaction(async (tx) => {
      const dbAsset = await tx.asset.create({
        data: {
          name,
          categoryId: catObj.id,
          assetTag: tag,
          serialNumber: serialNumber || null,
          barcode: barcode || `BAR-${tag.split('-')[1]}`,
          qrCode: qrCode || `QR-${tag.split('-')[1]}`,
          acquisitionDate: purchaseDate ? new Date(purchaseDate) : null,
          acquisitionCost: purchaseCost ? parseFloat(purchaseCost) : null,
          condition: mapConditionToDb(condition),
          sharedBookable: !!bookable,
          status: mapStatusToDb(status, assignedTo && assignedTo !== 'Unassigned'),
          locationId: locObj.id,
          departmentId,
          vendorId,
          organizationId: req.user.organizationId,
          customFieldValues: customValues || {}
        }
      });

      // Save photos
      if (photos && photos.length > 0) {
        await tx.assetImage.createMany({
          data: photos.map(url => ({
            assetId: dbAsset.id,
            url
          }))
        });
      }

      // Save documents
      if (documents && documents.length > 0) {
        await tx.assetDocument.createMany({
          data: documents.map(name => ({
            assetId: dbAsset.id,
            name,
            url: name
          }))
        });
      }

      // If assignedTo is passed, create an initial AssetAllocation in active status
      if (assignedTo && assignedTo !== 'Unassigned') {
        const emp = await tx.employee.findFirst({
          where: { name: assignedTo, isDeleted: false }
        });
        if (emp) {
          await tx.assetAllocation.create({
            data: {
              assetId: dbAsset.id,
              employeeId: emp.id,
              allocatedById: req.user.employeeId,
              status: 'ACTIVE',
              checkoutCondition: mapConditionToDb(condition),
              checkoutNotes: 'Assigned during asset registration',
              organizationId: req.user.organizationId
            }
          });
        }
      }

      await logActivity({
        userId: req.user.userId,
        action: 'CREATE_ASSET',
        entityType: 'Asset',
        entityId: dbAsset.id,
        newValue: { name, category },
        moduleName: 'ASSETS'
      }, tx);

      return dbAsset;
    });

    res.status(201).json({
      id: newAsset.id,
      name: newAsset.name,
      category,
      status: status || 'Active',
      assignedTo: assignedTo || 'Unassigned',
      location,
      condition: condition || 'Excellent',
      purchaseDate: purchaseDate || '',
      purchaseCost: purchaseCost || '0.00',
      serialNumber: serialNumber || '',
      barcode: newAsset.barcode,
      qrCode: newAsset.qrCode,
      bookable: !!bookable,
      department: department || 'None',
      customValues: customValues || {},
      photos: photos || [],
      documents: documents || [],
      lastAudit: 'Never'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to register asset.' });
  }
});

// PUT update asset
router.put('/:id', authMiddleware, checkRole(['Admin', 'Asset Manager']), async (req, res) => {
  const { id } = req.params;
  const {
    name,
    category,
    status,
    assignedTo,
    serialNumber,
    vendor,
    location,
    department,
    condition,
    bookable,
    customValues
  } = req.body;

  try {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: { allocations: { where: { status: 'ACTIVE' } } }
    });
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    let categoryId = undefined;
    if (category) {
      const catObj = await prisma.assetCategory.findFirst({
        where: { name: category, isDeleted: false }
      });
      if (catObj) categoryId = catObj.id;
    }

    let locationId = undefined;
    if (location) {
      let locObj = await prisma.location.findFirst({
        where: { name: location, isDeleted: false }
      });
      if (!locObj) {
        locObj = await prisma.location.create({
          data: {
            name: location,
            code: location.slice(0, 3).toUpperCase() + Math.floor(10 + Math.random() * 90),
            organizationId: req.user.organizationId
          }
        });
      }
      locationId = locObj.id;
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

    // Resolve vendor (auto-create)
    let vendorId = undefined;
    if (vendor !== undefined) {
      if (vendor === 'None' || vendor === '') {
        vendorId = null;
      } else {
        let vendorObj = await prisma.vendor.findFirst({
          where: { name: vendor, isDeleted: false, organizationId: req.user.organizationId }
        });
        if (!vendorObj) {
          vendorObj = await prisma.vendor.create({
            data: {
              name: vendor,
              organizationId: req.user.organizationId
            }
          });
        }
        vendorId = vendorObj.id;
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const dbAsset = await tx.asset.update({
        where: { id },
        data: {
          name,
          categoryId,
          serialNumber,
          condition: condition ? mapConditionToDb(condition) : undefined,
          sharedBookable: bookable !== undefined ? !!bookable : undefined,
          status: status ? mapStatusToDb(status, assignedTo && assignedTo !== 'Unassigned') : undefined,
          locationId,
          departmentId,
          vendorId,
          customFieldValues: customValues || undefined
        }
      });

      // Update allocation if assignee changed
      const currentAlloc = asset.allocations[0];
      if (assignedTo !== undefined) {
        if (assignedTo === 'Unassigned') {
          // Deactivate current allocation
          if (currentAlloc) {
            await tx.assetAllocation.update({
              where: { id: currentAlloc.id },
              data: { status: 'RETURNED', actualReturnDate: new Date() }
            });
            // Mark asset as AVAILABLE
            await tx.asset.update({
              where: { id },
              data: { status: 'AVAILABLE' }
            });
          }
        } else {
          // Check if employee name exists
          const emp = await tx.employee.findFirst({
            where: { name: assignedTo, isDeleted: false }
          });
          if (emp) {
            if (!currentAlloc || currentAlloc.employeeId !== emp.id) {
              // Deactivate old allocation
              if (currentAlloc) {
                await tx.assetAllocation.update({
                  where: { id: currentAlloc.id },
                  data: { status: 'RETURNED', actualReturnDate: new Date() }
                });
              }
              // Create new allocation
              await tx.assetAllocation.create({
                data: {
                  assetId: id,
                  employeeId: emp.id,
                  allocatedById: req.user.employeeId,
                  status: 'ACTIVE',
                  checkoutCondition: dbAsset.condition,
                  checkoutNotes: 'Assigned during asset update',
                  organizationId: req.user.organizationId
                }
              });
              // Mark asset as ALLOCATED
              await tx.asset.update({
                where: { id },
                data: { status: 'ALLOCATED' }
              });
            }
          }
        }
      }

      await logActivity({
        userId: req.user.userId,
        action: 'UPDATE_ASSET',
        entityType: 'Asset',
        entityId: id,
        newValue: { name, status },
        moduleName: 'ASSETS'
      }, tx);

      return dbAsset;
    });

    res.json({
      id: updated.id,
      name: updated.name,
      category: category || 'IT Equipment',
      status: status || mapStatusToFrontend(updated.status),
      assignedTo: assignedTo || 'Unassigned',
      location: location || 'HQ',
      condition: condition || mapConditionToFrontend(updated.condition),
      purchaseDate: updated.acquisitionDate ? updated.acquisitionDate.toISOString().split('T')[0] : '',
      purchaseCost: updated.acquisitionCost ? updated.acquisitionCost.toString() : '0.00',
      serialNumber: updated.serialNumber || '',
      barcode: updated.barcode,
      qrCode: updated.qrCode,
      bookable: updated.sharedBookable,
      department: department || 'None',
      customValues: updated.customFieldValues || {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update asset configuration.' });
  }
});

// DELETE asset
router.delete('/:id', authMiddleware, checkRole(['Admin']), async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.asset.update({
        where: { id },
        data: { isDeleted: true, deletedAt: new Date() }
      });
      await logActivity({
        userId: req.user.userId,
        action: 'DELETE_ASSET',
        entityType: 'Asset',
        entityId: id,
        moduleName: 'ASSETS'
      }, tx);
    });
    res.json({ success: true, message: 'Asset deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete asset.' });
  }
});

// POST upload photos / documents for an asset
// Accepts multipart/form-data with fields: photos[] and documents[]
router.post('/:id/upload', authMiddleware, checkRole(['Admin', 'Asset Manager']), (req, res, next) => {
  uploadAssetFiles(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'File upload failed.' });
    }
    const { id } = req.params;
    try {
      const asset = await prisma.asset.findUnique({ where: { id } });
      if (!asset || asset.isDeleted) {
        return res.status(404).json({ error: 'Asset not found.' });
      }

      const photoFiles    = req.files?.photos    || [];
      const documentFiles = req.files?.documents || [];

      // S3 returns `location`, local multer uses `filename`
      const getFileUrl = (f) => {
        if (f.location) return f.location; // S3
        const BASE_URL = process.env.BASE_URL || 'http://localhost:5050';
        const prefix = f.mimetype.startsWith('image/') ? 'photos' : 'documents';
        return `${BASE_URL}/uploads/${prefix}/${f.filename}`;
      };

      const photoRecords = photoFiles.map(f => ({
        assetId: id,
        url: getFileUrl(f),
        fileName: f.originalname,
        mimeType: f.mimetype
      }));

      const docRecords = documentFiles.map(f => ({
        assetId: id,
        name: f.originalname,
        url: getFileUrl(f),
        mimeType: f.mimetype
      }));

      // Persist to DB
      await prisma.$transaction(async (tx) => {
        if (photoRecords.length > 0) {
          await tx.assetImage.createMany({ data: photoRecords });
        }
        if (docRecords.length > 0) {
          await tx.assetDocument.createMany({ data: docRecords });
        }
      });

      res.json({
        success: true,
        photos: photoRecords.map(p => p.url),
        documents: docRecords.map(d => ({ name: d.name, url: d.url }))
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to persist uploaded files.' });
    }
  });
});

// POST bulk actions on assets (delete, status update)
router.post('/bulk-action', authMiddleware, checkRole(['Admin', 'Asset Manager']), async (req, res) => {
  const { action, assetIds, newStatus } = req.body;

  if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
    return res.status(400).json({ error: 'assetIds array is required.' });
  }

  try {
    if (action === 'delete') {
      await prisma.$transaction(async (tx) => {
        await tx.asset.updateMany({
          where: { id: { in: assetIds } },
          data: { isDeleted: true, deletedAt: new Date() }
        });

        await logActivity({
          userId: req.user.userId,
          action: 'BULK_DELETE_ASSETS',
          entityType: 'Asset',
          entityId: assetIds.join(','),
          newValue: { count: assetIds.length },
          moduleName: 'ASSETS'
        }, tx);
      });

      return res.json({ success: true, message: `${assetIds.length} assets deleted.` });
    }

    if (action === 'status' && newStatus) {
      const dbStatus = mapStatusToDb(newStatus, false);

      await prisma.$transaction(async (tx) => {
        await tx.asset.updateMany({
          where: { id: { in: assetIds } },
          data: { status: dbStatus }
        });

        await logActivity({
          userId: req.user.userId,
          action: 'BULK_STATUS_UPDATE',
          entityType: 'Asset',
          entityId: assetIds.join(','),
          newValue: { status: newStatus, count: assetIds.length },
          moduleName: 'ASSETS'
        }, tx);
      });

      return res.json({ success: true, message: `${assetIds.length} assets updated to ${newStatus}.` });
    }

    if (action === 'export') {
      const assets = await prisma.asset.findMany({
        where: { id: { in: assetIds }, isDeleted: false },
        include: {
          category: true,
          location: true,
          department: true,
          vendor: true,
          allocations: {
            where: { status: 'ACTIVE' },
            include: { employee: true }
          }
        }
      });

      const csvRows = assets.map(a => ({
        Name: a.name,
        Category: a.category.name,
        AssetTag: a.assetTag,
        SerialNumber: a.serialNumber || '',
        Status: a.status,
        Location: a.location.name,
        Department: a.department?.name || '',
        Vendor: a.vendor?.name || '',
        AssignedTo: a.allocations[0]?.employee?.name || 'Unassigned',
        PurchaseCost: a.acquisitionCost?.toString() || '0.00',
        PurchaseDate: a.acquisitionDate?.toISOString().split('T')[0] || ''
      }));

      return res.json({ success: true, data: csvRows });
    }

    res.status(400).json({ error: 'Invalid action. Use: delete, status, or export.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Bulk action failed.' });
  }
});

export default router;
