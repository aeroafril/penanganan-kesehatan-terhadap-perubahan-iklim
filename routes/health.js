const express = require('express');
const SymptomRule = require('../models/SymptomRule');
const HealthGuide = require('../models/HealthGuide');
const DetectionHistory = require('../models/DetectionHistory');
const verifyToken = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

const router = express.Router();

router.get('/penanganan', optionalAuth, async (req, res) => {
    try {
        const guides = await HealthGuide.find().sort({ createdAt: 1 });

        let rekomendasiPersonal = null;

        if (req.userId) {
            const riwayat = await DetectionHistory.find({ userId: req.userId, ruleKey: { $ne: null } });

            if (riwayat.length > 0) {
                // hitung frekuensi tiap ruleKey, sekalian catat kejadian terbarunya
                const freqMap = {};
                riwayat.forEach(r => {
                    if (!freqMap[r.ruleKey]) {
                        freqMap[r.ruleKey] = { count: 0, terakhir: r.waktuDeteksi };
                    }
                    freqMap[r.ruleKey].count += 1;
                    if (new Date(r.waktuDeteksi) > new Date(freqMap[r.ruleKey].terakhir)) {
                        freqMap[r.ruleKey].terakhir = r.waktuDeteksi;
                    }
                });

                // cari ruleKey paling sering; kalau seri, yang kejadian terbarunya lebih baru menang
                let topKey = null, topInfo = null;
                Object.entries(freqMap).forEach(([key, info]) => {
                    if (!topInfo) { topKey = key; topInfo = info; return; }
                    if (info.count > topInfo.count) {
                        topKey = key; topInfo = info;
                    } else if (info.count === topInfo.count && new Date(info.terakhir) > new Date(topInfo.terakhir)) {
                        topKey = key; topInfo = info;
                    }
                });
                const topCount = topInfo.count;

                const matchingGuide = guides.find(g => g.guideId === topKey || g.guideId.toLowerCase() === topKey.replace('_', ''));

                if (matchingGuide) {
                    rekomendasiPersonal = {
                        guideId: matchingGuide.guideId,
                        nama: matchingGuide.judul,
                        jumlah: topCount
                    };
                }
            }
        }

        return res.json({ guides, rekomendasiPersonal });
    } catch (err) {
        console.error('Get panduan error:', err);
        return res.status(500).json({ message: 'Gagal mengambil data panduan.' });
    }
});

router.post('/deteksi', verifyToken, async (req, res) => {
    try {
        const { gejala, cuaca } = req.body;

        if (!Array.isArray(gejala) || gejala.length === 0) {
            return res.status(400).json({ message: 'Pilih minimal satu gejala terlebih dahulu.' });
        }

        const rules = await SymptomRule.find();

        let best = null;
        let bestRatio = 0;

        rules.forEach(rule => {
            const matched = rule.gejala.filter(g => gejala.includes(g));
            if (matched.length >= rule.minMatch) {
                const ratio = matched.length / rule.gejala.length;
                if (ratio > bestRatio) {
                    bestRatio = ratio;
                    best = { rule, matched };
                }
            }
        });

        let hasil;
        let ruleKey = null;

        if (best) {
            ruleKey = best.rule.key;
            hasil = {
                nama: best.rule.nama,
                severity: best.rule.severity,
                desc: best.rule.desc,
                rekomendasi: best.rule.rekomendasi,
                matchedText: 'Gejala cocok: ' + best.matched.join(', ').replaceAll('_', ' ')
            };
        } else {
            hasil = {
                nama: 'Belum Ada Indikasi Spesifik',
                severity: 'sedang',
                desc: 'Kombinasi gejala yang kamu pilih belum cocok dengan pola yang dikenali sistem ini. Ini bukan berarti kondisimu ringan atau tidak perlu dikhawatirkan -- keterbatasan sistem tidak boleh dijadikan patokan bahwa gejalamu tidak serius.',
                rekomendasi: 'Sebaiknya tetap konsultasikan gejala yang kamu rasakan ke dokter atau tenaga kesehatan terdekat, terutama bila gejala memburuk, berlangsung lebih dari beberapa hari, atau mengganggu aktivitas sehari-hari.',
                matchedText: ''
            };
        }

        await DetectionHistory.create({
            userId: req.userId,
            gejala,
            indikasi: hasil.nama,
            ruleKey,
            severity: hasil.severity,
            rekomendasi: hasil.rekomendasi,
            cuaca: cuaca && typeof cuaca === 'object' ? {
                suhu: cuaca.suhu ?? null,
                deskripsi: cuaca.deskripsi ?? null,
                kota: cuaca.kota ?? null
            } : undefined
        });

        return res.json({ hasil });
    } catch (err) {
        console.error('Deteksi error:', err);
        return res.status(500).json({ message: 'Terjadi kesalahan saat memproses deteksi.' });
    }
});

router.get('/riwayat', verifyToken, async (req, res) => {
    try {
        const riwayat = await DetectionHistory
            .find({ userId: req.userId })
            .sort({ waktuDeteksi: -1 });

        return res.json({ riwayat });
    } catch (err) {
        console.error('Get riwayat error:', err);
        return res.status(500).json({ message: 'Gagal mengambil riwayat.' });
    }
});

router.delete('/riwayat/:id', verifyToken, async (req, res) => {
    try {
        const deleted = await DetectionHistory.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Catatan tidak ditemukan.' });
        }

        return res.json({ message: 'Catatan berhasil dihapus.' });
    } catch (err) {
        console.error('Delete riwayat error:', err);
        return res.status(500).json({ message: 'Gagal menghapus catatan.' });
    }
});


router.get('/riwayat/analisis', verifyToken, async (req, res) => {
    try {
        const riwayat = await DetectionHistory.find({ userId: req.userId });

        const totalDeteksi = riwayat.length;

        if (totalDeteksi === 0) {
            return res.json({
                totalDeteksi: 0,
                frekuensiIndikasi: [],
                polaWaktu: [],
                polaCuaca: [],
                distribusiSeverity: { tinggi: 0, sedang: 0, ringan: 0 },
                indikasiPalingSering: null
            });
        }

        //Frekuensi tiap indikasi
        const freqMap = {};
        riwayat.forEach(r => {
            const label = r.indikasi;
            if (!freqMap[label]) {
                freqMap[label] = { indikasi: label, ruleKey: r.ruleKey, jumlah: 0, terakhir: r.waktuDeteksi };
            }
            freqMap[label].jumlah += 1;
            //simpan waktu kejadian paling baru buat indikasi ini, dipakai buat tie-breaker
            if (new Date(r.waktuDeteksi) > new Date(freqMap[label].terakhir)) {
                freqMap[label].terakhir = r.waktuDeteksi;
            }
        });
        const frekuensiIndikasi = Object.values(freqMap).sort((a, b) => {
            if (b.jumlah !== a.jumlah) return b.jumlah - a.jumlah; // utama: jumlah lebih banyak menang
            return new Date(b.terakhir) - new Date(a.terakhir);     // seri: yang paling baru menang
        });
        const indikasiPalingSering = frekuensiIndikasi[0] || null;

        //Pola berdasarkan waktu deteksi
        function getTimeBucket(date) {
            const hour = new Date(date).getHours();
            if (hour >= 5 && hour < 11) return 'Pagi (05.00-11.00)';
            if (hour >= 11 && hour < 15) return 'Siang (11.00-15.00)';
            if (hour >= 15 && hour < 18) return 'Sore (15.00-18.00)';
            return 'Malam (18.00-05.00)';
        }
        const waktuMap = {};
        riwayat.forEach(r => {
            const bucket = getTimeBucket(r.waktuDeteksi);
            waktuMap[bucket] = (waktuMap[bucket] || 0) + 1;
        });
        const urutanWaktu = ['Pagi (05.00-11.00)', 'Siang (11.00-15.00)', 'Sore (15.00-18.00)', 'Malam (18.00-05.00)'];
        const polaWaktu = urutanWaktu
            .filter(w => waktuMap[w])
            .map(w => ({ waktu: w, jumlah: waktuMap[w] }));

        //Pola berdasarkan suhu saat deteksi
        function getSuhuBucket(suhu) {
            if (suhu === null || suhu === undefined) return 'Data cuaca tidak tercatat';
            if (suhu < 27) return '< 27°C (Sejuk)';
            if (suhu <= 32) return '27-32°C (Sedang)';
            return '> 32°C (Panas)';
        }
        const cuacaMap = {};
        riwayat.forEach(r => {
            const bucket = getSuhuBucket(r.cuaca?.suhu);
            cuacaMap[bucket] = (cuacaMap[bucket] || 0) + 1;
        });
        const polaCuaca = Object.entries(cuacaMap).map(([suhuBucket, jumlah]) => ({ suhuBucket, jumlah }));

        //Distribusi severity
        const distribusiSeverity = { tinggi: 0, sedang: 0, ringan: 0 };
        riwayat.forEach(r => {
            if (distribusiSeverity[r.severity] !== undefined) distribusiSeverity[r.severity] += 1;
        });

        return res.json({
            totalDeteksi,
            frekuensiIndikasi,
            polaWaktu,
            polaCuaca,
            distribusiSeverity,
            indikasiPalingSering
        });
    } catch (err) {
        console.error('Analisis riwayat error:', err);
        return res.status(500).json({ message: 'Gagal menganalisis riwayat.' });
    }
});

module.exports = router;