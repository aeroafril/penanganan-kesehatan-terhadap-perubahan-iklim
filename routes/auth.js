const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendResetPasswordEmail } = require('../utils/sendEmail');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, username, password, confirmPassword } = req.body;

        if (!firstName || !lastName || !email || !username || !password || !confirmPassword) {
            return res.status(400).json({ message: 'Semua field wajib diisi.' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Password dan konfirmasi password tidak cocok.' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password minimal 8 karakter.' });
        }

        const existing = await User.findOne({ $or: [{ email }, { username }] });
        if (existing) {
            return res.status(409).json({ message: 'Email atau username sudah terdaftar.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            firstName,
            lastName,
            email,
            username,
            password: hashedPassword
        });

        return res.status(201).json({
            message: 'Registrasi berhasil! Silakan login.',
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                username: newUser.username
            }
        });
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ message: 'Terjadi kesalahan di server.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username dan password wajib diisi.' });
        }

        // izinkan login pakai username ATAU email
        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        });

        if (!user) {
            return res.status(401).json({ message: 'Username atau password salah.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Username atau password salah.' });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        return res.json({
            message: 'Login berhasil!',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                username: user.username
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Terjadi kesalahan di server.' });
    }
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email wajib diisi.' });
        }

        const user = await User.findOne({ email });

        const genericMessage = 'Jika email terdaftar, link reset password sudah kami kirim. Silakan cek inbox/folder spam.';

        if (!user) {
            return res.json({ message: genericMessage });
        }

        // buat token acak, simpan versi hash-nya di DB (bukan token asli)
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // berlaku 1 jam
        await user.save();

        const resetLink = `${process.env.FRONTEND_URL}/gantiPassword.html?token=${rawToken}&id=${user._id}`;

        await sendResetPasswordEmail(user.email, user.firstName, resetLink);

        return res.json({ message: genericMessage });
    } catch (err) {
        console.error('Forgot password error:', err);
        return res.status(500).json({ message: 'Terjadi kesalahan di server.' });
    }
});

router.get('/validate-reset-token', async (req, res) => {
    try {
        const { token, id } = req.query;

        if (!token || !id) {
            return res.status(400).json({ valid: false, message: 'Link tidak lengkap.' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            _id: id,
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ valid: false, message: 'Link reset password tidak valid atau sudah kedaluwarsa.' });
        }

        return res.json({ valid: true });
    } catch (err) {
        console.error('Validate token error:', err);
        return res.status(500).json({ valid: false, message: 'Terjadi kesalahan di server.' });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { token, id, password, confirmPassword } = req.body;

        if (!token || !id || !password || !confirmPassword) {
            return res.status(400).json({ message: 'Semua field wajib diisi.' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Password dan konfirmasi password tidak cocok.' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password minimal 8 karakter.' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            _id: id,
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Link reset password tidak valid atau sudah kedaluwarsa. Silakan ajukan ulang.' });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        return res.json({ message: 'Password berhasil diubah! Silakan login dengan password baru kamu.' });
    } catch (err) {
        console.error('Reset password error:', err);
        return res.status(500).json({ message: 'Terjadi kesalahan di server.' });
    }
});

router.get('/me', verifyToken, async (req, res) => {
    try {
        // req.userId didapat dari middleware verifyToken di atas
        const user = await User.findById(req.userId).select('-password -resetPasswordToken -resetPasswordExpires');
        // .select('-password ...') artinya: ambil SEMUA field KECUALI ini (biar gak kekirim ke browser)

        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan.' });
        }

        return res.json({ user });
    } catch (err) {
        console.error('Get me error:', err);
        return res.status(500).json({ message: 'Terjadi kesalahan di server.' });
    }
});

module.exports = router;
