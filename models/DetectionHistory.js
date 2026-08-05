const mongoose = require('mongoose');
const detectionHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    gejala: { type: [String], required: true },
    indikasi: { type: String, required: true },
    ruleKey: { type: String, default: null },
    severity: { type: String, enum: ['ringan', 'sedang', 'tinggi'], required: true },
    rekomendasi: { type: String, required: true },
    cuaca: {
        suhu: { type: Number, default: null },
        deskripsi: { type: String, default: null },
        kota: { type: String, default: null }
    },
    waktuDeteksi: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

module.exports = mongoose.model('DetectionHistory', detectionHistorySchema);