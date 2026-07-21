const PETIK_CONFIG = (function () {
    const STORAGE_KEY = 'petikSelectedCity';

    // Kota default kalau user belum pernah memilih kota manapun
    const DEFAULT_CITY = { adm2: '31.71', adm4: '31.71.01.1001', name: 'Jakarta Pusat', province: 'DKI Jakarta', lat: -6.1805, lon: 106.8284 };

    function isValidCity(city) {
        // adm4 WAJIB ada dan berformat 4 segmen (misal "31.71.01.1001").
        // Ini juga otomatis menolak data lama dari localStorage yang cuma
        // punya adm2 (sebelum update ini), sehingga fallback ke DEFAULT_CITY.
        return !!(city && city.adm4 && /^\d{2}\.\d{2}\.\d{2}\.\d{4}$/.test(city.adm4));
    }

    function getSelectedCity() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (isValidCity(saved)) return saved;
        } catch (err) {
            console.error('Gagal membaca kota tersimpan:', err);
        }
        return DEFAULT_CITY;
    }

    function setSelectedCity(city) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(city));
    }

    function buildBmkgUrl(adm4) {
        // lewat proxy backend sendiri (/api/cuaca), BUKAN langsung ke api.bmkg.go.id,
        // supaya tidak kena CORS saat di-fetch dari browser
        return `/api/cuaca?adm4=${adm4}`;
    }

    return {
        DEFAULT_CITY,
        getSelectedCity,
        setSelectedCity,
        buildBmkgUrl,

        // getter: setiap kali dipanggil, selalu ambil kota TERBARU dari localStorage
        get CURRENT_CITY() {
            return getSelectedCity();
        },
        get BMKG_URL() {
            return buildBmkgUrl(getSelectedCity().adm4);
        }
    };
})();