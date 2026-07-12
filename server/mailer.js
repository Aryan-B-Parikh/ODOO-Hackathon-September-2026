/**
 * AssetFlow Mailer — nodemailer SMTP email utility.
 *
 * Set these in your .env to enable real email dispatch:
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=587
 *   SMTP_USER=your@email.com
 *   SMTP_PASS=your-app-password
 *   SMTP_FROM="AssetFlow <no-reply@assetflow.io>"
 *
 * Without SMTP config the module degrades gracefully:
 * emails are logged to the console only — no crash.
 */

import nodemailer from 'nodemailer';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM = 'AssetFlow <no-reply@assetflow.io>'
} = process.env;

const smtpConfigured = !!(SMTP_HOST && SMTP_USER && SMTP_PASS);

// Build transporter only when SMTP env vars are present
const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || '587'),
      secure: parseInt(SMTP_PORT || '587') === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    })
  : null;

/**
 * Core send function — degrades to console.log when SMTP is not configured.
 * @param {Object} opts  nodemailer mail options (to, subject, html)
 */
const sendMail = async (opts) => {
  if (!smtpConfigured || !transporter) {
    console.log(`[MAILER STUB] Would send email to: ${opts.to}`);
    console.log(`  Subject : ${opts.subject}`);
    console.log(`  Body    : ${opts.text || '(html only)'}`);
    return;
  }
  try {
    await transporter.sendMail({ from: SMTP_FROM, ...opts });
  } catch (err) {
    console.error('[MAILER ERROR]', err.message);
  }
};

// ─── Named helpers ────────────────────────────────────────────────────────────

/**
 * Notify an employee that an asset has been checked out to them.
 */
export const sendAllocationEmail = async ({ to, employeeName, assetName, expectedReturn }) => {
  await sendMail({
    to,
    subject: `AssetFlow: ${assetName} has been checked out to you`,
    text: `Hi ${employeeName},\n\n${assetName} has been allocated to you.\nExpected return: ${expectedReturn || 'Not specified'}.\n\nPlease visit the AssetFlow portal if you have any questions.\n\n— AssetFlow`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden">
        <div style="background:#004AC6;padding:24px 32px">
          <h2 style="color:#fff;margin:0;font-size:20px">📦 Asset Checked Out</h2>
        </div>
        <div style="padding:32px">
          <p style="font-size:15px;color:#333">Hi <strong>${employeeName}</strong>,</p>
          <p style="font-size:15px;color:#333">The following asset has been allocated to you:</p>
          <div style="background:#f5f5f5;border-radius:8px;padding:16px 20px;margin:16px 0">
            <strong style="font-size:16px;color:#004AC6">${assetName}</strong><br>
            <span style="color:#666;font-size:13px">Expected return: ${expectedReturn || 'Not specified'}</span>
          </div>
          <p style="color:#555;font-size:13px">Please take good care of this asset and return it by the expected date.</p>
          <p style="color:#aaa;font-size:12px;margin-top:32px">— AssetFlow Asset Management</p>
        </div>
      </div>`
  });
};

/**
 * Notify an employee that their asset return has been recorded.
 */
export const sendReturnConfirmEmail = async ({ to, employeeName, assetName, returnDate }) => {
  await sendMail({
    to,
    subject: `AssetFlow: ${assetName} return confirmed`,
    text: `Hi ${employeeName},\n\nThe return of ${assetName} has been recorded on ${returnDate}.\nThank you!\n\n— AssetFlow`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden">
        <div style="background:#1a7f4e;padding:24px 32px">
          <h2 style="color:#fff;margin:0;font-size:20px">✅ Return Confirmed</h2>
        </div>
        <div style="padding:32px">
          <p>Hi <strong>${employeeName}</strong>,</p>
          <p>The return of <strong>${assetName}</strong> on <strong>${returnDate}</strong> has been recorded. Thank you!</p>
          <p style="color:#aaa;font-size:12px;margin-top:32px">— AssetFlow Asset Management</p>
        </div>
      </div>`
  });
};

/**
 * Notify an admin/manager that a transfer request has been submitted.
 */
export const sendTransferRequestEmail = async ({ to, assetName, requestorName, targetName }) => {
  await sendMail({
    to,
    subject: `AssetFlow: Transfer request for ${assetName}`,
    text: `A transfer request for ${assetName} has been submitted by ${requestorName} to ${targetName}. Please log in to AssetFlow to approve or reject.\n\n— AssetFlow`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden">
        <div style="background:#6200ea;padding:24px 32px">
          <h2 style="color:#fff;margin:0;font-size:20px">🔄 Transfer Request Received</h2>
        </div>
        <div style="padding:32px">
          <p><strong>${requestorName}</strong> has requested a transfer of <strong>${assetName}</strong> to <strong>${targetName}</strong>.</p>
          <p>Please log in to AssetFlow to <strong>approve or reject</strong> this request.</p>
          <p style="color:#aaa;font-size:12px;margin-top:32px">— AssetFlow Asset Management</p>
        </div>
      </div>`
  });
};

/**
 * Notify an employee/admin about an overdue asset.
 */
export const sendOverdueEmail = async ({ to, employeeName, assetName, overdueDate }) => {
  await sendMail({
    to,
    subject: `AssetFlow: OVERDUE — ${assetName} return is past due`,
    text: `Hi ${employeeName},\n\n${assetName} was due for return on ${overdueDate} and has not been returned yet. Please return it immediately or contact your administrator.\n\n— AssetFlow`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden">
        <div style="background:#ba1a1a;padding:24px 32px">
          <h2 style="color:#fff;margin:0;font-size:20px">⚠️ Overdue Asset Alert</h2>
        </div>
        <div style="padding:32px">
          <p>Hi <strong>${employeeName}</strong>,</p>
          <p>The asset <strong>${assetName}</strong> was due for return on <strong>${overdueDate}</strong> and has not been returned.</p>
          <p>Please return it immediately or contact your asset manager.</p>
          <p style="color:#aaa;font-size:12px;margin-top:32px">— AssetFlow Asset Management</p>
        </div>
      </div>`
  });
};

/**
 * Notify an employee about an Admin promotion (dual sign-off audit trail).
 */
export const sendAdminPromotionEmail = async ({ to, promotedName, initiatorEmail, coSignerEmail }) => {
  await sendMail({
    to,
    subject: `AssetFlow: Admin role granted to ${promotedName}`,
    text: `This is an audit notification.\n${promotedName} has been promoted to Admin by ${initiatorEmail} with co-sign from ${coSignerEmail}.\n\n— AssetFlow`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden">
        <div style="background:#004AC6;padding:24px 32px">
          <h2 style="color:#fff;margin:0;font-size:20px">🔐 Admin Promotion Audit</h2>
        </div>
        <div style="padding:32px">
          <p><strong>${promotedName}</strong> has been granted <strong>Admin</strong> access.</p>
          <ul>
            <li>Initiating Admin: <strong>${initiatorEmail}</strong></li>
            <li>Co-signing Admin: <strong>${coSignerEmail}</strong></li>
          </ul>
          <p style="color:#aaa;font-size:12px;margin-top:32px">— AssetFlow Audit System</p>
        </div>
      </div>`
  });
};

/**
 * Notify a user with a password reset or setup link.
 */
export const sendPasswordResetEmail = async ({ to, resetToken, isInvite = false }) => {
  const resetLink = \`http://localhost:5173/reset-password?token=\${resetToken}\`;
  const subject = isInvite ? 'AssetFlow: You have been invited' : 'AssetFlow: Password Reset Request';
  const headerText = isInvite ? 'Welcome to AssetFlow' : 'Password Reset Request';
  const bodyText = isInvite 
    ? 'You have been invited to join AssetFlow. Click the button below to set up your password and access your account.'
    : 'We received a request to reset your password. Click the button below to choose a new password.';

  await sendMail({
    to,
    subject,
    text: \`\${bodyText}\n\nReset Link: \${resetLink}\n\n— AssetFlow\`,
    html: \`
      <div style="font-family:sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden">
        <div style="background:#004AC6;padding:24px 32px">
          <h2 style="color:#fff;margin:0;font-size:20px">🛡️ \${headerText}</h2>
        </div>
        <div style="padding:32px">
          <p>\${bodyText}</p>
          <div style="margin: 32px 0;">
            <a href="\${resetLink}" style="background:#004AC6;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:bold;display:inline-block;">
              \${isInvite ? 'Set Up Password' : 'Reset Password'}
            </a>
          </div>
          <p style="color:#666;font-size:13px">If you did not request this, you can safely ignore this email.</p>
          <p style="color:#aaa;font-size:12px;margin-top:32px">— AssetFlow Security System</p>
        </div>
      </div>\`
  });
};

