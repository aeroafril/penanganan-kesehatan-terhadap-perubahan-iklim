const riwayatList = document.getElementById('riwayatList');
const riwayatCount = document.getElementById('riwayatCount');
const analisisSection = document.getElementById('analisisSection');

function formatTanggal(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) +
        ' · ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function getToken() {
    return localStorage.getItem('authToken');
}

async function fetchRiwayat() {
    const res = await fetch('/api/riwayat', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error('Gagal memuat riwayat');
    const data = await res.json();
    return data.riwayat;
}

async function fetchAnalisis() {
    const res = await fetch('/api/riwayat/analisis', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error('Gagal memuat analisis');
    return res.json();
}

async function deleteRiwayat(id) {
    await fetch(`/api/riwayat/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
}

function renderAnalisis(data) {
    if (!analisisSection) return;

    if (!data || data.totalDeteksi === 0) {
        analisisSection.innerHTML = '';
        return;
    }

    const freqHtml = data.frekuensiIndikasi.map(f => `
        <div class="analisis-bar-row">
            <span class="analisis-label">${f.indikasi}</span>
            <div class="analisis-bar-track">
                <div class="analisis-bar-fill" style="width:${Math.round(f.jumlah / data.totalDeteksi * 100)}%"></div>
            </div>
            <span class="analisis-jumlah">${f.jumlah}x</span>
        </div>
    `).join('');

    const waktuHtml = data.polaWaktu.map(w => `<li>${w.waktu}<span>${w.jumlah}x</span></li>`).join('');
    const cuacaHtml = data.polaCuaca.map(c => `<li>${c.suhuBucket}<span>${c.jumlah}x</span></li>`).join('');

    analisisSection.innerHTML = `
        <div class="analisis-card" id="analisisCard">
            <button class="analisis-toggle" id="analisisToggle" aria-expanded="false">
                <div class="analisis-toggle-summary">
                    <h2>Ringkasan &amp; Analisis</h2>
                    <p>
                        Total <strong>${data.totalDeteksi}</strong> kali deteksi.
                        ${data.indikasiPalingSering ? `Paling sering: <strong>${data.indikasiPalingSering.indikasi}</strong> (${data.indikasiPalingSering.jumlah}x).` : ''}
                    </p>
                </div>
                <img src="triagle.png" alt="panah" class="analisis-toggle-icon">
            </button>

            <div class="analisis-panel" id="analisisPanel">
                <div class="analisis-panel-inner">
                    <h3>Frekuensi Kondisi</h3>
                    <div class="analisis-bars">${freqHtml}</div>

                    <div class="analisis-grid-2">
                        <div>
                            <h3>Pola Waktu Deteksi</h3>
                            <ul class="analisis-list">${waktuHtml}</ul>
                        </div>
                        <div>
                            <h3>Pola Suhu Saat Deteksi</h3>
                            <ul class="analisis-list">${cuacaHtml}</ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const card = document.getElementById('analisisCard');
    const toggleBtn = document.getElementById('analisisToggle');
    const panel = document.getElementById('analisisPanel');

    toggleBtn.addEventListener('click', () => {
        const isOpen = card.classList.contains('open');
        if (isOpen) {
            card.classList.remove('open');
            panel.style.maxHeight = null;
            toggleBtn.setAttribute('aria-expanded', 'false');
        } else {
            card.classList.add('open');
            panel.style.maxHeight = panel.scrollHeight + 'px';
            toggleBtn.setAttribute('aria-expanded', 'true');
        }
    });
}

function renderRiwayat(riwayat) {
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
        return;
    }

    riwayatList.innerHTML = riwayat.map(item => `
        <div class="riwayat-item">
            <button class="btn-delete" data-id="${item._id}" title="Hapus catatan ini">
                <img src="xbtn.png" alt="xbtn">
            </button>
            <div class="riwayat-top">
                <div>
                    <h3>${item.indikasi}</h3>
                    <div class="riwayat-date">${formatTanggal(item.waktuDeteksi)}</div>
                </div>
            </div>
            <div class="gejala-list">Gejala: ${item.gejala.map(g => g.replaceAll('_', ' ')).join(', ')}</div>
            <div class="rekomendasi">Rekomendasi: ${item.rekomendasi}</div>
        </div>
    `).join('');

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
            btn.disabled = true;
            await deleteRiwayat(btn.dataset.id);
            init();
        });
    });
}

async function init() {
    try {
        const [riwayat, analisis] = await Promise.all([fetchRiwayat(), fetchAnalisis()]);
        renderRiwayat(riwayat);
        renderAnalisis(analisis);
    } catch (err) {
        console.error('Gagal memuat riwayat/analisis:', err);
        riwayatList.innerHTML = `<p>Gagal memuat riwayat. Coba refresh halaman.</p>`;
    }
}

init();