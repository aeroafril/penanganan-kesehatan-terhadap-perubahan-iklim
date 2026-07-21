const express = require('express');
const router = express.Router();

/**
 * Proxy ke BMKG API. Fetch dari sisi server (Node.js) gak kena CORS,
 * jadi frontend cukup fetch ke endpoint ini (satu origin dengan backend),
 * bukan langsung ke api.bmkg.go.id.
 *
 * Contoh pakai dari frontend:
 *   fetch('/api/cuaca?adm4=31.71.03.1001')
 *
 * CACHING: BMKG cuma kasih jatah 60 request/menit per IP, sementara halaman
 * peta kita bisa nembak 30+ kota sekaligus tiap kali dibuka/refresh -> gampang
 * kena 429 (Too Many Requests). Data prakiraan cuaca juga gak berubah tiap detik
 * (per-jam), jadi gak perlu selalu fetch ulang ke BMKG. Solusinya: simpan hasil
 * per wilayah selama beberapa menit di memori server, request berikutnya untuk
 * wilayah yang sama dalam rentang waktu itu langsung dijawab dari cache,
 * TANPA menyentuh BMKG sama sekali.
 */

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 menit
const cache = new Map(); // key: `${paramName}:${adm}` -> { data, expiresAt }

// Bersihkan entry yang sudah kedaluwarsa secara berkala, biar cache gak numpuk terus di memori.
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
        if (entry.expiresAt <= now) cache.delete(key);
    }
}, CACHE_TTL_MS).unref();

router.get('/cuaca', async (req, res) => {
    try {
        const { adm1, adm2, adm3, adm4 } = req.query;
        const adm = adm4 || adm3 || adm2 || adm1;

        if (!adm) {
            return res.status(400).json({ message: 'Parameter adm1/adm2/adm3/adm4 wajib diisi.' });
        }

        const paramName = adm4 ? 'adm4' : adm3 ? 'adm3' : adm2 ? 'adm2' : 'adm1';
        const cacheKey = `${paramName}:${adm}`;

        // ===== Cek cache dulu sebelum ke BMKG =====
        const cached = cache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) {
            res.set('X-Cache', 'HIT');
            return res.json(cached.data);
        }

        const bmkgUrl = `https://api.bmkg.go.id/publik/prakiraan-cuaca?${paramName}=${adm}`;

        if (typeof fetch !== 'function') {
            console.error('Proxy cuaca error: fetch tidak tersedia di runtime ini. Pastikan Node.js >= 18, atau install & import node-fetch.');
            return res.status(500).json({ message: 'Server belum mendukung fetch bawaan. Cek versi Node.js.' });
        }

        let bmkgRes;
        try {
            bmkgRes = await fetch(bmkgUrl, {
                headers: {
                    // Jangan nyamar jadi browser (Mozilla/Chrome dsb) -- Cloudflare
                    // di depan BMKG malah mencurigai mismatch UA vs fingerprint Node.
                    // User-Agent jujur ala curl terbukti lolos.
                    'User-Agent': 'curl/8.21.0',
                    'Accept': '*/*'
                }
            });
        } catch (networkErr) {
            console.error('Proxy cuaca error (network ke BMKG):', networkErr);

            // Kalau ada cache lama yang sudah expired tapi masih ada, mending
            // tetap dipakai sebagai fallback daripada user gak dapat apa-apa.
            if (cached) {
                res.set('X-Cache', 'STALE');
                return res.json(cached.data);
            }
            return res.status(502).json({ message: 'Gagal menghubungi server BMKG. Coba lagi beberapa saat.' });
        }

        if (!bmkgRes.ok) {
            const rawBody = await bmkgRes.text().catch(() => '');
            console.error(`Proxy cuaca error: BMKG respond status ${bmkgRes.status}. Body:`, rawBody.slice(0, 300));

            // Kalau kena 429 (rate limit) dan kita masih punya cache basi, lebih
            // baik pakai itu daripada gagal total -- lebih baik data agak lama
            // daripada gak ada data sama sekali.
            if (cached) {
                res.set('X-Cache', 'STALE');
                return res.json(cached.data);
            }

            const status = bmkgRes.status === 429 ? 429 : 502;
            const message = bmkgRes.status === 429
                ? 'Terlalu banyak permintaan ke BMKG saat ini. Coba lagi sebentar lagi.'
                : `Gagal mengambil data dari BMKG (status ${bmkgRes.status}).`;
            return res.status(status).json({ message });
        }

        let data;
        try {
            data = await bmkgRes.json();
        } catch (parseErr) {
            console.error('Proxy cuaca error (parse JSON gagal):', parseErr);
            if (cached) {
                res.set('X-Cache', 'STALE');
                return res.json(cached.data);
            }
            return res.status(502).json({ message: 'Format data dari BMKG tidak sesuai.' });
        }

        if (!data || !data.data || !data.data[0]) {
            return res.status(404).json({ message: 'Data cuaca tidak ditemukan untuk wilayah ini.' });
        }

        // Simpan ke cache untuk request berikutnya.
        cache.set(cacheKey, { data, expiresAt: Date.now() + CACHE_TTL_MS });

        res.set('X-Cache', 'MISS');
        return res.json(data);

    } catch (err) {
        console.error('Proxy cuaca error (tidak terduga):', err);
        return res.status(500).json({ message: 'Terjadi kesalahan di server saat mengambil data cuaca.' });
    }
});

module.exports = router;