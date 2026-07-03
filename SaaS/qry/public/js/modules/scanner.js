import { elements, showScanResult, hideScanResult, showUploadResult, hideUploadResult, setCameraVisibility, showError, showTab, setContentInput } from './ui.js';

let html5QrCode = null;

export async function startCamera() {
    if (html5QrCode) {
        await html5QrCode.stop();
    }
    
    html5QrCode = new Html5Qrcode("camera-preview");
    setCameraVisibility(true);
    hideScanResult();
    
    try {
        await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (decodedText) => {
                showScanResult(decodedText);
                stopCamera();
            },
            (error) => {}
        );
    } catch (err) {
        showError('Kamera konnte nicht gestartet werden: ' + err);
        setCameraVisibility(false);
    }
}

export async function stopCamera() {
    if (html5QrCode) {
        await html5QrCode.stop();
        html5QrCode = null;
    }
    setCameraVisibility(false);
}

export function useScannedContent() {
    const content = elements.scannedContent.textContent;
    if (content) {
        showTab('generate');
        setContentInput(content);
        hideScanResult();
        // Setze Type auf Text
        const textBtn = document.querySelector('.type-btn[data-type="text"]');
        if (textBtn) textBtn.click();
    }
}

export function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async function(event) {
        const imgData = event.target.result;
        const qrScanner = new Html5Qrcode("upload-result");
        
        try {
            const decodedText = await qrScanner.scanImage(imgData);
            showUploadResult(decodedText);
        } catch (err) {
            showError('Kein QR-Code im Bild gefunden');
        }
    };
    reader.readAsDataURL(file);
}

export function useUploadedContent() {
    const content = elements.uploadScannedContent.textContent;
    if (content) {
        showTab('generate');
        setContentInput(content);
        hideUploadResult();
        const textBtn = document.querySelector('.type-btn[data-type="text"]');
        if (textBtn) textBtn.click();
    }
}