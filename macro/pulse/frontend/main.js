// ============================================================
//  PULSE — Verkaufs-Cockpit
//  Jahres-Modus + Excel-Export + Monats-Diagramm
// ============================================================

const STORAGE_KEY = 'pulse-dashboard-v4';

let state = load();
let selectedMonth = 'all';

const CURRENT_YEAR = new Date().getFullYear();

// ---------- Monats-Namen ----------
const MONTH_NAMES = ['Januar','Februar','März','April','Mai','Juni',
                     'Juli','August','September','Oktober','November','Dezember'];

const MONTH_NAMES_SHORT = {
  '01':'Jan','02':'Feb','03':'Mär','04':'Apr','05':'Mai','06':'Jun',
  '07':'Jul','08':'Aug','09':'Sep','10':'Okt','11':'Nov','12':'Dez'
};

// ---------- Persistenz ----------
function load(){
  try{
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(raw && raw.sales && raw.costs) return raw;
  }catch{}
  return { sales: [], costs: [] };
}
function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ---------- Formatierung ----------
const fmt     = n => n.toLocaleString('de-DE', { style:'currency', currency:'EUR', maximumFractionDigits:0 });
const fmtFull = n => n.toLocaleString('de-DE', { style:'currency', currency:'EUR', minimumFractionDigits:2 });
const fmtShort = n => {
  const abs = Math.abs(n);
  if(abs >= 1000) return (n/1000).toFixed(abs >= 10000 ? 0 : 1).replace('.', ',') + 'k€';
  return Math.round(n) + '€';
};

function escapeXml(s){
  return String(s).replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
const uid = () => 'id_' + Date.now() + Math.random().toString(36).slice(2, 6);

// ---------- Monats-Helfer ----------
function monthKey(mIndex){ // mIndex 0–11
  return `${CURRENT_YEAR}-${String(mIndex + 1).padStart(2, '0')}`;
}
function monthLabel(key){
  const [y, m] = key.split('-');
  return `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
}
function monthShort(key){
  const m = parseInt(key.split('-')[1], 10);
  return MONTH_NAMES[m - 1];
}
function monthShortFromKey(key){
  const shortMonth = key.split('-')[1];
  return MONTH_NAMES_SHORT[shortMonth] || key;
}
function currentMonthKey(){
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// Füllt Dropdown mit 12 Monaten des aktuellen Jahres
function fillMonthSelect(sel, defaultKey){
  const options = [];
  for(let i = 0; i < 12; i++){
    const key = monthKey(i);
    options.push(`<option value="${key}">${MONTH_NAMES[i]}</option>`);
  }
  sel.innerHTML = options.join('');
  sel.value = defaultKey || currentMonthKey();
}

// ============================================================
//  FILTER
// ============================================================
function getFilteredSales(){
  if(selectedMonth === 'all') return state.sales;
  return state.sales.filter(s => s.month === selectedMonth);
}
function getFilteredCosts(){
  if(selectedMonth === 'all') return state.costs;
  return state.costs.filter(c => c.month === selectedMonth);
}

// ============================================================
//  BERECHNUNGEN
// ============================================================
function buildProducts(sales = getFilteredSales()){
  const map = new Map();
  sales.forEach(s => {
    const key = s.product.toLowerCase().trim();
    if(!map.has(key)){
      map.set(key, { name: s.product, category: s.category, qty: 0, revenue: 0 });
    }
    const p = map.get(key);
    p.qty     += s.qty;
    p.revenue += s.qty * s.price;
  });
  return [...map.values()];
}

function totalSalesRevenue(sales = getFilteredSales()){
  return sales.reduce((sum, s) => sum + s.qty * s.price, 0);
}
function totalSalesCount(sales = getFilteredSales()){
  return sales.reduce((sum, s) => sum + s.qty, 0);
}
function totalCosts(costs = getFilteredCosts()){
  return costs.reduce((sum, c) => sum + c.amount, 0);
}
function totalProfit(){
  return totalSalesRevenue() - totalCosts();
}
function profitMargin(){
  const r = totalSalesRevenue();
  return r > 0 ? (totalProfit() / r * 100) : 0;
}

// ============================================================
//  MONATS-DATEN
// ============================================================
function buildMonthlyData(){
  const months = new Map();

  state.sales.forEach(s => {
    const k = s.month;
    if(!months.has(k)) months.set(k, { key:k, revenue:0, cost:0, count:0 });
    const m = months.get(k);
    m.revenue += s.qty * s.price;
    m.count   += s.qty;
  });

  state.costs.forEach(c => {
    const k = c.month;
    if(!months.has(k)) months.set(k, { key:k, revenue:0, cost:0, count:0 });
    months.get(k).cost += c.amount;
  });

  return [...months.values()]
    .map(m => ({ ...m, profit: m.revenue - m.cost }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

function renderMonthFilter(){
  const sel = document.getElementById('monthFilter');
  const monthly = buildMonthlyData();
  const current = selectedMonth;

  sel.innerHTML = '<option value="all">Gesamt (alle Monate)</option>' +
    monthly.map(m => `<option value="${m.key}">${monthShort(m.key)}</option>`).join('');

  if(current !== 'all' && monthly.some(m => m.key === current)){
    sel.value = current;
  } else {
    sel.value = 'all';
    selectedMonth = 'all';
  }
}

// ============================================================
//  RENDERING: KPIs
// ============================================================
function renderOverviewKPIs(){
  const revenue = totalSalesRevenue();
  const costs   = totalCosts();
  const profit  = revenue - costs;
  const margin  = profitMargin();
  const products = buildProducts();
  const salesCount = totalSalesCount();

  document.getElementById('kpiRevenue').textContent = fmt(revenue);
  document.getElementById('kpiRevenueSub').textContent = `${salesCount} Verkäufe`;

  document.getElementById('kpiCost').textContent = fmt(costs);
  document.getElementById('kpiCostSub').textContent = `${getFilteredCosts().length} Posten`;

  document.getElementById('kpiProfit').textContent = fmt(profit);
  const marginEl = document.getElementById('kpiMargin');
  marginEl.textContent = `Marge ${margin.toFixed(0)} %`;
  marginEl.className = 'kpi-delta ' + (margin >= 0 ? 'up' : 'down');

  document.getElementById('kpiProducts').textContent = products.length;
  document.getElementById('kpiProductsSub').textContent = `${salesCount} verkauft gesamt`;
}

// ============================================================
//  RENDERING: Haupt-Liniendiagramm — PRO MONAT
// ============================================================
function renderOverviewChart(){
  const wrap = document.getElementById('chartWrap');
  const monthly = buildMonthlyData();

  if(monthly.length === 0){
    wrap.innerHTML = '<div class="empty">Noch keine Daten – leg im Tab „Verkäufe" los.</div>';
    document.getElementById('legRevenue').textContent = '0 €';
    document.getElementById('legCost').textContent = '0 €';
    document.getElementById('legProfit').textContent = '0 €';
    return;
  }

  // Wenn ein Monat gewählt ist → nur den zeigen
  const data = (selectedMonth === 'all')
    ? monthly
    : monthly.filter(m => m.key === selectedMonth);

  if(data.length === 0){
    wrap.innerHTML = '<div class="empty">Keine Daten für den gewählten Monat.</div>';
    return;
  }

  // Gesamtwerte für Legende
  const sumRevenue = data.reduce((a, m) => a + m.revenue, 0);
  const sumCost    = data.reduce((a, m) => a + m.cost, 0);
  const sumProfit  = sumRevenue - sumCost;
  document.getElementById('legRevenue').textContent = fmt(sumRevenue);
  document.getElementById('legCost').textContent    = fmt(sumCost);
  document.getElementById('legProfit').textContent  = fmt(sumProfit);

  // ---------- Layout ----------
  const W = 760, H = 340;
  const pad = { top: 30, right: 32, bottom: 62, left: 70 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  // ---------- Skala ----------
  const allValues = data.flatMap(m => [m.revenue, m.cost, m.profit]);
  const rawMax = Math.max(...allValues, 1);
  const rawMin = Math.min(...allValues, 0);

  const niceMax = niceCeil(rawMax);
  const niceMin = rawMin < 0 ? -niceCeil(Math.abs(rawMin)) : 0;
  const range = niceMax - niceMin || 1;
  const gridSteps = 4;
  const stepValue = range / gridSteps;

  // ---------- Positionen ----------
  const n = data.length;
  const stepX = n > 1 ? innerW / (n - 1) : 0;
  const xPos = i => pad.left + (n > 1 ? i * stepX : innerW / 2);
  const yPos = v => pad.top + innerH - ((v - niceMin) / range) * innerH;

  const colors = {
    revenue: '#6c8cff',
    cost:    '#ff5c7c',
    profit:  '#33d69f'
  };

  const defs = `
    <defs>
      <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${colors.revenue}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="${colors.revenue}" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${colors.cost}" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="${colors.cost}" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${colors.profit}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="${colors.profit}" stop-opacity="0"/>
      </linearGradient>
    </defs>
  `;

  let svg = `<svg viewBox="0 0 ${W} ${H}" class="chart" preserveAspectRatio="xMidYMid meet">`;
  svg += defs;

  // Grid + Y-Achse
  for(let i = 0; i <= gridSteps; i++){
    const y = pad.top + (innerH / gridSteps) * i;
    const val = niceMax - stepValue * i;
    svg += `<line x1="${pad.left}" y1="${y}" x2="${W - pad.right}" y2="${y}"
              stroke="#222736" stroke-width="1" stroke-dasharray="${i === gridSteps ? '0' : '2 5'}"/>`;
    svg += `<text x="${pad.left - 12}" y="${y + 4}" text-anchor="end" class="axis-label">${fmtShort(val)}</text>`;
  }

  if(niceMin < 0){
    const y0 = yPos(0);
    svg += `<line x1="${pad.left}" y1="${y0}" x2="${W - pad.right}" y2="${y0}"
              stroke="#3a4152" stroke-width="1.5"/>`;
  }

  // Vertikale Orientierungslinien
  data.forEach((_, i) => {
    if(n === 1) return;
    const x = xPos(i);
    svg += `<line x1="${x}" y1="${pad.top}" x2="${x}" y2="${pad.top + innerH}"
              stroke="#1e2330" stroke-width="1"/>`;
  });

  // Smooth-Path
  function smoothPath(points){
    if(points.length < 2) return `M${points[0].x},${points[0].y}`;
    let d = `M${points[0].x},${points[0].y}`;
    for(let i = 0; i < points.length - 1; i++){
      const p0 = points[i], p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
    }
    return d;
  }

  function drawSeries(key, gradientId){
    const points = data.map((m, i) => ({ x: xPos(i), y: yPos(m[key]) }));
    const lineD = smoothPath(points);

    // Fläche nur bei mehreren Monaten
    if(points.length > 1){
      const areaD = lineD +
        ` L${points[points.length - 1].x},${pad.top + innerH}` +
        ` L${points[0].x},${pad.top + innerH} Z`;
      svg += `<path d="${areaD}" fill="url(#${gradientId})" stroke="none"/>`;
    }

    svg += `<path d="${lineD}" fill="none" stroke="${colors[key]}" stroke-width="2.5"
              stroke-linejoin="round" stroke-linecap="round"/>`;
  }

  drawSeries('cost', 'gradCost');
  drawSeries('revenue', 'gradRevenue');
  drawSeries('profit', 'gradProfit');

  // Punkte + Werte
  function drawPoints(key){
    data.forEach((m, i) => {
      const x = xPos(i), y = yPos(m[key]);
      svg += `<circle cx="${x}" cy="${y}" r="5" fill="${colors[key]}" stroke="#181b24" stroke-width="2.5"/>`;
      svg += `<text x="${x}" y="${y - 12}" text-anchor="middle"
                class="point-value" fill="${colors[key]}">${fmtShort(m[key])}</text>`;
    });
  }

  drawPoints('cost');
  drawPoints('revenue');
  drawPoints('profit');

  // X-Labels: kurze Monatsnamen
  data.forEach((m, i) => {
    const x = xPos(i);
    const label = monthShortFromKey(m.key);
    svg += `<text x="${x}" y="${H - pad.bottom + 26}" text-anchor="middle" class="x-label">${label}</text>`;
  });

  svg += `</svg>`;
  wrap.innerHTML = svg;
}

function niceCeil(v){
  if(v <= 0) return 0;
  const exp = Math.floor(Math.log10(v));
  const base = Math.pow(10, exp);
  const n = v / base;
  let nice;
  if(n <= 1) nice = 1;
  else if(n <= 2) nice = 2;
  else if(n <= 5) nice = 5;
  else nice = 10;
  return nice * base;
}

// ============================================================
//  RENDERING: Monats-Tabelle (alle 12 Monate)
// ============================================================
function renderMonthTable(){
  const wrap = document.getElementById('monthTableWrap');
  const monthlyMap = new Map(buildMonthlyData().map(m => [m.key, m]));

  let rows = '';
  for(let i = 0; i < 12; i++){
    const key = monthKey(i);
    const m = monthlyMap.get(key);
    if(m){
      const profitClass = m.profit >= 0 ? 'profit' : 'profit down';
      rows += `
        <tr>
          <td class="month-cell">${MONTH_NAMES[i]}</td>
          <td class="num rev">${fmtFull(m.revenue)}</td>
          <td class="num cost">${fmtFull(m.cost)}</td>
          <td class="num ${profitClass}">${m.profit >= 0 ? '+' : ''}${fmtFull(m.profit)}</td>
          <td class="num">${m.count}</td>
        </tr>
      `;
    } else {
      rows += `
        <tr class="empty-row">
          <td class="month-cell">${MONTH_NAMES[i]}</td>
          <td class="num">—</td>
          <td class="num">—</td>
          <td class="num">—</td>
          <td class="num">—</td>
        </tr>
      `;
    }
  }

  wrap.innerHTML = `
    <table class="month-table">
      <thead>
        <tr>
          <th>Monat</th>
          <th class="num">Umsatz</th>
          <th class="num">Kosten</th>
          <th class="num">Gewinn</th>
          <th class="num">Verkäufe</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// ============================================================
//  RENDERING: Produktliste
// ============================================================
function renderProductList(){
  const list = document.getElementById('productList');
  const products = buildProducts();
  document.getElementById('prodCount').textContent = products.length;

  if(products.length === 0){
    list.innerHTML = '<div class="empty">Noch keine Produkte. Erfasse Verkäufe im Verkaufs-Tab.</div>';
    return;
  }

  const totalRev  = totalSalesRevenue() || 1;
  const totalCost = totalCosts();

  const rows = products.map(p => {
    const costShare = totalCost * (p.revenue / totalRev);
    const profit    = p.revenue - costShare;
    return { ...p, cost: costShare, profit };
  }).sort((a, b) => b.profit - a.profit);

  list.innerHTML = rows.map(p => {
    const profitClass = p.profit >= 0 ? 'prod-profit' : 'prod-profit down';
    return `
      <div class="prod-item">
        <div class="prod-info">
          <div class="prod-name">${escapeXml(p.name)}</div>
          <div class="prod-meta">${p.category} · ${p.qty}× · Ø ${fmtFull(p.revenue / p.qty)}</div>
        </div>
        <div style="text-align:right">
          <div class="${profitClass}">${p.profit >= 0 ? '+' : ''}${fmtFull(p.profit)}</div>
          <div class="prod-meta">Umsatz ${fmtFull(p.revenue)}</div>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================
//  RENDERING: VERKÄUFE
// ============================================================
function renderSalesKPIs(){
  const revenue = totalSalesRevenue(state.sales);
  const count   = totalSalesCount(state.sales);
  const avg = count > 0 ? revenue / count : 0;

  document.getElementById('salesRevenue').textContent = fmt(revenue);
  document.getElementById('salesCount').textContent = count;
  document.getElementById('salesAvg').textContent = fmtFull(avg);

  const products = buildProducts(state.sales);
  const top = products.length ? products.reduce((a, b) => a.revenue > b.revenue ? a : b) : null;
  document.getElementById('salesTop').textContent = top ? top.name : '—';
}

function renderSalesMiniChart(){
  const wrap = document.getElementById('salesMiniChart');
  const sales = state.sales.slice(-10);

  if(sales.length === 0){
    wrap.innerHTML = '<div class="empty" style="padding:16px 0;font-size:0.8rem">Noch keine Verkäufe.</div>';
    return;
  }

  const W = 400, H = 140;
  const pad = { top:18, right:10, bottom:28, left:10 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const revenues = sales.map(s => s.qty * s.price);
  const maxVal = Math.max(...revenues, 1);
  const barW = innerW / sales.length;
  const bw = Math.min(barW * 0.65, 40);
  const gap = (barW - bw) / 2;
  const baseY = pad.top + innerH;

  let svg = `<svg viewBox="0 0 ${W} ${H}" class="mini-chart" preserveAspectRatio="xMidYMid meet">`;
  svg += `<line x1="${pad.left}" y1="${baseY}" x2="${W - pad.right}" y2="${baseY}" stroke="#262b38" stroke-width="1"/>`;

  sales.forEach((s, i) => {
    const v = revenues[i];
    const h = (v / maxVal) * innerH;
    const x = pad.left + i * barW + gap;
    const y = baseY - h;
    svg += `<rect x="${x}" y="${y}" width="${bw}" height="${Math.max(h, 2)}" rx="4" fill="var(--accent)" opacity="0.85"/>`;
    const label = s.product.length > 6 ? s.product.slice(0, 5) + '…' : s.product;
    svg += `<text x="${x + bw/2}" y="${baseY + 14}" text-anchor="middle" class="mini-label">${escapeXml(label)}</text>`;
  });

  svg += `</svg>`;
  wrap.innerHTML = svg;
}

function renderSalesList(){
  const list = document.getElementById('salesList');
  document.getElementById('salesListCount').textContent = state.sales.length;

  if(state.sales.length === 0){
    list.innerHTML = '<div class="empty">Noch keine Verkäufe erfasst.</div>';
    return;
  }

  const sorted = [...state.sales].sort((a, b) => {
    const d = b.month.localeCompare(a.month);
    return d !== 0 ? d : b.createdAt - a.createdAt;
  });

  list.innerHTML = sorted.map(s => {
    const total = s.qty * s.price;
    return `
      <div class="prod-item">
        <div class="prod-info">
          <div class="prod-name">${escapeXml(s.product)}</div>
          <div class="prod-meta">
            <span class="badge">${s.category}</span>
            ${s.qty}× ${fmtFull(s.price)} · ${monthShort(s.month)}
          </div>
        </div>
        <div style="text-align:right">
          <div class="prod-profit">+${fmtFull(total)}</div>
        </div>
        <button class="ghost" style="padding:6px 10px;font-size:0.75rem" data-del-sale="${s.id}">✕</button>
      </div>
    `;
  }).join('');

  list.querySelectorAll('[data-del-sale]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-del-sale');
      state.sales = state.sales.filter(s => s.id !== id);
      save(); renderAll();
    });
  });
}

// ============================================================
//  RENDERING: KOSTEN
// ============================================================
function renderCostsKPIs(){
  const total = totalCosts(state.costs);
  const count = state.costs.length;
  const fixed = state.costs.filter(c => c.type === 'Fixkosten').reduce((a, b) => a + b.amount, 0);
  const avg = count > 0 ? total / count : 0;

  document.getElementById('costTotal').textContent = fmt(total);
  document.getElementById('costCount').textContent = count;
  document.getElementById('costFixed').textContent = fmt(fixed);
  document.getElementById('costAvg').textContent = fmtFull(avg);
}

function renderCostsMiniChart(){
  const wrap = document.getElementById('costMiniChart');

  if(state.costs.length === 0){
    wrap.innerHTML = '<div class="empty" style="padding:16px 0;font-size:0.8rem">Noch keine Kosten.</div>';
    return;
  }

  const map = new Map();
  state.costs.forEach(c => {
    map.set(c.category, (map.get(c.category) || 0) + c.amount);
  });
  const entries = [...map.entries()].sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((a, [, v]) => a + v, 0);

  const W = 400, H = 140;
  const pad = { top:18, right:10, bottom:28, left:10 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const maxVal = Math.max(...entries.map(e => e[1]), 1);
  const barW = innerW / entries.length;
  const bw = Math.min(barW * 0.6, 44);
  const gap = (barW - bw) / 2;
  const baseY = pad.top + innerH;

  let svg = `<svg viewBox="0 0 ${W} ${H}" class="mini-chart" preserveAspectRatio="xMidYMid meet">`;
  svg += `<line x1="${pad.left}" y1="${baseY}" x2="${W - pad.right}" y2="${baseY}" stroke="#262b38" stroke-width="1"/>`;

  entries.forEach(([cat, val], i) => {
    const h = (val / maxVal) * innerH;
    const x = pad.left + i * barW + gap;
    const y = baseY - h;
    const pct = total > 0 ? Math.round(val / total * 100) : 0;
    svg += `<rect x="${x}" y="${y}" width="${bw}" height="${Math.max(h, 2)}" rx="4" fill="var(--red)" opacity="0.8"/>`;
    svg += `<text x="${x + bw/2}" y="${y - 4}" text-anchor="middle" class="mini-value">${pct}%</text>`;
    const label = cat.length > 8 ? cat.slice(0, 7) + '…' : cat;
    svg += `<text x="${x + bw/2}" y="${baseY + 14}" text-anchor="middle" class="mini-label">${escapeXml(label)}</text>`;
  });

  svg += `</svg>`;
  wrap.innerHTML = svg;
}

function renderCostsList(){
  const list = document.getElementById('costList');
  document.getElementById('costListCount').textContent = state.costs.length;

  if(state.costs.length === 0){
    list.innerHTML = '<div class="empty">Noch keine Kosten erfasst.</div>';
    return;
  }

  const sorted = [...state.costs].sort((a, b) => {
    const d = b.month.localeCompare(a.month);
    return d !== 0 ? d : b.createdAt - a.createdAt;
  });
  const typeClass = { 'Fixkosten':'fixed', 'Variable':'variable', 'Einmalig':'once' };

  list.innerHTML = sorted.map(c => `
    <div class="prod-item">
      <div class="prod-info">
        <div class="prod-name">${escapeXml(c.name)}</div>
        <div class="prod-meta">
          <span class="badge ${typeClass[c.type] || ''}">${c.type}</span>
          ${c.category} · ${monthShort(c.month)}
        </div>
      </div>
      <div style="text-align:right">
        <div class="prod-profit down">−${fmtFull(c.amount)}</div>
      </div>
      <button class="ghost" style="padding:6px 10px;font-size:0.75rem" data-del-cost="${c.id}">✕</button>
    </div>
  `).join('');

  list.querySelectorAll('[data-del-cost]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-del-cost');
      state.costs = state.costs.filter(c => c.id !== id);
      save(); renderAll();
    });
  });
}

// ============================================================
//  DATALIST
// ============================================================
function updateProductDatalist(){
  const dl = document.getElementById('productNames');
  const names = [...new Set(state.sales.map(s => s.product))];
  dl.innerHTML = names.map(n => `<option value="${escapeXml(n)}">`).join('');
}

// ============================================================
//  EXCEL EXPORT
// ============================================================
function exportYearToExcel(year){
  const monthly = buildMonthlyData();
  const monthMap = new Map(monthly.map(m => [m.key, m]));

  // --- Sheet 1: Monats-Übersicht ---
  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8">
      <style>
        table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11pt; }
        th, td { border: 1px solid #999; padding: 5px 10px; }
        th { background: #e8eaf0; font-weight: bold; }
        .num { text-align: right; }
        h2 { font-family: Arial, sans-serif; }
      </style>
    </head>
    <body>
      <h2>Pulse — Jahres-Abschluss ${year}</h2>
      <h3>Monats-Übersicht</h3>
      <table>
        <thead>
          <tr>
            <th>Monat</th>
            <th>Umsatz (€)</th>
            <th>Kosten (€)</th>
            <th>Gewinn (€)</th>
            <th>Verkäufe</th>
          </tr>
        </thead>
        <tbody>
  `;

  let totalRevenue = 0, totalCost = 0, totalSales = 0;
  for(let i = 0; i < 12; i++){
    const key = monthKey(i);
    const m = monthMap.get(key);
    const rev = m ? m.revenue : 0;
    const cost = m ? m.cost : 0;
    const profit = rev - cost;
    const sales = m ? m.count : 0;
    totalRevenue += rev;
    totalCost += cost;
    totalSales += sales;

    html += `
      <tr>
        <td>${MONTH_NAMES[i]}</td>
        <td class="num">${rev.toFixed(2).replace('.', ',')}</td>
        <td class="num">${cost.toFixed(2).replace('.', ',')}</td>
        <td class="num">${profit.toFixed(2).replace('.', ',')}</td>
        <td class="num">${sales}</td>
      </tr>
    `;
  }

  html += `
      <tr style="font-weight:bold;background:#f0f0f0">
        <td>GESAMT</td>
        <td class="num">${totalRevenue.toFixed(2).replace('.', ',')}</td>
        <td class="num">${totalCost.toFixed(2).replace('.', ',')}</td>
        <td class="num">${(totalRevenue - totalCost).toFixed(2).replace('.', ',')}</td>
        <td class="num">${totalSales}</td>
      </tr>
      </tbody></table>
  `;

  // --- Sheet 2: Alle Verkäufe ---
  html += `
    <br><br>
    <h3>Alle Verkäufe ${year}</h3>
    <table>
      <thead>
        <tr>
          <th>Monat</th>
          <th>Produkt</th>
          <th>Kategorie</th>
          <th>Stückpreis (€)</th>
          <th>Menge</th>
          <th>Gesamt (€)</th>
        </tr>
      </thead>
      <tbody>
  `;

  if(state.sales.length === 0){
    html += `<tr><td colspan="6" style="text-align:center;color:#888">Keine Verkäufe erfasst</td></tr>`;
  } else {
    const sortedSales = [...state.sales].sort((a, b) => a.month.localeCompare(b.month));
    sortedSales.forEach(s => {
      const total = s.qty * s.price;
      html += `
        <tr>
          <td>${monthShort(s.month)}</td>
          <td>${escapeHtml(s.product)}</td>
          <td>${escapeHtml(s.category)}</td>
          <td class="num">${s.price.toFixed(2).replace('.', ',')}</td>
          <td class="num">${s.qty}</td>
          <td class="num">${total.toFixed(2).replace('.', ',')}</td>
        </tr>
      `;
    });
  }

  html += `</tbody></table>`;

  // --- Sheet 3: Alle Kosten ---
  html += `
    <br><br>
    <h3>Alle Kosten ${year}</h3>
    <table>
      <thead>
        <tr>
          <th>Monat</th>
          <th>Bezeichnung</th>
          <th>Kategorie</th>
          <th>Typ</th>
          <th>Betrag (€)</th>
        </tr>
      </thead>
      <tbody>
  `;

  if(state.costs.length === 0){
    html += `<tr><td colspan="5" style="text-align:center;color:#888">Keine Kosten erfasst</td></tr>`;
  } else {
    const sortedCosts = [...state.costs].sort((a, b) => a.month.localeCompare(b.month));
    sortedCosts.forEach(c => {
      html += `
        <tr>
          <td>${monthShort(c.month)}</td>
          <td>${escapeHtml(c.name)}</td>
          <td>${escapeHtml(c.category)}</td>
          <td>${escapeHtml(c.type)}</td>
          <td class="num">${c.amount.toFixed(2).replace('.', ',')}</td>
        </tr>
      `;
    });
  }

  html += `</tbody></table>`;

  // --- Sheet 4: Produkte aggregiert ---
  const products = buildProducts(state.sales);
  html += `
    <br><br>
    <h3>Produkt-Übersicht ${year}</h3>
    <table>
      <thead>
        <tr>
          <th>Produkt</th>
          <th>Kategorie</th>
          <th>Verkäufe</th>
          <th>Umsatz (€)</th>
          <th>Ø Preis (€)</th>
        </tr>
      </thead>
      <tbody>
  `;

  if(products.length === 0){
    html += `<tr><td colspan="5" style="text-align:center;color:#888">Keine Produkte</td></tr>`;
  } else {
    products.sort((a, b) => b.revenue - a.revenue).forEach(p => {
      html += `
        <tr>
          <td>${escapeHtml(p.name)}</td>
          <td>${escapeHtml(p.category)}</td>
          <td class="num">${p.qty}</td>
          <td class="num">${p.revenue.toFixed(2).replace('.', ',')}</td>
          <td class="num">${(p.revenue / p.qty).toFixed(2).replace('.', ',')}</td>
        </tr>
      `;
    });
  }

  html += `</tbody></table></body></html>`;

  // --- Download ---
  const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Pulse_Jahresabschluss_${year}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================
//  MASTER RENDER
// ============================================================
function renderAll(){
  document.getElementById('yearLabel').textContent = CURRENT_YEAR;
  document.getElementById('bannerYear').textContent = CURRENT_YEAR;

  renderMonthFilter();
  renderOverviewKPIs();
  renderOverviewChart();
  renderMonthTable();
  renderProductList();
  renderSalesKPIs();
  renderSalesMiniChart();
  renderSalesList();
  renderCostsKPIs();
  renderCostsMiniChart();
  renderCostsList();
  updateProductDatalist();
}

// ============================================================
//  EVENTS
// ============================================================
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
  });
});

document.getElementById('saleForm').addEventListener('submit', e => {
  e.preventDefault();
  const product  = document.getElementById('sProduct').value.trim();
  const price    = parseFloat(document.getElementById('sPrice').value);
  const qty      = parseInt(document.getElementById('sQty').value);
  const category = document.getElementById('sCategory').value;
  const month    = document.getElementById('sMonth').value;

  if(!product || isNaN(price) || isNaN(qty) || !month) return;

  state.sales.push({ id: uid(), product, price, qty, category, month, createdAt: Date.now() });
  save();
  e.target.reset();
  document.getElementById('sQty').value = 1;
  fillMonthSelect(document.getElementById('sMonth'), month);
  renderAll();
});

document.getElementById('costForm').addEventListener('submit', e => {
  e.preventDefault();
  const name     = document.getElementById('cName').value.trim();
  const amount   = parseFloat(document.getElementById('cAmount').value);
  const type     = document.getElementById('cType').value;
  const category = document.getElementById('cCategory').value;
  const month    = document.getElementById('cMonth').value;

  if(!name || isNaN(amount) || !month) return;

  state.costs.push({ id: uid(), name, amount, type, category, month, createdAt: Date.now() });
  save();
  e.target.reset();
  fillMonthSelect(document.getElementById('cMonth'), month);
  renderAll();
});

document.getElementById('monthFilter').addEventListener('change', e => {
  selectedMonth = e.target.value;
  renderOverviewKPIs();
  renderOverviewChart();
  renderProductList();
});

// ============================================================
//  JAHR ABSCHLIESSEN
// ============================================================
document.getElementById('yearCloseBtn').addEventListener('click', () => {
  const year = CURRENT_YEAR;

  if(state.sales.length === 0 && state.costs.length === 0){
    alert('Es gibt keine Daten zum Exportieren.');
    return;
  }

  const ok = confirm(
    `Jahr ${year} abschließen?\n\n` +
    `① Alle Daten werden als Excel-Datei heruntergeladen\n` +
    `② Danach werden alle Daten aus Pulse gelöscht\n\n` +
    `Stelle sicher, dass du die Excel-Datei gespeichert hast, bevor du löschst.\n\n` +
    `Fortfahren?`
  );
  if(!ok) return;

  exportYearToExcel(year);

  setTimeout(() => {
    const wirklich = confirm(
      `Excel-Datei wurde heruntergeladen. ✅\n\n` +
      `Jetzt alle Daten aus Pulse löschen und mit ${year + 1} neu starten?\n\n` +
      `(Empfehlung: erst wenn du die Excel-Datei gespeichert hast)`
    );

    if(wirklich){
      state = { sales: [], costs: [] };
      selectedMonth = 'all';
      save();
      renderAll();

      alert(
        `✅ Alle Daten gelöscht!\n\n` +
        `Hinweis: Pulse nutzt intern noch das Jahr ${CURRENT_YEAR}.\n` +
        `Für das neue Jahr ${year + 1} passt du in der Datei main.js die Konstante CURRENT_YEAR an.`
      );
    }
  }, 600);
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if(confirm('Wirklich ALLE Daten löschen? (Kein Excel-Export!)')){
    state = { sales: [], costs: [] };
    selectedMonth = 'all';
    save();
    renderAll();
  }
});

// ============================================================
//  INIT
// ============================================================
fillMonthSelect(document.getElementById('sMonth'));
fillMonthSelect(document.getElementById('cMonth'));
renderAll();