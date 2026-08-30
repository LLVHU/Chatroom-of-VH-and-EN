const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const RECIPIENTS = {
  VINCENT: 'vincentwho92@gmail.com',
  EMILY: 'fwniu18@gmail.com'
};

async function sendUnreadNotification(sender, messagePreview) {
  const recipient =
    sender === 'VINCENT HU'
      ? RECIPIENTS.EMILY
      : RECIPIENTS.VINCENT;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Pocket Chat <onboarding@resend.dev>',
      to: recipient,
      subject: `[聊天室提醒] ${sender} 发来了新消息`,
      text: `${sender} 5分钟前给你发了消息还没有回复。

"${messagePreview}"

快去看看吧！`
    });

    if (error) {
      console.error('邮件发送失败:', error);
      throw new Error(error.message);
    }

    console.log(`提醒邮件已发送给 ${recipient}`, data.id);
  } catch (err) {
    console.error('邮件发送失败:', err);
    throw err;
  }
}

module.exports = { sendUnreadNotification };