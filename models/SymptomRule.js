const mongoose = require('mongoose');

const symptomRuleSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    nama: { type: String, required: true },
    gejala: { type: [String], required: true },
    minMatch: { type: Number, required: true },
    severity: { type: String, enum: ['ringan', 'sedang', 'tinggi'], required: true },
    desc: { type: String, required: true },
    rekomendasi: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('SymptomRule', symptomRuleSchema);