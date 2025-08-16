import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT, 10),
  secure: true, // true for 465, false for other ports
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
  // Add these additional options
//   tls: {
//     rejectUnauthorized: false // Only for testing with self-signed certs
//   }
});

// Send email function
export const sendEmail = async (options) => {
  const mailOptions = {
    from: 'AuthFlow API developer@joemarineng.com',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html: options.html (for HTML emails)
  };

  await transporter.sendMail(mailOptions);
};