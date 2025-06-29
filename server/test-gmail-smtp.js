const nodemailer = require('nodemailer');

async function testGmailSMTP() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'crisrailwayhead@gmail.com',
      pass: 'eknl hlkq cppj ofcw'
    }
  });

  try {
    const info = await transporter.sendMail({
      from: 'crisrailwayhead@gmail.com',
      to: 'crisrailwayhead@gmail.com',
      subject: 'Gmail SMTP Test',
      text: 'This is a test email sent using Gmail SMTP and nodemailer.'
    });
    console.log('✅ Email sent!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    if (error.response) {
      console.error('SMTP Response:', error.response);
    }
  }
}

testGmailSMTP(); 