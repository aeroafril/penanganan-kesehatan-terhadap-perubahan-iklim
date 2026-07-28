const dataTeam = [
    {
        nama: "Aero Afril",
        peran: "Fullstack Website",
        instagram: "/medsos/instagram.png",
        linkig: "https://www.instagram.com/ar_frildo/",
        github: "/medsos/github.png",
        linkgt: "https://github.com/aeroafril",
        linkedin: "/medsos/linkedin.png",
        linklkn: "https://www.linkedin.com/in/aeroafril"
    },
    {
        nama: "Risky Adi",
        peran: "UI/UX Designer",
        instagram: "/medsos/instagram.png",
        linkig: "https://www.instagram.com/risk_a.s27/",
        github: "/medsos/github.png",
        linkgt: "https://github.com/Riezk2705"
    },
    {
        nama: "Patricia",
        peran: "Proposal & Dokumentasi",
        instagram: "/medsos/instagram.png",
        linkig: "https://www.instagram.com/_pptcya/"
    }
];

const footerEl = document.getElementById("footer");

function socialIcon(iconSrc, link, label) {
    if (!iconSrc || !link) return '';
    return `
        <a href="${link}" target="_blank" rel="noopener" aria-label="${label}">
            <img src="${iconSrc}" alt="${label}">
        </a>
    `;
}

const footer = () => {
    const teamHtml = dataTeam.map(member => `
        <div class="team-member">
            <span class="team-name">${member.nama}</span>
            <span class="team-role">${member.peran}</span>
            <div class="team-social">
                ${socialIcon(member.instagram, member.linkig, `Instagram ${member.nama}`)}
                ${socialIcon(member.github, member.linkgt, `GitHub ${member.nama}`)}
                ${socialIcon(member.linkedin, member.linklkn, `LinkedIn ${member.nama}`)}
            </div>
        </div>
    `).join('');

    let isiFooter = `
        <footer class="footer" id="contact">
            <div class="batas"></div>
            <div class="contact-section">
                <p class="contact-wrap2">Silakan berikan saran Anda, setiap masukan sangat berarti bagi kami.</p>
                <div class="contact-wrap">
                    <form class="contact-form" id="contactForm" novalidate>
                        <div class="field field-full">
                            <label for="cf-message">Saran</label>
                            <textarea id="cf-message" name="message" rows="4" required></textarea>
                        </div>
                        <button type="submit" class="contact-submit">Kirim Saran</button>
                        <p class="form-status" id="formStatus" role="status" aria-live="polite"></p>
                    </form>
                </div>
            </div>

            <div class="batas"></div>

            <div class="footer-meta">
                <div class="logoFooter">
                    <img src="petik.png" alt="logoPetik">
                </div>
                <nav class="footer-links">
                    <div class="team-list">
                        ${teamHtml}
                    </div>
                </nav>
                <p>Terima kasih telah mengunjungi Webside Kami :)</p>
                <div class="garis"></div>
                <div class="kopiKanan">
                    <p><b>Copyright © 2026, Saya Akan Lawan</b></p>
                </div>
            </div>
        </footer>
    `;
    footerEl.innerHTML = isiFooter;

    attachContactFormListener();
}

function attachContactFormListener() {
    const contactForm = document.getElementById("contactForm");
    const formStatus = document.getElementById("formStatus");

    if (!contactForm) return;

    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const messageInput = document.getElementById("cf-message");
        const message = messageInput.value.trim();

        if (!message) {
            formStatus.textContent = "Saran tidak boleh kosong!";
            formStatus.style.color = "red";
            return;
        }

        formStatus.textContent = "Mengirim saran...";
        formStatus.style.color = "orange";

        try {
            const response = await fetch('/api/saran', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            const result = await response.json();

            if (response.ok) {
                alert("Saran Anda berhasil dikirim!");
                formStatus.textContent = "Terima kasih! Saran Anda berhasil dikirim.";
                formStatus.style.color = "green";
                messageInput.value = "";
            } else if (response.status === 429) {
                formStatus.textContent = result.message || "Anda sudah mencapai batas pengiriman saran hari ini.";
                formStatus.style.color = "red";
            } else {
                formStatus.textContent = result.message || "Gagal mengirim saran. Coba lagi nanti.";
                formStatus.style.color = "red";
            }
        } catch (error) {
            console.error(error);
            formStatus.textContent = "Terjadi kesalahan pada jaringan.";
            formStatus.style.color = "red";
        }
    });
}

footer();