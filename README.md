# PETIK — Penanganan Kesehatan Terhadap Perubahan Iklim

Aplikasi web yang membantu masyarakat memantau dampak kesehatan akibat perubahan iklim — mulai dari cuaca ekstrem, kualitas udara, hingga deteksi awal gejala penyakit yang mungkin muncul akibatnya.

🔗 **Live demo:** [penanganan-kesehatan-terhadap-perub.vercel.app](https://penanganan-kesehatan-terhadap-perub.vercel.app/dashboard.html)

## Fitur Utama

- **Autentikasi pengguna** — registrasi & login dengan password ter-enkripsi (bcrypt), sesi menggunakan JWT, serta fitur lupa/reset password lewat email.
- **Cuaca real-time** — data cuaca (suhu, kelembapan, angin, curah hujan) langsung dari BMKG untuk 31 kota besar di Indonesia.
- **Peta cuaca interaktif** — visualisasi lokasi & kondisi cuaca tiap kota di peta (Leaflet + vector tiles OpenFreeMap).
- **Pendeteksi gejala kesehatan** — sistem pakar rule-based untuk mengidentifikasi 6 indikasi kondisi kesehatan yang berkaitan dengan cuaca (heat stroke, dehidrasi, ISPA, iritasi polusi, DBD, gangguan pencernaan).
- **Panduan penanganan kesehatan** — informasi gejala dan langkah penanganan untuk tiap kondisi, disusun berdasarkan regulasi Kemenkes.
- **Riwayat kesehatan** — menyimpan histori hasil deteksi gejala pengguna.
- **Form saran** — pengguna dapat mengirim masukan yang diteruskan lewat email, dibatasi rate limit (3x/hari per IP).

## Teknologi

| Bagian | Teknologi |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (vanilla) |
| Backend | Node.js, Express |
| Basis data | MongoDB Atlas |
| Autentikasi | bcryptjs, jsonwebtoken (JWT) |
| Peta | Leaflet, MapLibre GL (OpenFreeMap) |
| Hosting/Deployment | Vercel |

## Sumber Data

- **Cuaca** — [BMKG](https://data.bmkg.go.id/prakiraan-cuaca/) (Badan Meteorologi, Klimatologi, dan Geofisika)
- **Kategori & penanganan kesehatan** — Permenkes No. 35 Tahun 2012, Permenkes No. 1018/Menkes/Per/V/2011, publikasi resmi Kemenkes RI, Kepmenkes No. HK.01.07/Menkes/532/2019, RAN-APIK 2020
- **Kode wilayah administratif** — [cahyadsn/wilayah](https://github.com/cahyadsn/wilayah) (berbasis data Kepmendagri)
- **Peta** — OpenStreetMap via OpenFreeMap

## Struktur Proyek

```
├── config/
│   └── db.js              # koneksi MongoDB Atlas
├── middleware/
│   └── auth.js             # verifikasi JWT
├── models/
│   └── User.js
├── routes/
│   ├── auth.js              # register, login, forgot/reset password, /me
│   └── weather.js           # proxy + cache request cuaca ke BMKG
├── utils/
│   └── sendEmail.js         # kirim email reset password & saran
├── public/                  # seluruh file frontend (html, css, js)
├── server.js                 # entry point Express
└── vercel.json               # konfigurasi deployment Vercel
```

## Menjalankan di Lokal

1. Clone repository ini dan install dependencies:
   ```bash
   npm install
   ```

2. Buat file `.env` di root project, isi dengan:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<namaDatabase>
   JWT_SECRET=isi_dengan_string_acak_yang_panjang
   FRONTEND_URL=http://localhost:5000
   # + kredensial email untuk fitur reset password & form saran (lihat utils/sendEmail.js)
   ```

3. Jalankan server:
   ```bash
   node server.js
   ```
   Server berjalan di `http://localhost:5000`.

## Deployment

Live: [penanganan-kesehatan-terhadap-perub.vercel.app](https://penanganan-kesehatan-terhadap-perub.vercel.app/dashboard.html)

Proyek ini di-deploy menggunakan **Vercel** (serverless) dengan basis data **MongoDB Atlas**. Pastikan:
- Environment variables (`MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, dll) sudah di-set di Vercel Project Settings untuk environment **Production** & **Preview**.
- MongoDB Atlas Network Access mengizinkan koneksi dari `0.0.0.0/0` (karena IP server Vercel bersifat dinamis).

## Tim Pengembang

| Nama | Peran |
|---|---|
| Aero Afril | Fullstack Website |
| Risky Adi | UI/UX Designer |
| Patricia | Proposal & Dokumentasi |

## Lisensi

Proyek ini dibuat untuk keperluan lomba website Technology Innovative Challenge 9.0.
