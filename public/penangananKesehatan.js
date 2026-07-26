const dataPenanganan = [
    {
        id: "heatStroke",
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
        id: "dehidrasi",
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
        id: "ispa",
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
        id: "dbd",
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
    }
];

const guideGridEl = document.getElementById('guideGrid');

function tampilPenanganan() {
    if (!guideGridEl) return;

    guideGridEl.innerHTML = dataPenanganan.map(item => `
        <div class="guide-card${item.highlight ? ' highlight' : ''}" id="card${item.id.charAt(0).toUpperCase() + item.id.slice(1)}">
            <div class="guide-top">
                <div>
                    <h3>${item.judul}</h3>
                    <span class="guide-tag">${item.tag}</span>
                </div>
            </div>
            <h4>Gejala</h4>
            <ul>
                ${item.gejala.map(g => `<li>${g}</li>`).join('')}
            </ul>
            <h4>Langkah Penanganan</h4>
            <ul>
                ${item.langkah.map(l => `<li>${l}</li>`).join('')}
            </ul>
        </div>
    `).join('');
}

tampilPenanganan();

(function () {
    // Ambil URL dari config.js terpusat — cukup edit di config.js kalau mau ganti wilayah
    const BMKG_URL = PETIK_CONFIG.BMKG_URL;

    const conditionBanner = document.getElementById('conditionBanner');
    const conditionDot = document.getElementById('conditionDot');
    const conditionText = document.getElementById('conditionText');
    const conditionBadge = document.getElementById('conditionBadge');
    const recommendationBox = document.getElementById('recommendationBox');
    const recommendationTitle = document.getElementById('recommendationTitle');
    const recommendationList = document.getElementById('recommendationList');

    function getHeatCategory(suhu) {
        if (suhu > 46.1) {
            return {
                level: 'very_high',
                label: 'Sangat Tinggi',
                highlightCards: ['cardHeatStroke', 'cardDehidrasi'],
                rekomendasi: [
                    'Minum air secara sering, jangan tunggu haus',
                    'Tunda pekerjaan/aktivitas berat yang tidak mendesak',
                    'Beri tahu orang di sekitar soal kondisi suhu ekstrem hari ini',
                    'Siapkan kontak darurat/fasilitas kesehatan terdekat bila terjadi kondisi darurat'
                ]
            };
        } else if (suhu > 39.4) {
            return {
                level: 'high',
                label: 'Tinggi',
                highlightCards: ['cardHeatStroke', 'cardDehidrasi'],
                rekomendasi: [
                    'Minum air setiap 15-20 menit',
                    'Ambil istirahat lebih sering',
                    'Jadwalkan aktivitas/pekerjaan berat di waktu yang lebih sejuk (pagi/malam)'
                ]
            };
        } else if (suhu > 32.8) {
            return {
                level: 'moderate',
                label: 'Sedang',
                highlightCards: ['cardDehidrasi'],
                rekomendasi: [
                    'Minum sekitar 4 gelas air per jam',
                    'Ambil istirahat sesuai kebutuhan tubuh'
                ]
            };
        } else {
            return {
                level: 'lower',
                label: 'Rendah',
                highlightCards: [],
                rekomendasi: [
                    'Terapkan kebiasaan aman dasar terhadap panas',
                    'Tetap jaga hidrasi seperti biasa'
                ]
            };
        }
    }

    function clearHighlights() {
        ['cardHeatStroke', 'cardDehidrasi', 'cardIspa', 'cardDbd'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('highlight');
        });
    }

    function renderCondition(suhu, deskripsi) {
        const kategori = getHeatCategory(suhu);

        conditionText.textContent = `${kategori.label}, ${suhu}°C`;
        conditionBadge.textContent = deskripsi || 'Data cuaca real-time';

        conditionBanner.classList.remove('level-lower', 'level-moderate', 'level-high', 'level-very_high');
        conditionBanner.classList.add('level-' + kategori.level);

        clearHighlights();
        kategori.highlightCards.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('highlight');
        });

        if (kategori.level === 'lower') {
            recommendationBox.classList.add('hidden');
        } else {
            recommendationTitle.textContent = `Rekomendasi: Tingkat ${kategori.label}`;
            recommendationList.innerHTML = kategori.rekomendasi.map(r => `<li>${r}</li>`).join('');
            recommendationBox.classList.remove('hidden');
        }
    }

    async function fetchCurrentCondition() {
        try {
            const res = await fetch(BMKG_URL);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const result = await res.json();
            const firstDay = result.data[0].cuaca[0];

            // cari slot waktu yang paling dekat dengan jam sekarang
            const now = new Date();
            let closestSlot = firstDay[0];
            let smallestDiff = Infinity;

            firstDay.forEach(slot => {
                const diff = Math.abs(new Date(slot.datetime) - now);
                if (diff < smallestDiff) {
                    smallestDiff = diff;
                    closestSlot = slot;
                }
            });

            renderCondition(closestSlot.t, closestSlot.weather_desc);
        } catch (err) {
            console.error('Gagal memuat kondisi cuaca:', err);
            conditionText.textContent = 'Data cuaca tidak tersedia';
            conditionBadge.textContent = 'Gagal memuat';
        }
    }

    fetchCurrentCondition();
})();
