import nodemailer from 'nodemailer';

const smtpPort = parseInt(process.env.SMTP_PORT);
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465, // 465 = implicit TLS/SSL; 587 = STARTTLS (secure:false)
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

export const sendOtpEmail = async (to, name, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: 'ManpowerPay HMS — Password Reset OTP',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;border:1px solid #ddd;padding:32px;border-radius:8px">
          <h2 style="color:#1F4E79">Password Reset OTP</h2>
          <p>Hi ${name},</p>
          <p>Your OTP for password reset is:</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#2E75B6;text-align:center;padding:16px;background:#f0f7ff;border-radius:8px;margin:16px 0">
            ${otp}
          </div>
          <p>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
          <p style="color:#888;font-size:12px">ManpowerPay HMS</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

export const sendPayslipEmail = async (to, name, month, year, pdfBuffer) => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: `Your Payslip for ${month}/${year} — ManpowerPay`,
    html: `<p>Hi ${name},</p><p>Please find your payslip for ${month}/${year} attached.</p>`,
    attachments: [{ filename: `payslip_${month}_${year}.pdf`, content: pdfBuffer }]
  });
};
