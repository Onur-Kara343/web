// ============================================================
// QRY – Premium / Lemon Squeezy
// ============================================================

const buyBtn = document.getElementById('premiumBuyBtn');

const LEMON_STORE = 'your-store-id';
const LEMON_PRODUCT = 'your-product-id';

buyBtn.addEventListener('click', async () => {
    const token = localStorage.getItem('qry_token');
    const user = JSON.parse(localStorage.getItem('qry_user') || 'null');

    if (!token || !user) {
        window.showAuthModal('login');
        alert('Bitte melde dich zuerst an.');
        return;
    }

    try {
        const data = await window.apiRequest('/premium/checkout', {
            method: 'POST',
            body: JSON.stringify({
                userId: user.id,
                email: user.email,
                productId: LEMON_PRODUCT,
            }),
        });

        if (data.checkoutUrl) {
            window.location.href = data.checkoutUrl;
        } else {
            alert('Fehler beim Starten des Kaufs. Bitte versuche es später erneut.');
        }
    } catch (err) {
        console.error('Premium error:', err);
        alert('Fehler: ' + err.message);
    }
});

// ----- VERIFY PURCHASE -----
async function verifyPurchase(orderId) {
    try {
        const data = await window.apiRequest('/premium/verify', {
            method: 'POST',
            body: JSON.stringify({ orderId }),
        });

        if (data.success) {
            const user = JSON.parse(localStorage.getItem('qry_user') || '{}');
            user.isPremium = true;
            user.premiumSince = new Date().toISOString();
            localStorage.setItem('qry_user', JSON.stringify(user));

            window.updateUI(user);
            alert('🎉 Premium erfolgreich aktiviert!');
            window.navigate('dashboard');
            if (window.loadDashboard) window.loadDashboard();
        } else {
            alert('Verifizierung fehlgeschlagen. Bitte kontaktiere den Support.');
        }
    } catch (err) {
        console.error('Verify error:', err);
        alert('Fehler bei der Verifizierung.');
    }
}

// ----- CHECK RETURN -----
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order_id');
    const status = params.get('status');
    if (orderId && status === 'success') {
        verifyPurchase(orderId);
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

// ----- FAQ TOGGLE (on premium page) -----
document.querySelectorAll('.premium-faq .faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
        const answer = btn.nextElementSibling;
        const isOpen = answer.classList.contains('open');
        btn.classList.toggle('active');
        answer.classList.toggle('open');
    });
});

// ----- FAQ PAGE TOGGLE -----
document.querySelectorAll('.faq-item .faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
        const answer = btn.nextElementSibling;
        btn.classList.toggle('active');
        answer.classList.toggle('open');
    });
});