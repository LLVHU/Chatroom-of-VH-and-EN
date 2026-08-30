const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const RECIPIENTS = {
  VINCENT: 'vincentwho92@gmail.com',
  EMILY: 'Fwniu18@gmail.com'
};

async function sendUnreadNotification(sender, messagePreview) {
  const recipient = sender === 'VINCENT HU' ? RECIPIENTS.EMILY : RECIPIENTS.VINCENT;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: recipient,
    subject: `[聊天室提醒] ${sender} 发来了新消息`,
    text: `${sender} 20分钟前给你发了消息还没回复:\n\n"${messagePreview}"\n\n快去看看吧~`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`提醒邮件已发送给 ${recipient}`);
  } catch (err) {
    console.error('邮件发送失败:', err);
    throw err;
  }
}

module.exports = { sendUnreadNotification };