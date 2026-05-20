const products = [
  {
    part: '04-906',
    desc: 'Radex - Airline Filter',
    category: 'filter_unit',
    priceByDistributor: { Main: 601.78, Grainger: 566.79, FNL: 601.78 },
    img: 'https://dummyimage.com/80x80/e9e9e9/333&text=04-906',
  },
  {
    part: '08-400-01',
    desc: 'RPB GX4 Gas Monitor',
    category: 'monitor',
    priceByDistributor: { Main: 1952.23, Grainger: 1952.23, FNL: 1952.23 },
    img: 'https://dummyimage.com/80x80/e9e9e9/333&text=08-400',
  },
  {
    part: 'NV2028',
    desc: '25ft Breathing Airline',
    category: 'airline_25',
    priceByDistributor: { Main: 111.74, Grainger: 105.33, FNL: 108.49 },
    img: 'https://dummyimage.com/80x80/e9e9e9/333&text=NV2028',
  },
  {
    part: '16-670',
    desc: 'Z-Link Weld Visor with ADF Lens',
    category: 'papr_zlink',
    priceByDistributor: { Main: 404.89, Grainger: 404.89, FNL: 404.89 },
    img: 'https://dummyimage.com/80x80/e9e9e9/333&text=16-670',
  },
  {
    part: '16-015-23',
    desc: 'Z-Link with Tychem 4000 Shoulder Cape, SAR Tube, C40',
    category: 'papr_zlink',
    priceByDistributor: { Main: 817.59, Grainger: 817.59, FNL: 817.59 },
    img: 'https://dummyimage.com/80x80/e9e9e9/333&text=16-015-23',
  },
  {
    part: '17-015-12',
    desc: 'T-Link Hard Hat Tychem 2000, Supplied Air + C40',
    category: 'papr_tlink',
    priceByDistributor: { Main: 644.38, Grainger: 644.38, FNL: 644.38 },
    img: 'https://dummyimage.com/80x80/e9e9e9/333&text=17-015-12',
  },
];

const distributors = ['Main', 'FNL', 'Grainger'];
let kit = [];
let selectedDistributor = distributors[0];
const assistantState = { pending: null, draft: {} };

const productList = document.getElementById('productList');
const sheetPreview = document.getElementById('sheetPreview');
const priceMode = document.getElementById('priceMode');
const search = document.getElementById('search');
const distributorSelect = document.getElementById('distributorSelect');
const manualDistributor = document.getElementById('manualDistributor');
const chatLog = document.getElementById('chatLog');

function getCost(item) {
  return item.priceByDistributor[selectedDistributor] ?? item.priceByDistributor.Main ?? 0;
}

function renderDistributorOptions() {
  distributorSelect.innerHTML = distributors
    .map((d) => `<option value="${d}">${d} pricing</option>`)
    .join('');
  distributorSelect.value = selectedDistributor;
}

function renderCatalog() {
  productList.innerHTML = '';
  const term = search.value.toLowerCase();
  products
    .filter((p) => p.part.toLowerCase().includes(term) || p.desc.toLowerCase().includes(term))
    .forEach((p) => {
      const div = document.createElement('div');
      div.className = 'product';
      div.innerHTML = `<img src="${p.img}"/><div><b>${p.part}</b><div>${p.desc}</div><small>$${getCost(p).toFixed(2)} (${selectedDistributor})</small></div><button>Add</button>`;
      div.querySelector('button').onclick = () => {
        kit.push(p);
        renderSheet();
      };
      productList.appendChild(div);
    });
}

function renderSheet() {
  sheetPreview.innerHTML = '';
  kit.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'row';
    const cost = priceMode.value === 'distributor' ? `$${getCost(item).toFixed(2)}` : '';
    row.innerHTML = `<img src="${item.img}"/><div class="cell">${item.part}${cost ? `<br><span class='cost'>${cost}</span>` : ''}</div><div class="cell desc">${item.desc}</div><div><button data-i='${i}'>Remove</button></div>`;
    row.querySelector('button').onclick = () => {
      kit.splice(i, 1);
      renderSheet();
    };
    sheetPreview.appendChild(row);
  });
}

function addBubble(text, role) {
  const b = document.createElement('div');
  b.className = `bubble ${role}`;
  b.textContent = text;
  chatLog.appendChild(b);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function findProductByIntent(intent) {
  if (intent.papr === 'zlink') {
    return products.find((p) => p.part === '16-015-23');
  }
  if (intent.papr === 'tlink') {
    return products.find((p) => p.part === '17-015-12');
  }
  return null;
}

function handleAssistantMessage(msg) {
  const text = msg.toLowerCase();

  if (assistantState.pending === 'papr') {
    if (text.includes('z-link') || text.includes('zlink')) assistantState.draft.papr = 'zlink';
    if (text.includes('t-link') || text.includes('tlink')) assistantState.draft.papr = 'tlink';
    if (!assistantState.draft.papr) {
      addBubble('Please choose one: Z-Link or T-Link so I can build the right kit.', 'bot');
      return;
    }
    assistantState.pending = 'filter';
    addBubble('Great. Which filter setup do you need: supplied air (Radex + GX4) or PAPR only?', 'bot');
    return;
  }

  if (assistantState.pending === 'filter') {
    assistantState.draft.filter = text.includes('supplied') ? 'supplied' : text.includes('papr') ? 'papr' : null;
    if (!assistantState.draft.filter) {
      addBubble('I need filter type before I continue: supplied air or PAPR only?', 'bot');
      return;
    }
    assistantState.pending = 'airline';
    addBubble('What airline length should I use: 25ft, 50ft, or 100ft?', 'bot');
    return;
  }

  if (assistantState.pending === 'airline') {
    assistantState.draft.airline = text.includes('50') ? '50' : text.includes('100') ? '100' : text.includes('25') ? '25' : null;
    if (!assistantState.draft.airline) {
      addBubble('I still need airline length: 25ft, 50ft, or 100ft.', 'bot');
      return;
    }

    const kitItems = [];
    const papr = findProductByIntent(assistantState.draft);
    if (papr) kitItems.push(papr);
    if (assistantState.draft.filter === 'supplied') {
      kitItems.push(products.find((p) => p.part === '04-906'));
      kitItems.push(products.find((p) => p.part === '08-400-01'));
    }
    kitItems.push(products.find((p) => p.part === 'NV2028'));

    kit = [...kit, ...kitItems.filter(Boolean)];
    renderSheet();
    addBubble('Kit built and added to the sales sheet. I asked follow-up questions to avoid guessing. Ask me for another kit or single part.', 'bot');
    assistantState.pending = null;
    assistantState.draft = {};
    return;
  }

  if (text.includes('kit')) {
    assistantState.pending = 'papr';
    addBubble('I can build that. First: which respirator platform do you want, Z-Link or T-Link?', 'bot');
    return;
  }

  const partMatch = products.find((p) => text.includes(p.part.toLowerCase()));
  if (partMatch) {
    kit.push(partMatch);
    renderSheet();
    addBubble(`Added single part ${partMatch.part} to the sheet.`, 'bot');
    return;
  }

  addBubble('I can build a full kit or add single parts. Tell me what you need and I will ask follow-up questions for missing details instead of guessing.', 'bot');
}

search.oninput = renderCatalog;
priceMode.onchange = renderSheet;
distributorSelect.onchange = () => {
  selectedDistributor = distributorSelect.value;
  renderCatalog();
  renderSheet();
};
manualDistributor.onchange = () => {
  const newName = manualDistributor.value.trim();
  if (!newName) return;
  if (!distributors.includes(newName)) distributors.push(newName);
  selectedDistributor = newName;
  renderDistributorOptions();
  renderCatalog();
  renderSheet();
};
document.getElementById('downloadBtn').onclick = () => window.print();
document.getElementById('chatSend').onclick = () => {
  const input = document.getElementById('chatInput');
  const q = input.value.trim();
  if (!q) return;
  addBubble(q, 'user');
  handleAssistantMessage(q);
  input.value = '';
};

renderDistributorOptions();
renderCatalog();
renderSheet();
addBubble('Hi! I can build kits/parts and will ask follow-up questions for missing details (PAPR/filter/airline/distributor).', 'bot');
