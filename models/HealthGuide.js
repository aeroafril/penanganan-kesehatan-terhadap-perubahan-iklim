const mongoose = require('mongoose');

const healthGuideSchema = new mongoose.Schema({
    guideId: { type: String, required: true, unique: true },
    judul: { type: String, required: true },
    tag: { type: String, required: true },
    gejala: { type: [String], required: true },
    langkah: { type: [String], required: true },
    highlight: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('HealthGuide', healthGuideSchema);