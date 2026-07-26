const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB terhubung');
    } catch (err) {
        console.error('Gagal konek MongoDB:', err.message);
    }
}

module.exports = connectDB;
