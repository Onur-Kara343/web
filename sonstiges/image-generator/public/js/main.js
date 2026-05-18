import { generateNewImage, downloadImage, setCurrentOptions, getCurrentImageData } from './modules/generator.js';
import { getInputValues, setInputValues, showLoading, hideLoading, showResult, displayImage, showError, hideResult } from './modules/ui.js';

// DOM Elements
const generateBtn = document.getElementById('generate-btn');
const downloadBtn = document.getElementById('download-btn');
const regenerateBtn = document.getElementById('regenerate-btn');
const promptInput = document.getElementById('prompt');

let lastOptions = null;

// UI Callbacks für Generator
const uiCallbacks = {
    showLoading,
    hideLoading,
    showResult,
    displayImage,
    showError
};

async function handleGenerate() {
    const options = getInputValues();
    lastOptions = { ...options };
    
    const success = await generateNewImage(options, uiCallbacks);
    
    if (success) {
        setCurrentOptions(options.prompt, options.negativePrompt, options.size, options.model);
    }
    generatedImage.textContent = '';
    generatedImage.src = '';
}

function handleDownload() {
    downloadImage();
}

async function handleRegenerate() {
    if (lastOptions) {
        const success = await generateNewImage(lastOptions, uiCallbacks);
        if (success) {
            setCurrentOptions(lastOptions.prompt, lastOptions.negativePrompt, lastOptions.size, lastOptions.model);
        }
    } else {
        await handleGenerate();
    }
}

// Event Listener
generateBtn.addEventListener('click', handleGenerate);
downloadBtn.addEventListener('click', handleDownload);
regenerateBtn.addEventListener('click', handleRegenerate);

// Strg+Enter im Prompt-Feld
promptInput.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        handleGenerate();
    }
});

// Initial verstecken
hideResult();

console.log('🎨 AI Image Generator ready! 🚀');