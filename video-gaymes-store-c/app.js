/* ===== Video Gay(mes) Store — núcleo compartilhado + loja =====
   Dados vêm de data.json e as alterações ficam salvas no localStorage. */

/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const platforms = ['Todas as plataformas', 'PC', 'PlayStation 5', 'Xbox Series', 'Nintendo Switch'];

const ICONS = {
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  right: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  upright: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  chevL: '<path d="m15 18-6-6 6-6"/>', chevR: '<path d="m9 18 6-6-6-6"/>',
  gamepad: '<path d="M6 12h4M8 10v4"/><path d="M15 13h.01M18 11h.01"/><rect x="2" y="6" width="20" height="12" rx="4"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  headphones: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  plus: '<path d="M5 12h14M12 5v14"/>', minus: '<path d="M5 12h14"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
  package: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  dashboard: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  tags: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  ps: '<path d="M12 3.2 15 8.4H9z"/><circle cx="19.4" cy="12" r="2.6"/><path d="m9.6 17.4 4.8 4.8M14.4 17.4l-4.8 4.8"/><rect x="2.2" y="9.6" width="4.8" height="4.8" rx=".7"/>',
  xbox: '<circle cx="12" cy="12" r="10"/><path d="M6.8 6.2c2.6 2 3.9 3.9 5.2 5.8 1.3-1.9 2.6-3.8 5.2-5.8M6.8 17.8c2.6-2 3.9-3.9 5.2-5.8 1.3 1.9 2.6 3.8 5.2 5.8"/>',
  switch: '<rect x="3" y="3" width="7.5" height="18" rx="3.75"/><rect x="13.5" y="3" width="7.5" height="18" rx="3.75"/><circle cx="6.75" cy="8" r="1.3"/><circle cx="17.25" cy="16" r="1.3"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>'
};
const ic = (n, size) => `<svg class="i" viewBox="0 0 24 24"${size ? ` style="font-size:${size}px"` : ''}>${ICONS[n] || ''}</svg>`;

/* ---------- estado e persistência ---------- */
let DB = null;
const S = { cart: {}, wishes: [], userId: null };
const KEY = 'vg_db_v4', SKEY = 'vg_session_v1';

async function boot() {
  try { DB = JSON.parse(localStorage.getItem(KEY)); } catch { DB = null; }
  try { Object.assign(S, JSON.parse(localStorage.getItem(SKEY)) || {}); } catch { }
  if (!DB) {
    try { DB = await (await fetch('data.json')).json(); }
    catch { document.body.innerHTML = '<p style="padding:40px">Não consegui carregar o <b>data.json</b>. Abra o site por um servidor local (ex.: <code>python -m http.server</code> ou a extensão Live Server do VS Code) em vez de dar duplo clique no arquivo.</p>'; throw 0; }
    saveDB();
  }
}
const saveDB = () => { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch { } };
const saveSession = () => { try { localStorage.setItem(SKEY, JSON.stringify(S)); } catch { } };
function resetDemo() { localStorage.removeItem(KEY); localStorage.removeItem(SKEY); location.reload(); }
const currentUser = () => DB.usuarios.find(u => u.id === S.userId) || null;
const nextId = rows => Math.max(0, ...rows.map(r => Number(r.id) || 0)) + 1;

/* ---------- componentes de UI ---------- */
const brand = () => '<div class="brand">Video Gay<em>(mes)</em><small>STORE</small></div>';
/* imagem em cima, gradiente embaixo: se a URL falhar, o gradiente aparece */
const gradient = (p, deg = 135) => `linear-gradient(${deg}deg,${esc(p.cor1 || '#222')},${esc(p.cor2 || '#555')})`;
const bg = (p, url, pos = 'center') => `${url ? `url('${esc(url)}') ${pos}/cover no-repeat,` : ''}${gradient(p)}`;
const cover = (p, label = true) => `<div class="cover" style="background:${gradient(p)}">${p.imagem_url ? `<img src="${esc(p.imagem_url)}" alt="" loading="lazy" decoding="async" onload="this.parentNode.classList.add('loaded')" onerror="this.remove()">` : ''}${label ? `<span class="cover-label">${esc(p.nome)}</span>` : ''}</div>`;
const pct = p => p.preco > 0 ? Math.max(0, Math.round((1 - (p.preco_promocional > 0 ? p.preco_promocional : p.preco) / p.preco) * 100)) : 0;

function toast(msg, type = 'ok') {
  let box = $('#toasts'); if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.append(box); }
  const t = document.createElement('div'); t.className = 'toast ' + (type === 'error' ? 'error' : ''); t.textContent = msg; box.append(t);
  setTimeout(() => t.remove(), 3200);
}
function openModal(html, wide) {
  closeModal();
  const o = document.createElement('div'); o.className = 'overlay'; o.id = 'modal';
  o.innerHTML = `<div class="dialog ${wide ? 'wide' : ''}" role="dialog" aria-modal="true"><button class="btn ghost icon sm close" data-a="close" aria-label="Fechar">${ic('x')}</button>${html}</div>`;
  o.addEventListener('mousedown', e => { if (e.target === o) closeModal(); });
  document.body.append(o);
}
function closeModal() { $('#modal')?.remove(); $('#drawer')?.remove(); }
/* menu lateral (carrinho e conta): se já está aberto, só troca o conteúdo */
function openDrawer(kind, html) {
  const cur = $('#drawer');
  if (cur && cur.dataset.kind === kind) {
    const body = cur.querySelector('.drawer-body'), top = body ? body.scrollTop : 0;
    cur.querySelector('.drawer-panel').innerHTML = html;
    const nb = cur.querySelector('.drawer-body'); if (nb) nb.scrollTop = top; return;
  }
  closeModal();
  const o = document.createElement('div'); o.id = 'drawer'; o.className = 'drawer'; o.dataset.kind = kind;
  o.innerHTML = `<aside class="drawer-panel" role="dialog" aria-modal="true">${html}</aside>`;
  o.addEventListener('mousedown', e => { if (e.target === o) closeModal(); });
  document.body.append(o);
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* delegação de eventos: <button data-a="acao" data-id="1"> chama actions.acao(dataset) */
const actions = { close: closeModal };
document.addEventListener('click', e => { const el = e.target.closest('[data-a]'); if (el && actions[el.dataset.a]) actions[el.dataset.a](el.dataset, el, e); });

/* ===================== LOJA (index.html) ===================== */
const ui = { tab: 'resumo', open: 0, query: '', platform: 0, category: 0, slide: 0, view: 'Destaques', sort: 'relevance', shown: 12, fav: 0 };
const ck = { cardId: null, addr: '', done: '', addCard: false, mode: 'entrar' };
const VIEWS = { Destaques: 'relevance', Catálogo: 'relevance', Ofertas: 'discount', Lançamentos: 'new' };
const SORTS = { relevance: 'Mais relevantes', score: 'Melhor avaliados', discount: 'Maior desconto', price: 'Menor preço', new: 'Lançamentos', name: 'Nome (A–Z)' };
const PLAT_ICON = { 1: 'monitor', 2: 'ps', 3: 'xbox', 4: 'switch' };
const price = p => p.preco_promocional > 0 ? p.preco_promocional : p.preco;
const onSale = p => pct(p) > 0;
const saleBadge = p => onSale(p) ? `<span class="discount">-${pct(p)}%</span>` : '<span class="tag-physical">Mídia física</span>';
const oldPrice = p => onSale(p) ? `<span class="old-price">${money(p.preco)}</span>` : '';
const prod = id => DB.produtos.find(p => p.id === Number(id));
const platName = id => (DB.plataformas.find(p => p.id === id) || {}).nome || '';
const catName = id => (DB.categorias.find(c => c.id === id) || {}).nome || '';
const platIcon = (id, size) => ic(PLAT_ICON[id] || 'gamepad', size);
const ytId = url => (String(url || '').match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/) || [])[1];
const featured = () => { const f = DB.produtos.filter(p => p.destaque && p.ativo).slice(0, 3); return f.length ? f : DB.produtos.slice(0, 3); };
const nSlides = () => Math.max(1, featured().length);
const reviewsOf = id => DB.avaliacoes.filter(a => a.produto_id === id);
const avg = id => { const r = reviewsOf(id); return { n: r.length, v: r.length ? r.reduce((s, a) => s + Number(a.nota), 0) / r.length : 0 }; };
const scoreBadge = p => p.nota_critica ? `<span class="score ${p.nota_critica >= 75 ? 'good' : p.nota_critica >= 50 ? 'mid' : 'bad'}" title="Nota da crítica (Metacritic)">${p.nota_critica}</span>` : '';
const stars = v => `<span class="stars" aria-label="Nota ${v.toFixed(1)} de 5">${ic('star', 12)}<b>${v.toFixed(1)}</b></span>`;

function filtered() {
  const q = ui.query.trim().toLowerCase();
  const by = {
    price: (a, b) => price(a) - price(b), discount: (a, b) => pct(b) - pct(a), score: (a, b) => (b.nota_critica || 0) - (a.nota_critica || 0) || avg(b.id).v - avg(a.id).v,
    new: (a, b) => String(b.data_lancamento).localeCompare(String(a.data_lancamento)), name: (a, b) => a.nome.localeCompare(b.nome, 'pt-BR'), relevance: (a, b) => (b.destaque || 0) - (a.destaque || 0) || a.id - b.id
  };
  return DB.produtos.filter(p => p.ativo && (ui.view !== 'Ofertas' || q || onSale(p)) && (!ui.platform || p.plataforma_id === ui.platform) && (!ui.category || p.categoria_id === ui.category) && `${p.nome} ${p.desenvolvedora}`.toLowerCase().includes(q)).sort(by[ui.sort] || by.relevance);
}
function card(p) {
  const on = S.wishes.includes(p.id), r = avg(p.id);
  return `<article class="game-card" data-a="detail" data-id="${p.id}"><div class="game-cover">${cover(p)}${saleBadge(p)}
  <button class="btn ghost icon sm wish-button ${on ? 'on' : ''}" data-a="wish" data-id="${p.id}" title="${on ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}" aria-label="Favoritar ${esc(p.nome)}">${ic('heart')}</button>
  <span class="plat-badge">${platIcon(p.plataforma_id, 13)}${esc(platName(p.plataforma_id))}</span></div>
  <div class="game-info"><span class="genre">${esc(catName(p.categoria_id))} · ${esc(p.desenvolvedora)}</span>
  <h3>${esc(p.nome)}</h3>
  <div class="game-meta">${scoreBadge(p)}${r.n ? stars(r.v) : ''}${!p.nota_critica && !r.n ? '<span class="muted" style="font-size:11px">Sem avaliações</span>' : ''}</div>
  <div class="game-price-line"><div>${oldPrice(p) || '<span class="old-price" style="text-decoration:none">&nbsp;</span>'}<strong>${money(price(p))}</strong></div>
  <button class="btn ghost icon" data-a="add" data-id="${p.id}" title="Adicionar ao carrinho" aria-label="Adicionar ${esc(p.nome)} ao carrinho">${ic('plus')}</button></div></div></article>`;
}
function renderNav() {
  $('#nav').innerHTML = Object.keys(VIEWS).map(n => `<button data-a="browse" data-v="${n}" class="${ui.view === n ? 'active' : ''}">${n}</button>`).join('');
  const qty = Object.values(S.cart).reduce((a, b) => a + b, 0);
  $('#cartCount').innerHTML = qty ? `<span class="cart-count">${qty}</span>` : '';
  $('#userBtn').classList.toggle('text-primary', !!currentUser());
  $('#userBtn').title = currentUser() ? 'Conta de ' + currentUser().nome : 'Entrar';
}
function renderHero() {
  const fl = featured(), f = fl[ui.slide % fl.length]; if (!f) { $('#hero').innerHTML = ''; return; }
  const title = f.nome === 'Elden Ring' ? 'ELDEN<br>RING' : esc(f.nome.toUpperCase());
  $('#hero').innerHTML = `<div class="hero-image" style="background:${bg(f, f.hero_url || f.imagem_url, '70% 42%')}"></div>
  <div class="hero-content"><div class="eyebrow">O MELHOR SITE DE MÍDIA FÍSICA</div><h1>${title}</h1><p>${esc(f.descricao)}</p>
  <div class="hero-price">${onSale(f) ? `<span class="discount">-${pct(f)}%</span>` : ''}${oldPrice(f)}<strong>${money(price(f))}</strong><span class="tag-physical">Disco / cartucho original</span></div>
  <div class="hero-cta"><button class="btn lg" data-a="heroBuy" data-id="${f.id}">Garantir meu jogo ${ic('right')}</button><button class="btn lg outline" data-a="detail" data-id="${f.id}">Ver trailer e detalhes ${ic('upright')}</button></div></div>
  <div class="hero-bottom"><div class="slide-dots">${fl.map((_, i) => `<button class="${ui.slide % fl.length === i ? 'current' : ''}" data-a="slide" data-i="${i}" aria-label="Destaque ${i + 1}"></button>`).join('')}</div>
  <div class="slide-nav"><span>0${ui.slide % fl.length + 1} <span style="opacity:.4">/ 0${fl.length}</span></span><button class="btn ghost icon" data-a="prev" title="Destaque anterior">${ic('chevL')}</button><button class="btn ghost icon" data-a="next" title="Próximo destaque">${ic('chevR')}</button></div></div>`;
}
function renderPlatforms() {
  $('#platforms').innerHTML = [{ id: 0, nome: 'Todas as plataformas' }, ...DB.plataformas].map(p => `<button class="btn ${ui.platform === p.id ? '' : 'outline'}" data-a="platform" data-i="${p.id}">${p.id ? platIcon(p.id, 16) : ic('gamepad', 16)}${esc(p.nome)}</button>`).join('');
}
function renderCatalog() {
  const list = filtered(), q = ui.query.trim(), shown = list.slice(0, ui.shown);
  const title = q ? `Resultados para “${esc(q)}”` : ({ Destaques: 'Em destaque na loja', Catálogo: 'Todos os jogos', Ofertas: 'Ofertas selecionadas', Lançamentos: 'Lançamentos' })[ui.view];
  $('#catalogBody').innerHTML = `<div class="section-heading"><div><h2>${ic('flame')}${title}</h2><p>${list.length} ${list.length === 1 ? 'jogo' : 'jogos'}${ui.platform ? ' em ' + esc(platName(ui.platform)) : ''}${ui.category ? ' · ' + esc(catName(ui.category)) : ''}</p></div>
  <label class="sort-box">Ordenar<select id="sort" aria-label="Ordenar jogos">${Object.entries(SORTS).map(([k, n]) => `<option value="${k}" ${ui.sort === k ? 'selected' : ''}>${n}</option>`).join('')}</select></label></div>
  <div class="chips">${[{ id: 0, nome: 'Todos os gêneros' }, ...DB.categorias].map(c => `<button class="chip ${ui.category === c.id ? 'on' : ''}" data-a="category" data-i="${c.id}">${esc(c.nome)}</button>`).join('')}</div>
  <div class="game-grid">${shown.map(card).join('')}</div>
  ${list.length > shown.length ? `<div class="more"><button class="btn outline lg" data-a="more">Mostrar mais jogos (${list.length - shown.length})</button></div>` : ''}
  ${list.length ? '' : `<div class="empty-state">${ic('search', 30)}<p>Nenhum jogo encontrado por aqui.</p><button class="btn link" data-a="clearFilters">Limpar filtros</button></div>`}`;
  $('#sort').onchange = e => { ui.sort = e.target.value; ui.view = 'Catálogo'; ui.shown = 12; renderNav(); renderCatalog(); };
}
const FAV_PAGE = 4;
const favList = () => DB.produtos.filter(p => p.ativo).sort((a, b) => (b.nota_critica || 0) - (a.nota_critica || 0) || avg(b.id).v - avg(a.id).v);
function renderFavs() {
  const l = favList(), pages = Math.max(1, Math.ceil(l.length / FAV_PAGE)); ui.fav = ((ui.fav % pages) + pages) % pages;
  $('#favGrid').innerHTML = l.slice(ui.fav * FAV_PAGE, ui.fav * FAV_PAGE + FAV_PAGE).map(card).join('');
}
const refresh = () => { renderNav(); renderHero(); renderPlatforms(); renderCatalog(); renderFavs(); saveSession(); };

/* carrinho / favoritos — atualizam só o necessário, sem redesenhar a vitrine */
function add(p) {
  if ((S.cart[p.id] || 0) >= p.estoque) { toast('Quantidade máxima em estoque.', 'error'); return false; }
  S.cart[p.id] = (S.cart[p.id] || 0) + 1; toast(`${p.nome} adicionado ao carrinho`); renderNav(); saveSession(); return true;
}
const scrollCatalog = () => $('#catalog').scrollIntoView({ block: 'start' });
const resetFilters = () => { ui.platform = 0; ui.category = 0; ui.query = ''; ui.shown = 12; $('#q').value = ''; $('#q2').value = ''; };

Object.assign(actions, {
  add: d => add(prod(d.id)),
  wish: d => {
    const id = Number(d.id); S.wishes = S.wishes.includes(id) ? S.wishes.filter(x => x !== id) : [...S.wishes, id]; const on = S.wishes.includes(id);
    document.querySelectorAll(`[data-a="wish"][data-id="${id}"]`).forEach(b => { b.classList.toggle('on', on); if (b.title) b.title = on ? 'Remover dos favoritos' : 'Adicionar aos favoritos'; });
    saveSession(); if ($('#modal')?.dataset.kind === 'wish') showWishes();
  },
  slide: d => { ui.slide = Number(d.i); renderHero(); },
  prev: () => { ui.slide = (ui.slide + nSlides() - 1) % nSlides(); renderHero(); },
  next: () => { ui.slide = (ui.slide + 1) % nSlides(); renderHero(); },
  favPrev: () => { ui.fav--; renderFavs(); }, favNext: () => { ui.fav++; renderFavs(); },
  platform: d => { ui.platform = Number(d.i); ui.shown = 12; renderPlatforms(); renderCatalog(); },
  category: d => { ui.category = Number(d.i); ui.shown = 12; renderCatalog(); },
  more: () => { ui.shown += 12; renderCatalog(); },
  browse: d => { ui.view = d.v; ui.sort = VIEWS[d.v]; ui.shown = 12; renderNav(); renderCatalog(); scrollCatalog(); },
  clearFilters: () => { resetFilters(); renderPlatforms(); renderCatalog(); },
  heroBuy: d => { add(prod(d.id)); showCart(); },
  detail: d => showDetail(prod(d.id)),
  addClose: d => { add(prod(d.id)); },
  cart: () => showCart(), wishes: () => showWishes(), account: () => showAccount(),
  dec: d => { S.cart[d.id] = Math.max(0, (S.cart[d.id] || 0) - 1); if (!S.cart[d.id]) delete S.cart[d.id]; renderNav(); saveSession(); showCart(); },
  inc: d => { add(prod(d.id)); showCart(); },
  rm: d => { delete S.cart[d.id]; renderNav(); saveSession(); showCart(); },
  addFromWish: d => { add(prod(d.id)); },
  toCheckout: () => showCheckout(),
  logout: () => { S.userId = null; saveSession(); renderNav(); toast('Você saiu da conta.'); showAccount(); },
  mode: d => { ck.mode = d.m; showAccount(); },
  addCardToggle: () => { ck.addCard = true; showAccount(); },
  saveCard: d => saveCard(d.from), pay: () => pay(),
  pickCard: d => { ck.cardId = Number(d.id); showCheckout(); },
  needLogin: () => { showAccount(); },
  tab: d => { ui.tab = d.t; showAccount(); },
  orderToggle: d => { ui.open = ui.open === Number(d.id) ? 0 : Number(d.id); showAccount(); },
  advance: d => { const o = DB.pedidos.find(x => x.id === Number(d.id)), i = o ? stepIdx(o) : -1; if (i < 0 || i > 2) return; o.status = ORDER_STEPS[i + 1][0]; if (o.status === 'enviado' && !o.codigo_rastreio) o.codigo_rastreio = trackCode(o); saveDB(); toast('Pedido atualizado: ' + ORDER_NAME[o.status]); showAccount(); },
  review: d => saveReview(Number(d.id)),
  pickStar: d => { $('#rv-nota').value = d.n; document.querySelectorAll('#starPick button').forEach(b => b.classList.toggle('on', Number(b.dataset.n) <= Number(d.n))); }
});

/* detalhes: vídeo, sinopse, notas e avaliações */
const reviewsHTML = p => {
  const rs = reviewsOf(p.id), u = currentUser(), mine = u && rs.find(a => a.usuario_id === u.id);
  return `<h4 class="sec">Avaliações da comunidade</h4>
  ${rs.length ? rs.slice().reverse().map(a => { const who = DB.usuarios.find(x => x.id === a.usuario_id); return `<div class="review"><div class="review-head"><strong>${esc(who ? who.nome.split(' ')[0] : 'Jogador')}</strong><span class="text-primary">${'★'.repeat(a.nota)}<span class="muted">${'★'.repeat(5 - a.nota)}</span></span></div><p>${esc(a.comentario)}</p></div>`; }).join('') : '<p class="muted" style="font-size:13px">Ainda sem avaliações. Seja o primeiro!</p>'}
  ${u ? `<div class="review-form"><div class="stars-pick" id="starPick">${[1, 2, 3, 4, 5].map(n => `<button type="button" class="${n <= (mine?.nota || 0) ? 'on' : ''}" data-a="pickStar" data-n="${n}" aria-label="${n} estrela${n > 1 ? 's' : ''}">${ic('star', 22)}</button>`).join('')}<input type="hidden" id="rv-nota" value="${mine?.nota || 0}"></div>
    <input id="rv-text" maxlength="300" placeholder="Conte o que achou do jogo" value="${esc(mine?.comentario || '')}">
    <button class="btn" data-a="review" data-id="${p.id}">${ic('check')}${mine ? 'Atualizar minha avaliação' : 'Enviar avaliação'}</button></div>`
    : `<button class="btn outline" data-a="needLogin">${ic('user')}Entre para avaliar este jogo</button>`}`;
};
const ratingsHTML = p => { const r = avg(p.id); return `<div class="ratings">
  <div class="rate-box"><span class="score big ${p.nota_critica >= 75 ? 'good' : p.nota_critica >= 50 ? 'mid' : 'bad'}">${p.nota_critica || '–'}</span><span>Nota da crítica<small>${p.nota_critica ? 'Metacritic' : 'sem nota'}</small></span></div>
  <div class="rate-box"><span class="score big comm">${r.n ? r.v.toFixed(1) : '–'}</span><span>Nota da comunidade<small>${r.n ? r.n + (r.n > 1 ? ' avaliações' : ' avaliação') : 'sem avaliações'}</small></span></div></div>`; };
function showDetail(p) {
  const id = ytId(p.trailer_url), on = S.wishes.includes(p.id), low = p.estoque < 10;
  const watch = id ? `https://www.youtube.com/watch?v=${id}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(p.nome + ' trailer oficial')}`;
  openModal(`<div class="detail-video">${id ? `<iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1" title="Trailer de ${esc(p.nome)}" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>` : cover(p, true)}</div>
  <a class="yt-link" href="${watch}" target="_blank" rel="noopener">${ic('upright', 12)} ${id ? 'Vídeo não carrega? Assistir no YouTube' : 'Buscar trailer no YouTube'}</a>
  <div><h2>${esc(p.nome)}</h2><p class="desc plat-line">${platIcon(p.plataforma_id, 14)}${esc(platName(p.plataforma_id))} · ${esc(catName(p.categoria_id))} · ${p.classificacao_indicativa ? 'Classificação ' + p.classificacao_indicativa + '+' : 'Livre'}</p></div>
  <div id="ratingTop">${ratingsHTML(p)}</div>
  <h4 class="sec">Sinopse</h4><p class="synopsis">${esc(p.sinopse || p.descricao)}</p>
  <dl class="specs"><div><dt>Desenvolvedora</dt><dd>${esc(p.desenvolvedora)}</dd></div><div><dt>Publicadora</dt><dd>${esc(p.publicadora)}</dd></div><div><dt>Lançamento</dt><dd>${dateBR(p.data_lancamento)}</dd></div><div><dt>Estoque</dt><dd class="${low ? 'danger' : ''}">${low ? `Restam só ${p.estoque} unidades` : 'Em estoque'}</dd></div></dl>
  <div class="buy-row"><div>${oldPrice(p)} ${onSale(p) ? `<span class="discount">-${pct(p)}%</span>` : '<span class="tag-physical">Mídia física lacrada</span>'}<strong class="big-price">${money(price(p))}</strong></div>
  <div class="buy-actions"><button class="btn outline icon wish-btn ${on ? 'on' : ''}" data-a="wish" data-id="${p.id}" title="Favoritar" aria-label="Favoritar">${ic('heart')}</button><button class="btn lg" data-a="addClose" data-id="${p.id}">${ic('bag')}Adicionar ao carrinho</button></div></div>
  <div id="reviews">${reviewsHTML(p)}</div>`, true);
  $('#modal').dataset.kind = 'detail';
}
function saveReview(pid) {
  const u = currentUser(); if (!u) return showAccount();
  const nota = Number($('#rv-nota').value), txt = $('#rv-text').value.trim();
  if (nota < 1) return toast('Escolha de 1 a 5 estrelas.', 'error');
  if (txt.length < 3) return toast('Escreva um comentário curtinho.', 'error');
  const old = DB.avaliacoes.find(a => a.produto_id === pid && a.usuario_id === u.id);
  if (old) { old.nota = nota; old.comentario = txt; } else DB.avaliacoes.push({ id: nextId(DB.avaliacoes), produto_id: pid, usuario_id: u.id, nota, comentario: txt });
  saveDB(); const p = prod(pid); $('#reviews').innerHTML = reviewsHTML(p); $('#ratingTop').innerHTML = ratingsHTML(p); renderFavs(); toast('Avaliação salva. Obrigado!');
}
const dateBR = s => String(s || '').split('-').reverse().join('/');
const FREE_SHIP = 299, SHIP = 19.9;
const dHead = (t, sub) => `<header class="drawer-head"><div><h2>${t}</h2><p>${sub}</p></div><button class="btn ghost icon" data-a="close" aria-label="Fechar">${ic('x')}</button></header>`;
function showCart() {
  const items = DB.produtos.filter(p => S.cart[p.id]), qty = Object.values(S.cart).reduce((a, b) => a + b, 0);
  const total = items.reduce((a, p) => a + price(p) * S.cart[p.id], 0);
  if (!items.length) return openDrawer('cart', dHead('Seu carrinho', 'Mais perto do seu próximo play') + `<div class="drawer-body"><div class="empty-state">${ic('bag', 36)}<p>Seu carrinho está esperando uma aventura.</p><button class="btn" data-a="close">Explorar jogos</button></div></div>`);
  const left = Math.max(0, FREE_SHIP - total), frete = left ? SHIP : 0;
  openDrawer('cart', dHead('Seu carrinho', `${qty} ${qty === 1 ? 'item' : 'itens'} · mídia física original`) +
    `<div class="drawer-body"><div class="ship-bar"><p>${left ? `<span>Faltam <b>${money(left)}</b> para o <b>frete grátis</b></span>` : `${ic('check', 14)}<span>Você ganhou <b>frete grátis</b>!</span>`}</p><div class="bar"><i style="width:${Math.min(100, Math.round(total / FREE_SHIP * 100))}%"></i></div></div>` +
    items.map(p => `<div class="cart-item">${cover(p, false)}<div class="ci-info"><span class="genre">${platIcon(p.plataforma_id, 12)}${esc(platName(p.plataforma_id))}</span><h3>${esc(p.nome)}</h3>
      <div class="ci-bottom"><div class="qty"><button class="btn outline" data-a="dec" data-id="${p.id}" title="Diminuir">${ic('minus')}</button><span>${S.cart[p.id]}</span><button class="btn outline" data-a="inc" data-id="${p.id}" title="Aumentar">${ic('plus')}</button></div><strong>${money(price(p) * S.cart[p.id])}</strong></div>
      ${S.cart[p.id] > 1 ? `<small class="muted">${money(price(p))} cada</small>` : ''}</div>
      <button class="btn ghost icon sm ci-rm" data-a="rm" data-id="${p.id}" title="Remover item" aria-label="Remover ${esc(p.nome)}">${ic('trash')}</button></div>`).join('') + `</div>
    <footer class="drawer-foot"><div class="row-between muted"><span>Subtotal</span><span>${money(total)}</span></div><div class="row-between muted"><span>Frete</span><span>${frete ? money(frete) : 'Grátis'}</span></div>
    <div class="row-between total"><span>Total</span><strong>${money(total + frete)}</strong></div>
    <button class="btn lg" data-a="toCheckout">Continuar para pagamento ${ic('right')}</button><button class="btn ghost" data-a="close">Continuar comprando</button>
    <p class="muted note">Demonstração — nenhum pagamento real será realizado.</p></footer>`);
}
function showWishes() {
  const items = DB.produtos.filter(p => S.wishes.includes(p.id));
  openModal(`<h2>Lista de desejos</h2><p class="desc">Guarde seus próximos favoritos.</p>` +
    items.map(p => `<div class="cart-row">${cover(p, false)}<div class="grow"><h3>${esc(p.nome)}</h3><p>${money(price(p))}</p></div>
    <button class="btn ghost icon" data-a="addFromWish" data-id="${p.id}" title="Adicionar ao carrinho">${ic('plus')}</button><button class="btn ghost icon" data-a="wish" data-id="${p.id}" title="Remover">${ic('trash')}</button></div>`).join('') +
    (items.length ? '' : '<p class="empty-state">Nenhum favorito ainda. Qual vai ser o primeiro?</p>'));
  $('#modal').dataset.kind = 'wish';
}

/* conta */
const masked = n => '•••• ' + String(n).slice(-4);
const field = (id, text, attrs = '', val = '') => `<div class="field"><label for="${id}">${text}</label><input id="${id}" ${attrs} value="${esc(val)}"></div>`;
function cardForm(from) {
  const u = currentUser();
  return `<div class="box stack"><p style="font-size:13px;display:flex;gap:8px;align-items:center"><span class="text-primary">${ic('wallet')}</span>VG Pay — cartão fictício para testar compras. Nenhum dado real é cobrado.</p>
  ${field('card-name', 'Apelido', '', 'Meu VG Pay')}${field('card-holder', 'Titular', '', u?.nome || '')}
  <div class="grid2">${field('card-number', 'Número (inventado)', 'inputmode="numeric" placeholder="0000 0000 0000" maxlength="19"')}${field('card-exp', 'Validade', 'placeholder="MM/AA" maxlength="5"')}</div>
  <button class="btn" data-a="saveCard" data-from="${from}">${ic('plus')}Cadastrar VG Pay</button></div>`;
}
function saveCard(from) {
  const u = currentUser(); if (!u) return;
  const num = $('#card-number').value.replace(/\D/g, ''), exp = $('#card-exp').value, holder = $('#card-holder').value.trim();
  if (num.length < 12) return toast('Número precisa ter ao menos 12 dígitos.', 'error');
  if (!/^\d{2}\/\d{2}$/.test(exp)) return toast('Validade no formato MM/AA.', 'error');
  if (!holder) return toast('Informe o titular.', 'error');
  const c = { id: Date.now(), usuario_id: u.id, apelido: $('#card-name').value || 'VG Pay', titular: holder, numero: num, bandeira: 'VG Pay', validade: exp, saldo: 1500 };
  DB.cartoes.push(c); saveDB(); ck.cardId = c.id; ck.addCard = false; toast('Cartão VG Pay criado com R$ 1.500 de saldo fictício!');
  from === 'checkout' ? showCheckout() : showAccount();
}
const ORDER_STEPS = [
  ['pago', 'Pedido confirmado', 'Pagamento aprovado com VG Pay', ic('check', 14)],
  ['em_separacao', 'Em separação', 'Separando suas mídias lacradas no estoque', ic('package', 14)],
  ['enviado', 'Enviado', 'Pacote com a transportadora, a caminho', ic('truck', 14)],
  ['entregue', 'Entregue', 'Pedido entregue no endereço informado', ic('pin', 14)]];
const ORDER_NAME = { aguardando_pagamento: 'Aguardando pagamento', pago: 'Pago', em_separacao: 'Em separação', enviado: 'Enviado', entregue: 'Entregue', cancelado: 'Cancelado', reembolsado: 'Reembolsado' };
const stepIdx = o => ORDER_STEPS.findIndex(s => s[0] === o.status);
/* datas fictícias, calculadas a partir da data do pedido */
function stepDate(o, i, past) {
  const d = new Date(String(o.criado_em) + 'T09:12:00'); if (isNaN(d)) return '';
  d.setDate(d.getDate() + [0, 0, 1, 3][i]); d.setHours([9, 14, 8, 15][i], [12, 40, 25, 10][i]);
  const dd = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), hh = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return past ? `${dd} · ${hh}` : `Previsão ${dd}`;
}
const trackCode = o => o.codigo_rastreio || `VG${String(o.id * 7919 + 100000).padStart(9, '0')}BR`;
const itemsOf = o => DB.pedido_itens.filter(i => i.pedido_id === o.id);
function timelineHTML(o) {
  const cur = stepIdx(o);
  if (cur < 0) return `<p class="muted" style="font-size:13px">${o.status === 'aguardando_pagamento' ? 'Estamos esperando a confirmação do pagamento.' : 'Este pedido foi ' + (ORDER_NAME[o.status] || o.status).toLowerCase() + '.'}</p>`;
  return `<ol class="timeline">${ORDER_STEPS.map((s, i) => `<li class="${i < cur || (i === cur && cur === 3) ? 'done' : i === cur ? 'now' : ''}"><span class="dot">${i <= cur ? s[3] : ''}</span><div><strong>${s[1]}</strong><small>${s[2]}</small></div><time>${stepDate(o, i, i <= cur)}</time></li>`).join('')}</ol>`;
}
function orderHTML(o) {
  const cur = stepIdx(o), open = ui.open === o.id, its = itemsOf(o), n = its.reduce((s, i) => s + i.quantidade, 0);
  const pill = `<span class="os-pill s-${esc(o.status)}">${esc(ORDER_NAME[o.status] || o.status)}</span>`;
  return `<article class="order ${open ? 'open' : ''}"><button class="order-head" data-a="orderToggle" data-id="${o.id}" aria-expanded="${open}">
    <div><strong>${esc(o.codigo)}</strong><small>${dateBR(o.criado_em)} · ${n} ${n === 1 ? 'jogo' : 'jogos'}</small></div><div class="order-right">${pill}<strong>${money(o.total)}</strong></div></button>
    <div class="mini-steps">${ORDER_STEPS.map((_, i) => `<i class="${i <= cur ? 'on' : ''}"></i>`).join('')}</div>
    ${open ? `<div class="order-detail">${timelineHTML(o)}
      ${cur >= 2 ? `<div class="track"><span>${ic('truck', 14)} Código de rastreio (fictício)</span><b>${esc(trackCode(o))}</b></div>` : ''}
      <div class="order-items">${its.map(i => `<div><span>${i.quantidade}× ${esc(i.nome_produto)}</span><span>${money(i.preco_unitario * i.quantidade)}</span></div>`).join('')}
        <div class="muted"><span>Frete</span><span>${o.frete ? money(o.frete) : 'Grátis'}</span></div><div class="sum"><span>Total</span><span>${money(o.total)}</span></div></div>
      ${o.endereco_entrega ? `<p class="muted" style="font-size:12px;display:flex;gap:6px;align-items:center">${ic('pin', 13)}${esc(o.endereco_entrega)}</p>` : ''}
      ${cur >= 0 && cur < 3 ? `<button class="btn outline sm" data-a="advance" data-id="${o.id}">${ic('right')}Avançar etapa (simulação)</button>` : ''}
    </div>` : ''}</article>`;
}
function showAccount() {
  const u = currentUser();
  if (!u) {
    openDrawer('account', dHead(ck.mode === 'entrar' ? 'Entrar na sua conta' : 'Criar conta de cliente', ck.mode === 'entrar' ? 'Teste com lucas@example.com / demo123' : 'Leva 10 segundos. É tudo demonstração.') + `<div class="drawer-body">
    <div class="grid2">${['entrar', 'cadastrar'].map(m => `<button class="btn ${ck.mode === m ? '' : 'outline'}" data-a="mode" data-m="${m}">${m === 'entrar' ? 'Entrar' : 'Cadastrar'}</button>`).join('')}</div>
    <form id="authForm" class="stack" style="gap:12px;margin-top:16px">${ck.mode === 'cadastrar' ? field('acc-name', 'Nome completo') : ''}${field('acc-email', 'E-mail', 'type="email" placeholder="voce@email.com"')}${field('acc-pass', 'Senha', 'type="password"')}${ck.mode === 'cadastrar' ? field('acc-confirm', 'Confirmar senha', 'type="password"') : ''}
    <button class="btn" type="submit">${ic('user')}${ck.mode === 'entrar' ? 'Entrar' : 'Criar conta'}</button></form></div>`);
    $('#authForm').onsubmit = e => { e.preventDefault(); ck.mode === 'entrar' ? login() : signup(); };
    return;
  }
  const orders = DB.pedidos.filter(p => p.usuario_id === u.id).slice().reverse(), mine = DB.cartoes.filter(c => c.usuario_id === u.id);
  const active = orders.filter(o => ['pago', 'em_separacao', 'enviado'].includes(o.status)), spent = orders.filter(o => !['cancelado', 'reembolsado'].includes(o.status)).reduce((s, o) => s + Number(o.total), 0);
  const initials = u.nome.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const tabs = [['resumo', 'Resumo', 'user'], ['pedidos', 'Meus pedidos', 'package'], ['pagamento', 'Pagamento', 'wallet']];
  let body = '';
  if (ui.tab === 'resumo') {
    const last = orders[0];
    body = `<div class="stats"><div><b>${orders.length}</b><span>pedidos</span></div><div><b>${active.length}</b><span>em andamento</span></div><div><b>${money(spent)}</b><span>total em compras</span></div></div>
    <h4 class="sec">${last ? 'Último pedido' : 'Pedidos'}</h4>${last ? orderHTML(last) : '<p class="muted" style="font-size:13px">Nenhum pedido ainda. Que tal escolher o primeiro jogo?</p>'}
    <div class="menu-list"><button data-a="wishes">${ic('heart')}<span>Lista de desejos</span><em>${S.wishes.length}</em></button><button data-a="cart">${ic('bag')}<span>Meu carrinho</span><em>${Object.values(S.cart).reduce((a, b) => a + b, 0)}</em></button>
    ${u.tipo === 'admin' ? `<a href="admin.html">${ic('dashboard')}<span>Painel administrativo</span></a>` : ''}</div>`;
  } else if (ui.tab === 'pedidos') {
    body = orders.length ? `<p class="muted" style="font-size:12px">Toque em um pedido para ver a situação detalhada. Situações fictícias, só para demonstração.</p>${orders.map(orderHTML).join('')}` : `<div class="empty-state">${ic('package', 34)}<p>Você ainda não fez pedidos.</p><button class="btn" data-a="close">Ver jogos</button></div>`;
  } else {
    body = `${mine.map(c => `<div class="vgcard"><span>VG Pay</span><b>${masked(c.numero)}</b><div><small>${esc(c.apelido)}</small><strong>${money(c.saldo)}</strong></div></div>`).join('')}
    ${ck.addCard ? cardForm('account') : `<button class="btn outline" data-a="addCardToggle">${ic('plus')}Cadastrar cartão VG Pay</button>`}`;
  }
  openDrawer('account', `<header class="drawer-head user-head"><span class="avatar-lg">${esc(initials)}</span><div><h2>Olá, ${esc(u.nome.split(' ')[0])}!</h2><p>${esc(u.email)}</p></div><button class="btn ghost icon" data-a="close" aria-label="Fechar">${ic('x')}</button></header>
  <nav class="drawer-tabs">${tabs.map(t => `<button class="${ui.tab === t[0] ? 'on' : ''}" data-a="tab" data-t="${t[0]}">${ic(t[2], 15)}${t[1]}</button>`).join('')}</nav>
  <div class="drawer-body">${body}</div><footer class="drawer-foot"><button class="btn ghost" data-a="logout">${ic('logout')}Sair da conta</button></footer>`);
}
function login() {
  const email = $('#acc-email').value.trim().toLowerCase(), u = DB.usuarios.find(x => x.email.toLowerCase() === email);
  if (!u || u.senha !== $('#acc-pass').value) return toast('E-mail ou senha incorretos.', 'error');
  S.userId = u.id; saveSession(); renderNav(); toast(`Bem-vindo de volta, ${u.nome.split(' ')[0]}!`); showAccount();
}
function signup() {
  const nome = $('#acc-name').value.trim(), email = $('#acc-email').value.trim().toLowerCase(), senha = $('#acc-pass').value;
  if (nome.length < 3) return toast('Informe seu nome.', 'error');
  if (!/^\S+@\S+\.\S+$/.test(email)) return toast('E-mail inválido.', 'error');
  if (DB.usuarios.some(c => c.email.toLowerCase() === email)) return toast('Esse e-mail já tem conta.', 'error');
  if (senha.length < 6) return toast('Senha com no mínimo 6 caracteres.', 'error');
  if (senha !== $('#acc-confirm').value) return toast('As senhas não conferem.', 'error');
  const u = { id: nextId(DB.usuarios), nome, email, senha, cpf: '', telefone: '', tipo: 'cliente', ativo: 1 };
  DB.usuarios.push(u); saveDB(); S.userId = u.id; saveSession(); renderNav(); toast('Conta criada! Cadastre seu VG Pay para comprar.'); showAccount();
}

/* checkout */
function cartTotals() {
  const items = Object.entries(S.cart).map(([id, q]) => ({ p: prod(id), q })).filter(i => i.p);
  const subtotal = items.reduce((s, i) => s + price(i.p) * i.q, 0), frete = subtotal >= 299 || !subtotal ? 0 : 19.9;
  return { items, subtotal, frete, total: subtotal + frete };
}
function showCheckout() {
  const u = currentUser(), { items, frete, total } = cartTotals();
  if (ck.done) return openModal(`<h2>Pedido confirmado</h2><p class="desc">Pedido ${esc(ck.done)} pago com VG Pay. Acompanhe a situação em Minha conta.</p><div style="text-align:center;color:var(--primary)">${ic('check', 56)}</div><button class="btn" data-a="account">Acompanhar meu pedido</button><button class="btn ghost" data-a="close">Continuar comprando</button>`);
  if (!u) return openModal(`<h2>Finalizar compra</h2><p class="desc">Entre ou crie sua conta para pagar.</p><button class="btn" data-a="needLogin">${ic('user')}Entrar / Cadastrar</button>`);
  const mine = DB.cartoes.filter(c => c.usuario_id === u.id), sel = mine.find(c => c.id === ck.cardId) || mine[0];
  openModal(`<h2>Finalizar compra</h2><p class="desc">${items.length} itens · total ${money(total)}${frete ? ` (frete ${money(frete)})` : ' · frete grátis'}</p>
  ${field('ck-addr', 'Endereço de entrega', 'placeholder="Rua, número, cidade - UF"', ck.addr)}
  ${mine.length ? `<div class="stack">${mine.map(c => `<button class="btn ${sel?.id === c.id ? '' : 'outline'}" style="justify-content:space-between" data-a="pickCard" data-id="${c.id}"><span>${ic('card')} ${esc(c.apelido)} · ${masked(c.numero)}</span><span>${money(c.saldo)}</span></button>`).join('')}</div>` : cardForm('checkout')}
  <button class="btn" data-a="pay" ${items.length ? '' : 'disabled'}>${ic('wallet')}Pagar ${money(total)}</button>`);
  $('#ck-addr').oninput = e => ck.addr = e.target.value;
}
function pay() {
  const u = currentUser(); if (!u) return;
  const mine = DB.cartoes.filter(c => c.usuario_id === u.id), sel = mine.find(c => c.id === ck.cardId) || mine[0], { items, subtotal, frete, total } = cartTotals();
  if (!sel) return toast('Cadastre um VG Pay primeiro.', 'error');
  if (ck.addr.trim().length < 5) return toast('Informe o endereço de entrega.', 'error');
  if (sel.saldo < total) return toast('Saldo VG Pay insuficiente.', 'error');
  const pid = nextId(DB.pedidos), codigo = `VG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  DB.pedidos.push({ id: pid, codigo, usuario_id: u.id, endereco_entrega: ck.addr, status: 'pago', subtotal, desconto: 0, frete, total, codigo_rastreio: '', criado_em: new Date().toISOString().slice(0, 10) });
  items.forEach((i, k) => DB.pedido_itens.push({ id: Date.now() + k, pedido_id: pid, produto_id: i.p.id, nome_produto: i.p.nome, preco_unitario: price(i.p), quantidade: i.q }));
  DB.pagamentos.push({ id: nextId(DB.pagamentos), pedido_id: pid, metodo: 'cartao', status: 'aprovado', valor: total, parcelas: 1, bandeira: 'VG Pay', ultimos_digitos: sel.numero.slice(-4), transacao_id: 'DEMO-' + codigo.slice(-4) });
  sel.saldo -= total; items.forEach(i => i.p.estoque -= i.q);
  saveDB(); S.cart = {}; ck.done = codigo; ui.open = pid; ui.tab = 'pedidos'; ck.addr = ''; renderNav(); saveSession(); toast('Pagamento aprovado!'); showCheckout(); ck.done = '';
}

/* inicialização da loja */
async function initStore() {
  await boot();
  document.body.insertAdjacentHTML('beforeend', '<div id="toasts"></div>');
  const search = v => { ui.query = v; ui.shown = 12; $('#q').value = v; $('#q2').value = v; renderCatalog(); };
  $('#q').oninput = e => { search(e.target.value); scrollCatalog(); };
  $('#q2').oninput = e => search(e.target.value);
  setInterval(() => { if (!document.hidden && !$('#modal')) { ui.slide = (ui.slide + 1) % nSlides(); renderHero(); } }, 7000);
  let clicks = 0, last = 0;
  $('#secret').onclick = () => { const now = Date.now(); clicks = now - last < 700 ? clicks + 1 : 1; last = now; if (clicks >= 5) location.href = 'admin.html'; };
  refresh();
}
if (document.body.dataset.page === 'store') initStore();
