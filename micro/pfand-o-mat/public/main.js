// ----- DOM-Referenzen -----
const countElement = document.getElementById('count');
const totalValueEl = document.getElementById('totalValue');
const incrementBtn = document.getElementById('increment');
const decrementBtn = document.getElementById('decrement');
const resetBtn = document.getElementById('reset');

const goalInput = document.getElementById('goalInput');
const setGoalBtn = document.getElementById('setGoal');
const clearGoalBtn = document.getElementById('clearGoal');
const goalDisplay = document.getElementById('goalDisplay');
const goalStatus = document.getElementById('goalStatus');
const goalProgress = document.getElementById('goalProgress');
const progressPercent = document.getElementById('progressPercent');

const hardResetBtn = document.getElementById('hardReset');
const lastSavedEl = document.getElementById('lastSaved');

// ----- State -----
let count = 0;
let goal = null;          // Anzahl Flaschen (Ziel)
const PFAND_PRO_FLASCHE = 0.25; // 25 Cent

// ----- LocalStorage Schlüssel -----
const STORAGE_KEY = 'pfandomat_data';

// ----- Hilfsfunktionen -----
function formatEuro(centValue) {
    return centValue.toFixed(2).replace('.', ',') + ' €';
}

function updateUI() {
    // Anzahl & Wert
    countElement.textContent = count;
    const total = count * PFAND_PRO_FLASCHE;
    totalValueEl.textContent = formatEuro(total);

    // Decrement-Button deaktivieren bei 0
    decrementBtn.disabled = (count === 0);

    // Ziel-Darstellung
    if (goal !== null && goal > 0) {
        goalDisplay.textContent = `${goal} Flaschen (→ ${formatEuro(goal * PFAND_PRO_FLASCHE)})`;
        goalStatus.textContent = '🎯 aktiv';
        goalStatus.style.background = '#2a6b3c';

        // Fortschritt (in %)
        const progress = Math.min(100, (count / goal) * 100);
        goalProgress.value = progress;
        progressPercent.textContent = Math.round(progress) + ' %';
        // Fortschrittsbalken-Farbe dynamisch via CSS (bleibt grün/blau)
    } else {
        goalDisplay.textContent = 'Kein Ziel gesetzt';
        goalStatus.textContent = '⏳ inaktiv';
        goalStatus.style.background = '#6c7a95';
        goalProgress.value = 0;
        progressPercent.textContent = '0 %';
    }

    // Speichern & LastSaved aktualisieren
    saveToLocalStorage();
    const now = new Date();
    lastSavedEl.textContent = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

// ----- LocalStorage -----
function saveToLocalStorage() {
    const data = {
        count: count,
        goal: goal,
        timestamp: new Date().toISOString()
    };
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('Speichern fehlgeschlagen:', e);
    }
}

function loadFromLocalStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        const data = JSON.parse(raw);
        if (typeof data.count === 'number' && data.count >= 0) {
            count = data.count;
        }
        if (data.goal !== undefined && data.goal !== null) {
            goal = data.goal;
        }
        return true;
    } catch (e) {
        console.warn('Laden fehlgeschlagen:', e);
        return false;
    }
}

// ----- Aktionen -----
function increment() {
    count += 1;
    updateUI();
}

function decrement() {
    if (count > 0) {
        count -= 1;
        updateUI();
    }
}

function resetCounter() {
    if (count === 0) return;
    if (confirm('Möchtest du den Zähler wirklich auf 0 zurücksetzen?')) {
        count = 0;
        updateUI();
    }
}

function setGoal() {
    const val = parseInt(goalInput.value, 10);
    if (isNaN(val) || val < 1) {
        alert('Bitte gib eine gültige Anzahl (mindestens 1 Flasche) ein.');
        return;
    }
    goal = val;
    goalInput.value = '';
    updateUI();
}

function clearGoal() {
    if (goal === null) return;
    if (confirm('Sparziel entfernen?')) {
        goal = null;
        updateUI();
    }
}

function hardReset() {
    if (!confirm('⚠️ Alle Daten (Zähler & Ziele) werden unwiderruflich gelöscht. Fortfahren?')) return;
    localStorage.removeItem(STORAGE_KEY);
    count = 0;
    goal = null;
    updateUI();
    // zusätzlich Input leeren
    goalInput.value = '';
}

// ----- Event Listener -----
incrementBtn.addEventListener('click', increment);
decrementBtn.addEventListener('click', decrement);
resetBtn.addEventListener('click', resetCounter);
setGoalBtn.addEventListener('click', setGoal);
clearGoalBtn.addEventListener('click', clearGoal);
hardResetBtn.addEventListener('click', hardReset);

// Tastatur: Enter im Goal-Input
goalInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        setGoal();
    }
});

// ----- Initialisierung -----
loadFromLocalStorage();

// Falls kein gespeicherter Wert, starte bei 0 (Standard)
if (typeof count !== 'number' || count < 0) count = 0;
if (goal !== undefined && goal !== null && goal < 1) goal = null;

updateUI();