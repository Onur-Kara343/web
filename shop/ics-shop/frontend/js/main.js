// API Configuration
const API_URL = 'http://localhost:3000/api';
let currentUser = null;
let checkoutLinks = {};

// ============ NAVIGATION ============
function showPage(pageId) {
    console.log('Zeige Seite:', pageId);
    
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const activePage = document.getElementById(`${pageId}Page`);
    if (activePage) {
        activePage.classList.add('active');
    }
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageId) {
            link.classList.add('active');
        }
    });
    
    if (pageId === 'library' && currentUser) {
        loadLibrary();
    }
}

function navigateToShop() {
    showPage('shop');
}

function scrollToFreeEbook() {
    document.getElementById('free-ebook-section')?.scrollIntoView({ behavior: 'smooth' });
}

// ============ AUTH ============
async function handleLogin() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email) {
        showNotification('Bitte E-Mail eingeben', 'error');
        return;
    }
    
    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: password || '' })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            localStorage.setItem('token', data.token);
            currentUser = { token: data.token, email: data.user.email, tier: data.user.tier };
            updateUIForLoggedInUser();
            closeAuthModal();
            showNotification('Login erfolgreich!', 'success');
            
            if (document.getElementById('libraryPage').classList.contains('active')) {
                loadLibrary();
            }
        } else {
            showNotification(data.error || 'Login fehlgeschlagen', 'error');
        }
    } catch (error) {
        showNotification('Fehler beim Login', 'error');
    }
}

async function handleRegister() {
    const email = document.getElementById('registerEmail')?.value;
    const password = document.getElementById('registerPassword')?.value;
    
    if (!email) {
        showNotification('Bitte E-Mail eingeben', 'error');
        return;
    }
    
    try {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: password || undefined })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            localStorage.setItem('token', data.token);
            currentUser = { token: data.token, email: data.user.email, tier: data.user.tier };
            updateUIForLoggedInUser();
            closeAuthModal();
            showNotification('Registrierung erfolgreich! Du erhältst dein kostenloses eBook per E-Mail.', 'success');
        } else {
            showNotification(data.error || 'Registrierung fehlgeschlagen', 'error');
        }
    } catch (error) {
        showNotification('Fehler bei Registrierung', 'error');
    }
}

function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    updateUIForLoggedOut();
    showPage('home');
    showNotification('Erfolgreich ausgeloggt', 'info');
}

function updateUIForLoggedInUser() {
    const authBtn = document.getElementById('authBtn');
    const userEmailSpan = document.getElementById('userEmail');
    const libraryLink = document.getElementById('libraryLink');
    
    if (authBtn) {
        authBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
    }
    if (userEmailSpan) {
        userEmailSpan.style.display = 'inline';
        userEmailSpan.textContent = currentUser?.email?.split('@')[0] || 'User';
    }
    if (libraryLink) libraryLink.style.display = 'inline';
}

function updateUIForLoggedOut() {
    const authBtn = document.getElementById('authBtn');
    const userEmailSpan = document.getElementById('userEmail');
    const libraryLink = document.getElementById('libraryLink');
    
    if (authBtn) {
        authBtn.innerHTML = '<i class="fas fa-user"></i> Login';
    }
    if (userEmailSpan) userEmailSpan.style.display = 'none';
    if (libraryLink) libraryLink.style.display = 'none';
}

function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        currentUser = { token };
        updateUIForLoggedInUser();
    }
}

// ============ BONUS TOOLS (3 ANDROID APPS) ============
async function loadBonusTools() {
    const container = document.getElementById('bonusToolsGrid');
    if (!container) return;
    
    const fallbackTools = [
        { 
            id: 'emora', 
            name: 'Emora', 
            icon: 'fa-comment-dots', 
            description: 'Emotionsrad mit 60+ Emotionen + Chatbot + Trigger-Landkarte für deine Gefühle',
            type: 'Android App'
        },
        { 
            id: 'calmmind', 
            name: 'CalmMind', 
            icon: 'fa-book', 
            description: 'Tagebuch mit Kalenderansicht, ToDos, Briefe an dein Zukunfts-Ich & KI-Reflexion',
            type: 'Android App'
        },
        { 
            id: 'dreamweaver', 
            name: 'Dreamweaver', 
            icon: 'fa-moon', 
            description: 'Traumtagebuch + KI-Analyse, Lucid Dream Tipps, Schlaf-Tracking & mehr',
            type: 'Android App'
        }
    ];
    
    try {
        const res = await fetch(`${API_URL}/bonus-tools`);
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }
        
        const tools = await res.json();
        
        container.innerHTML = tools.map(tool => `
            <div class="bonus-card coming-soon">
                <div class="bonus-icon"><i class="fas ${tool.icon}"></i></div>
                <h3>${tool.name} <span class="coming-badge">🔥 Bald</span></h3>
                <p>${tool.description}</p>
                <span class="bonus-platform"><i class="fas fa-android"></i> ${tool.type || 'Android App'}</span>
                <span class="bonus-link disabled">In Entwicklung →</span>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Fehler beim Laden der Bonus-Tools, zeige Fallback:', error);
        container.innerHTML = fallbackTools.map(tool => `
            <div class="bonus-card coming-soon">
                <div class="bonus-icon"><i class="fas ${tool.icon}"></i></div>
                <h3>${tool.name} <span class="coming-badge">🔥 Bald</span></h3>
                <p>${tool.description}</p>
                <span class="bonus-platform"><i class="fas fa-android"></i> ${tool.type}</span>
                <span class="bonus-link disabled">In Entwicklung →</span>
            </div>
        `).join('');
    }
}

// ============ FREE EBOOK DIREKT-DOWNLOAD (OHNE E-MAIL) ============
async function downloadFreeEbook(slug) {
    const fileMap = {
        'der-eine-schalter': 'free-ebook-1-der-eine-schalter.pdf',
        'tiefencode': 'free-ebook-2-tiefencode.pdf',
        'hardware-update': 'free-ebook-3-hardware-update.pdf'
    };
    
    const fileName = fileMap[slug];
    if (!fileName) {
        showNotification('eBook nicht gefunden', 'error');
        return;
    }
    
    showNotification('Starte Download...', 'info');
    
    try {
        const downloadUrl = `/uploads/free-ebooks/${fileName}`;
        
        const response = await fetch(downloadUrl);
        
        if (!response.ok) {
            throw new Error('Datei nicht gefunden');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        
        showNotification('Download gestartet!', 'success');
        
    } catch (error) {
        console.error('Download error:', error);
        showNotification('Fehler beim Download. Bitte versuche es später erneut.', 'error');
    }
}

// ============ FREE EBOOK PER E-MAIL ============
async function handleFreeEbookDownload(event, slug) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    
    if (!email) {
        showNotification('Bitte E-Mail eingeben', 'error');
        return;
    }
    
    showNotification('Sende Download-Link...', 'info');
    
    try {
        const res = await fetch(`${API_URL}/download-free-ebook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, ebookSlug: slug })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            showNotification(`Download-Link für "${slug}" wurde an ${email} gesendet!`, 'success');
            form.querySelector('input[type="email"]').value = '';
        } else {
            showNotification(data.error || 'Fehler beim Versenden', 'error');
        }
    } catch (error) {
        console.error('Free download error:', error);
        showNotification('Fehler beim Anfordern des Downloads', 'error');
    }
}

// ============ MODERN LIBRARY ============
async function loadLibrary() {
    const container = document.getElementById('libraryContainer');
    if (!container) return;
    
    const token = localStorage.getItem('token');
    
    if (!token) {
        container.innerHTML = `
            <div class="empty-library">
                <div class="empty-library-icon"><i class="fas fa-lock"></i></div>
                <h3>Bitte einloggen</h3>
                <p>Melde dich an, um deine Bibliothek zu sehen</p>
                <button class="btn btn-primary" onclick="openAuthModal()"><i class="fas fa-sign-in-alt"></i> Login</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Lade deine Bibliothek...</div>';
    
    try {
        const res = await fetch(`${API_URL}/my-ebooks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('token');
            currentUser = null;
            updateUIForLoggedOut();
            container.innerHTML = `
                <div class="empty-library">
                    <div class="empty-library-icon"><i class="fas fa-lock"></i></div>
                    <h3>Session abgelaufen</h3>
                    <p>Bitte logge dich erneut ein</p>
                    <button class="btn btn-primary" onclick="openAuthModal()"><i class="fas fa-sign-in-alt"></i> Login</button>
                </div>
            `;
            return;
        }
        
        if (!res.ok) throw new Error('Fehler beim Laden');
        
        const data = await res.json();
        
        let html = '';
        
        // Free eBooks Section
        if (data.grouped?.free?.length > 0) {
            html += `
                <div class="library-section">
                    <div class="library-section-header">
                        <h3><i class="fas fa-gift"></i> Kostenlose eBooks</h3>
                        <p>Deine Geschenke - immer verfügbar</p>
                    </div>
                    <div class="ebooks-table">
                        ${data.grouped.free.map(ebook => `
                            <div class="ebook-row">
                                <div class="ebook-info">
                                    <div class="ebook-title"><i class="fas fa-book"></i> ${ebook.title}</div>
                                    <div class="ebook-meta">
                                        <span class="ebook-phase"><i class="fas fa-star"></i> Gratis</span>
                                    </div>
                                </div>
                                <div class="ebook-action">
                                    <button class="download-btn" onclick="downloadEBook('${ebook.slug}')">
                                        <i class="fas fa-download"></i> Download
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // Paid eBooks Section
        const paidEbooks = [
            ...(data.grouped?.basic || []),
            ...(data.grouped?.advanced || []),
            ...(data.grouped?.full || [])
        ];
        
        if (paidEbooks.length > 0) {
            const tierName = data.userTier === 'basic' ? 'Basic Paket' : 
                           data.userTier === 'advanced' ? 'Advanced Paket' : 
                           'Full System';
            
            html += `
                <div class="library-section">
                    <div class="library-section-header">
                        <h3><i class="fas fa-lock"></i> Gekaufte eBooks (${tierName})</h3>
                        <p>Deine erworbenen Inhalte</p>
                    </div>
                    <div class="ebooks-table">
                        ${paidEbooks.map(ebook => `
                            <div class="ebook-row">
                                <div class="ebook-info">
                                    <div class="ebook-title"><i class="fas fa-book"></i> ${ebook.title}</div>
                                    <div class="ebook-meta">
                                        <span class="ebook-phase"><i class="fas fa-layer-group"></i> Phase ${ebook.phase}</span>
                                        ${ebook.is_downloaded ? 
                                            '<span class="ebook-status downloaded"><i class="fas fa-check-circle"></i> Bereits heruntergeladen</span>' : 
                                            '<span class="ebook-status"><i class="fas fa-arrow-down"></i> Bereit zum Download</span>'
                                        }
                                    </div>
                                </div>
                                <div class="ebook-action">
                                    <button class="download-btn ${ebook.is_downloaded ? 'downloaded' : ''}" 
                                            onclick="${ebook.is_downloaded ? '' : `downloadEBook('${ebook.slug}')`}"
                                            ${ebook.is_downloaded ? 'disabled' : ''}>
                                        ${ebook.is_downloaded ? '<i class="fas fa-check"></i> Heruntergeladen' : '<i class="fas fa-download"></i> Jetzt downloaden'}
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // Upgrade prompt for free users
        if (data.userTier === 'free' && paidEbooks.length === 0) {
            html += `
                <div class="upgrade-prompt">
                    <div class="upgrade-icon"><i class="fas fa-rocket"></i></div>
                    <h3>Erweitere deine Bibliothek</h3>
                    <p>Mit Basic, Advanced oder Full System erhältst du Zugriff auf alle Phasen 1-5</p>
                    <button class="btn btn-primary" onclick="showPage('shop')"><i class="fas fa-shopping-cart"></i> Zum Shop</button>
                </div>
            `;
        }
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Library error:', error);
        container.innerHTML = `
            <div class="empty-library">
                <div class="empty-library-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <h3>Fehler beim Laden</h3>
                <p>Bitte versuche es später erneut</p>
                <button class="btn btn-primary" onclick="loadLibrary()"><i class="fas fa-sync"></i> Neu laden</button>
            </div>
        `;
    }
}

async function downloadEBook(slug) {
    if (!currentUser) {
        showNotification('Bitte zuerst einloggen', 'error');
        openAuthModal();
        return;
    }
    
    showNotification('Bereite Download vor...', 'info');
    
    try {
        const response = await fetch(`${API_URL}/download/${slug}`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Download fehlgeschlagen');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${slug}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        
        showNotification('Download gestartet!', 'success');
        
        setTimeout(() => loadLibrary(), 1000);
        
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// ============ PURCHASE ============
async function loadCheckoutLinks() {
    try {
        const res = await fetch(`${API_URL}/checkout-links`);
        checkoutLinks = await res.json();
    } catch (error) {
        checkoutLinks = { basic: '#', advanced: '#', full: '#' };
    }
}

function handlePurchase(tier) {
    if (!currentUser) {
        showNotification('Bitte zuerst einloggen oder registrieren', 'error');
        openAuthModal();
        return;
    }
    
    const link = checkoutLinks[tier];
    if (link && link !== '#') {
        window.open(link, '_blank');
        showNotification(`Weiter zu LemonSqueezy für ${tier.toUpperCase()} Paket`, 'info');
    } else {
        simulatePurchase(tier);
    }
}

async function simulatePurchase(tier) {
    try {
        const res = await fetch(`${API_URL}/update-tier`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ tier })
        });
        
        if (res.ok) {
            currentUser.tier = tier;
            showNotification(`✅ ${tier.toUpperCase()} Paket aktiviert (Demo-Modus)`, 'success');
            loadLibrary();
        }
    } catch (error) {
        currentUser.tier = tier;
        showNotification(`Demo: ${tier.toUpperCase()} Zugriff gewährt`, 'info');
        loadLibrary();
    }
}

// ============ MODAL ============
function openAuthModal() {
    document.getElementById('authModal').style.display = 'block';
    toggleAuthForms('login');
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function toggleAuthForms(form) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (form === 'login') {
        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
    } else {
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
    }
}

// ============ NOTIFICATION ============
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    if (type === 'error') {
        notification.style.background = '#ff6b6b';
        notification.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    } else if (type === 'info') {
        notification.style.background = '#3498db';
        notification.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    } else {
        notification.style.background = '#4ecdc4';
        notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if (page) showPage(page);
        });
    });
    
    document.getElementById('authBtn')?.addEventListener('click', () => {
        currentUser ? logout() : openAuthModal();
    });
    
    document.querySelector('.close')?.addEventListener('click', closeAuthModal);
    window.onclick = (e) => {
        if (e.target === document.getElementById('authModal')) closeAuthModal();
    };
    
    checkAuth();
    loadCheckoutLinks();
    loadBonusTools();
});

// Globale Funktionen
window.showPage = showPage;
window.navigateToShop = navigateToShop;
window.scrollToFreeEbook = scrollToFreeEbook;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.closeAuthModal = closeAuthModal;
window.toggleAuthForms = toggleAuthForms;
window.handlePurchase = handlePurchase;
window.downloadEBook = downloadEBook;
window.openAuthModal = openAuthModal;
window.loadLibrary = loadLibrary;
window.downloadFreeEbook = downloadFreeEbook;
window.handleFreeEbookDownload = handleFreeEbookDownload;