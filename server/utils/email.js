const nodemailer = require('nodemailer');
const https = require('https');

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

const sendEmailViaResend = ({ to, subject, text, html }) => {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    
    console.log(`[Email] Sending via Resend API to ${to}...`);
    
    const postData = JSON.stringify({
      from: fromAddress,
      to: [to],
      subject: subject,
      text: text,
      html: html
    });

    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const responseData = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('[Email] Email sent successfully via Resend API:', responseData.id);
            resolve(responseData);
          } else {
            reject(new Error(responseData.message || `HTTP Status ${res.statusCode}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
};

const sendMailHelper = async ({ to, subject, text, html }) => {
  // If RESEND_API_KEY is configured, try Resend (HTTP based, avoids SMTP port blocking in cloud envs like Railway/Vercel)
  if (process.env.RESEND_API_KEY) {
    try {
      return await sendEmailViaResend({ to, subject, text, html });
    } catch (resendError) {
      console.error('[Email] Resend API failed. Falling back to SMTP if configured:', resendError.message);
    }
  }

  // Fallback to standard SMTP
  console.log(`[Email] Attempting to send email via SMTP to ${to}...`);
  const transporter = createTransporter();
  const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER;

  const result = await transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    text,
    html
  });

  console.log('[Email] Email sent successfully via SMTP:', result.messageId);
  return result;
};

const sendLoginConfirmationEmail = async ({
  to,
  name,
  role,
  loginTime,
  ipAddress,
  userAgent
}) => {
  const appName = process.env.APP_NAME || 'Medical LMS';
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

  await sendMailHelper({
    to,
    subject: `${appName} Login Confirmation`,
    text,
    html
  });
};

const sendWelcomeEmail = async ({ to, name }) => {
  const appName = process.env.APP_NAME || 'Medical LMS';
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

  await sendMailHelper({
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
