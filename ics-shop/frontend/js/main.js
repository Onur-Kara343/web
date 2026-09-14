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
    
    if (pageId === 'shop') {
        loadShop();
    }
    if (pageId === 'transformation') {
        loadModules();
    }
    if (pageId === 'library' && currentUser) {
        loadLibrary();
    }
}

function navigateToShop() {
    showPage('shop');
}

function navigateToTransformation() {
    showPage('transformation');
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
            
            const activePage = document.querySelector('.page.active');
            if (activePage) {
                const pageId = activePage.id.replace('Page', '');
                if (pageId === 'shop') loadShop();
                if (pageId === 'transformation') loadModules();
                if (pageId === 'library') loadLibrary();
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
            showNotification('Registrierung erfolgreich!', 'success');
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
    const userNameSpan = document.getElementById('userName');
    
    if (authBtn) {
        authBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
    }
    if (userEmailSpan) {
        userEmailSpan.style.display = 'inline-flex';
        userEmailSpan.style.alignItems = 'center';
        userEmailSpan.style.gap = '0.5rem';
    }
    if (userNameSpan) {
        const name = currentUser?.email?.split('@')[0] || 'User';
        userNameSpan.textContent = name;
    }
    if (libraryLink) libraryLink.style.display = 'inline-flex';
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

// ============ SHOP (FREE + PAID EBOOKS) ============
async function loadShop() {
    const container = document.getElementById('shopEbooksContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Lade eBooks...</div>';
    
    try {
        const res = await fetch(`${API_URL}/shop-ebooks`);
        const ebooks = await res.json();
        
        let purchasedSlugs = [];
        if (currentUser) {
            try {
                const purchasedRes = await fetch(`${API_URL}/my-shop-ebooks`, {
                    headers: { 'Authorization': `Bearer ${currentUser.token}` }
                });
                if (purchasedRes.ok) {
                    const purchased = await purchasedRes.json();
                    purchasedSlugs = purchased.map(e => e.slug);
                }
            } catch (e) {}
        }
        
        if (ebooks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="fas fa-book"></i></div>
                    <h3>Keine eBooks verfügbar</h3>
                    <p>Bitte komme später wieder</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = ebooks.map(ebook => {
            const isPurchased = purchasedSlugs.includes(ebook.slug);
            const price = parseFloat(ebook.price) || 0;
            const isFree = ebook.is_free;
            
            return `
                <div class="shop-card">
                    <div class="ebook-icon"><i class="fas fa-book"></i></div>
                    <h3>${ebook.title}</h3>
                    <p>${ebook.description}</p>
                    <div class="price">${isFree ? 'Kostenlos' : price.toFixed(2) + ' €'}</div>
                    ${isFree ? 
                        `<button class="btn btn-secondary btn-small" onclick="downloadFreeEbook('${ebook.slug}')">
                            <i class="fas fa-download"></i> Kostenlos downloaden
                        </button>` :
                        (isPurchased ? 
                            `<button class="btn btn-secondary btn-small" onclick="downloadShopEbook('${ebook.slug}')">
                                <i class="fas fa-download"></i> Herunterladen
                            </button>` :
                            `<button class="btn btn-primary btn-small" onclick="purchaseShopEbook(${ebook.id})">
                                <i class="fas fa-shopping-cart"></i> Jetzt kaufen (${price.toFixed(2)}€)
                            </button>`)
                    }
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Shop error:', error);
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <h3>Fehler beim Laden</h3>
                <p>Bitte versuche es später erneut</p>
            </div>
        `;
    }
}

// ============ FREE EBOOK DOWNLOAD ============
async function downloadFreeEbook(slug) {
    try {
        const response = await fetch(`${API_URL}/shop-ebooks/download/free/${slug}`);
        if (!response.ok) throw new Error('Download fehlgeschlagen');
        
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
    } catch (error) {
        showNotification(error.message || 'Download fehlgeschlagen', 'error');
    }
}

// ============ SHOP EBOOK FUNCTIONS ============
async function downloadShopEbook(slug) {
    if (!currentUser) {
        showNotification('Bitte einloggen', 'error');
        openAuthModal();
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/shop-ebooks/download/${slug}`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        
        if (!response.ok) throw new Error('Download fehlgeschlagen');
        
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
    } catch (error) {
        showNotification(error.message || 'Download fehlgeschlagen', 'error');
    }
}

async function purchaseShopEbook(ebookId) {
    if (!currentUser) {
        showNotification('Bitte zuerst einloggen', 'error');
        openAuthModal();
        return;
    }
    
    showNotification('Kauf wird verarbeitet...', 'info');
    
    try {
        const res = await fetch(`${API_URL}/shop-ebooks/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ ebookId })
        });
        
        const data = await res.json();
        if (res.ok) {
            showNotification('✅ eBook gekauft!', 'success');
            loadShop();
            loadLibrary();
        } else {
            showNotification(data.error || 'Kauf fehlgeschlagen', 'error');
        }
    } catch (error) {
        showNotification('Fehler beim Kauf', 'error');
    }
}

// ============ MODULES (NUR DAS, WAS IM TRANSFORMATION TAB IST) ============
async function loadModules() {
    const container = document.getElementById('modulesContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Lade Module...</div>';
    
    try {
        const res = await fetch(`${API_URL}/modules`);
        const modules = await res.json();
        
        let purchasedModuleIds = [];
        if (currentUser) {
            try {
                const purchasedRes = await fetch(`${API_URL}/my-modules`, {
                    headers: { 'Authorization': `Bearer ${currentUser.token}` }
                });
                if (purchasedRes.ok) {
                    const purchased = await purchasedRes.json();
                    purchasedModuleIds = purchased.map(m => m.id);
                }
            } catch (e) {}
        }
        
        const moduleNames = {
            'module-basic': 'Basic',
            'module-advanced': 'Advanced',
            'module-full': 'Full System'
        };
        
        const moduleColors = {
            'module-basic': 'basic',
            'module-advanced': 'advanced',
            'module-full': 'full'
        };
        
        if (modules.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="fas fa-tag"></i></div>
                    <h3>Keine Module verfügbar</h3>
                    <p>Bitte komme später wieder</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = modules.map(module => {
            const isPurchased = purchasedModuleIds.includes(module.id);
            const price = parseFloat(module.price) || 0;
            const phaseCount = module.phase_ids ? module.phase_ids.length : 0;
            const moduleKey = module.slug;
            const colorClass = moduleColors[moduleKey] || 'basic';
            
            return `
                <div class="pricing-card ${moduleKey === 'module-advanced' ? 'featured' : ''}">
                    ${moduleKey === 'module-advanced' ? '<div class="recommended-badge"><i class="fas fa-star"></i> EMPFOHLEN</div>' : ''}
                    <div class="pricing-badge ${colorClass}">${moduleNames[moduleKey] || module.name}</div>
                    <div class="pricing-price">${price.toFixed(2)}€</div>
                    <div class="pricing-duration">einmalig</div>
                    <ul>
                        <li><i class="fas fa-check-circle"></i> ${phaseCount} Transformationsphasen</li>
                        <li><i class="fas fa-book"></i> Alle eBooks der Phasen</li>
                        <li><i class="fas fa-infinity"></i> Lebenslanger Zugriff</li>
                    </ul>
                    ${isPurchased ? 
                        `<span class="status purchased"><i class="fas fa-check"></i> Bereits freigeschaltet</span>` :
                        `<button class="btn btn-pricing ${moduleKey === 'module-advanced' ? 'btn-featured' : ''}" onclick="purchaseModule(${module.id})">
                            <i class="fas fa-shopping-cart"></i> Jetzt wählen
                        </button>`
                    }
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Modules error:', error);
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <h3>Fehler beim Laden</h3>
                <p>Bitte versuche es später erneut</p>
            </div>
        `;
    }
}

async function purchaseModule(moduleId) {
    if (!currentUser) {
        showNotification('Bitte zuerst einloggen', 'error');
        openAuthModal();
        return;
    }
    
    showNotification('Kauf wird verarbeitet...', 'info');
    
    try {
        const res = await fetch(`${API_URL}/modules/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ moduleId })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            showNotification(`✅ ${data.message}`, 'success');
            loadModules();
            loadLibrary();
        } else {
            showNotification(data.error || 'Kauf fehlgeschlagen', 'error');
        }
    } catch (error) {
        showNotification('Fehler beim Kauf', 'error');
    }
}

// ============ LIBRARY ============
async function loadLibrary() {
    const container = document.getElementById('purchasedEbooksContainer');
    if (!container) return;
    
    if (!currentUser) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-lock"></i></div>
                <h3>Bitte einloggen</h3>
                <p>Melde dich an, um deine Bibliothek zu sehen</p>
                <button class="btn btn-primary" onclick="openAuthModal()"><i class="fas fa-sign-in-alt"></i> Login</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Lade deine Bibliothek...</div>';
    
    try {
        const res = await fetch(`${API_URL}/library/ebooks`, {
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        
        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem('token');
                currentUser = null;
                updateUIForLoggedOut();
                showNotification('Session abgelaufen, bitte neu einloggen', 'error');
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon"><i class="fas fa-lock"></i></div>
                        <h3>Session abgelaufen</h3>
                        <p>Bitte logge dich erneut ein</p>
                        <button class="btn btn-primary" onclick="openAuthModal()"><i class="fas fa-sign-in-alt"></i> Login</button>
                    </div>
                `;
                return;
            }
            throw new Error('Fehler beim Laden');
        }
        
        const data = await res.json();
        const ebooks = data.ebooks || [];
        
        if (ebooks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><i class="fas fa-book"></i></div>
                    <h3>Noch keine eBooks gekauft</h3>
                    <p>Entdecke unsere eBooks im Shop und starte deine Transformation</p>
                    <button class="btn btn-primary" onclick="navigateToShop()"><i class="fas fa-shopping-cart"></i> Zum Shop</button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = ebooks.map(ebook => `
            <div class="library-item">
                <div class="item-icon"><i class="fas fa-book"></i></div>
                <h4>${ebook.title}</h4>
                <p>${ebook.description}</p>
                <button class="btn btn-secondary btn-small" onclick="downloadShopEbook('${ebook.slug}')">
                    <i class="fas fa-download"></i> Herunterladen
                </button>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Library error:', error);
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <h3>Fehler beim Laden</h3>
                <p>Bitte versuche es später erneut</p>
                <button class="btn btn-primary" onclick="loadLibrary()"><i class="fas fa-sync"></i> Neu laden</button>
            </div>
        `;
    }
}

// ============ CHECKOUT ============
async function loadCheckoutLinks() {
    try {
        const res = await fetch(`${API_URL}/checkout-links`);
        checkoutLinks = await res.json();
    } catch (error) {
        checkoutLinks = { basic: '#', advanced: '#', full: '#' };
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
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
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
    
    if (document.getElementById('shopPage').classList.contains('active')) {
        loadShop();
    }
    if (document.getElementById('transformationPage').classList.contains('active')) {
        loadModules();
    }
    if (document.getElementById('libraryPage').classList.contains('active')) {
        loadLibrary();
    }
});

// ============ GLOBALE FUNKTIONEN ============
window.showPage = showPage;
window.navigateToShop = navigateToShop;
window.navigateToTransformation = navigateToTransformation;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.closeAuthModal = closeAuthModal;
window.toggleAuthForms = toggleAuthForms;
window.openAuthModal = openAuthModal;
window.downloadFreeEbook = downloadFreeEbook;
window.downloadShopEbook = downloadShopEbook;
window.purchaseShopEbook = purchaseShopEbook;
window.purchaseModule = purchaseModule;
window.loadShop = loadShop;
window.loadModules = loadModules;
window.loadLibrary = loadLibrary;