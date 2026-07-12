import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' }, isDeleted: false },
      include: {
        employee: true,
        userRoles: {
          include: { role: true }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const passwordMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: `Account is ${user.status.toLowerCase()}.` });
    }

    // Get role name
    const roleName = user.userRoles[0]?.role.name || 'Employee';

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: roleName,
        organizationId: user.organizationId,
        employeeId: user.employeeId,
        name: user.employee.name,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Generate and store RefreshToken
    const refreshTokenString = crypto.randomBytes(40).toString('hex');
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshTokenString,
        expiresAt: refreshExpiry
      }
    });

    res.json({
      token,
      refreshToken: refreshTokenString,
      user: {
        name: user.employee.name,
        email: user.email,
        role: roleName,
        status: user.status,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login.' });
  }
});

// Signup route
router.post('/signup', async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  try {
    // 1. Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' }, isDeleted: false }
    });
    if (existingUser) {
      return res.status(400).json({ error: 'User account with this email already exists.' });
    }

    // Get default Organization
    const org = await prisma.organization.findFirst({ where: { code: 'AF-ORG' } });
    if (!org) {
      return res.status(500).json({ error: 'Default organization not configured.' });
    }

    // Find or create role
    const selectedRoleName = role || 'Employee';
    const dbRole = await prisma.role.findFirst({
      where: { name: { equals: selectedRoleName, mode: 'insensitive' } }
    });
    if (!dbRole) {
      return res.status(400).json({ error: `Invalid role specified: ${selectedRoleName}` });
    }

    // 2. Find matching employee or create one
    let employee = await prisma.employee.findFirst({
      where: { email: { equals: email, mode: 'insensitive' }, isDeleted: false }
    });

    const userPasswordHash = bcrypt.hashSync(password, 10);

    // Create user and employee in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      if (!employee) {
        employee = await tx.employee.create({
          data: {
            name,
            email,
            phone: phone || null,
            organizationId: org.id,
          }
        });
      }

      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash: userPasswordHash,
          organizationId: org.id,
          employeeId: employee.id,
        }
      });

      await tx.userRole.create({
        data: {
          userId: newUser.id,
          roleId: dbRole.id
        }
      });

      return { user: newUser, employee };
    });

    res.status(201).json({
      message: 'Signup successful.',
      user: {
        name: result.employee.name,
        email: result.user.email,
        role: selectedRoleName
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'An error occurred during signup.' });
  }
});

// Refresh token route
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required.' });
  }

  try {
    const dbToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          include: {
            employee: true,
            userRoles: {
              include: { role: true }
            }
          }
        }
      }
    });

    if (!dbToken || dbToken.revokedAt || dbToken.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }

    // Revoke old token and create new token (Token Rotation)
    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.$transaction(async (tx) => {
      await tx.refreshToken.update({
        where: { id: dbToken.id },
        data: { revokedAt: new Date() }
      });

      await tx.refreshToken.create({
        data: {
          userId: dbToken.userId,
          token: newRefreshToken,
          expiresAt: newExpiry
        }
      });
    });

    const roleName = dbToken.user.userRoles[0]?.role.name || 'Employee';
    const newToken = jwt.sign(
      {
        userId: dbToken.user.id,
        email: dbToken.user.email,
        role: roleName,
        organizationId: dbToken.user.organizationId,
        employeeId: dbToken.user.employeeId,
        name: dbToken.user.employee.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'An error occurred during token refresh.' });
  }
});

// Forgot Password endpoint
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' }, isDeleted: false }
    });

    if (!user) {
      // Return generic success to avoid user enumeration
      return res.json({ message: 'Instructions sent to email if account exists.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: expiry
      }
    });

    console.log(`[MAIL SIMULATOR] Password reset token for ${email}: ${resetToken}`);
    res.json({ message: 'Instructions sent to email if account exists.', resetToken }); // return in JSON for testing / screen simulations
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to request password reset.' });
  }
});

// Reset Password endpoint
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required.' });
  }

  try {
    const reset = await prisma.passwordReset.findFirst({
      where: { token, usedAt: null, expiresAt: { gt: new Date() } }
    });

    if (!reset) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    const hashed = bcrypt.hashSync(password, 10);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: reset.userId },
        data: { passwordHash: hashed }
      });

      await tx.passwordReset.update({
        where: { id: reset.id },
        data: { usedAt: new Date() }
      });
    });

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// Verify Email endpoint
router.post('/verify-email', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Verification token is required.' });
  }

  try {
    const verification = await prisma.emailVerification.findFirst({
      where: { token, verifiedAt: null, expiresAt: { gt: new Date() } }
    });

    if (!verification) {
      return res.status(400).json({ error: 'Invalid or expired verification token.' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.emailVerification.update({
        where: { id: verification.id },
        data: { verifiedAt: new Date() }
      });

      await tx.user.update({
        where: { id: verification.userId },
        data: { status: 'ACTIVE' }
      });
    });

    res.json({ success: true, message: 'Email verified and account activated.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to verify email.' });
  }
});

// Current User profile route
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        employee: {
          include: { department: true }
        },
        userRoles: {
          include: { role: true }
        }
      }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({
      name: user.employee.name,
      email: user.email,
      role: user.userRoles[0]?.role.name || 'Employee',
      status: user.status,
      phone: user.employee.phone,
      department: user.employee.department?.name || 'None',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

// GET user notification preferences
router.get('/preferences', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { organizationId: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const types = ['SYSTEM', 'ALLOCATION', 'MAINTENANCE', 'BOOKING', 'TRANSFER', 'AUDIT', 'ALERT'];
    
    // Find existing preferences
    const existing = await prisma.notificationPreference.findMany({
      where: { userId: req.user.userId }
    });

    const prefMap = {};
    existing.forEach(p => {
      prefMap[p.notificationType] = p;
    });

    // Generate response list, creating missing preferences on the fly with defaults
    const result = await Promise.all(types.map(async (t) => {
      if (prefMap[t]) {
        return prefMap[t];
      }
      // Create default preference
      return await prisma.notificationPreference.create({
        data: {
          userId: req.user.userId,
          notificationType: t,
          channelEmail: true,
          channelPush: true,
          channelInApp: true,
          organizationId: user.organizationId
        }
      });
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve preferences.' });
  }
});

// POST update user notification preferences
router.post('/preferences', authMiddleware, async (req, res) => {
  const { preferences } = req.body; // Expect array of { type: string, channelEmail: bool, channelPush: bool, channelInApp: bool }
  if (!Array.isArray(preferences)) {
    return res.status(400).json({ error: 'Preferences must be an array.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { organizationId: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const results = [];
    for (const p of preferences) {
      const updated = await prisma.notificationPreference.upsert({
        where: {
          userId_notificationType: {
            userId: req.user.userId,
            notificationType: p.type
          }
        },
        update: {
          channelEmail: p.channelEmail,
          channelPush: p.channelPush,
          channelInApp: p.channelInApp
        },
        create: {
          userId: req.user.userId,
          notificationType: p.type,
          channelEmail: p.channelEmail ?? true,
          channelPush: p.channelPush ?? true,
          channelInApp: p.channelInApp ?? true,
          organizationId: user.organizationId
        }
      });
      results.push(updated);
    }

    res.json({ success: true, preferences: results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update preferences.' });
  }
});

export default router;
