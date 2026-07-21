// Basis aturan sistem pakar sederhana (rule-based)
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

const symptomGrid = document.getElementById('symptomGrid');
const resultBox = document.getElementById('resultBox');
const savedMsg = document.getElementById('savedMsg');

symptomGrid.addEventListener('change', (e) => {
    const item = e.target.closest('.symptom-item');
    item.classList.toggle('checked', e.target.checked);
});

document.getElementById('resetBtn').addEventListener('click', () => {
    document.querySelectorAll('.symptom-item input').forEach(cb => {
        cb.checked = false;
        cb.closest('.symptom-item').classList.remove('checked');
    });
    resultBox.classList.remove('show');
    savedMsg.textContent = '';
});

document.getElementById('detectBtn').addEventListener('click', () => {
    const selected = Array.from(document.querySelectorAll('.symptom-item input:checked')).map(cb => cb.value);

    if (selected.length === 0) {
        alert('Pilih minimal satu gejala terlebih dahulu.');
        return;
    }

    let best = null;
    let bestRatio = 0;

    rules.forEach(rule => {
        const matched = rule.gejala.filter(g => selected.includes(g));
        if (matched.length >= rule.minMatch) {
            const ratio = matched.length / rule.gejala.length;
            if (ratio > bestRatio) {
                bestRatio = ratio;
                best = { ...rule, matched };
            }
        }
    });

    let hasil;
    if (best) {
        hasil = {
            nama: best.nama,
            severity: best.severity,
            desc: best.desc,
            rekomendasi: best.rekomendasi,
            matchedText: 'Gejala cocok: ' + best.matched.join(', ').replaceAll('_', ' ')
        };
    } else {
        hasil = {
            nama: 'Belum Ada Indikasi Spesifik',
            severity: 'ringan',
            desc: 'Gejala yang dipilih belum cukup kuat untuk mengarah ke satu indikasi tertentu.',
            rekomendasi: 'Tetap jaga kondisi tubuh, cukup istirahat dan minum air. Pantau perkembangan gejala.',
            matchedText: ''
        };
    }

    document.getElementById('resultTitle').textContent = hasil.nama;
    const sevEl = document.getElementById('resultSeverity');
    sevEl.textContent = hasil.severity === 'tinggi' ? 'Perlu Perhatian' : hasil.severity === 'sedang' ? 'Sedang' : 'Ringan';
    sevEl.className = 'severity severity-' + hasil.severity;
    document.getElementById('resultMatched').textContent = hasil.matchedText;
    document.getElementById('resultDesc').textContent = hasil.desc;
    document.getElementById('resultRecommendation').textContent = 'Rekomendasi: ' + hasil.rekomendasi;
    resultBox.classList.add('show');

    // simpan ke riwayat (localStorage)
    try {
        const riwayat = JSON.parse(localStorage.getItem('riwayatKesehatan') || '[]');
        riwayat.unshift({
            tanggal: new Date().toISOString(),
            gejala: selected,
            indikasi: hasil.nama,
            severity: hasil.severity,
            rekomendasi: hasil.rekomendasi
        });
        localStorage.setItem('riwayatKesehatan', JSON.stringify(riwayat));
        savedMsg.textContent = 'Hasil deteksi tersimpan di Riwayat Kesehatan.';
    } catch (err) {
        console.error('Gagal menyimpan riwayat:', err);
    }

    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});