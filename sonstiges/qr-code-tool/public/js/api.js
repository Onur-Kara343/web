const API_BASE = '/api';

export async function generateQRCode(options) {
    const { content, type, ssid, password, encryption, phone } = options;
    
    const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type, ssid, password, encryption, phone })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Generieren');
    }
    
    return data;
}