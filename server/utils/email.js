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
    }
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

module.exports = {
  sendLoginConfirmationEmail
};
