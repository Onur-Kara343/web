const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');
const generateBtn = document.getElementById('generate');
const downloadBtn = document.getElementById('download');
const qrContainer = document.getElementById('qrcode');
const sizeInput = document.getElementById('size');
const sizeValue = document.getElementById('size-value');
const eccSelect = document.getElementById('ecc');

// Tab-Wechsel
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
    });
});

// Größen-Anzeige
sizeInput.addEventListener('input', () => {
    sizeValue.textContent = sizeInput.value;
});

// Payload je nach Tab bauen
function buildPayload() {
    const activeTab = document.querySelector('.tab.active').dataset.tab;

    if (activeTab === 'wlan') {
        const ssid = document.getElementById('wlan-ssid').value.trim();
        const pass = document.getElementById('wlan-pass').value;
        const enc = document.getElementById('wlan-enc').value;
        const hidden = document.getElementById('wlan-hidden').checked;

        if (!ssid) throw new Error('Bitte eine SSID eingeben.');

        // Sonderzeichen escapen
        const esc = s => s.replace(/([\\;,:"])/g, '\\$1');
        const passPart = enc === 'nopass' ? '' : `P:${esc(pass)};`;
        const hiddenPart = hidden ? 'H:true;' : '';
        return `WIFI:T:${enc};S:${esc(ssid)};${passPart}${hiddenPart};`;
    }

    if (activeTab === 'passwort') {
        const pw = document.getElementById('pw-input').value;
        if (!pw) throw new Error('Bitte ein Passwort eingeben.');
        return pw;
    }

    const text = document.getElementById('text-input').value.trim();
    if (!text) throw new Error('Bitte einen Text eingeben.');
    return text;
}

// QR-Code erzeugen
generateBtn.addEventListener('click', async () => {
    let payload;
    try {
        payload = buildPayload();
    } catch (e) {
        alert(e.message);
        return;
    }

    const size = parseInt(sizeInput.value, 10);
    const ecc = eccSelect.value;

    qrContainer.innerHTML = '';

    try {
        const canvas = document.createElement('canvas');
        await QRCode.toCanvas(canvas, payload, {
            width: size,
            errorCorrectionLevel: ecc,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' }
        });
        qrContainer.appendChild(canvas);
        downloadBtn.hidden = false;
    } catch (e) {
        alert('Fehler beim Erzeugen: ' + e.message);
    }
});

// Download
downloadBtn.addEventListener('click', () => {
    const canvas = qrContainer.querySelector('canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});