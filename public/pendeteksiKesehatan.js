const symptomGrid = document.getElementById('symptomGrid');
const resultBox = document.getElementById('resultBox');
const savedMsg = document.getElementById('savedMsg');
const detectBtn = document.getElementById('detectBtn');

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

async function ambilKonteksCuaca() {
    try {
        const res = await fetch(PETIK_CONFIG.BMKG_URL);
        if (!res.ok) return null;

        const data = await res.json();
        const firstDay = data.data[0].cuaca[0];

        const now = new Date();
        let closest = firstDay[0];
        let smallestDiff = Infinity;
        firstDay.forEach(slot => {
            const diff = Math.abs(new Date(slot.datetime) - now);
            if (diff < smallestDiff) {
                smallestDiff = diff;
                closest = slot;
            }
        });

        return {
            suhu: closest.t,
            deskripsi: closest.weather_desc,
            kota: PETIK_CONFIG.CURRENT_CITY?.name || null
        };
    } catch (err) {
        console.warn('Gagal ambil konteks cuaca, deteksi tetap lanjut tanpa data cuaca:', err);
        return null;
    }
}

detectBtn.addEventListener('click', async () => {
    const selected = Array.from(document.querySelectorAll('.symptom-item input:checked')).map(cb => cb.value);

    if (selected.length === 0) {
        alert('Pilih minimal satu gejala terlebih dahulu.');
        return;
    }

    detectBtn.disabled = true;

    try {
        const cuaca = await ambilKonteksCuaca();
        const token = localStorage.getItem('authToken');

        const res = await fetch('/api/deteksi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ gejala: selected, cuaca })
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || `HTTP ${res.status}`);
        }

        const { hasil } = await res.json();

        document.getElementById('resultTitle').textContent = hasil.nama;
        document.getElementById('resultMatched').textContent = hasil.matchedText;
        document.getElementById('resultDesc').textContent = hasil.desc;
        document.getElementById('resultRecommendation').textContent = 'Rekomendasi: ' + hasil.rekomendasi;
        resultBox.classList.add('show');

        savedMsg.textContent = 'Hasil deteksi tersimpan di Riwayat Kesehatan.';

        resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) {
        console.error('Gagal melakukan deteksi:', err);
        alert('Gagal memproses deteksi. Coba lagi sebentar.');
    } finally {
        detectBtn.disabled = false;
    }
});