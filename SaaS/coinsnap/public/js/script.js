import { 
    getCategories, 
    getTransactions, 
    createTransaction, 
    deleteTransaction as deleteTransactionAPI, 
    getSummary,
    getAITip,
    setAuthToken,
    getAuthToken,
    getSavings, 
    createSavings, 
    updateSavings, 
    deleteSavings, 
    savingsTransaction 
} from './api.js';

// ========== DOM ELEMENTE ==========
const form = document.getElementById('transaction-form');
const amountInput = document.getElementById('amount');
const typeSelect = document.getElementById('type');
const categorySelect = document.getElementById('category-id');
const descriptionInput = document.getElementById('description');
const dateInput = document.getElementById('date');
const transactionsTable = document.getElementById('transactions-table')?.querySelector('tbody');
const totalIncomeSpan = document.getElementById('total-income');
const totalExpenseSpan = document.getElementById('total-expense');
const balanceSpan = document.getElementById('balance');
const currentMonthSpan = document.getElementById('current-month');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const logoutBtn = document.getElementById('logout-btn');
const usernameSpan = document.getElementById('username');
const addCategoryBtn = document.getElementById('add-category-btn');
const challengesList = document.getElementById('challenges-list');
const addChallengeBtn = document.getElementById('add-challenge-btn');
const refreshTipBtn = document.getElementById('refresh-tip-btn');
const aiTipDiv = document.getElementById('ai-tip');

// ========== STATE ==========
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let expenseChart = null;

// ========== USER ==========
function loadUser() {
    const user = JSON.parse(localStorage.getItem('finance_user') || '{}');
    if (usernameSpan) usernameSpan.textContent = user.username || 'Benutzer';
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        setAuthToken(null);
        localStorage.removeItem('finance_user');
        window.location.href = '/';
    });
}

// ========== MONAT ==========
function updateMonthDisplay() {
    const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    if (currentMonthSpan) currentMonthSpan.textContent = `${monthNames[currentMonth]} ${currentYear}`;
}

function getMonthRange() {
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0);
    return {
        start: startDate.toISOString().slice(0, 10),
        end: endDate.toISOString().slice(0, 10)
    };
}

if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        updateMonthDisplay();
        refreshAll();
    });
}

if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        updateMonthDisplay();
        refreshAll();
    });
}

// ========== KATEGORIEN ==========
async function loadCategories() {
    if (!categorySelect) return;
    const categories = await getCategories();
    categorySelect.innerHTML = '<option value="">-- Keine Kategorie --</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = `${cat.name} (${cat.type === 'income' ? 'Einnahme' : 'Ausgabe'})`;
        categorySelect.appendChild(option);
    });
}

// ========== KI-TIPP ==========
async function loadAITip() {
    if (!aiTipDiv) return;
    try {
        const data = await getAITip();
        aiTipDiv.innerHTML = `
            <i class="fas fa-lightbulb"></i>
            <span>${escapeHtml(data.tip)}</span>
        `;
    } catch (error) {
        aiTipDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>Keine Daten für Tipp verfügbar</span>
        `;
    }
}

if (refreshTipBtn) {
    refreshTipBtn.addEventListener('click', loadAITip);
}

// ========== TRANSAKTION LÖSCHEN ==========
async function handleDeleteTransaction(id) {
    if (!confirm('Transaktion wirklich löschen?')) return;
    try {
        await deleteTransactionAPI(id);
        await refreshAll();
    } catch (error) {
        alert('Fehler: ' + error.message);
    }
}

// ========== TRANSAKTIONEN ==========
async function loadTransactions() {
    if (!transactionsTable) return;
    const { start, end } = getMonthRange();
    let transactions = await getTransactions(start, end);
    
    transactionsTable.innerHTML = '';
    for (const t of transactions) {
        const row = transactionsTable.insertRow();
        row.insertCell(0).textContent = new Date(t.transaction_date).toLocaleDateString();
        row.insertCell(1).textContent = t.category_name || '-';
        row.insertCell(2).textContent = t.description || '';
        const amountValue = parseFloat(t.amount);
        const amountCell = row.insertCell(3);
        amountCell.textContent = `${amountValue.toFixed(2)} €`;
        amountCell.className = t.type === 'income' ? 'income' : 'expense';
        const actionCell = row.insertCell(4);
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = () => handleDeleteTransaction(t.id);
        actionCell.appendChild(deleteBtn);
    }
}

// ========== ZUSAMMENFASSUNG ==========
async function loadSummary() {
    const { start, end } = getMonthRange();
    const summary = await getSummary(start, end);
    const totalIncome = parseFloat(summary.total_income) || 0;
    const totalExpense = parseFloat(summary.total_expense) || 0;
    const balance = parseFloat(summary.balance) || 0;
    if (totalIncomeSpan) totalIncomeSpan.textContent = `${totalIncome.toFixed(2)} €`;
    if (totalExpenseSpan) totalExpenseSpan.textContent = `${totalExpense.toFixed(2)} €`;
    if (balanceSpan) balanceSpan.textContent = `${balance.toFixed(2)} €`;
}

// ========== REFRESH ==========
async function refreshAll() {
    await loadTransactions();
    await loadSummary();
    await loadAITip();
    await updateChart();
    await loadSavings();
}

// ========== SPARBUCH ==========
async function loadSavings() {
    const savingsList = document.getElementById('savings-list');
    if (!savingsList) return;
    
    try {
        const savings = await getSavings();
        if (savings.length === 0) {
            savingsList.innerHTML = '<div class="empty-message">Keine Sparbücher vorhanden. Klicke auf "Neues Sparbuch"!</div>';
            return;
        }
        
        savingsList.innerHTML = savings.map(s => {
            const progress = (s.current_amount / s.target_amount) * 100;
            const isCompleted = s.current_amount >= s.target_amount;
            return `
                <div class="savings-item ${isCompleted ? 'completed' : ''}">
                    <div class="savings-header">
                        <span class="savings-name">${escapeHtml(s.name)}</span>
                        <span class="savings-target">🎯 ${s.target_amount}€</span>
                    </div>
                    <div class="savings-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                        </div>
                        <span class="savings-current">${s.current_amount}€ / ${s.target_amount}€</span>
                    </div>
                    <div class="savings-actions">
                        <button class="savings-add" data-id="${s.id}">➕ Einzahlen</button>
                        <button class="savings-remove" data-id="${s.id}">➖ Auszahlen</button>
                        <button class="savings-edit" data-id="${s.id}" data-name="${escapeHtml(s.name)}" data-target="${s.target_amount}" data-current="${s.current_amount}">✏️ Bearbeiten</button>
                        <button class="savings-delete" data-id="${s.id}">🗑️ Löschen</button>
                    </div>
                </div>
            `;
        }).join('');
        
        document.querySelectorAll('.savings-add').forEach(btn => {
            btn.removeEventListener('click', handleSavingsAdd);
            btn.addEventListener('click', handleSavingsAdd);
        });
        
        document.querySelectorAll('.savings-remove').forEach(btn => {
            btn.removeEventListener('click', handleSavingsRemove);
            btn.addEventListener('click', handleSavingsRemove);
        });
        
        document.querySelectorAll('.savings-edit').forEach(btn => {
            btn.removeEventListener('click', handleSavingsEdit);
            btn.addEventListener('click', handleSavingsEdit);
        });
        
        document.querySelectorAll('.savings-delete').forEach(btn => {
            btn.removeEventListener('click', handleSavingsDelete);
            btn.addEventListener('click', handleSavingsDelete);
        });
        
    } catch (error) {
        console.error('Fehler beim Laden der Sparbücher:', error);
        savingsList.innerHTML = '<div class="empty-message">Fehler beim Laden</div>';
    }
}

// Handler-Funktionen für Sparbuch
async function handleSavingsAdd(e) {
    const id = e.currentTarget.dataset.id;
    const amountInput = prompt('Betrag einzahlen (€):');
    if (!amountInput) return;
    
    // Ersetze Komma durch Punkt und parse
    const amount = parseFloat(amountInput.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
        alert('Bitte einen gültigen Betrag eingeben (z.B. 50 oder 50,50)');
        return;
    }
    
    // Runde auf 2 Dezimalstellen
    const roundedAmount = Math.round(amount * 100) / 100;
    
    console.log('Einzahlen:', { id, amount: roundedAmount });
    
    try {
        const result = await savingsTransaction(id, roundedAmount, 'add');
        console.log('Ergebnis:', result);
        await loadSavings();
        alert(`✅ ${roundedAmount}€ wurden eingezahlt!`);
    } catch (error) {
        console.error('Fehler beim Einzahlen:', error);
        alert('Fehler beim Einzahlen: ' + error.message);
    }
}

async function handleSavingsRemove(e) {
    const id = e.currentTarget.dataset.id;
    const amount = prompt('Betrag auszahlen (€):');
    if (amount && !isNaN(amount) && amount > 0) {
        await savingsTransaction(id, parseFloat(amount), 'remove');
        loadSavings();
    }
}

function handleSavingsEdit(e) {
    const id = e.currentTarget.dataset.id;
    const name = e.currentTarget.dataset.name;
    const target = parseFloat(e.currentTarget.dataset.target);
    const current = parseFloat(e.currentTarget.dataset.current);
    
    const newName = prompt('Neuer Name:', name);
    const newTarget = prompt('Neues Ziel (€):', target);
    const newCurrent = prompt('Aktueller Stand (€):', current);
    if (newName && newTarget && newCurrent) {
        updateSavings(id, newName, parseFloat(newTarget), parseFloat(newCurrent))
            .then(() => loadSavings());
    }
}

async function handleSavingsDelete(e) {
    const id = e.currentTarget.dataset.id;
    if (confirm('Sparbuch wirklich löschen?')) {
        await deleteSavings(id);
        loadSavings();
    }
}

// Neues Sparbuch Button
const addSavingsBtn = document.getElementById('add-savings-btn');
if (addSavingsBtn) {
    addSavingsBtn.addEventListener('click', () => {
        const name = prompt('Name des Sparbuchs (z.B. "Urlaub 2025"):');
        const target = prompt('Sparziel (€):');
        if (name && target) {
            createSavings(name, parseFloat(target), 0)
                .then(() => loadSavings());
        }
    });
}

// ========== CSV EXPORT ==========
async function exportToCSV() {
    const { start, end } = getMonthRange();
    const transactions = await getTransactions(start, end);
    const headers = ['Datum', 'Typ', 'Kategorie', 'Beschreibung', 'Betrag (€)'];
    const rows = transactions.map(t => [
        t.transaction_date,
        t.type === 'income' ? 'Einnahme' : 'Ausgabe',
        t.category_name || '-',
        t.description || '',
        parseFloat(t.amount).toFixed(2)
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `finanzen_${currentYear}_${currentMonth + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Event Listener für CSV-Button
const exportBtn = document.getElementById('export-csv-btn');
if (exportBtn) {
    exportBtn.addEventListener('click', exportToCSV);
}

// ========== FORMULAR ==========
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = parseFloat(amountInput.value);
        const type = typeSelect.value;
        const category_id = categorySelect.value ? parseInt(categorySelect.value) : null;
        const description = descriptionInput.value.trim();
        const transaction_date = dateInput.value || new Date().toISOString().slice(0,10);
        if (isNaN(amount) || amount <= 0) { alert('Bitte gültigen Betrag eingeben'); return; }
        try {
            await createTransaction({ amount, type, category_id, description, transaction_date });
            amountInput.value = '';
            descriptionInput.value = '';
            dateInput.value = '';
            await refreshAll();
        } catch (error) { alert('Fehler: ' + error.message); }
    });
}

// ========== DIAGRAMM ==========
async function updateChart() {
    const { start, end } = getMonthRange();
    const transactions = await getTransactions(start, end);
    
    const expensesByCategory = {};
    transactions.forEach(t => {
        if (t.type === 'expense' && t.category_name) {
            const category = t.category_name;
            expensesByCategory[category] = (expensesByCategory[category] || 0) + parseFloat(t.amount);
        }
    });
    
    const categories = Object.keys(expensesByCategory);
    const amounts = Object.values(expensesByCategory);
    const ctx = document.getElementById('expense-chart')?.getContext('2d');
    
    if (!ctx) return;
    
    if (expenseChart) expenseChart.destroy();
    
    if (categories.length > 0) {
        expenseChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: ['#667eea', '#48bb78', '#f56565', '#ed8936', '#9f7aea', '#fbbf24', '#38b2ac'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'right' }
                }
            }
        });
    } else {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = '16px Inter';
        ctx.fillStyle = '#718096';
        ctx.textAlign = 'center';
        ctx.fillText('Keine Ausgaben im aktuellen Monat', ctx.canvas.width / 2, ctx.canvas.height / 2);
    }
}

// ========== INIT ==========
async function init() {
    loadUser();
    updateMonthDisplay();
    try {
        await loadCategories();
        await refreshAll();
    } catch (error) {
        console.error('Init Fehler:', error);
    }
}

init();

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}