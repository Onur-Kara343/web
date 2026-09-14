// ===== Kurio – main.js =====
// Live-Währungskurse via Frankfurter API (EZB) + Fallback open.er-api.com

const API = 'https://api.frankfurter.dev/v1';
const API_FALLBACK = 'https://open.er-api.com/v6/latest/EUR';

const STORE_FROM = 'kurio_from';
const STORE_TO = 'kurio_to';

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// ---------- Währungen (viele Länder!) ----------
const CURRENCIES = {
  EUR: '🇪🇺 Euro',
  USD: '🇺🇸 US-Dollar',
  GBP: '🇬🇧 Britisches Pfund',
  JPY: '🇯🇵 Japanischer Yen',
  CHF: '🇨🇭 Schweizer Franken',
  CAD: '🇨🇦 Kanadischer Dollar',
  AUD: '🇦🇺 Australischer Dollar',
  NZD: '🇳🇿 Neuseeland-Dollar',
  CNY: '🇨🇳 Chinesischer Yuan',
  HKD: '🇭🇰 Hongkong-Dollar',
  SGD: '🇸🇬 Singapur-Dollar',
  KRW: '🇰🇷 Südkoreanischer Won',
  INR: '🇮🇳 Indische Rupie',
  IDR: '🇮🇩 Indonesische Rupiah',
  MYR: '🇲🇾 Malaysischer Ringgit',
  THB: '🇹🇭 Thailändischer Baht',
  PHP: '🇵🇭 Philippinischer Peso',
  VND: '🇻🇳 Vietnamesischer Dong',
  TRY: '🇹🇷 Türkische Lira',
  RUB: '🇷🇺 Russischer Rubel',
  PLN: '🇵🇱 Polnischer Złoty',
  CZK: '🇨🇿 Tschechische Krone',
  HUF: '🇭🇺 Ungarischer Forint',
  RON: '🇷🇴 Rumänischer Leu',
  BGN: '🇧🇬 Bulgarischer Lew',
  HRK: '🇭🇷 Kroatische Kuna',
  SEK: '🇸🇪 Schwedische Krone',
  NOK: '🇳🇴 Norwegische Krone',
  DKK: '🇩🇰 Dänische Krone',
  ISK: '🇮🇸 Isländische Krone',
  MXN: '🇲🇽 Mexikanischer Peso',
  BRL: '🇧🇷 Brasilianischer Real',
  ARS: '🇦🇷 Argentinischer Peso',
  CLP: '🇨🇱 Chilenischer Peso',
  COP: '🇨🇴 Kolumbianischer Peso',
  PEN: '🇵🇪 Peruanischer Sol',
  ZAR: '🇿🇦 Südafrikanischer Rand',
  EGP: '🇪🇬 Ägyptisches Pfund',
  MAD: '🇲🇦 Marokkanischer Dirham',
  NGN: '🇳🇬 Nigerianische Naira',
  KES: '🇰🇪 Kenianischer Schilling',
  ILS: '🇮🇱 Israelischer Schekel',
  AED: '🇦🇪 VAE-Dirham',
  SAR: '🇸🇦 Saudi-Riyal',
  QAR: '🇶🇦 Katar-Riyal',
  KWD: '🇰🇼 Kuwait-Dinar',
  PKR: '🇵🇰 Pakistanische Rupie',
  BDT: '🇧🇩 Bangladesch-Taka',
  LKR: '🇱🇰 Sri-Lanka-Rupie',
  NPR: '🇳🇵 Nepalesische Rupie'
};

// ---------- State ----------
let rates = {};               // Kurse relativ zu EUR
let fromCurrency = localStorage.getItem(STORE_FROM) || 'EUR';
let toCurrency = localStorage.getItem(STORE_TO) || 'USD';
let chart = null;
let currentRange = 30;
let prevRate = null;          // Für Veränderung in %

// ---------- Helpers ----------
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2000);
}

function formatNumber(n, digits = 4) {
  if (n === undefined || n === null || isNaN(n)) return '–';
  if (n >= 1000) return n.toLocaleString('de-DE', { maximumFractionDigits: 2 });
  if (n >= 1)    return n.toLocaleString('de-DE', { maximumFractionDigits: digits });
  return n.toLocaleString('de-DE', { maximumFractionDigits: 6 });
}

// Kurs von A nach B (beide relativ zu EUR)
function getRate(from, to) {
  if (!rates[from] || !rates[to]) return null;
  return rates[to] / rates[from];
}

// ---------- API ----------
async function fetchRates() {
  setStatus('loading');
  try {
    const res = await fetch(`${API}/latest?from=EUR`);
    if (!res.ok) throw new Error('Frankfurter fehlgeschlagen');
    const data = await res.json();
    rates = { EUR: 1, ...data.rates };
    setStatus('live');
    return true;
  } catch (e) {
    console.warn('Primär-API fehlgeschlagen, versuche Fallback…');
    try {
      const res = await fetch(API_FALLBACK);
      const data = await res.json();
      if (!data.rates) throw new Error('Fallback fehlgeschlagen');
      rates = data.rates;
      setStatus('live');
      return true;
    } catch (e2) {
      setStatus('error');
      toast('Kurse konnten nicht geladen werden');
      return false;
    }
  }
}

// Historische Daten für Chart
async function fetchHistory(from, to, days) {
  try {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    const fmt = (d) => d.toISOString().slice(0, 10);

    const url = `${API}/${fmt(start)}..${fmt(end)}?from=${from}&to=${to}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const data = await res.json();

    const labels = Object.keys(data.rates);
    const values = labels.map(d => data.rates[d][to]);
    return { labels, values };
  } catch {
    return null;
  }
}

function setStatus(state) {
  const dot = $('#status-dot');
  const txt = $('#status-text');
  dot.className = 'dot';
  if (state === 'live') {
    dot.classList.add('live');
    txt.textContent = 'Live · EZB-Daten';
  } else if (state === 'loading') {
    txt.textContent = 'Lade Kurse…';
  } else if (state === 'error') {
    dot.classList.add('error');
    txt.textContent = 'Offline';
  }
}

// ---------- UI Aufbau ----------
function fillSelect(select, selected) {
  select.innerHTML = '';
  Object.entries(CURRENCIES).forEach(([code, name]) => {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = `${code} – ${name}`;
    if (code === selected) opt.selected = true;
    select.appendChild(opt);
  });
  // Falls die gewählte Währung nicht in der Liste ist → hinzufügen
  if (!CURRENCIES[selected]) {
    const opt = document.createElement('option');
    opt.value = selected;
    opt.textContent = selected;
    opt.selected = true;
    select.appendChild(opt);
  }
}

// ---------- Hero + Converter + Popular ----------
function updateHero() {
  const rate = getRate(fromCurrency, toCurrency);
  $('#hero-from').textContent = fromCurrency;
  $('#hero-to').textContent = toCurrency;
  $('#hero-value').textContent = rate ? formatNumber(rate) : '–';
  $('#hero-updated').textContent = 'Jetzt: ' + new Date().toLocaleTimeString('de-DE');

  const changeEl = $('#hero-change');
  if (prevRate !== null && rate !== null) {
    const diff = ((rate - prevRate) / prevRate) * 100;
    if (Math.abs(diff) < 0.001) {
      changeEl.className = 'change neutral';
      changeEl.textContent = '±0.00 %';
    } else if (diff > 0) {
      changeEl.className = 'change up';
      changeEl.textContent = `▲ +${diff.toFixed(2)} %`;
    } else {
      changeEl.className = 'change down';
      changeEl.textContent = `▼ ${diff.toFixed(2)} %`;
    }
  } else {
    changeEl.className = 'change neutral';
    changeEl.textContent = '–';
  }
  if (rate !== null) prevRate = rate;
}

function updateConverter() {
  const amount = parseFloat($('#amount').value) || 0;
  const rate = getRate(fromCurrency, toCurrency);
  if (!rate) {
    $('#converted-value').textContent = '–';
    $('#converted-hint').textContent = '–';
    return;
  }
  const result = amount * rate;
  $('#converted-value').textContent = `${formatNumber(result, 2)} ${toCurrency}`;
  $('#converted-hint').textContent = `1 ${fromCurrency} = ${formatNumber(rate)} ${toCurrency}`;
}

function renderPopular() {
  const pairs = [
    ['EUR', 'USD'], ['EUR', 'GBP'], ['EUR', 'CHF'], ['EUR', 'JPY'],
    ['USD', 'JPY'], ['USD', 'GBP'], ['GBP', 'USD'], ['EUR', 'TRY']
  ];
  const list = $('#popular-list');
  list.innerHTML = '';
  pairs.forEach(([f, t]) => {
    const r = getRate(f, t);
    const li = document.createElement('li');
    li.className = 'popular-item';
    li.innerHTML = `
      <span class="pair">${f} → ${t}</span>
      <span class="val">${r ? formatNumber(r) : '–'}</span>
    `;
    li.addEventListener('click', () => {
      fromCurrency = f;
      toCurrency = t;
      $('#from-currency').value = f;
      $('#to-currency').value = t;
      localStorage.setItem(STORE_FROM, f);
      localStorage.setItem(STORE_TO, t);
      refreshAll();
    });
    list.appendChild(li);
  });
}

// ---------- Chart ----------
async function renderChart() {
  const hint = $('#chart-hint');
  hint.textContent = 'Verlauf wird geladen…';

  const history = await fetchHistory(fromCurrency, toCurrency, currentRange);

  if (!history || history.values.length === 0) {
    hint.textContent = 'Keine Verlaufsdaten verfügbar.';
    if (chart) { chart.destroy(); chart = null; }
    return;
  }

  hint.textContent = `${history.values.length} Datenpunkte · ${fromCurrency} → ${toCurrency}`;

  const ctx = $('#rate-chart').getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 280);
  grad.addColorStop(0, 'rgba(16,185,129,0.35)');
  grad.addColorStop(1, 'rgba(16,185,129,0)');

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: history.labels,
      datasets: [{
        label: `${fromCurrency} → ${toCurrency}`,
        data: history.values,
        borderColor: '#10b981',
        backgroundColor: grad,
        borderWidth: 2.5,
        tension: 0.35,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#10b981',
        pointHoverBorderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(11,18,32,0.95)',
          borderColor: '#10b981',
          borderWidth: 1,
          padding: 10,
          titleColor: '#e6edf7',
          bodyColor: '#10b981',
          callbacks: {
            label: (ctx) => `1 ${fromCurrency} = ${formatNumber(ctx.parsed.y)} ${toCurrency}`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#8a94a8', maxTicksLimit: 8, font: { size: 11 } }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            color: '#8a94a8',
            font: { size: 11 },
            callback: (v) => formatNumber(v)
          }
        }
      }
    }
  });
}

// ---------- Refresh ----------
async function refreshAll() {
  updateHero();
  updateConverter();
  renderPopular();
  await renderChart();
}

// ---------- Events ----------
$('#from-currency').addEventListener('change', (e) => {
  fromCurrency = e.target.value;
  localStorage.setItem(STORE_FROM, fromCurrency);
  refreshAll();
});
$('#to-currency').addEventListener('change', (e) => {
  toCurrency = e.target.value;
  localStorage.setItem(STORE_TO, toCurrency);
  refreshAll();
});
$('#amount').addEventListener('input', updateConverter);
$('#swap-btn').addEventListener('click', () => {
  [fromCurrency, toCurrency] = [toCurrency, fromCurrency];
  $('#from-currency').value = fromCurrency;
  $('#to-currency').value = toCurrency;
  localStorage.setItem(STORE_FROM, fromCurrency);
  localStorage.setItem(STORE_TO, toCurrency);
  refreshAll();
  toast('Getauscht ⇄');
});

$$('.range-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.range-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentRange = parseInt(btn.dataset.range, 10);
    renderChart();
  });
});

// ---------- Init ----------
(async function init() {
  fillSelect($('#from-currency'), fromCurrency);
  fillSelect($('#to-currency'), toCurrency);
  await fetchRates();
  await refreshAll();

  // Auto-Refresh alle 5 Minuten
  setInterval(async () => {
    await fetchRates();
    updateHero();
    updateConverter();
    renderPopular();
  }, 5 * 60 * 1000);
})();