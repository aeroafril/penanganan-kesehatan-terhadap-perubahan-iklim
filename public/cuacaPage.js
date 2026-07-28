(function () {
    const errorState = document.getElementById('errorState');
    const errorMessage = document.getElementById('errorMessage');
    const cuacaContent = document.getElementById('cuacaContent');
    const locationLine = document.getElementById('locationLine');
    const updatedLine = document.getElementById('updatedLine');
    const citySelect = document.getElementById('citySelect');

    const prevDayBtn = document.getElementById('prevDayBtn');
    const nextDayBtn = document.getElementById('nextDayBtn');
    const dayTitle = document.getElementById('dayTitle');
    const daySubtitle = document.getElementById('daySubtitle');
    const dayDots = document.getElementById('dayDots');
    const slotGrid = document.getElementById('slotGrid');
    const retryBtn = document.getElementById('retryBtn');

    let cuacaPerHari = [];
    let lokasi = null;
    let selectedDay = 0;

    function populateCitySelect() {
        const current = PETIK_CONFIG.CURRENT_CITY;
        citySelect.innerHTML = PETIK_CITIES.map(city =>
            `<option value="${city.adm2}" ${city.adm2 === current.adm2 ? 'selected' : ''}>${city.name}, ${city.province}</option>`
        ).join('');
    }

    citySelect.addEventListener('change', () => {
        const picked = PETIK_CITIES.find(c => c.adm2 === citySelect.value);
        if (picked) {
            PETIK_CONFIG.setSelectedCity(picked);
            fetchWeather();
        }
    });

    function showState(name) {
        errorState.classList.add('hidden');
        cuacaContent.classList.add('hidden');
        if (name === 'error') errorState.classList.remove('hidden');
        if (name === 'content') cuacaContent.classList.remove('hidden');
    }

    function getWeatherIcon(code) {
        if (code === 0 || code === 1) return '/cuaca/cerah.png';
        if (code === 2 || code === 3) return '/cuaca/cerahBerawan.png';
        if (code === 4) return '/cuaca/berawan.png';
        if (code === 5 || code === 10) return '/cuaca/berawanTebal.png';
        if (code >= 45 && code <= 48) return '/cuaca/berawanTebal.png';
        if (code >= 60 && code <= 63) return '/cuaca/hujan.png';
        if (code >= 61 && code <= 67) return '/cuaca/hujan.png';
        if (code >= 80 && code <= 82) return '/cuaca/hujanPetir.png';
        if (code >= 95) return '/cuaca/awanPetir.png';
        return '/cuaca/berawan.png';
    }

    function isSameHour(dateA, dateB) {
        return dateA.getFullYear() === dateB.getFullYear() &&
               dateA.getMonth() === dateB.getMonth() &&
               dateA.getDate() === dateB.getDate() &&
               dateA.getHours() === dateB.getHours();
    }

    async function fetchWeather() {
        try {
            const res = await fetch(PETIK_CONFIG.BMKG_URL);

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const result = await res.json();

            if (!result.data || !result.data[0]) {
                throw new Error('Struktur data tidak sesuai.');
            }

            lokasi = result.data[0].lokasi || result.lokasi;
            cuacaPerHari = result.data[0].cuaca;

            selectedDay = 0;
            renderLocation();
            renderDayNav();
            renderSlots();
            showState('content');
        } catch (err) {
            console.error('Gagal memuat cuaca:', err);
            errorMessage.textContent = 'Gagal memuat data cuaca dari BMKG. Cek koneksi internet kamu dan coba lagi.';
            locationLine.textContent = 'Lokasi tidak tersedia';
            showState('error');
        }
    }

    function renderLocation() {
        locationLine.innerHTML = `<strong>${lokasi.kecamatan}:</strong> ${lokasi.kotkab}, ${lokasi.provinsi}`;
        updatedLine.textContent = 'Terakhir dimuat: ' + new Date().toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    }

    function renderDayNav() {
        const dayData = cuacaPerHari[selectedDay];
        const firstSlot = dayData[0];
        const dateObj = new Date(firstSlot.datetime);

        dayTitle.textContent = dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
        daySubtitle.textContent = selectedDay === 0 ? 'Hari ini' : selectedDay === 1 ? 'Besok' : `${selectedDay + 1} hari lagi`;

        prevDayBtn.disabled = selectedDay === 0;
        nextDayBtn.disabled = selectedDay === cuacaPerHari.length - 1;

        dayDots.innerHTML = cuacaPerHari.map((_, i) =>
            `<button class="day-dot ${i === selectedDay ? 'active' : ''}" data-day="${i}" aria-label="Hari ke-${i + 1}"></button>`
        ).join('');

        dayDots.querySelectorAll('.day-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                selectedDay = parseInt(dot.dataset.day, 10);
                renderDayNav();
                renderSlots();
            });
        });
    }

    function renderSlots() {
        const dayData = cuacaPerHari[selectedDay];
        const now = new Date();

        slotGrid.innerHTML = dayData.map(slot => {
            const dt = new Date(slot.datetime);
            const time = dt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const isNow = isSameHour(dt, now);

            return `
                <div class="slot-card ${isNow ? 'now' : ''}">
                    ${isNow ? '<span class="now-badge">Sekarang</span>' : ''}
                    <div class="slot-top">
                        <div>
                            <div class="slot-time">${time}</div>
                            <div class="slot-desc">${slot.weather_desc}</div>
                        </div>
                        <div class="slot-icon">
                            <img src="${getWeatherIcon(slot.weather)}" alt="${slot.weather_desc}" class="slot-icon-img">
                        </div>
                    </div>

                    <div class="slot-temp">
                        <span class="value">${slot.t}</span>
                        <span class="unit">°C</span>
                    </div>

                    <div class="slot-details">
                        <div>
                            <div class="label">Kelembapan</div>
                            <div class="value-small">${slot.hu}%</div>
                        </div>
                        <div>
                            <div class="label">Angin</div>
                            <div class="value-small">${slot.ws} km/j</div>
                        </div>
                        <div>
                            <div class="label">Curah Hujan</div>
                            <div class="value-small">${slot.tp} mm</div>
                        </div>
                        <div>
                            <div class="label">Awan</div>
                            <div class="value-small">${slot.tcc}%</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    prevDayBtn.addEventListener('click', () => {
        if (selectedDay > 0) {
            selectedDay -= 1;
            renderDayNav();
            renderSlots();
        }
    });

    nextDayBtn.addEventListener('click', () => {
        if (selectedDay < cuacaPerHari.length - 1) {
            selectedDay += 1;
            renderDayNav();
            renderSlots();
        }
    });

    retryBtn.addEventListener('click', fetchWeather);

    populateCitySelect();
    fetchWeather();
})();