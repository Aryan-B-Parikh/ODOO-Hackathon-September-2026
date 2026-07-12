import prisma from '../db.js';

/**
 * Helper utility to securely write ActivityLog entries.
 * Can use a Prisma transaction client (tx) if provided, ensuring atomic writes.
 */
export const logActivity = async ({
  userId,
  action,
  entityType,
  entityId = null,
  oldValue = null,
  newValue = null,
  severity = 'INFO',
  moduleName,
  ipAddress = '',
  userAgent = ''
}, tx = prisma) => {
  try {
    await tx.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        oldValue,
        newValue,
        severity,
        module: moduleName,
        ipAddress,
        userAgent,
      }
    });
  } catch (error) {
    console.error('[ACTIVITY LOG ERROR]', error);
  }
};
