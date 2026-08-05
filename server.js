require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const weatherRoutes = require('./routes/weather');
const healthRoutes = require('./routes/health');
const { sendSuggestionEmail } = require('./utils/sendEmail');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        return res.status(503).json({ message: 'Database belum siap, coba lagi sebentar.' });
    }
});

const saranLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Anda sudah mengirim saran 3 kali hari ini. Silakan coba lagi besok.'
    },
});

app.post('/api/saran', saranLimiter, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ message: 'Pesan tidak boleh kosong!' });
        }
        await sendSuggestionEmail(message.trim());
        res.status(200).json({ success: true, message: 'Saran terkirim!' });
    } catch (error) {
        console.error('Gagal mengirim email saran:', error);
        res.status(500).json({ success: false, message: 'Gagal mengirim email.' });
    }
});

app.use('/api', authRoutes);
app.use('/api', weatherRoutes);
app.use('/api', healthRoutes);

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server berjalan di http://localhost:${PORT}`);
    });
}

module.exports = app;