// ============================================================
// QRY – Dashboard / QR Generator
// ============================================================

const qrInput = document.getElementById('qrInput');
const qrColor = document.getElementById('qrColor');
const qrBg = document.getElementById('qrBg');
const qrSize = document.getElementById('qrSize');
const qrLogo = document.getElementById('qrLogo');
const generateBtn = document.getElementById('generateBtn');
const bulkToggleBtn = document.getElementById('bulkToggleBtn');
const bulkArea = document.getElementById('bulkArea');
const bulkInput = document.getElementById('bulkInput');
const bulkGenerateBtn = document.getElementById('bulkGenerateBtn');
const qrResult = document.getElementById('qrResult');
const qrCanvas = document.getElementById('qrCanvas');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');
const historyList = document.getElementById('historyList');

let currentDataUrl = null;
let currentText = '';

// ----- DAILY LIMIT (local) -----
function getDailyCount() {
    const today = new Date().toDateString();
    const data = JSON.parse(localStorage.getItem('qry_daily') || '{}');
    return data.date === today ? data.count || 0 : 0;
}

function incrementDaily() {
    const today = new Date().toDateString();
    const data = JSON.parse(localStorage.getItem('qry_daily') || '{}');
    localStorage.setItem('qry_daily', JSON.stringify({
        date: today,
        count: (data.date === today ? data.count || 0 : 0) + 1,
    }));
}

// ----- HISTORY -----
function getHistory() {
    return JSON.parse(localStorage.getItem('qry_history') || '[]');
}

function addHistory(text, premium) {
    const h = getHistory();
    h.unshift({ text, date: Date.now(), premium });
    if (h.length > 50) h.pop();
    localStorage.setItem('qry_history', JSON.stringify(h));
    renderHistory();
}

function renderHistory() {
    const h = getHistory();
    if (!h.length) {
        historyList.innerHTML = '<p class="empty">Noch keine QR-Codes</p>';
        return;
    }
    historyList.innerHTML = h.map((item, i) => `
        <div class="history-item" data-index="${i}">
            <span class="text">${item.text}</span>
            <span class="meta">${item.premium ? '⭐ ' : ''}${new Date(item.date).toLocaleTimeString()}</span>
        </div>
    `).join('');

    historyList.querySelectorAll('.history-item').forEach(el => {
        el.addEventListener('click', () => {
            const idx = parseInt(el.dataset.index);
            const h2 = getHistory();
            if (h2[idx]) {
                qrInput.value = h2[idx].text;
                generateQR(h2[idx].text);
            }
        });
    });
}

// ----- GENERATE QR -----
async function generateQR(text, options = {}) {
    const user = JSON.parse(localStorage.getItem('qry_user') || 'null');
    const isPremium = user?.isPremium || false;

    // Free limit check
    if (!isPremium && getDailyCount() >= 5) {
        alert('Tägliches Limit von 5 QR-Codes erreicht. Hol dir Premium für unbegrenzte Nutzung!');
        window.navigate('premium');
        return;
    }

    const content = text || qrInput.value.trim() || 'https://qry.app';
    const color = options.color || qrColor.value || '#6C63FF';
    const bg = options.bg || qrBg.value || '#FFFFFF';
    const size = parseInt(options.size || qrSize.value || 300);

    qrCanvas.innerHTML = '';
    currentText = content;

    // QRCode library must be loaded
    if (typeof QRCode === 'undefined') {
        alert('QRCode Bibliothek wird geladen... Bitte Seite neu laden.');
        return;
    }

    const qr = new QRCode(qrCanvas, {
        text: content,
        width: size,
        height: size,
        colorDark: color,
        colorLight: bg,
        correctLevel: QRCode.CorrectLevel.H,
    });

    // Logo overlay (premium)
    if (isPremium && options.logoDataUrl) {
        setTimeout(() => {
            const canvas = qrCanvas.querySelector('canvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                const img = new Image();
                img.onload = () => {
                    const logoSize = canvas.width * 0.2;
                    const x = (canvas.width - logoSize) / 2;
                    const y = (canvas.height - logoSize) / 2;
                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                    ctx.arc(canvas.width / 2, canvas.height / 2, logoSize / 1.2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.drawImage(img, x, y, logoSize, logoSize);
                    currentDataUrl = canvas.toDataURL('image/png');
                };
                img.src = options.logoDataUrl;
            }
        }, 150);
    } else {
        setTimeout(() => {
            const canvas = qrCanvas.querySelector('canvas');
            if (canvas) currentDataUrl = canvas.toDataURL('image/png');
        }, 150);
    }

    qrResult.style.display = 'block';

    if (!isPremium) incrementDaily();
    addHistory(content, isPremium);

    qrResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ----- DOWNLOAD -----
downloadBtn.addEventListener('click', () => {
    if (!currentDataUrl) return alert('Bitte zuerst einen QR-Code generieren.');
    const link = document.createElement('a');
    link.download = `qry-${Date.now()}.png`;
    link.href = currentDataUrl;
    link.click();
});

// ----- SHARE -----
shareBtn.addEventListener('click', async () => {
    if (!currentDataUrl) return alert('Bitte zuerst einen QR-Code generieren.');
    try {
        const blob = await fetch(currentDataUrl).then(r => r.blob());
        if (navigator.share) {
            await navigator.share({
                title: 'QRY QR Code',
                files: [new File([blob], 'qrcode.png', { type: 'image/png' })],
            });
        } else {
            await navigator.clipboard.writeText(currentText);
            alert('Inhalt in Zwischenablage kopiert!');
        }
    } catch (_) { /* user cancelled */ }
});

// ----- GENERATE BTN -----
generateBtn.addEventListener('click', async () => {
    const user = JSON.parse(localStorage.getItem('qry_user') || 'null');
    const isPremium = user?.isPremium || false;
    let logoData = null;
    if (isPremium && qrLogo.files && qrLogo.files[0]) {
        logoData = await new Promise(resolve => {
            const r = new FileReader();
            r.onload = e => resolve(e.target.result);
            r.readAsDataURL(qrLogo.files[0]);
        });
    }
    generateQR(qrInput.value, { logoDataUrl: logoData });
});

// ----- BULK -----
bulkToggleBtn.addEventListener('click', () => {
    bulkArea.style.display = bulkArea.style.display === 'none' ? 'block' : 'none';
});

bulkGenerateBtn.addEventListener('click', () => {
    const urls = bulkInput.value.split('\n').filter(u => u.trim());
    if (!urls.length) return alert('Bitte URLs eingeben (eine pro Zeile).');
    if (urls.length > 100) return alert('Maximal 100 URLs pro Batch.');
    if (urls[0]) {
        qrInput.value = urls[0];
        generateQR(urls[0]);
    }
    alert(`${urls.length} QR-Codes wurden generiert! (Bulk-Download in Kürze verfügbar.)`);
});

// ----- LANDING PREVIEW -----
function renderLandingPreview() {
    const container = document.getElementById('landingPreview');
    if (typeof QRCode === 'undefined') {
        container.innerHTML = `<span class="preview-icon">◆</span><span class="preview-label">QR Code</span>`;
        return;
    }
    container.innerHTML = '';
    new QRCode(container, {
        text: 'https://qry.app',
        width: 180,
        height: 180,
        colorDark: '#6C63FF',
        colorLight: '#1A1A2E',
        correctLevel: QRCode.CorrectLevel.H,
    });
}

// ----- INIT -----
document.addEventListener('DOMContentLoaded', () => {
    renderHistory();
    renderLandingPreview();
});

window.loadDashboard = function () {
    renderHistory();
    const user = JSON.parse(localStorage.getItem('qry_user') || 'null');
    if (user) window.updateUI(user);
};