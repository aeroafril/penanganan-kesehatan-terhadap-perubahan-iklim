dataHeader = [
    {
        link: "dashboard.html",
        text: "Dashboard"
    },{
        link: "penangananKesehatan.html",
        text: "Penanganan"
    },{
        link: "pendeteksiKesehatan.html",
        text: "Pendeteksi"
    },{
        link: "petaCuaca.html",
        text: "Peta"
    },{
        link: "riwayatKesehatan.html",
        text: "Riwayat"
    }
];

const headerEl = document.getElementById("header");

const header = () => {
    let isiHeader = `
        <header class="site-header" id="siteHeader">
            <div class="header-inner">
                <a href="#" class="logo"><img src="petik.png" alt="logoPetik"></a>

                <nav class="main-nav">
                    ${dataHeader.map(item => `<a href="${item.link}">${item.text}</a>`).join('')}
                </nav>

                <div class="header-actions">
                    <div class="profile-menu" id="profileMenu">
                        <button class="profile-btn" id="profileBtn" aria-label="Akun">
                            <img src="profil.png" alt="Profil" class="profile-avatar" id="profileAvatar">
                        </button>
                        <div class="profile-dropdown" id="profileDropdown">
                            <div class="profile-info">
                                <p class="profile-name" id="profileName">404</p>
                                <p class="profile-email" id="profileEmail"></p>
                            </div>
                            <button class="logout-btn" id="logoutBtn">Logout</button>
                        </div>
                    </div>

                    <button class="menu-toggle" id="menuToggle" aria-label="Open menu" aria-expanded="false">
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </div>
        </header>

        <div class="menu-overlay" id="menuOverlay"></div>
        <nav class="mobile-menu" id="mobileMenu" aria-label="Mobile navigation">
            ${dataHeader.map(item => `<a href="${item.link}">${item.text}</a>`).join('')}
        </nav>
    `;
    headerEl.innerHTML = isiHeader;
}

header();

document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('menuToggle').classList.toggle('active');
    document.getElementById('mobileMenu').classList.toggle('open');
    document.getElementById('menuOverlay').classList.toggle('visible');
});

document.getElementById('menuOverlay').addEventListener('click', () => {
    document.getElementById('menuToggle').classList.remove('active');
    document.getElementById('mobileMenu').classList.remove('open');
    document.getElementById('menuOverlay').classList.remove('visible');
});

const profileBtn = document.getElementById('profileBtn');
const profileMenu = document.getElementById('profileMenu');

profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    profileMenu.classList.toggle('open');
});

document.addEventListener('click', (e) => {
    if (!profileMenu.contains(e.target)) {
        profileMenu.classList.remove('open');
    }
});

async function loadProfile() {
    const token = localStorage.getItem('authToken');

    if (!token) {
        // belum login, lempar balik ke halaman login
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch('/api/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // kirim token biar backend tau ini siapa
            }
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('profileName').textContent = `${data.user.firstName} ${data.user.lastName}`;
            document.getElementById('profileEmail').textContent = data.user.email;
        } else {
            // token invalid/expired -> paksa login ulang
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    } catch (err) {
        console.error('Gagal memuat profil:', err);
    }
}

loadProfile();

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
});