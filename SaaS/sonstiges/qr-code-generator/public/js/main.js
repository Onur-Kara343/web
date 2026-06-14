// QR-Code Tool - Main Entry Point
import { elements, setCurrentType, updateUIVisibility, showTab, hideQRResult } from './modules/ui.js';
import { generateQR, downloadQR, copyContent } from './modules/generator.js';
import { startCamera, stopCamera, useScannedContent, handleFileUpload, useUploadedContent } from './modules/scanner.js';

// Override saveToHistory to be called from generator
import { getCurrentQRImage, getCurrentContent } from './modules/generator.js';
import { getCurrentType } from './modules/ui.js';

// Patch: Auto-save to history after generation
const originalShowQRResult = window.showQRResult || function() {};
const originalGenerateQR = generateQR;



// ========== Event Listeners ==========

// Tabs
elements.tabs.forEach(btn => {
    btn.addEventListener('click', () => showTab(btn.dataset.tab));
});

// Type Buttons
elements.typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        elements.typeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setCurrentType(btn.dataset.type);
        updateUIVisibility();
        hideQRResult();
    });
});

// Generate
elements.generateBtn.addEventListener('click', generateQR);
elements.downloadBtn.addEventListener('click', downloadQR);
elements.copyBtn.addEventListener('click', copyContent);

// Scanner
elements.startCameraBtn.addEventListener('click', startCamera);
elements.stopCameraBtn.addEventListener('click', stopCamera);
elements.useScannedBtn.addEventListener('click', useScannedContent);
elements.uploadFile.addEventListener('change', handleFileUpload);
elements.useUploadBtn.addEventListener('click', useUploadedContent);

// ========== Initialization ==========
updateUIVisibility();
hideQRResult();

console.log('📱 QR-Code Tool ready!');