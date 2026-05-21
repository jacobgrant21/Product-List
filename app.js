const BUILD_ID = 'UI-REFRESH-2026-05-21-1918UTC';

const products = [
  { part: '04-906', desc: 'Radex - Airline Filter', prices: { Main: 601.78, FNL: 601.78, Grainger: 566.79 } },
  { part: '08-400-01', desc: 'RPB GX4 Gas Monitor - 10ppm CO', prices: { Main: 1952.23, FNL: 1952.23, Grainger: 1952.23 } },
  { part: 'NV2028', desc: '25ft Breathing Airline', prices: { Main: 111.74, FNL: 108.49, Grainger: 105.33 } },
  { part: 'NV2029', desc: '50ft Breathing Airline', prices: { Main: 154.64, FNL: 150.14, Grainger: 145.77 } },
  { part: 'NV2027', desc: '100ft Breathing Airline', prices: { Main: 291.27, FNL: 282.75, Grainger: 274.55 } },
  { part: '16-015-23', desc: 'Z-Link Tychem 4000 + C40', prices: { Main: 817.59, FNL: 817.59, Grainger: 817.59 } },
  { part: '17-015-12', desc: 'T-Link Hard Hat Tychem 2000 + C40', prices: { Main: 644.38, FNL: 644.38, Grainger: 644.38 } },
];

const distributors = ['Main', 'FNL', 'Grainger'];
let selectedDistributor = 'Main';
let kit = [];
const assistantState = { pending: null, draft: {} };

const $ = (id) => document.getElementById(id);
const fmt = (n) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const getPrice = (p) => p.prices[selectedDistributor] ?? p.prices.Main ?? 0;

function renderDistributors() {
  $('distributorSelect').innerHTML = distributors.map((d) => `<option ${d === selectedDistributor ? 'selected' : ''}>${d}</option>`).join('');
}

function renderCatalog() {
  const term = $('search').value.toLowerCase();
  $('productList').innerHTML = products.filter((p) => `${p.part} ${p.desc}`.toLowerCase().includes(term)).map((p) => `
    <div class="product">
      <div class="img">${p.part.slice(0, 6)}</div>
      <div><b>${p.part}</b><div>${p.desc}</div><small>${fmt(getPrice(p))} (${selectedDistributor})</small></div>
      <button data-add="${p.part}">Add</button>
    </div>
  `).join('');
  document.querySelectorAll('[data-add]').forEach((btn) => {
    btn.onclick = () => addPart(btn.dataset.add);
  });
}

function addPart(part, qty = 1) {
  const p = products.find((x) => x.part === part);
  if (!p) return;
  const existing = kit.find((k) => k.part === part);
  if (existing) existing.qty += qty;
  else kit.push({ ...p, qty });
  renderSheet();
}

function renderSheet() {
  const mode = $('priceMode').value;
  $('priceColHead').style.visibility = mode === 'customer' ? 'hidden' : 'visible';
  let total = 0;

  $('sheetPreview').innerHTML = kit.map((k, i) => {
    const price = getPrice(k);
    const ext = price * k.qty;
    total += ext;
    return `<div class="row">
      <div><b>${k.part}</b></div>
      <div>${k.desc}</div>
      <div><input type="number" min="1" value="${k.qty}" data-qty="${i}"/></div>
      <div>${mode === 'distributor' ? fmt(price) : ''}</div>
      <div>${mode === 'distributor' ? fmt(ext) : ''}</div>
      <div><button class="ghost" data-rm="${i}">x</button></div>
    </div>`;
  }).join('');

  document.querySelectorAll('[data-rm]').forEach((b) => {
    b.onclick = () => {
      kit.splice(Number(b.dataset.rm), 1);
      renderSheet();
    };
  });

  document.querySelectorAll('[data-qty]').forEach((q) => {
    q.onchange = () => {
      const i = Number(q.dataset.qty);
      kit[i].qty = Math.max(1, Number(q.value) || 1);
      renderSheet();
    };
  });

  $('itemCount').textContent = kit.reduce((a, b) => a + b.qty, 0);
  $('sheetTotal').textContent = mode === 'distributor' ? fmt(total) : 'Hidden in customer PDF';
}

function bot(text) { const d = document.createElement('div'); d.className = 'bubble bot'; d.textContent = text; $('chatLog').appendChild(d); }
function user(text) { const d = document.createElement('div'); d.className = 'bubble user'; d.textContent = text; $('chatLog').appendChild(d); }

function preloadDemoKit() {
  kit = [];
  addPart('16-015-23', 8);
  addPart('04-906', 1);
  addPart('08-400-01', 1);
  addPart('NV2028', 8);
  bot('Loaded demo 8-user kit.');
}

function handleAssistant(msg) {
  const t = msg.toLowerCase();

  if (assistantState.pending === 'respirator') {
    if (t.includes('z')) assistantState.draft.respirator = 'z';
    else if (t.includes('t')) assistantState.draft.respirator = 't';
    else return bot('Which respirator platform: Z-Link or T-Link?');
    assistantState.pending = 'filter';
    return bot('Filter setup: supplied air (Radex + GX4) or PAPR only?');
  }

  if (assistantState.pending === 'filter') {
    if (t.includes('supplied')) assistantState.draft.filter = 'supplied';
    else if (t.includes('papr')) assistantState.draft.filter = 'papr';
    else return bot('I need filter setup: supplied air or PAPR only.');
    assistantState.pending = 'airline';
    return bot('Airline length: 25, 50, or 100 ft?');
  }

  if (assistantState.pending === 'airline') {
    const len = t.includes('100') ? 'NV2027' : t.includes('50') ? 'NV2029' : t.includes('25') ? 'NV2028' : null;
    if (!len) return bot('Please pick airline length: 25, 50, or 100 ft.');
    addPart(assistantState.draft.respirator === 'z' ? '16-015-23' : '17-015-12');
    if (assistantState.draft.filter === 'supplied') { addPart('04-906'); addPart('08-400-01'); }
    addPart(len);
    assistantState.pending = null;
    assistantState.draft = {};
    return bot('Done. Kit built and added to quote.');
  }

  if (t.includes('build') || t.includes('kit')) {
    assistantState.pending = 'respirator';
    return bot('Sure — which respirator platform: Z-Link or T-Link?');
  }

  const match = products.find((p) => t.includes(p.part.toLowerCase()));
  if (match) {
    addPart(match.part);
    return bot(`Added ${match.part}.`);
  }

  bot('Say "build a kit" or give a part number. I will ask follow-up questions instead of guessing.');
}

$('buildStamp').textContent = `Build: ${BUILD_ID}`;
$('search').oninput = renderCatalog;
$('priceMode').onchange = renderSheet;
$('distributorSelect').onchange = () => { selectedDistributor = $('distributorSelect').value; renderCatalog(); renderSheet(); };
$('manualDistributor').onchange = () => {
  const name = $('manualDistributor').value.trim();
  if (!name) return;
  if (!distributors.includes(name)) distributors.push(name);
  selectedDistributor = name;
  renderDistributors();
  renderCatalog();
  renderSheet();
};
$('downloadBtn').onclick = () => window.print();
$('clearBtn').onclick = () => { kit = []; renderSheet(); };
$('loadDemoBtn').onclick = preloadDemoKit;
$('chatSend').onclick = () => {
  const q = $('chatInput').value.trim();
  if (!q) return;
  user(q);
  handleAssistant(q);
  $('chatInput').value = '';
};

renderDistributors();
renderCatalog();
renderSheet();
bot('Ready. Ask me to build a kit or add a part.');
preloadDemoKit();
