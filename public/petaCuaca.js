(function () {
    const cityGrid = document.getElementById('cityGrid');
    const refreshBtn = document.getElementById('refreshBtn');

    function tempCategory(t) {
        if (t >= 32) return 'hot';
        if (t >= 27) return 'warm';
        return 'cool';
    }

    const TEMP_COLOR = {
        hot: '#e63946',
        warm: '#f4a261',
        cool: '#457b9d',
        loading: '#adb5bd',
        error: '#6c757d'
    };

    function getWeatherIcon(code) {
        if (code === 0 || code === 1) return '☀️';
        if (code === 2 || code === 3) return '⛅';
        if (code === 4) return '☁️';
        if (code >= 61 && code <= 67) return '🌧️';
        if (code >= 80 && code <= 82) return '🌦️';
        if (code >= 95) return '⛈️';
        return '☁️';
    }

    // ===== Setup peta Leaflet (OpenStreetMap, gratis, tanpa API key) =====
    // Titik tengah kira-kira di tengah Indonesia, zoom level 5 supaya seluruh
    // wilayah dari Sumatera sampai Papua kelihatan.
    const map = L.map('mapInner').setView([-2.5, 118], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
    }).addTo(map);

    // Simpan referensi marker per kota (key: adm2), supaya bisa diupdate
    // warna/isi popup-nya setelah data cuaca datang, tanpa gambar ulang peta.
    const markers = {};

    function makeDivIcon(color, label) {
        return L.divIcon({
            className: 'city-marker-icon',
            html: `<div style="
                background:${color};
                width:28px;height:28px;border-radius:50%;
                display:flex;align-items:center;justify-content:center;
                color:#fff;font-size:11px;font-weight:600;
                border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4);
            ">${label}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            popupAnchor: [0, -16],
        });
    }

    function renderSkeleton() {
        PETIK_CITIES.forEach(city => {
            const marker = L.marker([city.lat, city.lon], {
                icon: makeDivIcon(TEMP_COLOR.loading, '⏳'),
            }).addTo(map);
            marker.bindPopup(`<strong>${city.name}</strong><br>Memuat...`);
            markers[city.adm2] = marker;
        });

        cityGrid.innerHTML = PETIK_CITIES.map(city => `
            <div class="city-card loading" id="card-${city.adm2.replace('.', '-')}" data-adm2="${city.adm2}">
                <div class="city-card-top">
                    <div>
                        <h3>${city.name}</h3>
                        <span class="city-province">${city.province}</span>
                    </div>
                    <span class="city-icon">⏳</span>
                </div>
                <div class="city-temp">--°</div>
                <div class="city-desc">Memuat...</div>
            </div>
        `).join('');
    }

    function updateMarker(city, temp, icon) {
        const marker = markers[city.adm2];
        if (!marker) return;
        const color = TEMP_COLOR[tempCategory(temp)];
        marker.setIcon(makeDivIcon(color, `${temp}°`));
        marker.setPopupContent(`<strong>${city.name}</strong><br>${icon} ${temp}°C`);
        marker.on('click', () => {
            PETIK_CONFIG.setSelectedCity(city);
            window.location.href = 'cuaca.html';
        });
    }

    function updateMarkerError(city) {
        const marker = markers[city.adm2];
        if (!marker) return;
        marker.setIcon(makeDivIcon(TEMP_COLOR.error, '⚠️'));
        marker.setPopupContent(`<strong>${city.name}</strong><br>Data tidak tersedia`);
    }

    function updateCard(city, temp, weatherCode, desc) {
        const el = document.getElementById(`card-${city.adm2.replace('.', '-')}`);
        if (!el) return;
        el.classList.remove('loading');
        el.classList.add(tempCategory(temp));
        el.querySelector('.city-icon').textContent = getWeatherIcon(weatherCode);
        el.querySelector('.city-temp').textContent = `${temp}°`;
        el.querySelector('.city-desc').textContent = desc;

        el.addEventListener('click', () => {
            PETIK_CONFIG.setSelectedCity(city);
            window.location.href = 'cuaca.html';
        });
    }

    function updateCardError(city) {
        const el = document.getElementById(`card-${city.adm2.replace('.', '-')}`);
        if (!el) return;
        el.classList.remove('loading');
        el.classList.add('error');
        el.querySelector('.city-icon').textContent = '⚠️';
        el.querySelector('.city-desc').textContent = 'Data tidak tersedia';
    }

    async function fetchCityWeather(city) {
        try {
            // buildBmkgUrl butuh adm4 (kode kelurahan) -- itu satu-satunya
            // parameter yang resmi didukung BMKG.
            const res = await fetch(PETIK_CONFIG.buildBmkgUrl(city.adm4));
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const result = await res.json();
            const firstDistrict = result.data && result.data[0];
            if (!firstDistrict) throw new Error('Data kosong');

            const firstDay = firstDistrict.cuaca[0];

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

            updateMarker(city, closest.t, getWeatherIcon(closest.weather));
            updateCard(city, closest.t, closest.weather, closest.weather_desc);
        } catch (err) {
            console.error(`Gagal memuat cuaca ${city.name}:`, err);
            updateMarkerError(city);
            updateCardError(city);
        }
    }

    function loadAllCities() {
        if (Object.keys(markers).length === 0) {
            renderSkeleton();
        }

        // Muat kota secara bertahap (per batch kecil), bukan 31 sekaligus.
        // Ini mengurangi kemungkinan burst request nge-hit rate limit BMKG
        // sebelum cache di backend sempat "kepanaskan".
        const BATCH_SIZE = 5;
        const BATCH_DELAY_MS = 400;

        let i = 0;
        function nextBatch() {
            const batch = PETIK_CITIES.slice(i, i + BATCH_SIZE);
            batch.forEach(city => fetchCityWeather(city));
            i += BATCH_SIZE;
            if (i < PETIK_CITIES.length) {
                setTimeout(nextBatch, BATCH_DELAY_MS);
            }
        }
        nextBatch();
    }

    refreshBtn.addEventListener('click', loadAllCities);

    loadAllCities();
})();