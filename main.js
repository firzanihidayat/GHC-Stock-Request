import './style.css';

const demoItems = [
  { item_id: 1, item_name: 'Oil Filter', category: 'Engine Parts', quantity_available: 12 },
  { item_id: 2, item_name: 'Air Filter', category: 'Engine Parts', quantity_available: 8 },
  { item_id: 3, item_name: 'Hydraulic Hose', category: 'Hydraulic Parts', quantity_available: 5 },
  { item_id: 4, item_name: 'Spark Plug', category: 'Electrical Parts', quantity_available: 20 },
  { item_id: 5, item_name: 'Brake Pad', category: 'Brake Parts', quantity_available: 15 }
];
let items = [];
let demo = false;
const app = document.querySelector('#app');
app.innerHTML = `
<header><div class="brand"><div class="mark">G</div><div><strong>goHUB <span>Capital</span></strong><small>STOCK REQUEST MANAGEMENT</small></div></div><div class="tag">Staff Portal</div></header>
<main><section class="hero"><div class="eyebrow">GO HUB CAPITAL · INVENTORY</div><h1>Find what you need.<br/><em>Request with ease.</em></h1><p>Search spare parts, check available quantities and submit your request in one place.</p></section>
<section class="panel"><div class="section-title"><div><h2>Available Stock</h2><p>Search by item name or category</p></div><span id="count" class="count"></span></div><label class="search"><span>⌕</span><input id="search" placeholder="Search spare parts..." autocomplete="off" /></label><div id="mode" class="notice" hidden></div><div id="items" class="items"><p>Loading stock...</p></div></section>
<section class="panel form-panel" id="request-panel" hidden><div class="section-title"><div><h2>Request Spare Part</h2><p>Complete the form to submit your stock request.</p></div><button type="button" id="close" class="ghost">✕</button></div><form id="request-form"><input type="hidden" name="item_id" id="item-id" /><label>Selected item<input id="selected-item" readonly /></label><div class="two"><label>Full name<input name="requester_name" required minlength="2" maxlength="100" placeholder="Your name" /></label><label>Work email<input name="requester_email" type="email" required maxlength="200" placeholder="name@company.com" /></label></div><div class="two"><label>Quantity<input name="quantity_requested" type="number" required min="1" step="1" /></label><label>Staff access code<input name="access_code" type="password" required placeholder="Code provided for demo" autocomplete="off" /></label></div><label class="honeypot" aria-hidden="true">Leave blank<input name="website" tabindex="-1" autocomplete="off" /></label><button id="submit" type="submit" class="primary">Submit Request</button><p id="feedback" role="status"></p></form></section>
</main><footer>© Go Hub Capital · Stock Request Management System</footer>`;
const list = document.querySelector('#items');
const search = document.querySelector('#search');
const count = document.querySelector('#count');
const panel = document.querySelector('#request-panel');
const form = document.querySelector('#request-form');
const feedback = document.querySelector('#feedback');
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x])); }
function render() {
 const term = search.value.toLowerCase().trim();
 const found = items.filter(i => `${i.item_name} ${i.category||''}`.toLowerCase().includes(term));
 count.textContent = `${found.length} item${found.length !== 1 ? 's' : ''}`;
 list.innerHTML = found.length ? found.map(i => `<article class="item"><div class="item-icon">▦</div><div class="item-info"><h3>${escapeHtml(i.item_name)}</h3><p>${escapeHtml(i.category || 'Uncategorised')} · ID ${Number(i.item_id)}</p></div><div class="stock"><b>${Number(i.quantity_available)}</b><small>In stock</small></div><button class="request" data-id="${Number(i.item_id)}" ${i.quantity_available < 1 ? 'disabled' : ''}>Request →</button></article>`).join('') : '<p class="empty">No matching items found.</p>';
}
list.addEventListener('click', e => {
 const btn = e.target.closest('button[data-id]'); if (!btn) return;
 const item = items.find(i => i.item_id === Number(btn.dataset.id)); if (!item) return;
 form.reset(); feedback.textContent = '';
 document.querySelector('#item-id').value = item.item_id;
 document.querySelector('#selected-item').value = item.item_name;
 form.elements.quantity_requested.max = item.quantity_available;
 panel.hidden = false; panel.scrollIntoView({behavior:'smooth'});
});
document.querySelector('#close').addEventListener('click', () => panel.hidden = true);
search.addEventListener('input', render);
async function loadItems() {
 try { const resp = await fetch('/api/items'); if (!resp.ok) throw Error('API unavailable');
 const data = await resp.json(); if (!Array.isArray(data.items)) throw Error('Invalid response');
 items = data.items; demo = false;
 } catch { items = demoItems; demo = true;
 const note = document.querySelector('#mode'); note.hidden = false;
 note.textContent = 'PREVIEW MODE: Showing sample items only. Publish to Vercel and configure environment variables to use the real Supabase database. Requests cannot be saved in preview mode.';
 }
 render();
}
form.addEventListener('submit', async e => {
 e.preventDefault(); feedback.className = '';
 if (demo) { feedback.textContent = 'Preview only. Deploy to Vercel and connect Supabase before submitting real requests.'; feedback.className = 'error'; return; }
 const body = Object.fromEntries(new FormData(form));
 body.item_id = Number(body.item_id); body.quantity_requested = Number(body.quantity_requested);
 const button = document.querySelector('#submit'); button.disabled = true; button.textContent = 'Submitting...';
 try {
  const resp = await fetch('/api/requests', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const data = await resp.json(); if (!resp.ok) throw Error(data.error || 'Request failed');
  feedback.textContent = `Request #${data.request_id} submitted. Status: Pending.`;
  feedback.className = 'success'; form.reset();
 } catch(err) { feedback.textContent = err.message; feedback.className = 'error'; }
 finally { button.disabled = false; button.textContent = 'Submit Request'; }
});
loadItems();
