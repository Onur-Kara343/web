// Glücksrad - Mit eigenen Werten
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const resultDiv = document.getElementById('result');
const valueInput = document.getElementById('valueInput');
const addBtn = document.getElementById('addBtn');
const valuesList = document.getElementById('valuesList');
const resetBtn = document.getElementById('resetBtn');
const exampleBtn = document.getElementById('exampleBtn');
const titleInput = document.getElementById('titleInput');
const editTitleBtn = document.getElementById('editTitleBtn');
const soundToggleBtn = document.getElementById('sound-toggle');

let values = [];
let currentRotation = 0;
let spinning = false;
let animationId = null;
let soundEnabled = true;

// ========== SOUND-EFFEKTE (KORRIGIERT) ==========
let audioContext = null;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

function playSpinSound() {
    if (!soundEnabled) return;
    initAudio();
    
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    oscillator.frequency.setValueAtTime(880, now);
    oscillator.frequency.linearRampToValueAtTime(440, now + 1.5);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 1.5);
    
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(now + 1.5);
}

function playWinSound() {
    if (!soundEnabled) return;
    initAudio();
    
    const now = audioContext.currentTime;
    
    // Erster Ton
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = 523.25;
    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.linearRampToValueAtTime(0.01, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(audioContext.destination);
    osc1.start();
    osc1.stop(now + 0.5);
    
    // Zweiter Ton (nach 200ms)
    setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.type = 'sine';
        osc2.frequency.value = 659.25;
        gain2.gain.setValueAtTime(0.4, audioContext.currentTime);
        gain2.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.start();
        osc2.stop(audioContext.currentTime + 0.5);
    }, 200);
    
    // Dritter Ton (nach 400ms)
    setTimeout(() => {
        const osc3 = audioContext.createOscillator();
        const gain3 = audioContext.createGain();
        osc3.type = 'sine';
        osc3.frequency.value = 783.99;
        gain3.gain.setValueAtTime(0.4, audioContext.currentTime);
        gain3.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        osc3.connect(gain3);
        gain3.connect(audioContext.destination);
        osc3.start();
        osc3.stop(audioContext.currentTime + 0.5);
    }, 400);
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    if (soundToggleBtn) {
        soundToggleBtn.innerHTML = soundEnabled ? '🔊 Sound an' : '🔇 Sound aus';
    }
}

// ========== TITEL ==========
function saveTitle() {
    localStorage.setItem('gluecksrad_title', titleInput.value);
}

function loadTitle() {
    const savedTitle = localStorage.getItem('gluecksrad_title');
    if (savedTitle) {
        titleInput.value = savedTitle;
    }
}

editTitleBtn.addEventListener('click', () => {
    titleInput.focus();
    titleInput.select();
});

titleInput.addEventListener('blur', () => {
    saveTitle();
    if (!titleInput.value.trim()) {
        titleInput.value = '🎡 Glücksrad';
        saveTitle();
    }
});

titleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        titleInput.blur();
    }
});

// ========== FARBEN ==========
const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
    '#98D8C8', '#F7B05E', '#C44569', '#786FA6', '#F8C7CC', '#A3DDCB'
];

// ========== RAD ZEICHNEN ==========
function drawWheel() {
    const size = canvas.width;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;
    
    if (values.length === 0) {
        ctx.clearRect(0, 0, size, size);
        ctx.font = '20px Inter';
        ctx.fillStyle = '#718096';
        ctx.textAlign = 'center';
        ctx.fillText('Bitte Werte hinzufügen', centerX, centerY);
        return;
    }
    
    const angleStep = (Math.PI * 2) / values.length;
    
    for (let i = 0; i < values.length; i++) {
        const startAngle = i * angleStep + currentRotation;
        const endAngle = (i + 1) * angleStep + currentRotation;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + angleStep / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.font = 'bold ' + (radius / 8) + 'px Inter';
        ctx.shadowBlur = 0;
        
        const text = values[i];
        const x = radius * 0.6;
        const y = 5;
        ctx.fillText(text, x, y);
        ctx.restore();
    }
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#2d3748';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX + radius + 10, centerY - 10);
    ctx.lineTo(centerX + radius + 25, centerY);
    ctx.lineTo(centerX + radius + 10, centerY + 10);
    ctx.fillStyle = '#2d3748';
    ctx.fill();
}

// ========== WERTE SPEICHERN ==========
function saveValues() {
    localStorage.setItem('gluecksrad_values', JSON.stringify(values));
}

function loadValues() {
    const saved = localStorage.getItem('gluecksrad_values');
    if (saved) {
        values = JSON.parse(saved);
    } else {
        values = ['10€ Gewinn', 'Trostpreis', 'Nichts', 'Bonus', 'Nochmal', 'Überraschung'];
    }
    renderValuesList();
    drawWheel();
}

function renderValuesList() {
    valuesList.innerHTML = '';
    values.forEach((value, index) => {
        const item = document.createElement('div');
        item.className = 'value-item';
        item.innerHTML = `
            <span>${value}</span>
            <button onclick="removeValue(${index})">✕</button>
        `;
        valuesList.appendChild(item);
    });
    saveValues();
    drawWheel();
}

window.removeValue = function(index) {
    values.splice(index, 1);
    renderValuesList();
    if (values.length === 0) {
        resultDiv.textContent = 'Bitte füge Werte hinzu!';
    }
};

function addValue() {
    const newValue = valueInput.value.trim();
    if (!newValue) {
        alert('Bitte einen Wert eingeben!');
        return;
    }
    if (values.length >= 12) {
        alert('Maximal 12 Werte möglich!');
        return;
    }
    values.push(newValue);
    valueInput.value = '';
    renderValuesList();
    resultDiv.textContent = `${newValue} wurde hinzugefügt!`;
}

// ========== RAD DREHEN (MIT VERBESSERTER ANIMATION + SOUND) ==========
function spin() {
    if (spinning) return;
    if (values.length === 0) {
        alert('Bitte zuerst Werte hinzufügen!');
        return;
    }
    
    spinning = true;
    
    // Dreh-Sound abspielen
    playSpinSound();
    
    // Zufällige Anzahl Umdrehungen (8-15)
    const spins = 8 + Math.random() * 7;
    const targetRotation = currentRotation + (Math.PI * 2 * spins);
    const startRotation = currentRotation;
    const startTime = performance.now();
    const duration = 2500; // 2.5 Sekunden
    
    function animate(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        
        // Bessere Easing-Funktion: Start langsam, Mitte schnell, Ende sanft
        let ease;
        if (progress < 0.2) {
            // Langsamer Start
            ease = 0.5 * Math.pow(progress / 0.2, 2);
        } else if (progress < 0.8) {
            // Schnelle Mitte
            ease = 0.2 + 1.2 * (progress - 0.2);
        } else {
            // Sanftes Stoppen
            const t = (progress - 0.8) / 0.2;
            ease = 1 - Math.pow(1 - t, 3);
        }
        
        currentRotation = startRotation + (targetRotation - startRotation) * Math.min(1, ease);
        drawWheel();
        
        if (progress < 1) {
            animationId = requestAnimationFrame(animate);
        } else {
            spinning = false;
            cancelAnimationFrame(animationId);
            
            // Gewinner ermitteln
            const angleStep = (Math.PI * 2) / values.length;
            const pointerAngle = Math.PI / 2;
            let relativeAngle = (currentRotation + pointerAngle) % (Math.PI * 2);
            let winnerIndex = Math.floor((Math.PI * 2 - relativeAngle) / angleStep) % values.length;
            if (winnerIndex < 0) winnerIndex += values.length;
            winnerIndex = winnerIndex % values.length;
            
            const winner = values[winnerIndex];
            resultDiv.innerHTML = `🎉 ${winner} 🎉`;
            
            // Gewinn-Sound abspielen
            playWinSound();
            
            // Konfetti-Effekt
            for (let i = 0; i < 30; i++) {
                createConfetti();
            }
        }
    }
    
    if (animationId) cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(animate);
}

// ========== KONFETTI ==========
function createConfetti() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.position = 'fixed';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    confetti.style.left = Math.random() * window.innerWidth + 'px';
    confetti.style.top = '-10px';
    confetti.style.borderRadius = '50%';
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '9999';
    document.body.appendChild(confetti);
    
    const animation = confetti.animate([
        { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
        { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
    ], {
        duration: 1500,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });
    
    animation.onfinish = () => confetti.remove();
}

// ========== BEISPIELWERTE & RESET ==========
function loadExamples() {
    values = ['10€ Gewinn', 'Trostpreis', 'Nichts', 'Bonusrunde', 'Doppelter Gewinn', 'Überraschung', 'Nochmal drehen'];
    renderValuesList();
    resultDiv.textContent = 'Beispielwerte geladen!';
}

function resetAll() {
    if (confirm('Alle Werte wirklich löschen?')) {
        values = [];
        renderValuesList();
        drawWheel();
        resultDiv.textContent = 'Alle Werte gelöscht!';
    }
}

// ========== EVENT LISTENER ==========
spinBtn.addEventListener('click', spin);
addBtn.addEventListener('click', addValue);
resetBtn.addEventListener('click', resetAll);
exampleBtn.addEventListener('click', loadExamples);
valueInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addValue();
});

// ========== INITIALISIERUNG ==========
loadTitle();
loadValues();