const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function notifyByEmail(toEmail, subject, text) {
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: toEmail,
    subject,
    text,
  });
}

module.exports = notifyByEmail;
