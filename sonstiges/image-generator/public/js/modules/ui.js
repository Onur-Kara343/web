export function getInputValues() {
    return {
        prompt: document.getElementById('prompt').value,
        negativePrompt: document.getElementById('negative-prompt').value,
        size: document.getElementById('size').value,
        model: document.getElementById('model').value
    };
}

export function setInputValues(prompt, negativePrompt, size, model) {
    if (prompt) document.getElementById('prompt').value = prompt;
    if (negativePrompt !== undefined) document.getElementById('negative-prompt').value = negativePrompt;
    if (size) document.getElementById('size').value = size;
    if (model) document.getElementById('model').value = model;
}

export function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

export function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

export function showResult() {
    document.getElementById('result').classList.remove('hidden');
}

export function hideResult() {
    document.getElementById('result').classList.add('hidden');
}

export function displayImage(imageData) {
    const img = document.getElementById('generated-image');
    img.src = imageData;
}

export function showError(message) {
    alert('❌ ' + message);
}

export function clearImage() {
    const img = document.getElementById('generated-image');
    img.src = '';
    hideResult();
}