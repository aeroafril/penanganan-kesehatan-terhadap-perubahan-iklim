const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        username: { type: String, required: true, unique: true, trim: true },
        password: { type: String, required: true }, // sudah di-hash sebelum disimpan

        // untuk fitur lupa password
        resetPasswordToken: { type: String, default: null },
        resetPasswordExpires: { type: Date, default: null }
    },
    { timestamps: true } // otomatis nambah createdAt & updatedAt
);

module.exports = mongoose.model('User', userSchema);
