import { register, login, setAuthToken, isLoggedIn } from './api.js';

const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const authError = document.getElementById('auth-error');

// Tab-Wechsel
if (showRegisterLink) {
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        authError.textContent = '';
    });
}

if (showLoginLink) {
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.remove('active');
        loginForm.classList.add('active');
        authError.textContent = '';
    });
}

// Login
if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            authError.textContent = 'Bitte E-Mail und Passwort eingeben';
            return;
        }

        try {
            const data = await login(email, password);
            setAuthToken(data.token);
            localStorage.setItem('finance_user', JSON.stringify(data.user));
            window.location.href = '/dashboard.html';
        } catch (error) {
            authError.textContent = error.message;
        }
    });
}

// Registrierung
if (registerBtn) {
    registerBtn.addEventListener('click', async () => {
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;

        if (!username || !email || !password) {
            authError.textContent = 'Alle Felder sind erforderlich';
            return;
        }

        try {
            const data = await register(username, email, password);
            setAuthToken(data.token);
            localStorage.setItem('finance_user', JSON.stringify(data.user));
            window.location.href = '/dashboard.html';
        } catch (error) {
            authError.textContent = error.message;
        }
    });
}

// Prüfen ob bereits eingeloggt
if (isLoggedIn()) {
    window.location.href = '/dashboard.html';
}