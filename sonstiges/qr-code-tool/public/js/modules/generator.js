import { generateQRCode } from '../api.js';
import { 
    elements, getCurrentType, getCurrentTypeContent, 
    showQRResult, setGenerateButtonLoading, showError, hideQRResult 
} from './ui.js';

let currentQRImage = null;
let currentContent = null;
let currentType = null;

export function getCurrentQRImage() {
    return currentQRImage;
}

export function getCurrentContent() {
    return currentContent;
}

export async function generateQR() {
    const contentData = getCurrentTypeContent();
    if (contentData.error) {
        showError(contentData.error);
        return;
    }
    
    const type = getCurrentType();
    let requestBody = { content: contentData.content, type };
    
    if (type === 'wifi') {
        const data = JSON.parse(contentData.content);
        requestBody = { ...requestBody, ssid: data.ssid, password: data.password, encryption: data.encryption };
    }
    if (type === 'phone') {
        requestBody = { ...requestBody, phone: contentData.content };
    }
    
    setGenerateButtonLoading(true);
    hideQRResult();
    
    try {
        const data = await generateQRCode(requestBody);
        
        if (data.success) {
            currentQRImage = data.qrImage;
            currentContent = data.qrContent || contentData.content;
            currentType = type;
            showQRResult(currentQRImage, currentContent);
        } else {
            showError(data.error || 'Fehler beim Generieren');
        }
    } catch (error) {
        showError(error.message);
    } finally {
        setGenerateButtonLoading(false);
    }
}

export function downloadQR() {
    if (!currentQRImage) {
        showError('Kein QR-Code zum Download');
        return;
    }
    const link = document.createElement('a');
    link.download = `qr-code-${Date.now()}.png`;
    link.href = currentQRImage;
    link.click();
}

export function copyContent() {
    if (!currentContent) {
        showError('Kein Inhalt zum Kopieren');
        return;
    }
    navigator.clipboard.writeText(currentContent);
    showSuccess('Inhalt kopiert!');
}

export function setCurrentQRFromHistory(qrImage, content, type) {
    currentQRImage = qrImage;
    currentContent = content;
    currentType = type;
    showQRResult(currentQRImage, currentContent);
}