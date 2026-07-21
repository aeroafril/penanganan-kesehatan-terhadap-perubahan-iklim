const API_URL = '/api';

const checkingState = document.getElementById('checkingState');
const invalidState = document.getElementById('invalidState');
const resetState = document.getElementById('resetState');
const invalidMessage = document.getElementById('invalidMessage');
const resetMessage = document.getElementById('resetMessage');
const resetForm = document.getElementById('resetForm');
const resetBtn = document.getElementById('resetBtn');

// ambil token & id dari URL, contoh: gantiPassword.html?token=abc123&id=64f...
const params = new URLSearchParams(window.location.search);
const token = params.get('token');
const userId = params.get('id');

function showState(state) {
    checkingState.classList.add('hidden');
    invalidState.classList.add('hidden');
    resetState.classList.add('hidden');
    state.classList.remove('hidden');
}

function showMessage(el, text, type) {
    el.innerHTML = `<div class="message ${type}">${text}</div>`;
}

function setLoading(isLoading) {
    resetBtn.disabled = isLoading;
    resetBtn.innerHTML = isLoading ? '<span class="loading"></span>' : 'Simpan Password Baru';
}

async function validateToken() {
    if (!token || !userId) {
        showMessage(invalidMessage, 'Link tidak lengkap atau rusak.', 'error');
        showState(invalidState);
        return;
    }

    try {
        const response = await fetch(`${API_URL}/validate-reset-token?token=${token}&id=${userId}`);
        const data = await response.json();

        if (response.ok && data.valid) {
            showState(resetState);
        } else {
            showMessage(invalidMessage, data.message || 'Link tidak valid.', 'error');
            showState(invalidState);
        }
    } catch (err) {
        console.error('Error:', err);
        showMessage(invalidMessage, 'Gagal terhubung ke server. Pastikan backend berjalan di ' + API_URL, 'error');
        showState(invalidState);
    }
}

resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;

    if (password !== confirmPassword) {
        showMessage(resetMessage, 'Password dan konfirmasi password tidak cocok.', 'error');
        return;
    }

    setLoading(true);
    resetMessage.innerHTML = '';

    try {
        const response = await fetch(`${API_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, id: userId, password, confirmPassword })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(resetMessage, data.message + ' Mengalihkan ke halaman login...', 'success');
            resetForm.reset();
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            showMessage(resetMessage, data.message || 'Gagal mengubah password.', 'error');
        }
    } catch (err) {
        console.error('Error:', err);
        showMessage(resetMessage, 'Terjadi kesalahan koneksi ke server.', 'error');
    } finally {
        setLoading(false);
    }
});

validateToken();
