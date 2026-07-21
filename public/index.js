const API_URL = '/api';

function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('AuthContainer').classList.remove('register-active');
    document.body.classList.remove('register-mode');
    clearMessages();
}

function showRegister() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('AuthContainer').classList.add('register-active');
    document.body.classList.add('register-mode');
    clearMessages();
}

function clearMessages() {
    document.getElementById('loginMessage').innerHTML = '';
    document.getElementById('registerMessage').innerHTML = '';
}

function showMessage(elementId, message, type) {
    const msgDiv = document.getElementById(elementId);
    msgDiv.innerHTML = `<div class="message ${type}">${message}</div>`;
}

function setLoading(buttonId, isLoading) {
    const btn = document.getElementById(buttonId);
    if (isLoading) {
        btn.disabled = true;
        btn.innerHTML = '<span class="loading"></span>';
    } else {
        btn.disabled = false;
        btn.innerHTML = buttonId === 'loginBtn' ? 'Masuk' : 'Daftar';
    }
}

async function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        showMessage('loginMessage', 'Username dan password wajib diisi.', 'error');
        return;
    }

    setLoading('loginBtn', true);
    clearMessages();

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // simpan token & data user biar bisa dipakai di dashboard
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            window.location.href = 'dashboard.html';
        } else {
            showMessage('loginMessage', data.message || 'Login gagal.', 'error');
        }
    } catch (err) {
        console.error('Error:', err);
        showMessage('loginMessage', 'Terjadi kesalahan koneksi ke server. Pastikan backend berjalan di ' + API_URL, 'error');
    } finally {
        setLoading('loginBtn', false);
    }
}

function handleLoginSubmit(event) {
    event.preventDefault();
    login();
}

document.getElementById('registerForm').querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstName = document.getElementById('registerFirstName').value.trim();
    const lastName = document.getElementById('registerLastName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        showMessage('registerMessage', 'Password tidak cocok!', 'error');
        return;
    }

    setLoading('registerBtn', true);

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, email, username, password, confirmPassword })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('registerMessage', data.message || 'Registrasi berhasil!', 'success');
            setTimeout(() => {
                document.getElementById('registerForm').querySelector('form').reset();
                showLogin();
            }, 1500);
        } else {
            showMessage('registerMessage', data.message || 'Registrasi gagal!', 'error');
        }
    } catch (err) {
        console.error('Error:', err);
        showMessage('registerMessage', 'Terjadi kesalahan koneksi ke server. Pastikan backend berjalan di ' + API_URL, 'error');
    } finally {
        setLoading('registerBtn', false);
    }
});

window.onload = function () {
    showLogin();
};
