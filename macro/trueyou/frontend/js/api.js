// frontend/js/api.js
const API_URL = (() => {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return '/api';
    }
    return 'http://localhost:5003/api';
})();

console.log('📡 TrueYou API_URL:', API_URL);

let apiCache = new Map();

export async function apiCall(endpoint, options = {}, useCache = false) {
    const cacheKey = `${endpoint}:${JSON.stringify(options.body || {})}`;

    if (useCache && apiCache.has(cacheKey)) {
        console.log(`📦 Cache hit: ${endpoint}`);
        return apiCache.get(cacheKey).clone();
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            credentials: 'include', // ← WICHTIG für Cookies!
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        // 🔥 Bei 401/403: Cookie löschen und reload
        if (response.status === 403 || response.status === 401) {
            // Cookie wird automatisch gelöscht, wenn der Server clearCookie sendet
            window.location.reload();
            throw new Error('Nicht autorisiert');
        }

        if (useCache && response.ok) {
            apiCache.set(cacheKey, response.clone());
        }

        return response;
    } catch (error) {
        console.error('❌ API Fehler:', error);
        throw error;
    }
}

export function clearApiCache() {
    apiCache.clear();
    console.log('🗑️ API-Cache geleert');
}

// ========== AUTH ==========
export async function login(email, password) {
    const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    return response;
}

export async function register(username, email, password) {
    const response = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
    });
    return response;
}

export async function verifyToken() {
    const response = await apiCall('/auth/verify');
    return response;
}

export async function logout() {
    const response = await apiCall('/auth/logout', {
        method: 'POST'
    });
    return response;
}

// ========== PREMIUM ==========
export async function getPremiumStatus() {
    const response = await apiCall('/premium/status', {}, true);
    return response.json();
}

export async function createCheckout() {
    const response = await apiCall('/premium/checkout', {
        method: 'POST'
    });
    return response.json();
}

// ========== TESTS ==========
export async function getTest(testId) {
    const response = await apiCall(`/tests/${testId}`, {}, true);
    return response.json();
}

export async function submitTest(testId, answers) {
    console.log('📤 Submit Test:', testId, 'Antworten:', answers.length);
    const response = await apiCall(`/tests/${testId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers })
    });
    const data = await response.json();
    console.log('📥 Submit Response:', data);
    clearApiCache();
    return data;
}

export async function getAllResults() {
    const response = await apiCall('/tests/results/all', {}, false);
    return response.json();
}

export async function deleteResult(resultId) {
    const response = await apiCall(`/tests/results/${resultId}`, {
        method: 'DELETE'
    });
    return response;
}