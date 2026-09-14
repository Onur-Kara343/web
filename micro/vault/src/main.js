// ===== KeyVault – main.js =====
// Speichert alles lokal in localStorage. Kein Server, kein Netzwerk.

const STORE_PASS = 'keyvault_pass';
const STORE_KEYS = 'keyvault_keys';

// ---------- Helpers ----------
const $ = (sel) => document.querySelector(sel);

// Base64 (nur Verschleierung, kein echter Schutz!)
const encode = (str) => btoa(unescape(encodeURIComponent(str)));
const decode = (str) => decodeURIComponent(escape(atob(str)));

function toast(msg, isError = false) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.toggle('error', isError);
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2200);
}

// ---------- Storage ----------
function getPassHash() { return localStorage.getItem(STORE_PASS); }
function setPassHash(hash) { localStorage.setItem(STORE_PASS, hash); }

function getKeys() {
  const raw = localStorage.getItem(STORE_KEYS);
  if (!raw) return [];
  try { return JSON.parse(decode(raw)); } catch { return []; }
}
function saveKeys(keys) {
  localStorage.setItem(STORE_KEYS, encode(JSON.stringify(keys)));
}

// ---------- Auth ----------
function showSetup() {
  $('#setup-form').classList.remove('hidden');
  $('#login-form').classList.add('hidden');
}
function showLogin() {
  $('#setup-form').classList.add('hidden');
  $('#login-form').classList.remove('hidden');
}
function enterApp() {
  $('#auth-screen').classList.add('hidden');
  $('#app').classList.remove('hidden');
  renderKeys();
}
function lockApp() {
  $('#app').classList.add('hidden');
  $('#auth-screen').classList.remove('hidden');
  $('#login-pass').value = '';
  showLogin();
}

// Setup
$('#setup-btn').addEventListener('click', () => {
  const p1 = $('#setup-pass').value.trim();
  const p2 = $('#setup-pass-confirm').value.trim();
  const err = $('#setup-error');

  if (p1.length < 4) { err.textContent = 'Mindestens 4 Zeichen.'; return; }
  if (p1 !== p2) { err.textContent = 'Passwörter stimmen nicht überein.'; return; }

  setPassHash(encode(p1));
  err.textContent = '';
  toast('Vault erstellt 🔐');
  enterApp();
});

// Login
$('#login-btn').addEventListener('click', () => {
  const p = $('#login-pass').value.trim();
  const err = $('#login-error');
  if (encode(p) === getPassHash()) {
    err.textContent = '';
    enterApp();
  } else {
    err.textContent = 'Falsches Passwort.';
  }
});
$('#login-pass').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') $('#login-btn').click();
});

// Lock
$('#lock-btn').addEventListener('click', lockApp);

// Reset / Wipe
function wipeAccount() {
  if (!confirm('Wirklich ALLES löschen und Account neu erstellen? Deine Keys gehen verloren!')) return;
  localStorage.removeItem(STORE_PASS);
  localStorage.removeItem(STORE_KEYS);
  location.reload();
}
$('#reset-btn').addEventListener('click', wipeAccount);
$('#wipe-btn').addEventListener('click', wipeAccount);

// ---------- Keys ----------
function addKey(name, value) {
  const keys = getKeys();
  keys.push({ id: Date.now() + Math.random(), name, value });
  saveKeys(keys);
  renderKeys();
}

function deleteKey(id) {
  const keys = getKeys().filter(k => k.id !== id);
  saveKeys(keys);
  renderKeys();
}

function copyKey(value) {
  navigator.clipboard.writeText(value)
    .then(() => toast('Kopiert ✓'))
    .catch(() => toast('Kopieren fehlgeschlagen', true));
}

function renderKeys() {
  const keys = getKeys();
  const list = $('#key-list');
  list.innerHTML = '';
  $('#key-count').textContent = keys.length;
  $('#empty-msg').classList.toggle('hidden', keys.length > 0);

  keys.forEach(k => {
    const li = document.createElement('li');
    li.className = 'key-item';

    let visible = false;

    const nameEl = document.createElement('span');
    nameEl.className = 'name';
    nameEl.textContent = k.name;

    const valEl = document.createElement('span');
    valEl.className = 'value';
    valEl.textContent = '•'.repeat(Math.min(k.value.length, 24));

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    // Toggle
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'icon-btn';
    toggleBtn.textContent = '👁';
    toggleBtn.title = 'Anzeigen / Verbergen';
    toggleBtn.addEventListener('click', () => {
      visible = !visible;
      valEl.textContent = visible ? k.value : '•'.repeat(Math.min(k.value.length, 24));
      toggleBtn.textContent = visible ? '🙈' : '👁';
    });

    // Copy
    const copyBtn = document.createElement('button');
    copyBtn.className = 'icon-btn';
    copyBtn.textContent = '📋';
    copyBtn.title = 'Kopieren';
    copyBtn.addEventListener('click', () => copyKey(k.value));

    // Delete
    const delBtn = document.createElement('button');
    delBtn.className = 'icon-btn del';
    delBtn.textContent = '✕';
    delBtn.title = 'Löschen';
    delBtn.addEventListener('click', () => {
      if (confirm(`Key "${k.name}" löschen?`)) deleteKey(k.id);
    });

    actions.append(toggleBtn, copyBtn, delBtn);
    li.append(nameEl, valEl, actions);
    list.appendChild(li);
  });
}

// Add form
$('#add-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#key-name').value.trim();
  const value = $('#key-value').value.trim();
  if (!name || !value) return;
  addKey(name, value);
  $('#add-form').reset();
  toast('Key gespeichert ✓');
});

// ---------- Init ----------
(function init() {
  if (getPassHash()) {
    showLogin();
  } else {
    showSetup();
  }
})();