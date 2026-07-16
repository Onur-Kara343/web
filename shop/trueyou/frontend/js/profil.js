// frontend/js/profil.js
import { getAllResults, deleteResult, apiCall, getPremiumStatus, logout } from './api.js';

// ========== DOM ==========
const backBtn = document.getElementById('back-to-dashboard');
const userNameSpan = document.getElementById('user-name');
const premiumBadge = document.getElementById('premium-badge');
const totalTestsSpan = document.getElementById('total-tests');
const resultsList = document.getElementById('profile-results-list');

const TEST_NAMES = {
    big_five: '🧠 Big Five Persönlichkeitstest',
    bindungsstil: '💞 Bindungsstil Test',
    resilienz: '🌱 Resilienz Test',
    jung_archetypen: '🏛️ Jung-Archetypen',
    schattenseiten: '🌑 Schattenseiten',
    kommunikationsstil: '💬 Kommunikationsstil',
    entscheidungstyp: '⚖️ Entscheidungstyp',
    konfliktstil: '⚔️ Konfliktstil',
    emotionale_intelligenz: '❤️ Emotionale Intelligenz',
    selbstwert: '💪 Selbstwert Test',
    lebensrollen: '🎭 Lebensrollen',
    lebenswerte: '🏆 Lebenswerte',
    motivationsprofil: '⚡ Motivationsprofil',
    innere_antreiber: '🔋 Innere Antreiber',
    stressprofil: '😰 Stressprofil'
};

// ========== UTILITY ==========
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

function getTestName(testId) {
    return TEST_NAMES[testId] || testId;
}

function getResultPreview(testId, results) {
    const data = results.results || results;
    const avg = data.averages || data;

    if (testId === 'big_five') {
        const traits = [];
        if (avg.extraversion >= 4) traits.push('extravertiert');
        else if (avg.extraversion <= 2) traits.push('introvertiert');
        if (avg.conscientiousness >= 4) traits.push('gewissenhaft');
        if (avg.openness >= 4) traits.push('offen für Neues');
        if (avg.agreeableness >= 4) traits.push('harmoniebedürftig');
        if (avg.neuroticism >= 4) traits.push('emotional sensibel');
        else if (avg.neuroticism <= 2) traits.push('emotional stabil');
        return traits.length ? traits.join(', ') : 'Ausgeglichene Persönlichkeit';
    }

    if (testId === 'bindungsstil') {
        const scores = data.scores || data;
        let max = 'sicher';
        let maxVal = scores.secure || 0;
        if ((scores.anxious || 0) > maxVal) { max = 'ängstlich'; }
        if ((scores.avoidant || 0) > maxVal) { max = 'vermeidend'; }
        return `Dominant: ${max}er Bindungsstil`;
    }

    if (testId === 'resilienz') {
        return `Resilienz-Level: ${data.level || 'Berechnet'}`;
    }

    return '📊 Klicke für Details';
}

// ========== RENDER TEST RESULT IM MODAL (SCHÖN) ==========
function renderTestResultModal(testId, data) {
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
            <div class="result-card" style="background:transparent;padding:0;">
                <h2 class="result-title" style="font-size:24px;margin-bottom:8px;">🧠 Deine Big Five Persönlichkeit</h2>
                <p style="color: #94a3b8; margin-bottom: 20px;font-size:14px;">Die fünf Dimensionen deiner Persönlichkeit im Überblick</p>
                <div class="result-chart">
                    ${['extraversion','conscientiousness','openness','agreeableness','neuroticism'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label" style="font-size:13px;">${dimEmojis[dim]} ${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((averages[dim]||0)/5)*100}%">${averages[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation" style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);">
                    <h3 style="font-size:16px;margin-bottom:8px;">📖 Deine Persönlichkeits-Zusammenfassung</h3>
                    <p style="font-size:14px;color:#94a3b8;">${data.interpretation || 'Du hast eine ausgewogene Persönlichkeit mit vielen Stärken.'}</p>
                    ${data.dominant_traits && data.dominant_traits.length > 0 ? `
                        <p style="margin-top: 8px;font-size:14px;color:#f59e0b;"><strong>🌟 Deine dominanten Eigenschaften:</strong> ${data.dominant_traits.join(', ')}</p>
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
            <div class="result-card" style="background:transparent;padding:0;">
                <h2 class="result-title" style="font-size:24px;margin-bottom:8px;">💞 Dein Bindungsstil</h2>
                <p style="color: #94a3b8; margin-bottom: 20px;font-size:14px;">Wie du dich in Beziehungen verhältst und fühlst</p>
                <div class="result-chart">
                    ${['secure','anxious','avoidant'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label" style="font-size:13px;">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation" style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);">
                    <h3 style="font-size:16px;margin-bottom:8px;">📖 Dein dominanter Bindungsstil: ${styleNames[data.dominant] || 'Sicher'}</h3>
                    <p style="font-size:14px;color:#94a3b8;">${data.interpretation || 'Du hast einen gesunden Umgang mit Nähe und Distanz in Beziehungen.'}</p>
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
            <div class="result-card" style="background:transparent;padding:0;">
                <h2 class="result-title" style="font-size:24px;margin-bottom:8px;">🌱 Deine Resilienz</h2>
                <p style="color: #94a3b8; margin-bottom: 20px;font-size:14px;">Wie gut du mit Herausforderungen und Rückschlägen umgehst</p>
                <div class="result-chart">
                    ${['adaptability','optimism','self_efficacy','emotion_regulation','social_support'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label" style="font-size:13px;">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation" style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);">
                    <h3 style="font-size:16px;margin-bottom:8px;">📖 ${data.level || 'Dein Resilienz-Level'}</h3>
                    <p style="font-size:14px;color:#94a3b8;">${data.interpretation || 'Deine psychische Widerstandskraft wurde berechnet.'}</p>
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
            <div class="result-card" style="background:transparent;padding:0;">
                <h2 class="result-title" style="font-size:24px;margin-bottom:8px;">🏛️ Dein Jung-Archetyp</h2>
                <p style="color: #94a3b8; margin-bottom: 20px;font-size:14px;">Welche Urbilder in dir leben – basierend auf Carl Jungs Psychologie</p>
                <div class="result-chart">
                    ${['hero','sage','explorer','caregiver','rebel'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label" style="font-size:13px;">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation" style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);">
                    <h3 style="font-size:16px;margin-bottom:8px;">📖 Dein dominanter Archetyp: ${dimLabels[data.dominant] || 'Der Held'}</h3>
                    <p style="font-size:14px;color:#94a3b8;">${archetypeDescriptions[data.dominant] || data.interpretation || ''}</p>
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
            <div class="result-card" style="background:transparent;padding:0;">
                <h2 class="result-title" style="font-size:24px;margin-bottom:8px;">🌑 Deine Schattenseiten</h2>
                <p style="color: #94a3b8; margin-bottom: 20px;font-size:14px;">Die verdrängten Anteile deiner Persönlichkeit</p>
                <div class="result-chart">
                    ${['narcissism','perfectionism','control','mistrust','avoidance'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label" style="font-size:13px;">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation" style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);">
                    <h3 style="font-size:16px;margin-bottom:8px;">📖 Was deine Schattenseiten dir sagen</h3>
                    <p style="font-size:14px;color:#94a3b8;">${data.interpretation || 'Du hast keine stark ausgeprägten Schattenseiten.'}</p>
                    ${data.warnings && data.warnings.length > 0 ? `
                        <p style="margin-top: 8px;font-size:14px;color:#f59e0b;"><strong>⚠️ Auffällig:</strong> ${data.warnings.join(', ')}</p>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // 6. KOMMUNIKATIONSSTIL
    if (testId === 'kommunikationsstil') {
        const dimLabels = {
            assertive: '💪 Durchsetzungsstark',
            diplomatic: '🤝 Diplomatisch',
            reserved: '🤫 Zurückhaltend'
        };
        const styleNames = {
            assertive: 'Durchsetzungsstark',
            diplomatic: 'Diplomatisch',
            reserved: 'Zurückhaltend'
        };
        return `
            <div class="result-card" style="background:transparent;padding:0;">
                <h2 class="result-title" style="font-size:24px;margin-bottom:8px;">💬 Dein Kommunikationsstil</h2>
                <p style="color: #94a3b8; margin-bottom: 20px;font-size:14px;">Wie du mit anderen sprichst und dich ausdrückst</p>
                <div class="result-chart">
                    ${['assertive','diplomatic','reserved'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label" style="font-size:13px;">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation" style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);">
                    <h3 style="font-size:16px;margin-bottom:8px;">📖 Dein Stil: ${styleNames[data.dominant] || 'Durchsetzungsstark'}</h3>
                    <p style="font-size:14px;color:#94a3b8;">${data.interpretation || 'Du hast einen ausgeprägten Kommunikationsstil.'}</p>
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
            <div class="result-card" style="background:transparent;padding:0;">
                <h2 class="result-title" style="font-size:24px;margin-bottom:8px;">⚖️ Dein Entscheidungstyp</h2>
                <p style="color: #94a3b8; margin-bottom: 20px;font-size:14px;">Wie du Entscheidungen triffst</p>
                <div class="result-chart">
                    ${['rational','intuitive','emotional'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label" style="font-size:13px;">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation" style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);">
                    <h3 style="font-size:16px;margin-bottom:8px;">📖 Du bist ein: ${styleNames[data.dominant] || 'Rationaler Denker'}</h3>
                    <p style="font-size:14px;color:#94a3b8;">${data.interpretation || 'Du triffst Entscheidungen auf eine sehr persönliche Art.'}</p>
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
            <div class="result-card" style="background:transparent;padding:0;">
                <h2 class="result-title" style="font-size:24px;margin-bottom:8px;">⚔️ Dein Konfliktstil</h2>
                <p style="color: #94a3b8; margin-bottom: 20px;font-size:14px;">Wie du mit Konflikten umgehst</p>
                <div class="result-chart">
                    ${['harmonizing','confrontational','avoiding'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label" style="font-size:13px;">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation" style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);">
                    <h3 style="font-size:16px;margin-bottom:8px;">📖 Dein Stil: ${styleNames[data.dominant] || 'Harmoniebedürftig'}</h3>
                    <p style="font-size:14px;color:#94a3b8;">${data.interpretation || 'Du hast einen klaren Konfliktstil entwickelt.'}</p>
                </div>
            </div>
        `;
    }

    // 9. EMOTIONALE INTELLIGENZ
    if (testId === 'emotionale_intelligenz') {
        const dimLabels = {
            self_awareness: '🔍 Selbstwahrnehmung',
            self_regulation: '🧘 Selbstregulation',
            empathy: '❤️ Empathie',
            social_skills: '🤝 Soziale Kompetenz',
            motivation: '⚡ Motivation'
        };
        return `
            <div class="result-card" style="background:transparent;padding:0;">
                <h2 class="result-title" style="font-size:24px;margin-bottom:8px;">❤️ Deine Emotionale Intelligenz (EQ)</h2>
                <p style="color: #94a3b8; margin-bottom: 20px;font-size:14px;">Wie gut du Gefühle erkennst und steuerst</p>
                <div class="result-chart">
                    ${['self_awareness','self_regulation','empathy','social_skills','motivation'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label" style="font-size:13px;">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation" style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);">
                    <h3 style="font-size:16px;margin-bottom:8px;">📖 ${data.level || 'Dein EQ-Level'}</h3>
                    <p style="font-size:14px;color:#94a3b8;">${data.interpretation || 'Deine emotionale Intelligenz ist ein wichtiger Schlüssel.'}</p>
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
            <div class="result-card" style="background:transparent;padding:0;">
                <h2 class="result-title" style="font-size:24px;margin-bottom:8px;">💪 Dein Selbstwert</h2>
                <p style="color: #94a3b8; margin-bottom: 20px;font-size:14px;">Wie du dich selbst siehst</p>
                <div class="result-chart">
                    ${['self_acceptance','self_confidence','self_worth'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label" style="font-size:13px;">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation" style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);">
                    <h3 style="font-size:16px;margin-bottom:8px;">📖 ${data.level || 'Dein Selbstwert'}</h3>
                    <p style="font-size:14px;color:#94a3b8;">${data.interpretation || 'Dein Selbstwert ist eine wichtige Grundlage.'}</p>
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
            <div class="result-card" style="background:transparent;padding:0;">
                <h2 class="result-title" style="font-size:24px;margin-bottom:8px;">🎭 Deine Lebensrollen</h2>
                <p style="color: #94a3b8; margin-bottom: 20px;font-size:14px;">Was dir wirklich wichtig ist</p>
                <div class="result-chart">
                    ${['career','family','friendship','hobbies','growth'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label" style="font-size:13px;">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation" style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);">
                    <h3 style="font-size:16px;margin-bottom:8px;">📖 Deine wichtigste Rolle: ${roleNames[data.most_important] || 'Karriere'}</h3>
                    <p style="font-size:14px;color:#94a3b8;">${data.interpretation || 'Diese Rolle prägt dein Leben am stärksten.'}</p>
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
            <div class="result-card" style="background:transparent;padding:0;">
                <h2 class="result-title" style="font-size:24px;margin-bottom:8px;">🏆 Deine Lebenswerte</h2>
                <p style="color: #94a3b8; margin-bottom: 20px;font-size:14px;">Deine inneren Kompasse</p>
                <div class="result-chart">
                    ${['security','freedom','achievement','relationships','meaning'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label" style="font-size:13px;">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation" style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);">
                    <h3 style="font-size:16px;margin-bottom:8px;">📖 Dein wichtigster Wert: ${valueNames[data.top_value] || 'Sicherheit'}</h3>
                    <p style="font-size:14px;color:#94a3b8;">${data.interpretation || 'Dieser Wert leitet deine Entscheidungen.'}</p>
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
            <div class="result-card" style="background:transparent;padding:0;">
                <h2 class="result-title" style="font-size:24px;margin-bottom:8px;">⚡ Dein Motivationsprofil</h2>
                <p style="color: #94a3b8; margin-bottom: 20px;font-size:14px;">Was dich antreibt</p>
                <div class="result-chart">
                    ${['achievement_motivation','power_motivation','affiliation_motivation'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label" style="font-size:13px;">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation" style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);">
                    <h3 style="font-size:16px;margin-bottom:8px;">📖 Deine Hauptmotivation: ${motiNames[data.dominant] || 'Leistung'}</h3>
                    <p style="font-size:14px;color:#94a3b8;">${data.interpretation || 'Diese Motivation treibt dich an.'}</p>
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
            <div class="result-card" style="background:transparent;padding:0;">
                <h2 class="result-title" style="font-size:24px;margin-bottom:8px;">🔋 Deine inneren Antreiber</h2>
                <p style="color: #94a3b8; margin-bottom: 20px;font-size:14px;">Die unbewussten Glaubenssätze, die dich steuern</p>
                <div class="result-chart">
                    ${['perfection_driver','strength_driver','hurry_driver','please_driver','effort_driver'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label" style="font-size:13px;">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation" style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);">
                    <h3 style="font-size:16px;margin-bottom:8px;">📖 Deine inneren Antreiber</h3>
                    <p style="font-size:14px;color:#94a3b8;">${data.interpretation || 'Deine inneren Antreiber zeigen deine unbewussten Glaubenssätze.'}</p>
                    ${data.strong_drivers && data.strong_drivers.length > 0 ? `
                        <p style="margin-top: 8px;font-size:14px;color:#f59e0b;"><strong>⚠️ Starke Antreiber:</strong> ${data.strong_drivers.join(', ')}</p>
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
            <div class="result-card" style="background:transparent;padding:0;">
                <h2 class="result-title" style="font-size:24px;margin-bottom:8px;">😰 Dein Stressprofil</h2>
                <p style="color: #94a3b8; margin-bottom: 20px;font-size:14px;">Wie du unter Druck reagierst</p>
                <div class="result-chart">
                    ${['type_a','type_b','type_c'].map(dim => `
                        <div class="chart-item">
                            <div class="chart-label" style="font-size:13px;">${dimLabels[dim]}</div>
                            <div class="chart-bar"><div class="chart-fill" style="width: ${((scores[dim]||0)/5)*100}%">${scores[dim]||0}/5</div></div>
                        </div>
                    `).join('')}
                </div>
                <div class="result-interpretation" style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);">
                    <h3 style="font-size:16px;margin-bottom:8px;">📖 Dein Stress-Typ: ${typeNames[data.dominant] || 'Typ B – Ruhig & gelassen'}</h3>
                    <p style="font-size:14px;color:#94a3b8;">${data.interpretation || 'Dein Stressprofil zeigt, wie du mit Druck umgehst.'}</p>
                </div>
            </div>
        `;
    }

    // FALLBACK
    return `
        <div class="result-card" style="background:transparent;padding:0;">
            <h2 style="font-size:20px;margin-bottom:8px;">📊 Dein Testergebnis</h2>
            <pre style="background:rgba(0,0,0,0.2);padding:16px;border-radius:12px;overflow-x:auto;font-size:13px;color:#94a3b8;">${JSON.stringify(data, null, 2)}</pre>
        </div>
    `;
}

// ========== LOAD USER INFO ==========
async function loadUserInfo() {
    try {
        // 🔥 KEIN Token-Check mehr – der Server prüft das Cookie!
        const response = await apiCall('/auth/verify');
        if (response.ok) {
            const data = await response.json();
            const premiumData = await getPremiumStatus();
            if (userNameSpan) userNameSpan.textContent = data.user.username;
            if (premiumBadge) premiumBadge.style.display = premiumData.is_premium ? 'inline-block' : 'none';
        } else {
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Fehler:', error);
        window.location.href = 'index.html';
    }
}

async function loadProfile() {
    if (!resultsList) return;

    try {
        const results = await getAllResults();
        console.log('📊 Ergebnisse geladen:', results);

        const resultArray = Array.isArray(results) ? results : (results.results || []);

        if (totalTestsSpan) totalTestsSpan.textContent = resultArray.length;

        if (!resultArray.length) {
            resultsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <h3>Noch keine Ergebnisse</h3>
                    <p>Mache deinen ersten Test, um hier deine Ergebnisse zu sehen!</p>
                </div>
            `;
            return;
        }

        resultsList.innerHTML = resultArray.map(result => `
            <div class="result-item" data-test-id="${result.test_id}" data-result-id="${result.id}">
                <div class="result-item-header">
                    <div>
                        <div class="result-item-title">${getTestName(result.test_id)}</div>
                        <div class="result-item-date">${new Date(result.taken_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                    </div>
                    <button class="delete-result" data-id="${result.id}">🗑️ Löschen</button>
                </div>
                <div class="result-item-preview">${getResultPreview(result.test_id, result.results)}</div>
            </div>
        `).join('');

        document.querySelectorAll('.result-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-result')) return;
                const testId = item.dataset.testId;
                const result = resultArray.find(r => r.test_id === testId);
                if (result) {
                    showResultModal(result.test_id, result.results);
                }
            });
        });

        document.querySelectorAll('.delete-result').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                if (confirm('Möchtest du dieses Ergebnis wirklich löschen?')) {
                    try {
                        const response = await deleteResult(id);
                        if (response.ok) {
                            showNotification('✅ Ergebnis gelöscht', 'success');
                            await loadProfile();
                        } else {
                            showNotification('Fehler beim Löschen', 'error');
                        }
                    } catch (error) {
                        showNotification('Fehler beim Löschen', 'error');
                    }
                }
            });
        });

    } catch (error) {
        console.error('Fehler beim Laden des Profils:', error);
        resultsList.innerHTML = `<div class="empty-state">❌ Fehler beim Laden der Ergebnisse: ${error.message}</div>`;
    }
}

// ========== MODAL ==========
function showResultModal(testId, results) {
    const modalHtml = `
        <div id="result-modal" class="modal">
            <div class="modal-content" style="max-width:700px;max-height:85vh;overflow-y:auto;">
                ${renderTestResultModal(testId, results)}
                <div class="modal-buttons" style="margin-top:20px;display:flex;justify-content:flex-end;">
                    <button id="close-modal" style="background:rgba(255,255,255,0.1);border:none;padding:10px 24px;border-radius:30px;color:white;cursor:pointer;">Schließen</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('close-modal')?.addEventListener('click', () => {
        document.getElementById('result-modal')?.remove();
    });
}

// ========== EVENT LISTENERS ==========
backBtn?.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// ========== INIT ==========
async function init() {
    await loadUserInfo();
    await loadProfile();
}

init();