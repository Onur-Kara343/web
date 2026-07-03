import { generateNewImage, downloadImage, setCurrentOptions, getCurrentImageData } from './modules/generator.js';
import { getInputValues, setInputValues, showLoading, hideLoading, showResult, displayImage, showError, hideResult, clearImage } from './modules/ui.js';

// DOM Elements
const generateBtn = document.getElementById('generate-btn');
const downloadBtn = document.getElementById('download-btn');
const promptInput = document.getElementById('prompt');
const generatedImage = document.getElementById("generated-image")
const clearBtn = document.getElementById("clear-btn")

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
    generatedImage.textcontent = "";
    generatedImage.src = '';

}

function handleDownload() {
    downloadImage();
}

function clearI() {
    clearImage()
}

// Event Listener
generateBtn.addEventListener('click', handleGenerate);
downloadBtn.addEventListener('click', handleDownload);
clearBtn.addEventListener('click', clearI);

// Strg+Enter im Prompt-Feld
promptInput.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        handleGenerate();
    }
});

// Initial verstecken
hideResult();

console.log('🎨 AI Image Generator ready! 🚀');