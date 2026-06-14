const API_BASE = '/api';

export async function generateImage(options) {
    const { prompt, negativePrompt, width, height, model } = options;
    
    const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt,
            negativePrompt,
            width,
            height,
            model
        })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Generieren');
    }
    
    return data;
}