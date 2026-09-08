import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendResetPasswordEmail = async (email, nama, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: `"Kebun Raya Eka Karya Bali" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset Password - Kebun Raya Eka Karya Bali',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #166534; margin: 0;">Kebun Raya Eka Karya Bali</h2>
          <p style="color: #6b7280; font-size: 13px;">Virtual Tour</p>
        </div>
        <div style="background: white; border-radius: 10px; padding: 24px; border: 1px solid #e5e7eb;">
          <h3 style="color: #1f2937; margin-top: 0;">Halo, ${nama}!</h3>
          <p style="color: #4b5563;">Kami menerima permintaan untuk mereset password akun Anda.</p>
          <p style="color: #4b5563;">Klik tombol di bawah untuk membuat password baru. Link ini hanya berlaku selama <strong>15 menit</strong>.</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}" style="background: #16a34a; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">
              Reset Password
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 12px;">Jika Anda tidak meminta reset password, abaikan email ini. Password Anda tidak akan berubah.</p>
          <p style="color: #9ca3af; font-size: 12px;">Atau copy link berikut ke browser:<br/><a href="${resetUrl}" style="color: #16a34a;">${resetUrl}</a></p>
        </div>
      </div>
    `,
  });
};
