const dataContent = [
    {
        img: "/dashboard/panduan.png",
        judul: "Penanganan Kesehatan",
        link: "penangananKesehatan",
        text: "Penanganan cepat menghadapi cuaca ekstrem"
    },{
        img: "/dashboard/pendeteksi.png",
        judul: "Pendeteksi Kesehatan",
        link: "pendeteksiKesehatan",
        text: "Cek gejala, kenali indikasi lebih awal"
    },{
        img: "/dashboard/peta.png",
        judul: "Peta Cuaca",
        link: "petaCuaca",
        text: "Kondisi cuaca kota-kota di Indonesia"
    },{
        img: "/dashboard/riwayat.png",
        judul: "Riwayat Kesehatan",
        link: "riwayatKesehatan",
        text: "Semua hasil deteksimu, tersimpan rapi"
    }
]

const dashboardHeroEl = document.getElementById('dashboardHero');
const aboutSectionEl = document.getElementById('aboutSection');

function renderHero() {
    const slidesHtml = dataContent.map((item, idx) => `
        <div class="hero-slide ${idx === 0 ? 'active' : ''}">
            <a href="${item.link}.html">
                <div class="hero-float">
                    <img src="${item.img}" alt="${item.judul}">
                </div>
                <div class="hero-caption">
                    <h3>${item.judul}</h3>
                    <span>${item.text}</span>
                </div>
            </a>
        </div>
    `).join('');

    dashboardHeroEl.innerHTML = `
        <div class="hero-split">
            <div class="hero-left">
                <p class="hero-eyebrow">Welcome, <span id="dashboardName">Anonymous</span></p>
                <h1 class="hero-title bungee-regular">PETIK</h1>
                <p class="hero-desc">Pantau cuaca dan kelola kesehatan kamu di tengah perubahan iklim, semua dalam satu tempat.</p>
                <button class="hero-cta" id="heroCta">About</button>
            </div>
            <div class="hero-right" id="heroRight">
                <button class="hero-arrow hero-arrow-left" id="heroPrev" aria-label="Fitur sebelumnya">
                    <img src="panah.png" alt="panahSlide">
                </button>

                <div class="hero-carousel" id="heroCarousel">
                    ${slidesHtml}
                </div>

                <button class="hero-arrow hero-arrow-right" id="heroNext" aria-label="Fitur berikutnya">
                    <img src="panah.png" alt="">
                </button>

                <div class="hero-dots" id="heroDots"></div>
            </div>
        </div>
    `;

    setupHeroCarousel();
}

function setupHeroCarousel() {
    const carousel = document.getElementById('heroCarousel');
    const heroRight = document.getElementById('heroRight');
    const dotsWrap = document.getElementById('heroDots');
    const heroCta = document.getElementById('heroCta');
    const prevBtn = document.getElementById('heroPrev');
    const nextBtn = document.getElementById('heroNext');
    if (!carousel || !dotsWrap) return;

    const slides = carousel.querySelectorAll('.hero-slide');
    let current = 0;
    let timer = null;
    const delay = 3800;

    slides.forEach((slide, i) => {
        const dot = document.createElement('button');
        dot.setAttribute('aria-label', `Lihat fitur ${i + 1}`);
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            goTo(i);
            restart();
        });
        dotsWrap.appendChild(dot);
    });
    const dots = dotsWrap.querySelectorAll('button');

    function goTo(index) {
        slides[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = (index + slides.length) % slides.length;
        slides[current].classList.add('active');
        dots[current].classList.add('active');
    }

    function next() {
        goTo(current + 1);
    }

    function prev() {
        goTo(current - 1);
    }

    function start() {
        timer = setInterval(next, delay);
    }

    function stop() {
        clearInterval(timer);
    }

    function restart() {
        stop();
        start();
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prev();
            restart();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            next();
            restart();
        });
    }

    if (heroCta) {
        heroCta.addEventListener('click', () => {
            const target = document.getElementById('aboutSection');
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    }

    heroRight.addEventListener('mouseenter', stop);
    heroRight.addEventListener('mouseleave', start);

    start();
}

renderHero();

const aboutData = [
    {
        judul: "Pemantauan Cuaca Real-Time",
        desc: "Data suhu, kelembapan, angin, dan curah hujan terkini dari BMKG untuk kota pilihanmu, lengkap dengan prakiraan beberapa hari ke depan.",
        href: "cuaca.html"
    },
    {
        judul: "Penanganan Kesehatan Terhadap Perubahan Iklim",
        desc: "Panduan gejala dan langkah penanganan untuk enam kondisi kesehatan yang dipicu cuaca ekstrem, mulai dari heat stroke hingga ISPA.",
        href: "penangananKesehatan.html"
    },
    {
        judul: "Pendeteksi Gejala Kesehatan",
        desc: "Pilih gejala yang kamu rasakan, sistem mencocokkannya secara otomatis dan memberi indikasi awal beserta rekomendasi penanganannya.",
        href: "pendeteksiKesehatan.html"
    },
    {
        judul: "Peta Cuaca Nasional",
        desc: "Lihat kondisi cuaca di puluhan kota besar se-Indonesia sekaligus dalam satu peta interaktif, tanpa perlu buka satu per satu.",
        href: "petaCuaca.html"
    },
    {
        judul: "Riwayat Kesehatan",
        desc: "Semua hasil deteksi gejala yang pernah kamu lakukan tersimpan otomatis, dan bisa dicek atau dihapus kapan saja.",
        href: "riwayatKesehatan.html"
    },
    {
        judul: "Ringkasan & Analisis",
        desc: "Lihat kondisi kesehatan apa yang paling sering kamu alami, lengkap dengan pola berdasarkan waktu dan suhu saat deteksi dilakukan.",
        href: "riwayatKesehatan.html"
    }
];

function renderAbout() {
    if (!aboutSectionEl) return;

    const itemsHtml = aboutData.map(item => `
        <a class="about-item" href="${item.href}">
            <h4>${item.judul}</h4>
            <p>${item.desc}</p>
        </a>
    `).join('');

    aboutSectionEl.innerHTML = `
        <div class="about-inner">
            <p class="about-eyebrow">Tentang PETIK</p>
            <h2 class="about-title">Satu tempat untuk cuaca & kesehatan kamu</h2>
            <p class="about-desc">
                PETIK membantu kamu memantau dampak kesehatan dari perubahan iklim yang terjadi
                saat ini -- mulai dari cuaca ekstrem, kualitas udara, hingga gejala penyakit
                yang mungkin muncul akibatnya. Semua informasi disajikan real-time, mudah
                dipahami, dan bisa diakses kapan saja.
            </p>
            <div class="about-grid">
                ${itemsHtml}
            </div>
        </div>
    `;
}

renderAbout();

async function loadProfile() {
    const token = localStorage.getItem('authToken');

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch('/api/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('dashboardName').textContent = `${data.user.firstName} ${data.user.lastName}`;
        } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    } catch (err) {
        console.error('Gagal memuat profil:', err);
    }
}

loadProfile();