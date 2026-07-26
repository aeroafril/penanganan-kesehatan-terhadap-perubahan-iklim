const mongoose = require('mongoose');

let cachedConnection = null;

async function connectDB() {
    if (cachedConnection) {
        return cachedConnection;
    }

    cachedConnection = mongoose.connect(process.env.MONGODB_URI)
        .then((conn) => {
            console.log('MongoDB terhubung');
            return conn;
        })
        .catch((err) => {
            console.error('Gagal konek MongoDB:', err.message);
            cachedConnection = null;
            throw err;
        });

    return cachedConnection;
}

module.exports = connectDB;
