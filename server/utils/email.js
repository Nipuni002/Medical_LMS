const nodemailer = require('nodemailer');

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    },
    tls: {
      // Do not fail on invalid/self-signed certs (useful on some cloud hosting providers)
      rejectUnauthorized: false
    },
    connectionTimeout: 10000, // 10 seconds timeout to prevent hanging in serverless environments
    greetingTimeout: 10000,
    socketTimeout: 15000
  });
};

const sendLoginConfirmationEmail = async ({
  to,
  name,
  role,
  loginTime,
  ipAddress,
  userAgent
}) => {
  const transporter = createTransporter();

  const appName = process.env.APP_NAME || 'Medical LMS';
  const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER;
  const safeName = name || 'User';

  const text = [
    `Hi ${safeName},`,
    '',
    `This is a confirmation that your account was logged in to ${appName}.`,
    '',
    `Role: ${role}`,
    `Login time: ${loginTime}`,
    `IP address: ${ipAddress}`,
    `Device: ${userAgent}`,
    '',
    'If this was not you, please change your password immediately and contact support.'
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">
      <h2 style="margin-bottom: 8px;">Login Confirmation</h2>
      <p>Hi ${safeName},</p>
      <p>This is a confirmation that your account was logged in to <strong>${appName}</strong>.</p>
      <ul>
        <li><strong>Role:</strong> ${role}</li>
        <li><strong>Login time:</strong> ${loginTime}</li>
        <li><strong>IP address:</strong> ${ipAddress}</li>
        <li><strong>Device:</strong> ${userAgent}</li>
      </ul>
      <p>If this was not you, please change your password immediately and contact support.</p>
    </div>
  `;

  await transporter.sendMail({
    from: fromAddress,
    to,
    subject: `${appName} Login Confirmation`,
    text,
    html
  });
};

const sendWelcomeEmail = async ({ to, name }) => {
  const transporter = createTransporter();

  const appName = process.env.APP_NAME || 'Medical LMS';
  const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER;
  const safeName = name || 'User';

  const text = [
    `Hi ${safeName},`,
    '',
    `Thank you for registering on ${appName}!`,
    '',
    `We are excited to have you join our learning portal. You now have access to special notices, medical news, study tools, and clinical scenario revisions.`,
    '',
    `If you have any questions or require support, please contact our support team.`,
    '',
    'Best regards,',
    `The ${appName} Team`
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px;">
      <h2 style="color: #0A2463; margin-top: 0;">Welcome to ${appName}!</h2>
      <p>Hi <strong>${safeName}</strong>,</p>
      <p>Thank you for registering on our platform! We are absolutely thrilled to have you join our medical learning community.</p>
      <p>With your new account, you now have private access to: </p>
      <ul>
        <li><strong>Special Announcement Boards</strong> & Emergency Medical News.</li>
        <li><strong>Unified Theory Banks</strong> for PLAB, AMC, NExT, and USMLE.</li>
        <li><strong>Practice Pretests</strong> & clinical scenario simulations.</li>
      </ul>
      <p>If you have any questions or need assistance, simply reply to this email or visit our Help & Support section.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 0.9rem; color: #64748b;">Best regards,<br/><strong>The ${appName} Team</strong></p>
    </div>
  `;

  await transporter.sendMail({
    from: fromAddress,
    to,
    subject: `Thank you for registering on ${appName}!`,
    text,
    html
  });
};

module.exports = {
  sendLoginConfirmationEmail,
  sendWelcomeEmail
};
