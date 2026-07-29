let reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { observer.observe(el); });
}

setTimeout(function () {
    reveals.forEach(function (el) { el.classList.add('revealed'); });
}, 3000);