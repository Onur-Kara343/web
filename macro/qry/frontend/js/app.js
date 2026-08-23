// ============================================================
// QRY – App Controller
// ============================================================

// ----- STATE -----
let currentUser = null;

// ----- DOM REFS -----
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const hamburger = document.getElementById('hamburger');
const mainNav = document.getElementById('mainNav');

// ----- NAVIGATION -----
function navigate(page) {
    pages.forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`page-${page}`);
    if (target) target.classList.add('active');

    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });

    mainNav.classList.remove('open');
    window.location.hash = page;
}

navLinks.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        navigate(link.dataset.page);
    });
});

window.addEventListener('hashchange', () => {
    const page = window.location.hash.slice(1) || 'landing';
    if (document.getElementById(`page-${page}`)) navigate(page);
});

// ----- HAMBURGER -----
hamburger.addEventListener('click', () => mainNav.classList.toggle('open'));

// ----- AUTH UI -----
function updateUI(user) {
    currentUser = user;
    if (user) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-flex';
        document.getElementById('userName').textContent = user.name || 'User';
        document.getElementById('userAvatar').textContent = (user.name || 'U')[0].toUpperCase();

        const isPremium = user.isPremium || false;
        const tierEl = document.getElementById('userTier');
        tierEl.textContent = isPremium ? '⭐ Premium' : 'Free';
        tierEl.className = isPremium ? 'badge-premium' : 'badge-free';

        document.getElementById('premiumOptions').style.display = isPremium ? 'block' : 'none';
        document.getElementById('bulkToggleBtn').style.display = isPremium ? 'inline-flex' : 'none';
        document.getElementById('settingsPremiumStatus').textContent = isPremium ? '⭐ Premium' : 'Free';
    } else {
        loginBtn.style.display = 'inline-flex';
        logoutBtn.style.display = 'none';
        document.getElementById('userName').textContent = 'Gast';
        document.getElementById('userAvatar').textContent = 'G';
        document.getElementById('userTier').textContent = 'Free';
        document.getElementById('userTier').className = 'badge-free';
        document.getElementById('premiumOptions').style.display = 'none';
        document.getElementById('bulkToggleBtn').style.display = 'none';
        document.getElementById('settingsPremiumStatus').textContent = 'Free';
    }
}

// ----- LOGIN / LOGOUT -----
loginBtn.addEventListener('click', () => showAuthModal('login'));

logoutBtn.addEventListener('click', () => {
    if (confirm('Wirklich abmelden?')) {
        localStorage.removeItem('qry_token');
        localStorage.removeItem('qry_user');
        updateUI(null);
        navigate('landing');
    }
});

// ----- LOAD USER -----
function loadUser() {
    const raw = localStorage.getItem('qry_user');
    if (raw) {
        try {
            const user = JSON.parse(raw);
            updateUI(user);
            return user;
        } catch (_) {
            localStorage.removeItem('qry_user');
        }
    }
    updateUI(null);
    return null;
}

// ----- API HELPERS -----
function getToken() {
    return localStorage.getItem('qry_token');
}

async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    const base = window.location.origin;
    const url = `${base}/api${endpoint}`;

    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
        throw new Error(err.message || 'Serverfehler');
    }
    return res.json();
}

// ----- INIT -----
document.addEventListener('DOMContentLoaded', () => {
    loadUser();
    const hash = window.location.hash.slice(1) || 'landing';
    if (document.getElementById(`page-${hash}`)) navigate(hash);
    else navigate('landing');
});

// ----- EXPOSE -----
window.navigate = navigate;
window.updateUI = updateUI;
window.loadUser = loadUser;
window.getToken = getToken;
window.apiRequest = apiRequest;
window.showAuthModal = null; // set by auth.js