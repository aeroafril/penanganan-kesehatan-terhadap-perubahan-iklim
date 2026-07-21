const API_URL = '/api';

const forgotForm = document.getElementById('forgotForm');
const forgotBtn = document.getElementById('forgotBtn');
const forgotMessage = document.getElementById('forgotMessage');

function showMessage(text, type) {
    forgotMessage.innerHTML = `<div class="message ${type}">${text}</div>`;
}

function setLoading(isLoading) {
    forgotBtn.disabled = isLoading;
    forgotBtn.innerHTML = isLoading ? '<span class="loading"></span>' : 'Kirim Link Reset';
}

forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('forgotEmail').value.trim();

    if (!email) {
        showMessage('Email wajib diisi.', 'error');
        return;
    }

    setLoading(true);
    forgotMessage.innerHTML = '';

    try {
        const response = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(data.message, 'success');
            forgotForm.reset();
        } else {
            showMessage(data.message || 'Gagal mengirim link reset password.', 'error');
        }
    } catch (err) {
        console.error('Error:', err);
        showMessage('Terjadi kesalahan koneksi ke server. Pastikan backend berjalan di ' + API_URL, 'error');
    } finally {
        setLoading(false);
    }
});
