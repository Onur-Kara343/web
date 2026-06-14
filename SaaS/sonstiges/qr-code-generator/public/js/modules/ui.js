// DOM Elements
export const elements = {
    // Tabs
    tabs: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // Generate
    typeBtns: document.querySelectorAll('.type-btn'),
    textUrlGroup: document.getElementById('text-url-group'),
    wifiGroup: document.getElementById('wifi-group'),
    phoneGroup: document.getElementById('phone-group'),
    contentInput: document.getElementById('content-input'),
    wifiSsid: document.getElementById('wifi-ssid'),
    wifiPassword: document.getElementById('wifi-password'),
    wifiEncryption: document.getElementById('wifi-encryption'),
    phoneNumber: document.getElementById('phone-number'),
    generateBtn: document.getElementById('generate-btn'),
    qrResult: document.getElementById('qr-result'),
    qrImage: document.getElementById('qr-image'),
    downloadBtn: document.getElementById('download-btn'),
    copyBtn: document.getElementById('copy-btn'),
    
    // Scan
    startCameraBtn: document.getElementById('start-camera-btn'),
    stopCameraBtn: document.getElementById('stop-camera-btn'),
    cameraContainer: document.getElementById('camera-container'),
    cameraPreview: document.getElementById('camera-preview'),
    scanResult: document.getElementById('scan-result'),
    scannedContent: document.getElementById('scanned-content'),
    useScannedBtn: document.getElementById('use-scanned-btn'),
    uploadFile: document.getElementById('upload-file'),
    uploadResult: document.getElementById('upload-result'),
    uploadScannedContent: document.getElementById('upload-scanned-content'),
    useUploadBtn: document.getElementById('use-upload-btn'),
    
    // History
    historyList: document.getElementById('history-list'),
    clearHistoryBtn: document.getElementById('clear-history-btn')
};

let currentType = 'text';

export function getCurrentType() {
    return currentType;
}

export function setCurrentType(type) {
    currentType = type;
    updateUIVisibility();
}

export function updateUIVisibility() {
    elements.textUrlGroup.classList.add('hidden');
    elements.wifiGroup.classList.add('hidden');
    elements.phoneGroup.classList.add('hidden');
    
    if (currentType === 'wifi') elements.wifiGroup.classList.remove('hidden');
    else if (currentType === 'phone') elements.phoneGroup.classList.remove('hidden');
    else elements.textUrlGroup.classList.remove('hidden');
}

export function getCurrentTypeContent() {
    if (currentType === 'wifi') {
        const ssid = elements.wifiSsid.value.trim();
        const password = elements.wifiPassword.value.trim();
        const encryption = elements.wifiEncryption.value;
        
        if (!ssid) return { error: 'Bitte WLAN-Namen eingeben' };
        if (encryption !== 'nopass' && !password) return { error: 'Bitte Passwort eingeben' };
        
        return { content: JSON.stringify({ type: 'wifi', ssid, password, encryption }) };
    }
    
    if (currentType === 'phone') {
        const phone = elements.phoneNumber.value.trim();
        if (!phone) return { error: 'Bitte Telefonnummer eingeben' };
        return { content: phone };
    }
    
    const text = elements.contentInput.value.trim();
    if (!text) return { error: 'Bitte Text/URL eingeben' };
    return { content: text };
}

export function showQRResult(imageData, content) {
    elements.qrImage.src = imageData;
    elements.qrResult.classList.remove('hidden');
}

export function hideQRResult() {
    elements.qrResult.classList.add('hidden');
}

export function setGenerateButtonLoading(isLoading) {
    if (isLoading) {
        elements.generateBtn.disabled = true;
        elements.generateBtn.textContent = '🔄 Generiere...';
    } else {
        elements.generateBtn.disabled = false;
        elements.generateBtn.textContent = '🎯 QR-Code generieren';
    }
}

export function showTab(tabId) {
    elements.tabContents.forEach(tab => tab.classList.remove('active'));
    elements.tabs.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(`tab-${tabId}`).classList.add('active');
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
}

export function showError(message) {
    alert('❌ ' + message);
}

export function showSuccess(message) {
    alert('✅ ' + message);
}

export function setCameraVisibility(visible) {
    if (visible) {
        elements.cameraContainer.classList.remove('hidden');
        elements.startCameraBtn.classList.add('hidden');
        elements.stopCameraBtn.classList.remove('hidden');
    } else {
        elements.cameraContainer.classList.add('hidden');
        elements.startCameraBtn.classList.remove('hidden');
        elements.stopCameraBtn.classList.add('hidden');
    }
}

export function showScanResult(content) {
    elements.scannedContent.textContent = content;
    elements.scanResult.classList.remove('hidden');
}

export function hideScanResult() {
    elements.scanResult.classList.add('hidden');
}

export function showUploadResult(content) {
    elements.uploadScannedContent.textContent = content;
    elements.uploadResult.classList.remove('hidden');
}

export function hideUploadResult() {
    elements.uploadResult.classList.add('hidden');
}

export function setContentInput(value) {
    elements.contentInput.value = value;
}

export function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

export function getTypeName(type) {
    const names = { text: '📝 Text', url: '🔗 URL', wifi: '📶 WLAN', phone: '📞 Telefon' };
    return names[type] || '📝 Text';
}