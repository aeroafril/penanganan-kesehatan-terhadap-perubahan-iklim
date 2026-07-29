(function () {
    // Fade out overlay begitu script ini jalan (DOM udah pasti ready)
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => loadingScreen.remove(), 300);
        }, 200);
    }

    // Munculin overlay lagi pas mau pindah halaman
    document.querySelectorAll('a[href$=".html"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (link.target === '_blank') return;

            e.preventDefault();
            const overlay = document.getElementById('loadingScreen') || createLoadingScreen();
            overlay.style.opacity = '1';

            setTimeout(() => {
                window.location.href = href;
            }, 300);
        });
    });

    function createLoadingScreen() {
        const div = document.createElement('div');
        div.id = 'loadingScreen';
        div.className = 'loading-screen';
        document.body.appendChild(div);
        return div;
    }
})();