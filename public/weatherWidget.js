(function () {
    const cuacaEl = document.getElementById("weatherWidget");

    const weather = () => {
        let isi = `
            <span class="weather-icon-closed" id="weatherIconClosed"><img src="/cuaca/cerahBerawan.png" alt="cuaca"></span>
            <div class="weather-content" id="weatherContent">
                <div class="weather-top">
                    <div>
                        <p class="weather-label">Cuaca saat ini</p>
                        <p class="weather-location" id="weatherLocation">Memuat...</p>
                    </div>
                    <span class="weather-icon-open" id="weatherIconOpen"><img src="/cuaca/cerahBerawan.png" alt="cuaca"></span>
                </div>
                <div class="weather-temp">
                    <span class="weather-temp-value" id="weatherTemp">--</span>°
                    <span class="weather-desc" id="weatherDesc"></span>
                </div>
                <a href="./cuaca.html" class="weather-detail-btn">Lihat Detail Cuaca</a>
            </div>
        `;
        cuacaEl.innerHTML = isi;
    }

    weather();

    const weatherWidget = document.getElementById('weatherWidget');
    const weatherLocation = document.getElementById('weatherLocation');
    const weatherTemp = document.getElementById('weatherTemp');
    const weatherDesc = document.getElementById('weatherDesc');
    const weatherIconClosed = document.getElementById('weatherIconClosed');
    const weatherIconOpen = document.getElementById('weatherIconOpen');

    let weatherData = null;

    const BMKG_URL = PETIK_CONFIG.BMKG_URL;

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

    async function fetchMiniWeather() {
        try {
            const res = await fetch(BMKG_URL);
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);

            const result = await res.json();
            if(!res.ok) throw new Error(result.message || "Gagal mengambil data");

            const firstDay = result.data[0].cuaca[0];
            const firstSlot = firstDay[0];

            if(!firstSlot){throw new Error("Format data cuaca tidak valid")}

            weatherData = {
                t: firstSlot.t,
                weather: firstSlot.weather,
                weather_desc: firstSlot.weather_desc,
                desa: result.lokasi?.desa || 'Lokasi',
                kotkab: result.lokasi?.kotkab ||'Wilayah'
            };

            const iconSrc = getWeatherIcon(weatherData.weather);
            const imgClosed = weatherIconClosed.querySelector('img');
            const imgOpen = weatherIconOpen.querySelector('img');

            imgClosed.src = iconSrc;
            imgClosed.alt = weatherData.weather_desc;
            imgOpen.src = iconSrc;
            imgOpen.alt = weatherData.weather_desc;
 
            weatherLocation.textContent = `${weatherData.desa}, ${weatherData.kotkab}`;
            weatherTemp.textContent = weatherData.t;
            weatherDesc.textContent = weatherData.weather_desc;
        } catch(err) {
            console.error('Gagal memuat cuaca:', err);
            weatherLocation.textContent = 'Data tidak tersedia';
        }
    }

    weatherWidget.addEventListener('click', (e) => {
        if (e.target.closest('.weather-detail-btn')) return;
        weatherWidget.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!weatherWidget.contains(e.target)) {
            weatherWidget.classList.remove('open');
        }
    });

    fetchMiniWeather();
})();