const footerEl = document.getElementById("footer");

const footer = () => {
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
                    <h4>PETIK</h4>
                </div>
                <nav class="footer-links">
                    <h1>Pembuat</h1>
                </nav>
                <p>Terima kasih telah mengunjungi Webside Kami :)</p>
                <p><b>Copyright © 2026, Pradipta</b></p>
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
