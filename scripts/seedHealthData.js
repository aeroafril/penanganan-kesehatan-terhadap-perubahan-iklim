require('dotenv').config();
const mongoose = require('mongoose');
const SymptomRule = require('../models/SymptomRule');
const HealthGuide = require('../models/HealthGuide');

const rules = [
    {
        key: 'heatstroke',
        nama: 'Indikasi Heat Stroke (Sengatan Panas)',
        gejala: ['suhu_tubuh_tinggi', 'pusing', 'mual', 'lemas'],
        minMatch: 3,
        severity: 'tinggi',
        desc: 'Kombinasi gejala mengarah pada sengatan panas akibat suhu ekstrem.',
        rekomendasi: 'Segera pindah ke tempat teduh, kompres air dingin, dan minum air secara bertahap. Bila tidak membaik dalam 30 menit, segera ke IGD.'
    },
    {
        key: 'dehidrasi',
        nama: 'Indikasi Dehidrasi',
        gejala: ['lemas', 'kulit_kering', 'pusing'],
        minMatch: 2,
        severity: 'sedang',
        desc: 'Gejala menunjukkan tubuh kekurangan cairan akibat cuaca panas.',
        rekomendasi: 'Minum air putih atau cairan elektrolit, istirahat di tempat sejuk, dan hindari aktivitas berat di luar ruangan.'
    },
    {
        key: 'ispa',
        nama: 'Indikasi ISPA (Infeksi Saluran Pernapasan)',
        gejala: ['batuk', 'sesak_napas', 'tenggorokan_gatal', 'suhu_tubuh_tinggi'],
        minMatch: 2,
        severity: 'sedang',
        desc: 'Gejala mengarah pada gangguan saluran pernapasan, umumnya dipicu kualitas udara buruk.',
        rekomendasi: 'Gunakan masker, kurangi aktivitas luar ruangan, dan perbanyak istirahat. Segera ke fasilitas kesehatan bila sesak memberat.'
    },
    {
        key: 'iritasi_polusi',
        nama: 'Indikasi Iritasi Akibat Polusi Udara',
        gejala: ['mata_perih', 'batuk', 'tenggorokan_gatal'],
        minMatch: 2,
        severity: 'ringan',
        desc: 'Gejala ringan yang umum terjadi saat paparan polusi udara meningkat.',
        rekomendasi: 'Bilas mata dengan air bersih, gunakan masker saat beraktivitas di luar, dan hindari area berpolusi tinggi.'
    },
    {
        key: 'dbd',
        nama: 'Indikasi Demam Berdarah Dengue (DBD)',
        gejala: ['suhu_tubuh_tinggi', 'ruam_kulit', 'nyeri_sendi', 'mual'],
        minMatch: 3,
        severity: 'tinggi',
        desc: 'Kombinasi gejala mengarah pada potensi DBD yang umum meningkat di musim hujan.',
        rekomendasi: 'Kompres hangat, perbanyak cairan, dan segera periksa ke fasilitas kesehatan, terutama bila demam berlangsung lebih dari 2 hari.'
    },
    {
        key: 'gi',
        nama: 'Indikasi Gangguan Pencernaan',
        gejala: ['diare', 'muntah', 'nyeri_perut'],
        minMatch: 2,
        severity: 'sedang',
        desc: 'Gejala umum terjadi akibat kualitas air atau makanan yang terdampak cuaca ekstrem.',
        rekomendasi: 'Perbanyak minum cairan elektrolit, konsumsi makanan ringan, dan konsultasi dokter bila berlangsung lebih dari 2 hari.'
    }
];

const guides = [
    {
        guideId: "heatStroke",
        judul: "Heat Stroke (Sengatan Panas)",
        tag: "Suhu ekstrem",
        gejala: [
            "Suhu tubuh naik drastis (&gt;39°C)",
            "Pusing dan kebingungan",
            "Kulit kering dan memerah, tidak berkeringat",
            "Mual, lemas, atau pingsan"
        ],
        langkah: [
            "Segera pindah ke tempat teduh dan sejuk",
            "Longgarkan pakaian, kompres air dingin di leher/ketiak",
            "Berikan air minum sedikit demi sedikit",
            "Jika tidak membaik dalam 30 menit, segera ke IGD"
        ]
    },
    {
        guideId: "dehidrasi",
        judul: "Dehidrasi",
        tag: "Suhu tinggi",
        gejala: [
            "Mulut dan bibir kering",
            "Lemas dan mudah lelah",
            "Urine berwarna gelap dan jarang buang air kecil",
            "Sakit kepala ringan"
        ],
        langkah: [
            "Minum air putih atau cairan elektrolit secara bertahap",
            "Hindari aktivitas berat di luar ruangan siang hari",
            "Istirahat di tempat sejuk",
            "Konsultasi dokter bila disertai muntah terus-menerus"
        ]
    },
    {
        guideId: "ispa",
        judul: "ISPA (Infeksi Saluran Pernapasan)",
        tag: "Kualitas udara buruk",
        gejala: [
            "Batuk dan tenggorokan gatal",
            "Sesak napas atau napas berbunyi",
            "Mata perih dan berair",
            "Demam ringan"
        ],
        langkah: [
            "Gunakan masker saat kualitas udara buruk",
            "Kurangi aktivitas luar ruangan, terutama pagi/sore",
            "Perbanyak istirahat dan cairan hangat",
            "Segera ke fasilitas kesehatan bila sesak memberat"
        ]
    },
    {
        guideId: "dbd",
        judul: "DBD & Penyakit Musim Hujan",
        tag: "Curah hujan tinggi",
        gejala: [
            "Demam tinggi mendadak",
            "Nyeri sendi dan otot",
            "Muncul ruam merah di kulit",
            "Mual dan nafsu makan menurun"
        ],
        langkah: [
            "Kompres hangat dan perbanyak minum",
            "Kuras dan tutup penampungan air di sekitar rumah",
            "Pantau suhu tubuh secara berkala",
            "Segera periksa ke fasilitas kesehatan bila demam &gt;2 hari"
        ]
    },
    {
        guideId: "iritasiPolusi",
        judul: "Iritasi Akibat Polusi Udara",
        tag: "Polusi udara tinggi",
        gejala: [
            "Mata perih dan berair",
            "Batuk ringan",
            "Tenggorokan gatal atau kering",
            "Kulit terasa tidak nyaman"
        ],
        langkah: [
            "Bilas mata dengan air bersih",
            "Gunakan masker saat beraktivitas di luar ruangan",
            "Hindari area dengan tingkat polusi tinggi",
            "Periksa ke dokter bila iritasi tidak kunjung membaik"
        ]
    },
    {
        guideId: "gangguanPencernaan",
        judul: "Gangguan Pencernaan",
        tag: "Kualitas air/makanan terdampak cuaca",
        gejala: [
            "Diare",
            "Mual dan muntah",
            "Nyeri perut",
            "Lemas akibat kehilangan cairan tubuh"
        ],
        langkah: [
            "Perbanyak minum cairan elektrolit",
            "Konsumsi makanan ringan dan mudah dicerna",
            "Istirahat yang cukup",
            "Konsultasi dokter bila berlangsung lebih dari 2 hari"
        ]
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Terhubung ke MongoDB, mulai seeding...');

        for (const rule of rules) {
            await SymptomRule.findOneAndUpdate(
                { key: rule.key },
                rule,
                { upsert: true, new: true }
            );
        }
        console.log(`${rules.length} rule berhasil di-seed.`);

        for (const guide of guides) {
            await HealthGuide.findOneAndUpdate(
                { guideId: guide.guideId },
                guide,
                { upsert: true, new: true }
            );
        }
        console.log(`${guides.length} panduan berhasil di-seed.`);

        console.log('Selesai!');
    } catch (err) {
        console.error('Gagal seeding:', err);
    } finally {
        await mongoose.disconnect();
    }
}

seed();