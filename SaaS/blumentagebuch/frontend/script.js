const API_BASE_URL = 'https://blumentagebuch-backend-latest.onrender.com/api';
let allFlowers = [];
let currentSearchTerm = '';

// ===== DOM-REFERENZEN =====
const flowerGrid = document.getElementById('flower-grid');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resetBtn = document.getElementById('reset-btn');
const dailyFlowerContent = document.getElementById('daily-flower-content');
const modal = document.getElementById('flower-modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close-modal');

// ===== GLITZER-PARTIKEL GENERIEREN =====
function createParticles() {
    const container = document.getElementById('particles-container');
    const colors = ['#ffd700', '#ff69b4', '#ff1493', '#ffffff', '#ffa500'];
    
    for (let i = 0; i < 60; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 12 + 3;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 20 + 10) + 's';
        particle.style.animationDelay = (Math.random() * 15) + 's';
        particle.style.background = `radial-gradient(circle, ${colors[Math.floor(Math.random() * colors.length)]}, transparent)`;
        container.appendChild(particle);
    }
}
createParticles();

// ===== API-HELFER =====
async function fetchAPI(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API-Fehler:', error);
        return { success: false, message: error.message };
    }
}

// ===== BLUMEN LADEN =====
async function loadFlowers(searchTerm = '') {
    flowerGrid.innerHTML = '<div class="loading">🌿 Lade Blumen...</div>';
    
    let endpoint = '/flowers';
    if (searchTerm && searchTerm.length > 1) {
        endpoint += `?search=${encodeURIComponent(searchTerm)}`;
    }
    
    const result = await fetchAPI(endpoint);
    
    if (!result.success || result.data.length === 0) {
        flowerGrid.innerHTML = `
            <div style="text-align:center; color:white; padding:40px; font-size:1.2rem;">
                🌸 Keine Blumen gefunden.<br>
                Versuche es mit einem anderen Suchbegriff!
            </div>
        `;
        return;
    }
    
    allFlowers = result.data;
    renderFlowers(allFlowers);
}

// ===== BLUMEN RENDERN =====
function renderFlowers(flowers) {
    if (flowers.length === 0) {
        flowerGrid.innerHTML = `
            <div style="text-align:center; color:white; padding:40px; font-size:1.2rem;">
                🌸 Keine Blumen gefunden.
            </div>
        `;
        return;
    }
    
    flowerGrid.innerHTML = flowers.map(flower => `
        <div class="flower-card" data-id="${flower.id}" onclick="showFlowerDetails('${flower.id}')">
            <img 
                src="${flower.imageUrl || 'https://via.placeholder.com/400x400/ffb6c1/ffffff?text=🌸'}" 
                alt="${flower.name}"
                class="flower-image"
                loading="lazy"
                onerror="this.src='https://via.placeholder.com/400x400/ffb6c1/ffffff?text=🌸'"
            >
            <div class="flower-info">
                <h3>${flower.name}</h3>
                <div class="scientific-name">${flower.scientificName || ''}</div>
                <div class="family">${flower.family || ''}</div>
                <div class="description">${flower.description || ''}</div>
            </div>
        </div>
    `).join('');
    
    // Klick-Event für alle Karten (falls onclick nicht funktioniert)
    document.querySelectorAll('.flower-card').forEach(card => {
        card.addEventListener('click', function() {
            const id = this.dataset.id;
            showFlowerDetails(id);
        });
    });
}

// ===== BLUMEN-DETAILS ANZEIGEN =====
async function showFlowerDetails(id) {
    modal.classList.add('show');
    modalBody.innerHTML = '<div class="loading">🌺 Lade Details...</div>';
    
    const result = await fetchAPI(`/flowers/${id}`);
    
    if (!result.success || !result.data) {
        modalBody.innerHTML = `
            <div style="text-align:center; padding:20px;">
                ❌ Fehler beim Laden der Details
            </div>
        `;
        return;
    }
    
    const flower = result.data;
    modalBody.innerHTML = `
        <img 
            src="${flower.imageUrl || 'https://via.placeholder.com/600x400/ffb6c1/ffffff?text=🌸'}" 
            alt="${flower.name}"
            class="modal-image"
            onerror="this.src='https://via.placeholder.com/600x400/ffb6c1/ffffff?text=🌸'"
        >
        <h2>${flower.name}</h2>
        <div class="modal-scientific">${flower.scientificName || ''}</div>
        <div class="modal-description">${flower.description || 'Keine Beschreibung verfügbar.'}</div>
        <div class="modal-details">
            <span>🌿 Familie:</span> ${flower.family || 'Unbekannt'}
            <span>📅 Jahr:</span> ${flower.year || 'Unbekannt'}
            ${flower.genus ? `<span>🔬 Gattung:</span> ${flower.genus}` : ''}
            ${flower.edible ? `<span>🍽️ Essbar:</span> Ja` : ''}
            ${flower.medicinal ? `<span>💊 Heilpflanze:</span> Ja` : ''}
        </div>
    `;
}

// ===== BLUME DES TAGES =====
async function loadFlowerOfTheDay() {
    dailyFlowerContent.innerHTML = '<div class="loading">🌟 Lade Blume des Tages...</div>';
    
    const result = await fetchAPI('/flower-of-the-day');
    
    if (!result.success || !result.data) {
        dailyFlowerContent.innerHTML = `
            <div style="text-align:center; color:white; padding:20px;">
                🌸 Keine Blume des Tages verfügbar
            </div>
        `;
        return;
    }
    
    const flower = result.data;
    dailyFlowerContent.innerHTML = `
        <img 
            src="${flower.imageUrl || 'https://via.placeholder.com/200x200/ffb6c1/ffffff?text=🌸'}" 
            alt="${flower.name}"
            class="daily-flower-image"
            onerror="this.src='https://via.placeholder.com/200x200/ffb6c1/ffffff?text=🌸'"
        >
        <div class="daily-flower-info">
            <h3>${flower.name}</h3>
            <div class="scientific">${flower.scientificName || ''}</div>
            <p>${flower.description || 'Eine wunderschöne Blume!'}</p>
        </div>
    `;
}

// ===== MODAL-STEUERUNG =====
closeModal.addEventListener('click', () => {
    modal.classList.remove('show');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        modal.classList.remove('show');
    }
});

// ===== SUCHFUNKTION =====
searchBtn.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim();
    currentSearchTerm = searchTerm;
    loadFlowers(searchTerm);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

resetBtn.addEventListener('click', () => {
    searchInput.value = '';
    currentSearchTerm = '';
    loadFlowers();
});

// ===== APP STARTEN =====
async function init() {
    await loadFlowers();
    await loadFlowerOfTheDay();
}

// ===== ZEITGESTEUERTE AKTUALISIERUNG (alle 5 Minuten) =====
setInterval(() => {
    if (!currentSearchTerm || currentSearchTerm.length < 2) {
        loadFlowers();
    }
}, 300000); // 5 Minuten

// ===== START =====
init();

console.log('🌸 Blumentagebuch geladen! ✨');
console.log('💡 Tipp: Klicke auf eine Blume für Details!');