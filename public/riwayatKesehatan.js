const riwayatList = document.getElementById('riwayatList');
const riwayatCount = document.getElementById('riwayatCount');
const clearBtn = document.getElementById('clearBtn');

function formatTanggal(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) +
        ' · ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function severityLabel(sev) {
    return sev === 'tinggi' ? 'Perlu Perhatian' : sev === 'sedang' ? 'Sedang' : 'Ringan';
}

function getRiwayat() {
    try {
        return JSON.parse(localStorage.getItem('riwayatKesehatan') || '[]');
    } catch (err) {
        console.error('Gagal membaca riwayat:', err);
        return [];
    }
}

function saveRiwayat(data) {
    localStorage.setItem('riwayatKesehatan', JSON.stringify(data));
}

function render() {
    const riwayat = getRiwayat();
    riwayatCount.textContent = riwayat.length + ' catatan tersimpan';

    if (riwayat.length === 0) {
        riwayatList.innerHTML = `
            <div class="empty-state">
                <a href="pendeteksiKesehatan.html"><img src="plus.png" alt="gambarPlus"></a>
                <h3>Belum ada riwayat kesehatan</h3>
                <p>Hasil deteksi gejala yang kamu lakukan akan muncul di sini.</p>
                <a href="pendeteksiKesehatan.html">Mulai Deteksi Sekarang</a>
            </div>
        `;
        clearBtn.style.display = 'none';
        return;
    }

    clearBtn.style.display = 'inline-block';

    riwayatList.innerHTML = riwayat.map((item, index) => `
        <div class="riwayat-item">
            <button class="btn-delete" data-index="${index}" title="Hapus catatan ini">
                <img src="xbtn.png" alt="xbtn">
            </button>
            <div class="riwayat-top">
                <div>
                    <h3>${item.indikasi}</h3>
                    <div class="riwayat-date">${formatTanggal(item.tanggal)}</div>
                </div>
                <span class="severity severity-${item.severity}">${severityLabel(item.severity)}</span>
            </div>
            <div class="gejala-list">Gejala: ${item.gejala.map(g => g.replaceAll('_', ' ')).join(', ')}</div>
            <div class="rekomendasi">Rekomendasi: ${item.rekomendasi}</div>
        </div>
    `).join('');

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index, 10);
            const riwayat = getRiwayat();
            riwayat.splice(idx, 1);
            saveRiwayat(riwayat);
            render();
        });
    });
}

clearBtn.addEventListener('click', () => {
    if (confirm('Hapus semua riwayat kesehatan? Tindakan ini tidak bisa dibatalkan.')) {
        saveRiwayat([]);
        render();
    }
});

render();