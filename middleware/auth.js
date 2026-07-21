const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization; // format: "Bearer eyJhbGc..."

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token tidak ditemukan. Silakan login ulang.' });
    }

    const token = authHeader.split(' ')[1]; // ambil bagian setelah "Bearer "

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id; // simpan id user, dipakai di route selanjutnya
        next(); // lanjut ke route handler
    } catch (err) {
        return res.status(401).json({ message: 'Token tidak valid atau sudah kedaluwarsa.' });
    }
}

module.exports = verifyToken;