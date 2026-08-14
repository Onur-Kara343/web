const API_URL = '/api';

let authToken = null;

export function setAuthToken(token) {
    authToken = token;
    if (token) {
        localStorage.setItem('finance_token', token);
    } else {
        localStorage.removeItem('finance_token');
    }
}

export function getAuthToken() {
    if (!authToken) {
        authToken = localStorage.getItem('finance_token');
    }
    return authToken;
}

export function isLoggedIn() {
    return !!getAuthToken();
}

async function fetchAPI(endpoint, options = {}) {
    const token = getAuthToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler bei API');
    }
    
    return response.json();
}

// Auth
export async function register(username, email, password) {
    return fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password })
    });
}

export async function login(email, password) {
    return fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
}

// Kategorien
export async function getCategories() {
    return fetchAPI('/categories');
}

// Transaktionen
export async function getTransactions(start, end) {
    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    return fetchAPI(`/transactions?${params.toString()}`);
}

export async function createTransaction(transaction) {
    return fetchAPI('/transactions', {
        method: 'POST',
        body: JSON.stringify(transaction)
    });
}

export async function deleteTransaction(id) {
    return fetchAPI(`/transactions/${id}`, {
        method: 'DELETE'
    });
}

export async function getSummary(start, end) {
    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    return fetchAPI(`/summary?${params.toString()}`);
}

// KI-Tipp
export async function getAITip() {
    return fetchAPI('/ai-tips');
}

// ========== SPARBUCH ==========
export async function getSavings() {
    return fetchAPI('/savings');
}

export async function createSavings(name, target_amount, current_amount) {
    return fetchAPI('/savings', {
        method: 'POST',
        body: JSON.stringify({ name, target_amount, current_amount })
    });
}

export async function updateSavings(id, name, target_amount, current_amount) {
    return fetchAPI(`/savings/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, target_amount, current_amount })
    });
}

export async function deleteSavings(id) {
    return fetchAPI(`/savings/${id}`, {
        method: 'DELETE'
    });
}

export async function savingsTransaction(id, amount, type) {
    return fetchAPI('/savings/transaction', {
        method: 'POST',
        body: JSON.stringify({ id, amount, type })
    });
}