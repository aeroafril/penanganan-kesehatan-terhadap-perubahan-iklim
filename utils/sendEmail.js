const nodemailer = require('nodemailer');

// Transporter dibuat sekali, dipakai berkali-kali
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true', // true untuk port 465, false untuk 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendResetPasswordEmail(toEmail, firstName, resetLink) {
    const html = `
        <div style="font-family: Segoe UI, Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #FDF6E2; padding: 32px; border-radius: 12px;">
            <h2 style="color: #4A3B32; margin-bottom: 16px;">Reset Password PETIK</h2>
            <p style="color: #000; font-size: 14px; line-height: 1.6;">
                Halo <strong>${firstName}</strong>,
            </p>
            <p style="color: #000; font-size: 14px; line-height: 1.6;">
                Kami menerima permintaan untuk mengatur ulang password akun kamu. Klik tombol di bawah ini untuk membuat password baru:
            </p>
            <div style="text-align: center; margin: 28px 0;">
                <a href="${resetLink}" style="background: #4A7C74; color: #FDF6E2; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; display: inline-block;">
                    Ganti Password
                </a>
            </div>
            <p style="color: #4A3B32; font-size: 12px; line-height: 1.6;">
                Link ini hanya berlaku selama 1 jam. Jika kamu tidak merasa meminta reset password, abaikan saja email ini — password akun kamu tetap aman.
            </p>
            <p style="color: #999; font-size: 11px; margin-top: 24px;">
                Jika tombol di atas tidak berfungsi, salin dan tempel link berikut ke browser kamu:<br>
                ${resetLink}
            </p>
        </div>
    `;

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: toEmail,
        subject: 'Reset Password Akun PETIK',
        html
    });
}

module.exports = { sendResetPasswordEmail };
