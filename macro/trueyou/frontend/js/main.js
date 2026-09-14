// frontend/js/main.js
import { login, register, verifyToken, getTest, submitTest, getAllResults, getPremiumStatus, createCheckout, logout } from './api.js';
import { store } from './store.js';

// ========== TEST-METADATEN ==========
const TEST_METADATA = [
    { id: 'big_five', name: 'Big Five Persönlichkeitstest', description: 'Entdecke deine Persönlichkeit anhand der fünf Dimensionen', category: 'Persönlichkeit', icon: '🧠', free: true },
    { id: 'bindungsstil', name: 'Bindungsstil Test', description: 'Wie bindest du dich in Beziehungen?', category: 'Beziehungen', icon: '💞', free: true },
    { id: 'resilienz', name: 'Resilienz Test', description: 'Wie gut steckst du Rückschläge weg?', category: 'Entwicklung', icon: '🌱', free: true },
    { id: 'jung_archetypen', name: 'Jung-Archetypen', description: 'Welcher Archetyp lebt in dir?', category: 'Persönlichkeit', icon: '🏛️', free: false },
    { id: 'schattenseiten', name: 'Schattenseiten', description: 'Entdecke deine verdrängten Anteile', category: 'Persönlichkeit', icon: '🌑', free: false },
    { id: 'kommunikationsstil', name: 'Kommunikationsstil', description: 'Wie kommunizierst du mit anderen?', category: 'Persönlichkeit', icon: '💬', free: false },
    { id: 'entscheidungstyp', name: 'Entscheidungstyp', description: 'Triffst du Entscheidungen rational oder emotional?', category: 'Persönlichkeit', icon: '⚖️', free: false },
    { id: 'konfliktstil', name: 'Konfliktstil', description: 'Wie gehst du mit Konflikten um?', category: 'Beziehungen', icon: '⚔️', free: false },
    { id: 'emotionale_intelligenz', name: 'Emotionale Intelligenz', description: 'Wie gut erkennst du Gefühle?', category: 'Beziehungen', icon: '❤️', free: false },
    { id: 'selbstwert', name: 'Selbstwert Test', description: 'Wie stark ist dein Selbstbewusstsein?', category: 'Beziehungen', icon: '💪', free: false },
    { id: 'lebensrollen', name: 'Lebensrollen', description: 'Welche Rollen prägen dich?', category: 'Beziehungen', icon: '🎭', free: false },
    { id: 'lebenswerte', name: 'Lebenswerte', description: 'Was ist dir wirklich wichtig?', category: 'Entwicklung', icon: '🏆', free: false },
    { id: 'motivationsprofil', name: 'Motivationsprofil', description: 'Was treibt dich an?', category: 'Entwicklung', icon: '⚡', free: false },
    { id: 'innere_antreiber', name: 'Innere Antreiber', description: 'Welche Glaubenssätze steuern dich?', category: 'Entwicklung', icon: '🔋', free: false },
    { id: 'stressprofil', name: 'Stressprofil', description: 'Wie reagierst du unter Druck?', category: 'Entwicklung', icon: '😰', free: false }
];

// ========== DOM ELEMENTS ==========
const authView = document.getElementById('auth-view');
const mainView = document.getElementById('main-view');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const testCategories = document.getElementById('test-categories');
const dashboardResults = document.getElementById('dashboard-results');
const questionContainer = document.getElementById('question-container');
const resultContainer = document.getElementById('result-container');
const questionCounter = document.getElementById('question-counter');
const progressFill = document.getElementById('progress-fill');
const userNameElement = document.getElementById('user-name');
const premiumBadge = document.getElementById('premium-badge');
const premiumBanner = document.getElementById('premium-banner');
const logoutBtn = document.getElementById('logout-btn');
const backToDashboardBtn = document.getElementById('back-to-dashboard');
const newTestBtn = document.getElementById('new-test');
const upgradeBtn = document.getElementById('upgrade-btn');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');

// ========== UTILITY ==========
function showElement(element, display = 'block') {
    if (element) element.style.display = display;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#6366f1',
        warning: '#f59e0b'
    };

    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        padding: 14px 24px;
        border-radius: 16px;
        background: ${colors[type] || colors.info};
        color: white;
        font-weight: 500;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        max-width: 400px;
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(20px)';
        notification.style.transition = 'all 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
window.showNotification = showNotification;

function showLoading(show) {
    const existing = document.querySelector('.loading-overlay');
    if (show) {
        if (!existing) {
            const overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-spinner"></div>
                <p style="color: #94a3b8; margin-top: 16px;">Lade Test...</p>
            `;
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(10, 10, 26, 0.85);
                backdrop-filter: blur(8px);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9998;
            `;
            document.body.appendChild(overlay);
        }
    } else {
        if (existing) existing.remove();
    }
}

// ========== STORE SUBSCRIPTION ==========
store.subscribe((state) => {
    if (state.currentUser) {
        if (userNameElement) userNameElement.textContent = state.currentUser.username;
        if (premiumBadge) premiumBadge.style.display = state.isPremium ? 'inline-flex' : 'none';
        if (premiumBanner) premiumBanner.style.display = state.isPremium ? 'none' : 'block';
        renderDashboard();
    }
});

// ========== RENDER FUNCTIONS ==========
function renderDashboard() {
    if (testCategories) {
        const isPremium = store.isPremium;
        testCategories.innerHTML = TEST_METADATA.map(test => {
            const locked = !isPremium && !test.free;
            return `
                <div class="test-card ${locked ? 'locked' : ''}" data-test-id="${test.id}">
                    <div class="test-card-icon">${test.icon}</div>
                    <h3>${test.name}</h3>
                    <p>${test.description}</p>
                    <div class="test-card-footer">
                        <div class="test-card-badge ${locked ? 'premium' : 'free'}">${locked ? '⭐ Premium' : '✅ Free'}</div>
                        <span>${test.category}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    if (dashboardResults && store.results.length > 0) {
        dashboardResults.innerHTML = store.results.slice(0, 5).map(result => `
            <div class="result-summary-card">
                <h3>${getTestName(result.test_id)}</h3>
                <p><strong>Datum:</strong> ${new Date(result.taken_at).toLocaleString('de-DE')}</p>
            </div>
        `).join('');
    }
}

function getTestName(testId) {
    const test = TEST_METADATA.find(t => t.id === testId);
    return test ? test.name : testId;
}

function renderQuestion() {
    if (!questionContainer) return;
    const questions = store.currentTestQuestions;
    const index = store.currentQuestionIndex;
    const question = questions[index];
    const currentAnswer = store.currentAnswers[index];

    const options = [1, 2, 3, 4, 5].map(value => {
        const label = ['Stimme gar nicht zu', 'Stimme eher nicht zu', 'Neutral', 'Stimme eher zu', 'Stimme voll zu'][value - 1];
        const active = currentAnswer === value ? ' selected' : '';
        return `<button type="button" class="option-btn${active}" data-value="${value}">${label}</button>`;
    }).join('');

    questionContainer.innerHTML = `
        <div class="question-container">
            <div class="question-text">${escapeHtml(question.text)}</div>
            <div class="options">${options}</div>
            <div class="nav-buttons">
                <button id="prev-question" class="btn-secondary" ${index === 0 ? 'disabled' : ''}>⬅️ Zurück</button>
                <button id="next-question" class="btn-success">${index === questions.length - 1 ? '📤 Absenden' : '➡️ Weiter'}</button>
            </div>
        </div>
    `;

    questionContainer.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            questionContainer.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            store.setAnswer(index, Number(btn.dataset.value));
        });
    });

    document.getElementById('prev-question')?.addEventListener('click', () => {
        store.prevQuestion();
        renderQuestion();
        updateProgress();
    });

    document.getElementById('next-question')?.addEventListener('click', async () => {
        if (store.currentAnswers[index] === undefined) {
            showNotification('Bitte wähle eine Antwort aus!', 'warning');
            return;
        }
        if (index === questions.length - 1) {
            await submitCurrentTest();
        } else {
            store.nextQuestion();
            renderQuestion();
            updateProgress();
        }
    });

    updateProgress();
}

function updateProgress() {
    const total = store.currentTestQuestions.length;
    const index = store.currentQuestionIndex;
    if (questionCounter) questionCounter.textContent = `Frage ${index + 1} / ${total}`;
    if (progressFill) progressFill.style.width = `${((index + 1) / total) * 100}%`;
}

// ========== TEST LOGIC ==========
async function loadTest(testId) {
    const test = TEST_METADATA.find(t => t.id === testId);
    if (!test) {
        showNotification('❌ Test nicht gefunden', 'error');
        return;
    }

    const isLocked = !store.isPremium && !test.free;
    if (isLocked) {
        showNotification('⭐ Dieser Test ist nur für Premium-Mitglieder verfügbar!', 'warning');
        return;
    }

    showLoading(true);
    try {
        const data = await getTest(testId);
        store.setCurrentTest(testId, data.questions || []);
        store.setView('test');

        document.getElementById('dashboard-view').style.display = 'none';
        document.getElementById('test-view').style.display = 'block';
        document.getElementById('result-view').style.display = 'none';

        renderQuestion();
        showLoading(false);
    } catch (error) {
        showLoading(false);
        showNotification('Fehler beim Laden des Tests', 'error');
        console.error('Load test error:', error);
    }
}

async function submitCurrentTest() {
    const answers = store.currentAnswers.map(a => a);
    const testId = store.currentTestId;

    if (!testId) {
        showNotification('❌ Kein Test ausgewählt', 'error');
        return;
    }

    showLoading(true);
    try {
        const result = await submitTest(testId, answers);
        showResultView(result);
        showLoading(false);
        showNotification('✅ Test erfolgreich abgeschlossen!', 'success');
    } catch (error) {
        showLoading(false);
        showNotification('Fehler beim Absenden des Tests', 'error');
        console.error('Submit error:', error);
    }
}

function showResultView(result) {
    store.setView('result');
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('test-view').style.display = 'none';
    document.getElementById('result-view').style.display = 'block';

    if (resultContainer) {
        resultContainer.innerHTML = renderTestResult(store.currentTestId, result.results || result);
    }
}

// ========== RENDER TEST RESULT - KOMPLETT AUF DEUTSCH ==========
function renderTestResult(testId, data) {
    const averages = data.averages || data;
    const scores = data.scores || data;

    // 1. BIG FIVE
    if (testId === 'big_five') {
        const dimLabels = {
            extraversion: 'Extraversion (Geselligkeit)',
            conscientiousness: 'Gewissenhaftigkeit',
            openness: 'Offenheit für Neues',
            agreeableness: 'Verträglichkeit (Harmonie)',
            neuroticism: 'Neurotizismus (Emotionale Stabilität)'
        };
        const dimEmojis = {
            extraversion: '🎉',
            conscientiousness: '📋',
            openness: '🌈',
            agreeableness: '🤝',
            neuroticism: '🧘'
        };
        return `
            <div class="result-card">
                <h2 class="result-title">🧠 Deine Big Five Persönlichkeit</h2>
                <p style="color: #94a3b8; margin-bottom: 24px;">Die fünf Dimensionen deiner Persönlichkeit im Überblick</p>
                <div class="result-chart">
                    ${['extraversion','conscientiousness','openness','agreeableness','neuroticism'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label">${dimEmojis[dim]} ${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((averages[dim]||0)/5)*100}%">${averages[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation">
                    <h3>📖 Deine Persönlichkeits-Zusammenfassung</h3>
                    <p>${data.interpretation || 'Du hast eine ausgewogene Persönlichkeit mit vielen Stärken.'}</p>
                    ${data.dominant_traits && data.dominant_traits.length > 0 ? `
                        <p style="margin-top: 12px;"><strong>🌟 Deine dominanten Eigenschaften:</strong> ${data.dominant_traits.join(', ')}</p>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // 2. BINDUNGSSTIL
    if (testId === 'bindungsstil') {
        const dimLabels = {
            secure: '🔒 Sicherer Bindungsstil',
            anxious: '😰 Ängstlicher Bindungsstil',
            avoidant: '🚫 Vermeidender Bindungsstil'
        };
        const styleNames = {
            secure: 'Sicherer Bindungsstil',
            anxious: 'Ängstlicher Bindungsstil',
            avoidant: 'Vermeidender Bindungsstil'
        };
        return `
            <div class="result-card">
                <h2 class="result-title">💞 Dein Bindungsstil</h2>
                <p style="color: #94a3b8; margin-bottom: 24px;">Wie du dich in Beziehungen verhältst und fühlst</p>
                <div class="result-chart">
                    ${['secure','anxious','avoidant'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation">
                    <h3>📖 Dein dominanter Bindungsstil: ${styleNames[data.dominant] || 'Sicher'}</h3>
                    <p>${data.interpretation || 'Du hast einen gesunden Umgang mit Nähe und Distanz in Beziehungen.'}</p>
                </div>
            </div>
        `;
    }

    // 3. RESILIENZ
    if (testId === 'resilienz') {
        const dimLabels = {
            adaptability: '🔄 Anpassungsfähigkeit',
            optimism: '☀️ Optimismus',
            self_efficacy: '💪 Selbstwirksamkeit',
            emotion_regulation: '🧘 Emotionsregulation',
            social_support: '🤝 Soziale Unterstützung'
        };
        return `
            <div class="result-card">
                <h2 class="result-title">🌱 Deine Resilienz (psychische Widerstandskraft)</h2>
                <p style="color: #94a3b8; margin-bottom: 24px;">Wie gut du mit Herausforderungen und Rückschlägen umgehst</p>
                <div class="result-chart">
                    ${['adaptability','optimism','self_efficacy','emotion_regulation','social_support'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation">
                    <h3>📖 ${data.level || 'Dein Resilienz-Level'}</h3>
                    <p>${data.interpretation || 'Deine psychische Widerstandskraft wurde berechnet.'}</p>
                    <p style="margin-top: 12px; color: #94a3b8; font-size: 14px;">💡 <strong>Tipp:</strong> Resilienz kann trainiert werden – regelmäßige Reflexion und Achtsamkeit helfen.</p>
                </div>
            </div>
        `;
    }

    // 4. JUNG-ARCHETYPEN
    if (testId === 'jung_archetypen') {
        const dimLabels = {
            hero: '🦸 Held',
            sage: '🧙 Weiser',
            explorer: '🗺️ Entdecker',
            caregiver: '🤱 Fürsorger',
            rebel: '🔥 Rebell'
        };
        const archetypeDescriptions = {
            hero: 'Du stellst dich Herausforderungen, kämpfst für deine Überzeugungen und willst etwas in der Welt bewegen.',
            sage: 'Du suchst nach Wahrheit, Wissen und Weisheit. Andere kommen zu dir, um Rat zu holen.',
            explorer: 'Du liebst Freiheit, neue Erfahrungen und Unabhängigkeit. Routine ist nichts für dich.',
            caregiver: 'Du kümmerst dich um andere, bist fürsorglich und stellst das Wohl deiner Lieben an erste Stelle.',
            rebel: 'Du hinterfragst Autoritäten, gehst eigene Wege und kämpfst für Veränderung.'
        };
        return `
            <div class="result-card">
                <h2 class="result-title">🏛️ Dein Jung-Archetyp</h2>
                <p style="color: #94a3b8; margin-bottom: 24px;">Welche Urbilder in dir leben – basierend auf Carl Jungs Psychologie</p>
                <div class="result-chart">
                    ${['hero','sage','explorer','caregiver','rebel'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation">
                    <h3>📖 Dein dominanter Archetyp: ${dimLabels[data.dominant] || 'Der Held'}</h3>
                    <p>${archetypeDescriptions[data.dominant] || data.interpretation || ''}</p>
                </div>
            </div>
        `;
    }

    // 5. SCHATTENSEITEN
    if (testId === 'schattenseiten') {
        const dimLabels = {
            narcissism: '🪞 Narzissmus',
            perfectionism: '🎯 Perfektionismus',
            control: '🎮 Kontrollzwang',
            mistrust: '🔒 Misstrauen',
            avoidance: '🏃 Vermeidung'
        };
        return `
            <div class="result-card">
                <h2 class="result-title">🌑 Deine Schattenseiten</h2>
                <p style="color: #94a3b8; margin-bottom: 24px;">Die verdrängten Anteile deiner Persönlichkeit – Bewusstsein ist der erste Schritt</p>
                <div class="result-chart">
                    ${['narcissism','perfectionism','control','mistrust','avoidance'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation">
                    <h3>📖 Was deine Schattenseiten dir sagen</h3>
                    <p>${data.interpretation || 'Du hast keine stark ausgeprägten Schattenseiten – das ist ein Zeichen für emotionale Gesundheit.'}</p>
                    ${data.warnings && data.warnings.length > 0 ? `
                        <p style="margin-top: 12px; color: #f59e0b;"><strong>⚠️ Auffällig:</strong> ${data.warnings.join(', ')}</p>
                        <p style="color: #94a3b8; font-size: 14px;">💡 Diese Themen könnten ein guter Ansatz für persönliche Entwicklung sein.</p>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // 6. KOMMUNIKATIONSSTIL
    if (testId === 'kommunikationsstil') {
        const dimLabels = {
            assertive: '💪 Durchsetzungsstark (direkt)',
            diplomatic: '🤝 Diplomatisch (harmonieorientiert)',
            reserved: '🤫 Zurückhaltend (schüchtern)'
        };
        const styleNames = {
            assertive: 'Durchsetzungsstark',
            diplomatic: 'Diplomatisch',
            reserved: 'Zurückhaltend'
        };
        return `
            <div class="result-card">
                <h2 class="result-title">💬 Dein Kommunikationsstil</h2>
                <p style="color: #94a3b8; margin-bottom: 24px;">Wie du mit anderen sprichst und dich ausdrückst</p>
                <div class="result-chart">
                    ${['assertive','diplomatic','reserved'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation">
                    <h3>📖 Dein Stil: ${styleNames[data.dominant] || 'Durchsetzungsstark'}</h3>
                    <p>${data.interpretation || 'Du hast einen ausgeprägten Kommunikationsstil.'}</p>
                </div>
            </div>
        `;
    }

    // 7. ENTSCHEIDUNGSTYP
    if (testId === 'entscheidungstyp') {
        const dimLabels = {
            rational: '🧠 Rational (logisch)',
            intuitive: '🔮 Intuitiv (bauchgefühl)',
            emotional: '❤️ Emotional (herz)'
        };
        const styleNames = {
            rational: 'Rationaler Denker',
            intuitive: 'Intuitiver Entscheider',
            emotional: 'Emotionaler Entscheider'
        };
        return `
            <div class="result-card">
                <h2 class="result-title">⚖️ Dein Entscheidungstyp</h2>
                <p style="color: #94a3b8; margin-bottom: 24px;">Wie du Entscheidungen triffst – mit Kopf, Bauch oder Herz</p>
                <div class="result-chart">
                    ${['rational','intuitive','emotional'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation">
                    <h3>📖 Du bist ein: ${styleNames[data.dominant] || 'Rationaler Denker'}</h3>
                    <p>${data.interpretation || 'Du triffst Entscheidungen auf eine sehr persönliche Art.'}</p>
                </div>
            </div>
        `;
    }

    // 8. KONFLIKTSTIL
    if (testId === 'konfliktstil') {
        const dimLabels = {
            harmonizing: '🤗 Harmoniebedürftig',
            confrontational: '⚔️ Konfrontativ',
            avoiding: '🏃 Vermeidend'
        };
        const styleNames = {
            harmonizing: 'Harmoniebedürftig',
            confrontational: 'Konfrontativ',
            avoiding: 'Vermeidend'
        };
        return `
            <div class="result-card">
                <h2 class="result-title">⚔️ Dein Konfliktstil</h2>
                <p style="color: #94a3b8; margin-bottom: 24px;">Wie du mit Konflikten und Auseinandersetzungen umgehst</p>
                <div class="result-chart">
                    ${['harmonizing','confrontational','avoiding'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation">
                    <h3>📖 Dein Stil: ${styleNames[data.dominant] || 'Harmoniebedürftig'}</h3>
                    <p>${data.interpretation || 'Du hast einen klaren Konfliktstil entwickelt.'}</p>
                </div>
            </div>
        `;
    }

    // 9. EMOTIONALE INTELLIGENZ
    if (testId === 'emotionale_intelligenz') {
        const dimLabels = {
            self_awareness: '🔍 Selbstwahrnehmung',
            self_regulation: '🧘 Selbstregulation',
            empathy: '❤️ Empathie (Einfühlungsvermögen)',
            social_skills: '🤝 Soziale Kompetenz',
            motivation: '⚡ Motivation'
        };
        return `
            <div class="result-card">
                <h2 class="result-title">❤️ Deine Emotionale Intelligenz (EQ)</h2>
                <p style="color: #94a3b8; margin-bottom: 24px;">Wie gut du deine eigenen Gefühle und die anderer erkennst und steuerst</p>
                <div class="result-chart">
                    ${['self_awareness','self_regulation','empathy','social_skills','motivation'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation">
                    <h3>📖 ${data.level || 'Dein EQ-Level'}</h3>
                    <p>${data.interpretation || 'Deine emotionale Intelligenz ist ein wichtiger Schlüssel für erfolgreiche Beziehungen.'}</p>
                </div>
            </div>
        `;
    }

    // 10. SELBSTWERT
    if (testId === 'selbstwert') {
        const dimLabels = {
            self_acceptance: '💖 Selbstakzeptanz',
            self_confidence: '💪 Selbstvertrauen',
            self_worth: '🌟 Selbstwertgefühl'
        };
        return `
            <div class="result-card">
                <h2 class="result-title">💪 Dein Selbstwert</h2>
                <p style="color: #94a3b8; margin-bottom: 24px;">Wie du dich selbst siehst und wie sehr du dich wertschätzt</p>
                <div class="result-chart">
                    ${['self_acceptance','self_confidence','self_worth'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation">
                    <h3>📖 ${data.level || 'Dein Selbstwert'}</h3>
                    <p>${data.interpretation || 'Dein Selbstwert ist eine wichtige Grundlage für ein erfülltes Leben.'}</p>
                </div>
            </div>
        `;
    }

    // 11. LEBENSROLLEN
    if (testId === 'lebensrollen') {
        const dimLabels = {
            career: '💼 Karriere & Beruf',
            family: '👨‍👩‍👧‍👦 Familie & Partner',
            friendship: '🤝 Freundschaften',
            hobbies: '🎨 Hobbys & Interessen',
            growth: '🌱 Persönliche Entwicklung'
        };
        const roleNames = {
            career: 'Karriere & Beruf',
            family: 'Familie & Partner',
            friendship: 'Freundschaften',
            hobbies: 'Hobbys & Interessen',
            growth: 'Persönliche Entwicklung'
        };
        return `
            <div class="result-card">
                <h2 class="result-title">🎭 Deine Lebensrollen</h2>
                <p style="color: #94a3b8; margin-bottom: 24px;">Was dir wirklich wichtig ist im Leben – deine Prioritäten</p>
                <div class="result-chart">
                    ${['career','family','friendship','hobbies','growth'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation">
                    <h3>📖 Deine wichtigste Rolle: ${roleNames[data.most_important] || 'Karriere'}</h3>
                    <p>${data.interpretation || 'Diese Rolle prägt dein Leben und deine Entscheidungen am stärksten.'}</p>
                </div>
            </div>
        `;
    }

    // 12. LEBENSWERTE
    if (testId === 'lebenswerte') {
        const dimLabels = {
            security: '🔒 Sicherheit & Stabilität',
            freedom: '🕊️ Freiheit & Unabhängigkeit',
            achievement: '🏆 Erfolg & Leistung',
            relationships: '💞 Beziehungen & Nähe',
            meaning: '🌿 Sinn & Erfüllung'
        };
        const valueNames = {
            security: 'Sicherheit & Stabilität',
            freedom: 'Freiheit & Unabhängigkeit',
            achievement: 'Erfolg & Leistung',
            relationships: 'Beziehungen & Nähe',
            meaning: 'Sinn & Erfüllung'
        };
        return `
            <div class="result-card">
                <h2 class="result-title">🏆 Deine Lebenswerte</h2>
                <p style="color: #94a3b8; margin-bottom: 24px;">Was dir wirklich wichtig ist – deine inneren Kompasse</p>
                <div class="result-chart">
                    ${['security','freedom','achievement','relationships','meaning'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation">
                    <h3>📖 Dein wichtigster Wert: ${valueNames[data.top_value] || 'Sicherheit'}</h3>
                    <p>${data.interpretation || 'Dieser Wert leitet deine Entscheidungen und dein Leben.'}</p>
                </div>
            </div>
        `;
    }

    // 13. MOTIVATIONSPROFIL
    if (testId === 'motivationsprofil') {
        const dimLabels = {
            achievement_motivation: '🏆 Leistungsmotivation',
            power_motivation: '👑 Machtmotivation',
            affiliation_motivation: '🤝 Zugehörigkeitsmotivation'
        };
        const motiNames = {
            achievement_motivation: 'Leistung',
            power_motivation: 'Macht & Einfluss',
            affiliation_motivation: 'Zugehörigkeit & Teamwork'
        };
        return `
            <div class="result-card">
                <h2 class="result-title">⚡ Dein Motivationsprofil</h2>
                <p style="color: #94a3b8; margin-bottom: 24px;">Was dich antreibt und was dich morgens aufstehen lässt</p>
                <div class="result-chart">
                    ${['achievement_motivation','power_motivation','affiliation_motivation'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation">
                    <h3>📖 Deine Hauptmotivation: ${motiNames[data.dominant] || 'Leistung'}</h3>
                    <p>${data.interpretation || 'Diese Motivation treibt dich im Beruf und im Leben an.'}</p>
                </div>
            </div>
        `;
    }

    // 14. INNERE ANTREIBER
    if (testId === 'innere_antreiber') {
        const dimLabels = {
            perfection_driver: '🎯 "Sei perfekt!"',
            strength_driver: '💪 "Sei stark!"',
            hurry_driver: '⚡ "Beeil dich!"',
            please_driver: '🤗 "Mach es allen recht!"',
            effort_driver: '🔥 "Streng dich an!"'
        };
        return `
            <div class="result-card">
                <h2 class="result-title">🔋 Deine inneren Antreiber</h2>
                <p style="color: #94a3b8; margin-bottom: 24px;">Die unbewussten Glaubenssätze, die dein Verhalten steuern</p>
                <div class="result-chart">
                    ${['perfection_driver','strength_driver','hurry_driver','please_driver','effort_driver'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation">
                    <h3>📖 Deine inneren Antreiber im Überblick</h3>
                    <p>${data.interpretation || 'Deine inneren Antreiber zeigen, welche unbewussten Glaubenssätze dich leiten.'}</p>
                    ${data.strong_drivers && data.strong_drivers.length > 0 ? `
                        <p style="margin-top: 12px; color: #f59e0b;"><strong>⚠️ Starke Antreiber:</strong> ${data.strong_drivers.join(', ')}</p>
                        <p style="color: #94a3b8; font-size: 14px;">💡 Bewusstsein über diese Antreiber kann dir helfen, dich von ihnen zu lösen.</p>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // 15. STRESSPROFIL
    if (testId === 'stressprofil') {
        const dimLabels = {
            type_a: '🔥 Typ A – Hektisch & ungeduldig',
            type_b: '😌 Typ B – Ruhig & gelassen',
            type_c: '😰 Typ C – Angespannt & besorgt'
        };
        const typeNames = {
            type_a: 'Typ A – Hektisch & ungeduldig',
            type_b: 'Typ B – Ruhig & gelassen',
            type_c: 'Typ C – Angespannt & besorgt'
        };
        return `
            <div class="result-card">
                <h2 class="result-title">😰 Dein Stressprofil</h2>
                <p style="color: #94a3b8; margin-bottom: 24px;">Wie du unter Druck reagierst und mit Stress umgehst</p>
                <div class="result-chart">
                    ${['type_a','type_b','type_c'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation">
                    <h3>📖 Dein Stress-Typ: ${typeNames[data.dominant] || 'Typ B – Ruhig & gelassen'}</h3>
                    <p>${data.interpretation || 'Dein Stressprofil zeigt, wie du mit Druck und Belastung umgehst.'}</p>
                </div>
            </div>
        `;
    }

    // FALLBACK für alle anderen Tests
    return `
        <div class="result-card">
            <h2 class="result-title">📊 Dein Testergebnis</h2>
            <pre style="background:rgba(0,0,0,0.2);padding:20px;border-radius:16px;overflow-x:auto;color:#94a3b8;">${JSON.stringify(data, null, 2)}</pre>
        </div>
    `;
}

// ========== AUTH ==========
async function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!email || !password) {
        showNotification('Bitte gib E-Mail und Passwort ein', 'warning');
        return;
    }

    try {
        const response = await login(email, password);
        const body = await response.json();
        
        const premiumStatus = await getPremiumStatus();
        store.setUser(body.user, premiumStatus.is_premium);
        await loadResults();
        showApp();
        showNotification(`Willkommen zurück, ${body.user.username}! 🎉`, 'success');
    } catch (error) {
        showNotification('Anmeldung fehlgeschlagen', 'error');
    }
}

async function handleRegister() {
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value.trim();

    if (!username || !email || !password) {
        showNotification('Bitte alle Felder ausfüllen', 'warning');
        return;
    }
    if (password.length < 6) {
        showNotification('Passwort muss mindestens 6 Zeichen haben', 'warning');
        return;
    }

    try {
        const response = await register(username, email, password);
        const body = await response.json();
        
        store.setUser(body.user, false);
        await loadResults();
        showApp();
        showNotification('✅ Registrierung erfolgreich!', 'success');
    } catch (error) {
        showNotification('Registrierung fehlgeschlagen', 'error');
    }
}

async function handleLogout() {
    try {
        await logout(); 
    } catch (error) {
        console.error('Logout Fehler:', error);
    }
    
    // 🔥 Kein localStorage.removeItem mehr!
    store.setUser(null, false);
    showAuth();
    setActiveAuthForm('login');
    showNotification('👋 Bis bald!', 'info');
}

async function handleAuthentication() {
    // 🔥 Kein Token-Check mehr – der Server prüft das Cookie!
    try {
        const response = await verifyToken();
        const body = await response.json();
        const premiumStatus = await getPremiumStatus();
        store.setUser(body.user, premiumStatus.is_premium);
        await loadResults();
        showApp();
    } catch (error) {
        showAuth();
        setActiveAuthForm('login');
    }
}

async function handleUpgrade() {
    try {
        const data = await createCheckout();
        if (data.url) {
            window.location.href = data.url;
        } else {
            showNotification('Fehler beim Erstellen des Checkouts', 'error');
        }
    } catch (error) {
        showNotification('Premium-Upgrade fehlgeschlagen', 'error');
    }
}

// ========== EVENT LISTENERS ==========
function initEventListeners() {
    showRegisterLink?.addEventListener('click', (e) => {
        e.preventDefault();
        setActiveAuthForm('register');
    });

    showLoginLink?.addEventListener('click', (e) => {
        e.preventDefault();
        setActiveAuthForm('login');
    });

    loginBtn?.addEventListener('click', handleLogin);
    registerBtn?.addEventListener('click', handleRegister);
    logoutBtn?.addEventListener('click', handleLogout);
    upgradeBtn?.addEventListener('click', handleUpgrade);

    // Enter Key für Login
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const loginFormEl = document.getElementById('login-form');
            if (loginFormEl && loginFormEl.style.display !== 'none') {
                loginBtn?.click();
            }
        }
    });

    // Zurück zur Übersicht
    backToDashboardBtn?.addEventListener('click', () => {
        store.resetTest();
        document.getElementById('dashboard-view').style.display = 'block';
        document.getElementById('test-view').style.display = 'none';
        document.getElementById('result-view').style.display = 'none';
    });

    // Neuer Test
    newTestBtn?.addEventListener('click', () => {
        store.resetTest();
        document.getElementById('dashboard-view').style.display = 'block';
        document.getElementById('test-view').style.display = 'none';
        document.getElementById('result-view').style.display = 'none';
    });

    // Test-Karten
    testCategories?.addEventListener('click', (event) => {
        const card = event.target.closest('.test-card');
        if (!card) return;
        const testId = card.dataset.testId;
        if (testId) loadTest(testId);
    });
}

// ========== INIT ==========
async function init() {
    initEventListeners();
    await handleAuthentication();
}

init();

// Export für globale Nutzung
window.store = store;
window.showNotification = showNotification;