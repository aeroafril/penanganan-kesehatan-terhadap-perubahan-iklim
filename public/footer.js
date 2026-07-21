const footerEl = document.getElementById("footer");

const footer = () => {
    let isiFooter = `
        <footer class="footer" id="contact">
            <div class="batas"></div>
            <footer class="footer" id="contact">
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
                <p><b>Copyright © 2026, AeroAfril</b></p>
            </div>
        </footer>
    `;
    footerEl.innerHTML = isiFooter;
}

footer();