import { generateImage } from '../api.js';

let currentImageData = null;
let currentPrompt = '';
let currentNegativePrompt = '';
let currentSize = '';
let currentModel = '';

export function setCurrentImageData(data) {
    currentImageData = data;
}

export function getCurrentImageData() {
    return currentImageData;
}

export function setCurrentOptions(prompt, negativePrompt, size, model) {
    currentPrompt = prompt;
    currentNegativePrompt = negativePrompt;
    currentSize = size;
    currentModel = model;
}

export async function generateNewImage(options, uiCallbacks) {
    const { showLoading, hideLoading, showResult, displayImage, showError } = uiCallbacks;
    
    const { prompt, negativePrompt, size, model } = options;
    
    if (!prompt.trim()) {
        showError('Bitte gib einen Prompt ein!');
        return false;
    }
    
    showLoading();
    
    try {
        const result = await generateImage({
            prompt,
            negativePrompt,
            width: parseInt(size),
            height: parseInt(size),
            model
        });
        
        currentImageData = result.image;
        setCurrentOptions(prompt, negativePrompt, size, model);
        
        hideLoading();
        displayImage(result.image);
        showResult();
        return true;
        
    } catch (error) {
        hideLoading();
        showError(error.message);
        return false;
    }
}

export function downloadImage() {
    if (!currentImageData) {
        alert('Kein Bild zum Download verfügbar!');
        return;
    }
    
    const link = document.createElement('a');
    link.href = currentImageData;
    link.download = `ai_image_${Date.now()}.png`;
    link.click();
}