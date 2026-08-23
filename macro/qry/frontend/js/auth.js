// ============================================================
// QRY – Authentication
// ============================================================

const modal = document.getElementById('authModal');
const modalClose = document.getElementById('modalClose');
const modalTitle = document.getElementById('modalTitle');
const authForm = document.getElementById('authForm');
const authSubmit = document.getElementById('authSubmit');
const authSwitch = document.getElementById('authSwitch');
const authSwitchLink = document.getElementById('authSwitchLink');
const authError = document.getElementById('authError');
const nameGroup = document.getElementById('nameGroup');
const authName = document.getElementById('authName');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');

let mode = 'login'; // 'login' | 'register'

// ----- SHOW -----
window.showAuthModal = function (m = 'login') {
    mode = m;
    authError.style.display = 'none';
    authError.textContent = '';
    authForm.reset();

    if (m === 'login') {
        modalTitle.textContent = '🔐 Anmelden';
        authSubmit.textContent = 'Anmelden';
        authSwitch.innerHTML = 'Noch kein Konto? <a id="authSwitchLink">Registrieren</a>';
        nameGroup.style.display = 'none';
        authName.required = false;
    } else {
        modalTitle.textContent = '📝 Registrieren';
        authSubmit.textContent = 'Registrieren';
        authSwitch.innerHTML = 'Bereits registriert? <a id="authSwitchLink">Anmelden</a>';
        nameGroup.style.display = 'block';
        authName.required = true;
    }

    // Re-bind switch link
    document.getElementById('authSwitchLink').addEventListener('click', e => {
        e.preventDefault();
        window.showAuthModal(mode === 'login' ? 'register' : 'login');
    });

    modal.classList.add('show');
};

// ----- CLOSE -----
function closeModal() {
    modal.classList.remove('show');
}
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
});

// ----- SWITCH (delegated) -----
document.addEventListener('click', e => {
    if (e.target.id === 'authSwitchLink') {
        e.preventDefault();
        window.showAuthModal(mode === 'login' ? 'register' : 'login');
    }
});

// ----- SUBMIT -----
authForm.addEventListener('submit', async e => {
    e.preventDefault();
    authError.style.display = 'none';
    authError.textContent = '';

    const email = authEmail.value.trim();
    const password = authPassword.value;
    const name = authName.value.trim();

    if (!email || !password) return showError('Bitte alle Felder ausfüllen.');
    if (password.length < 6) return showError('Passwort muss mindestens 6 Zeichen haben.');
    if (mode === 'register' && !name) return showError('Bitte gib deinen Namen ein.');

    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
    const payload = mode === 'login' ? { email, password } : { name, email, password };

    try {
        const data = await window.apiRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        localStorage.setItem('qry_token', data.token);
        localStorage.setItem('qry_user', JSON.stringify(data.user));

        window.updateUI(data.user);
        closeModal();
        window.navigate('dashboard');
        if (window.loadDashboard) window.loadDashboard();
    } catch (err) {
        showError(err.message || 'Verbindungsfehler');
        console.error('Auth error:', err);
    }
});

function showError(msg) {
    authError.textContent = msg;
    authError.style.display = 'block';
}

// ----- PROTECT DASHBOARD -----
const observer = new MutationObserver(() => {
    const dash = document.getElementById('page-dashboard');
    if (dash && dash.classList.contains('active') && !localStorage.getItem('qry_token')) {
        window.showAuthModal('login');
        window.navigate('landing');
    }
});
observer.observe(document.body, { childList: true, subtree: true });