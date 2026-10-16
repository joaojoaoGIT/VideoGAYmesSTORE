/* ===== Video Gay(mes) Store — núcleo compartilhado + loja =====
   Dados vêm do MySQL (game_store) via API PHP em /api. */

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
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  eyeoff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.4 10.4 0 0 1 12 5c7 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3 7 10 7a9.7 9.7 0 0 0 5.39-1.61"/><path d="m2 2 20 20"/>',
  github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>'
};
const ic = (n, size) => `<svg class="i" viewBox="0 0 24 24"${size ? ` style="font-size:${size}px"` : ''}>${ICONS[n] || ''}</svg>`;

/* ---------- estado e persistência ---------- */
let DB = null;
const S = { cart: {}, wishes: [], userId: null, adulto: false };
const SKEY = 'vg_session_v1';  /* só carrinho e favoritos do visitante ficam no navegador */

/* chamada à API PHP (mesma origem, cookie de sessão) */
async function api(path, body) {
  let r, j;
  try { r = await fetch('api/' + path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : { cache: 'no-store' }); }
  catch { throw new Error('Servidor indisponível. Abra o site por http://localhost/ com o Apache do XAMPP ligado.'); }
  try { j = await r.json(); } catch { throw new Error('O PHP não respondeu como esperado. O Apache/PHP do XAMPP está ligado?'); }
  if (!r.ok) throw new Error(j.erro || 'Erro no servidor');
  return j;
}
async function loadDB() {
  DB = await api('load.php'); S.userId = DB._usuario_id ?? null;
  const next = DB._next || {}; delete DB._next; delete DB._usuario_id; S.adulto = !!DB._adulto_ok; delete DB._adulto_ok;
  for (const t in DB) if (Array.isArray(DB[t])) Object.defineProperty(DB[t], '_next', { value: next[t] || 1, enumerable: false });
  if (S.userId) { /* une favoritos do visitante com os já salvos na conta */
    const mine = DB.lista_desejos.filter(w => w.usuario_id === S.userId).map(w => w.produto_id);
    S.wishes = [...new Set([...(S.wishes || []), ...mine])]; syncWishes();
  }
  for (const id in S.cart) if (!DB.produtos.some(p => p.id === Number(id))) delete S.cart[id]; /* ex.: itens +18 depois de sair do modo +18 */
}
function syncWishes() {
  const u = currentUser(); if (!u) return;
  const cur = DB.lista_desejos.filter(w => w.usuario_id === u.id);
  if (cur.length === S.wishes.length && cur.every(w => S.wishes.includes(w.produto_id))) return;
  const keep = new Map(cur.map(w => [w.produto_id, w]));
  DB.lista_desejos = DB.lista_desejos.filter(w => w.usuario_id !== u.id);
  S.wishes.forEach(pid => DB.lista_desejos.push(keep.get(pid) || { id: nextId(DB.lista_desejos), usuario_id: u.id, produto_id: pid, criado_em: new Date().toISOString().slice(0, 10) }));
  Object.defineProperty(DB.lista_desejos, '_next', { value: Math.max(...DB.lista_desejos.map(w => w.id), 0) + 1, enumerable: false });
  saveDB();
}
async function boot() {
  try { Object.assign(S, JSON.parse(localStorage.getItem(SKEY)) || {}); } catch { }
  try { await loadDB(); }
  catch (e) { document.body.innerHTML = `<p style="padding:40px;max-width:640px;line-height:1.6"><b>Não consegui carregar o banco de dados.</b><br>${esc(e.message)}<br><br>1) Inicie <b>Apache</b> e <b>MySQL</b> no XAMPP · 2) Abra <code>http://localhost/video-gaymes-store-c/install.php</code> uma vez · 3) Volte para <code>index.html</code> por <code>http://localhost/...</code> (não por duplo clique no arquivo).</p>`; throw 0; }
}
/* grava no MySQL (agrupa várias alterações seguidas em uma única requisição) */
let _saveTimer = null;
const saveDB = () => { clearTimeout(_saveTimer); _saveTimer = setTimeout(async () => { try { await api('save.php', DB); DB.usuarios.forEach(u => { if ('senha' in u) u.senha = ''; }); } catch (e) { toast(e.message, 'error'); } }, 120); };
const saveSession = () => { syncWishes(); try { localStorage.setItem(SKEY, JSON.stringify({ cart: S.cart, wishes: S.wishes })); } catch { } };
async function resetDemo() { try { await api('reset.php', {}); } catch (e) { return toast(e.message, 'error'); } try { localStorage.removeItem(SKEY); } catch { } location.href = 'index.html'; }
const currentUser = () => DB.usuarios.find(u => u.id === S.userId) || null;
const nextId = rows => Math.max(rows._next || 1, ...rows.map(r => (Number(r.id) || 0) + 1));

/* ---------- componentes de UI ---------- */
const brand = () => '<img class="brand-logo" src="img/logo.png" alt="Video Gay(mes) Store" width="52" height="52">';
/* ---------- capas dos jogos ----------
   Ordem de tentativa: URL do banco -> outros servidores da Steam (cada CDN pode falhar) -> capa oficial da Wikipédia
   (buscada no navegador, serve para Nintendo/Gran Turismo e para o Catálogo +18) -> gradiente com o título. */
const gradient = (p, deg = 135) => `linear-gradient(${deg}deg,${esc(p.cor1 || '#222')},${esc(p.cor2 || '#555')})`;
const steamAlt = u => {
  const m = String(u || '').match(/steam\/apps\/(\d+)\/header\.jpg/); if (!m) return [];
  const id = m[1];
  return [`https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${id}/header.jpg`,
    `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${id}/header.jpg`,
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/header.jpg`,
    `https://cdn.fastly.steamstatic.com/steam/apps/${id}/header.jpg`,
    `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/header.jpg`,
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/capsule_616x353.jpg`].filter(x => x !== u);
};
/* títulos das páginas da Wikipédia (EN) de onde vem a capa oficial, quando o jogo não tem capa Steam */
const COVER_WIKI = {
  'gran-turismo-7': ['Gran Turismo 7'],
  'the-legend-of-zelda-tears-of-the-kingdom': ['The Legend of Zelda: Tears of the Kingdom'],
  'super-mario-odyssey': ['Super Mario Odyssey'],
  'mario-kart-8-deluxe': ['Mario Kart 8 Deluxe'],
  'dramatical-murder': ['Dramatical Murder', 'DRAMAtical Murder'],
  'togainu-no-chi': ['Togainu no Chi'],
  'lamento-beyond-the-void': ['Lamento: Beyond the Void', 'Lamento -Beyond the Void-'],
  'trials-in-tainted-space': ['Trials in Tainted Space'],
  'lilith-s-throne': ["Lilith's Throne"],
  'my-femboy-roommate': ['My Femboy Roommate'],
  'femboy-love-story': ['Femboy Love Story']
};
const COVER_KEY = 'vg_covers_v1';
let COVER_CACHE = {}; try { COVER_CACHE = JSON.parse(localStorage.getItem(COVER_KEY)) || {}; } catch { }
const coverUrl = p => p.imagem_url || COVER_CACHE[p.slug] || '';
const _coverJobs = {};
const _wikiJson = async url => { const r = await fetch(url); if (!r.ok) throw new Error(r.status); return r.json(); };
const _wikiThumb = j => { const t = j && j.thumbnail && j.thumbnail.source; return t ? t.replace(/\/\d+px-/, '/640px-') : ((j && j.originalimage && j.originalimage.source) || ''); };
const _plain = t => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
async function _findCover(p) {
  /* 1) página exata (só aceita se for mesmo sobre um jogo, para não pegar foto errada) */
  for (const t of [...(COVER_WIKI[p.slug] || []), p.nome]) {
    try {
      const j = await _wikiJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t.replace(/ /g, '_'))}`);
      if (j.type === 'standard' && /game|visual novel/i.test(`${j.description || ''} ${j.extract || ''}`)) { const u = _wikiThumb(j); if (u) return u; }
    } catch { }
  }
  /* 2) busca (no Catálogo +18 o título tem de bater por inteiro) */
  {
    try {
      const j = await _wikiJson(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrlimit=4&gsrsearch=${encodeURIComponent(p.nome + ' video game')}&prop=pageimages&piprop=thumbnail&pithumbsize=640`);
      const pages = Object.values((j.query && j.query.pages) || {}).sort((a, b) => a.index - b.index);
      const full = _plain(p.nome), key = _plain(p.nome).split(' ').find(w => w.length >= 4) || full;
      const hit = pages.find(x => x.thumbnail && _plain(x.title).includes(p.adulto ? full : key));
      if (hit) return hit.thumbnail.source;
    } catch { }
  }
  return '';
}
function resolveCover(p) {
  if (COVER_CACHE[p.slug]) return Promise.resolve(COVER_CACHE[p.slug]);
  return _coverJobs[p.slug] || (_coverJobs[p.slug] = _findCover(p).then(u => {
    if (u) { COVER_CACHE[p.slug] = u; try { localStorage.setItem(COVER_KEY, JSON.stringify(COVER_CACHE)); } catch { } }
    return u;
  }));
}
/* busca em segundo plano as capas dos jogos que não têm imagem e redesenha quando chegam */
async function loadCovers() {
  const miss = DB.produtos.filter(p => !coverUrl(p) && !_coverJobs[p.slug]);
  if (!miss.length) return;
  const got = (await Promise.all(miss.map(resolveCover))).filter(Boolean).length;
  if (!got) return;
  if ($('#hero')) { renderHero(); renderCatalog(); renderFavs(); }
  if ($('#secretPage')) renderSecret();
}
/* várias imagens em camadas (a que falhar some e a seguinte aparece), gradiente por baixo */
const bg = (p, url, pos = 'center') => {
  const urls = [].concat(url || []).filter(Boolean).flatMap(u => [u, ...steamAlt(u).slice(0, 1)]).filter((u, i, a) => a.indexOf(u) === i).slice(0, 3);
  return urls.map(u => `url('${esc(u)}') ${pos}/cover no-repeat`).concat(gradient(p)).join(',');
};
window.imgFail = img => {
  const l = (img.dataset.alt || '').split('|').filter(Boolean);
  if (l.length) { img.dataset.alt = l.slice(1).join('|'); img.src = l[0]; return; }
  const p = prod(img.dataset.pid);
  if (p && !img.dataset.wiki) { img.dataset.wiki = '1'; resolveCover(p).then(u => { if (u && u !== img.src && img.isConnected) img.src = u; else img.remove(); }); return; }
  img.remove();
};
const coverImg = p => { const u = coverUrl(p); return u ? `<img src="${esc(u)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-pid="${p.id}" onload="this.parentNode.classList.add('loaded')" onerror="imgFail(this)" data-alt="${esc(steamAlt(u).join('|'))}">` : ''; };
const cover = (p, label = true) => `<div class="cover" style="background:${gradient(p)}">${coverImg(p)}${label ? `<span class="cover-label">${esc(p.nome)}</span>` : ''}</div>`;
const pct = p => p.preco > 0 ? Math.max(0, Math.round((1 - (p.preco_promocional > 0 ? p.preco_promocional : p.preco) / p.preco) * 100)) : 0;

function toast(msg, type = 'ok') {
  let box = $('#toasts'); if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.append(box); }
  const t = document.createElement('div'); t.className = 'toast ' + (type === 'error' ? 'error' : ''); t.textContent = msg; box.append(t);
  setTimeout(() => t.remove(), type === 'error' ? 7000 : 3200);
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
document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; if ($('#modal') || $('#drawer')) closeModal(); else if ($('#secretPage')) closeSecret(); });

/* delegação de eventos: <button data-a="acao" data-id="1"> chama actions.acao(dataset) */
const actions = { close: closeModal };
document.addEventListener('click', e => { const el = e.target.closest('[data-a]'); if (el && actions[el.dataset.a]) actions[el.dataset.a](el.dataset, el, e); });

/* ===================== LOJA (index.html) ===================== */
const ui = { tab: 'resumo', open: 0, query: '', platform: 0, category: 0, slide: 0, view: 'Destaques', sort: 'relevance', shown: 12, fav: 0 };
const ck = { cardId: null, addrId: null, done: null, mode: 'entrar', payNew: false, newAddr: false, addAddr: false, editEnd: null, addCard: false, paying: false, savingCard: false, cardMsg: '', cupom: null, cupomMsg: '', f: {} };
const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
/* máscaras: a barra da validade (MM/AA) entra sozinha; apagar não trava */
const MASKS = {
  'card-number': v => v.replace(/\D/g, '').slice(0, 19).replace(/(.{4})(?=.)/g, '$1 '),
  'card-exp': (v, t) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 || (d.length === 2 && !t.startsWith('delete')) ? d.slice(0, 2) + '/' + d.slice(2) : d; },
  'card-cvv': v => v.replace(/\D/g, '').slice(0, 4),
  'end-cep': v => { const d = v.replace(/\D/g, '').slice(0, 8); return d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d; },
  'cupom-code': v => v.toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 30)
};
/* os modais/menus são redesenhados a cada ação: guardamos o que foi digitado em ck.f */
document.addEventListener('input', e => {
  const el = e.target, n = el.dataset && el.dataset.f; if (!n) return;
  if (el.type === 'checkbox') { ck.f[n] = el.checked; return; }
  let v = el.value; if (MASKS[n]) { const m = MASKS[n](v, e.inputType || ''); if (m !== v) { el.value = m; v = m; } }
  ck.f[n] = v;
});
document.addEventListener('change', e => { const el = e.target, n = el.dataset && el.dataset.f; if (!n) return; if (el.type === 'checkbox') ck.f[n] = el.checked; else ck.f[n] = el.value; if (n === 'end-cep') fillCep(); });
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'cupom-code') { e.preventDefault(); actions.cupomApply(); } });
const VIEWS = { Destaques: 'relevance', Catálogo: 'relevance', Ofertas: 'discount', Lançamentos: 'new' };
const SORTS = { relevance: 'Mais relevantes', score: 'Melhor avaliados', discount: 'Maior desconto', price: 'Menor preço', new: 'Lançamentos', name: 'Nome (A–Z)' };
const PLAT_ICON = { 1: 'monitor', 2: 'ps', 3: 'xbox', 4: 'switch' };
const price = p => p.preco_promocional > 0 ? p.preco_promocional : p.preco;
const onSale = p => pct(p) > 0;
const saleBadge = p => onSale(p) ? `<span class="discount">-${pct(p)}%</span>` : '<span class="tag-physical">Mídia física</span>';
const oldPrice = p => onSale(p) ? `<span class="old-price">${money(p.preco)}</span>` : '';
const prod = id => DB.produtos.find(p => p.id === Number(id));
const pubCats = () => DB.categorias.filter(c => { const l = DB.produtos.filter(p => p.categoria_id === c.id); return !l.length || l.some(p => !p.adulto); }); /* esconde categorias só de +18 */
const platName = id => (DB.plataformas.find(p => p.id === id) || {}).nome || '';
const catName = id => (DB.categorias.find(c => c.id === id) || {}).nome || '';
const platIcon = (id, size) => ic(PLAT_ICON[id] || 'gamepad', size);
const ytId = url => (String(url || '').match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/) || [])[1];
const featured = () => { const f = DB.produtos.filter(p => p.destaque && p.ativo && !p.adulto).slice(0, 3); return f.length ? f : DB.produtos.filter(p => !p.adulto).slice(0, 3); };
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
  return DB.produtos.filter(p => p.ativo && !p.adulto && (ui.view !== 'Ofertas' || q || onSale(p)) && (!ui.platform || p.plataforma_id === ui.platform) && (!ui.category || p.categoria_id === ui.category) && `${p.nome} ${p.desenvolvedora}`.toLowerCase().includes(q)).sort(by[ui.sort] || by.relevance);
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
  const sc = $('#secretCartCount'); if (sc) sc.innerHTML = qty ? `<span class="cart-count">${qty}</span>` : '';
  $('#userBtn').classList.toggle('text-primary', !!currentUser());
  $('#userBtn').title = currentUser() ? 'Conta de ' + currentUser().nome : 'Entrar';
}
function renderHero() {
  const fl = featured(), f = fl[ui.slide % fl.length]; if (!f) { $('#hero').innerHTML = ''; return; }
  const title = f.nome === 'Elden Ring' ? 'ELDEN<br>RING' : esc(f.nome.toUpperCase());
  $('#hero').innerHTML = `<div class="hero-image" style="background:${bg(f, [f.hero_url, coverUrl(f)], '70% 42%')}"></div>
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
  <div class="chips">${[{ id: 0, nome: 'Todos os gêneros' }, ...pubCats()].map(c => `<button class="chip ${ui.category === c.id ? 'on' : ''}" data-a="category" data-i="${c.id}">${esc(c.nome)}</button>`).join('')}</div>
  <div class="game-grid">${shown.map(card).join('')}</div>
  ${list.length > shown.length ? `<div class="more"><button class="btn outline lg" data-a="more">Mostrar mais jogos (${list.length - shown.length})</button></div>` : ''}
  ${list.length ? '' : `<div class="empty-state">${ic('search', 30)}<p>Nenhum jogo encontrado por aqui.</p><button class="btn link" data-a="clearFilters">Limpar filtros</button></div>`}`;
  $('#sort').onchange = e => { ui.sort = e.target.value; ui.view = 'Catálogo'; ui.shown = 12; renderNav(); renderCatalog(); };
}
const FAV_PAGE = 4;
const favList = () => DB.produtos.filter(p => p.ativo && !p.adulto).sort((a, b) => (b.nota_critica || 0) - (a.nota_critica || 0) || avg(b.id).v - avg(a.id).v);
function renderFavs() {
  const l = favList(), pages = Math.max(1, Math.ceil(l.length / FAV_PAGE)); ui.fav = ((ui.fav % pages) + pages) % pages;
  $('#favGrid').innerHTML = l.slice(ui.fav * FAV_PAGE, ui.fav * FAV_PAGE + FAV_PAGE).map(card).join('');
}
const refresh = () => { renderNav(); renderHero(); renderPlatforms(); renderCatalog(); renderFavs(); saveSession(); };

/* carrinho / favoritos — atualizam só o necessário, sem redesenhar a vitrine */
function add(p) {
  if ((S.cart[p.id] || 0) >= p.estoque) { toast('Quantidade máxima em estoque.', 'error'); return false; }
  S.cart[p.id] = (S.cart[p.id] || 0) + 1; toast(`${p.nome} adicionado ao carrinho`); renderNav(); saveSession(); revalidateCupom(); return true;
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
  dec: d => { S.cart[d.id] = Math.max(0, (S.cart[d.id] || 0) - 1); if (!S.cart[d.id]) delete S.cart[d.id]; renderNav(); saveSession(); showCart(); revalidateCupom(); },
  inc: d => { add(prod(d.id)); showCart(); },
  rm: d => { delete S.cart[d.id]; renderNav(); saveSession(); showCart(); revalidateCupom(); },
  addFromWish: d => { add(prod(d.id)); },
  toCheckout: () => showCheckout(),
  logout: async () => { try { await api('auth.php', { acao: 'logout' }); await loadDB(); } catch (e) { S.userId = null; } S.wishes = []; ck.addrId = null; ck.cardId = null; ck.cupom = null; ck.cupomMsg = ''; ck.f = {}; ck.payNew = false; ck.addAddr = false; ck.addCard = false; ui.tab = 'resumo'; saveSession(); renderNav(); toast('Você saiu da conta.'); showAccount(); },
  mode: d => { ck.mode = d.m; showAccount(); },
  /* cupom */
  cupomUse: d => { ck.f['cupom-code'] = d.code; applyCupom(); },
  copyCupom: async d => toast((await copyText(d.code)) ? `Cupom ${d.code} copiado! Cole no carrinho ou no pagamento.` : `Use o cupom ${d.code} no carrinho.`),
  cupomApply: () => applyCupom(), cupomRemove: () => { ck.cupom = null; ck.cupomMsg = ''; rerender(); },
  /* endereços */
  addrNew: () => { clearAddr(); ck.addAddr = true; showAccount(); },
  addrNewCk: () => { clearAddr(); ck.newAddr = true; showCheckout(); },
  addrEdit: d => { const e = DB.enderecos.find(x => x.id === Number(d.id)); if (!e) return; clearAddr(); Object.assign(ck.f, { 'end-apelido': e.apelido || '', 'end-cep': String(e.cep).replace(/^(\d{5})(\d{3})$/, '$1-$2'), 'end-log': e.logradouro, 'end-num': e.numero, 'end-comp': e.complemento || '', 'end-bai': e.bairro, 'end-cid': e.cidade, 'end-uf': e.estado, 'end-princ': !!e.principal }); ck.editEnd = e.id; ck.addAddr = true; showAccount(); },
  addrSave: d => saveAddress(d.from),
  addrCancel: d => { clearAddr(); ck.addAddr = false; ck.newAddr = false; d.from === 'checkout' ? showCheckout() : showAccount(); },
  addrDel: d => deleteAddress(Number(d.id)), addrMain: d => mainAddress(Number(d.id)),
  pickAddr: d => { ck.addrId = Number(d.id); showCheckout(); },
  /* cartões */
  cardNew: () => { clearCardForm(); ck.addCard = true; showAccount(); },
  cardCancel: () => { clearCardForm(); ck.addCard = false; showAccount(); },
  cardSave: () => saveCardAccount(), cardDel: d => deleteCard(Number(d.id)),
  pickCard: d => { ck.cardId = Number(d.id); ck.payNew = false; showCheckout(); },
  payNew: () => { clearCardForm(); ck.payNew = true; showCheckout(); },
  payUseSaved: () => { ck.payNew = false; showCheckout(); },
  pay: () => pay(),
  /* catálogo secreto (+18) e menu Git */
  secretEntry: () => secretEntry(), age18Yes: () => confirmAge(), secretClose: () => closeSecret(), secretExit: () => exitAdult(),
  adultDetail: d => showAdultDetail(prod(d.id)), theme18: d => { ui18.theme = d.t; renderSecret(); },
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
  ${p.adulto ? '' : `<div class="rate-box"><span class="score big ${p.nota_critica >= 75 ? 'good' : p.nota_critica >= 50 ? 'mid' : 'bad'}">${p.nota_critica || '–'}</span><span>Nota da crítica<small>${p.nota_critica ? 'Metacritic' : 'sem nota'}</small></span></div>`}
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
/* resumo de valores: subtotal, desconto, frete e total */
const sumHTML = t => `<div class="row-between muted"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>${t.desconto ? `<div class="row-between disc"><span>Desconto (${esc(ck.cupom.codigo)})</span><span>− ${money(t.desconto)}</span></div>` : ''}
  <div class="row-between muted"><span>Frete</span><span>${t.frete ? money(t.frete) : 'Grátis'}${t.freteDesc ? ' <small>(cupom)</small>' : ''}</span></div>
  <div class="row-between total"><span>Total</span><strong>${money(t.total)}</strong></div>`;
const FIRST_COUPON = { codigo: 'BEMVINDO10', desc: '10% de desconto' };
const isFirstBuy = () => { const u = currentUser(); return !u || !DB.pedidos.some(o => o.usuario_id === u.id && !['cancelado', 'reembolsado'].includes(o.status)); };
const firstBuyBox = () => `<div class="first-buy">${ic('ticket', 18)}<span><b>Primeira compra?</b> Use o cupom <code>${FIRST_COUPON.codigo}</code> e ganhe ${FIRST_COUPON.desc} no pedido.</span><button class="btn outline sm" data-a="cupomUse" data-code="${FIRST_COUPON.codigo}">Usar cupom</button></div>`;
async function copyText(t) { try { await navigator.clipboard.writeText(t); return true; } catch { const a = document.createElement('textarea'); a.value = t; a.style.cssText = 'position:fixed;opacity:0'; document.body.append(a); a.select(); let ok = false; try { ok = document.execCommand('copy'); } catch { } a.remove(); return ok; } }
const cupomLabel = c => c.tipo === 'frete_gratis' ? 'frete grátis' : c.tipo === 'percentual' ? `${Number(c.valor)}% de desconto` : `${money(c.valor)} de desconto`;
function couponBox() {
  return `<div class="coupon">${ck.cupom
    ? `<div class="coupon-ok">${ic('ticket', 16)}<span><b>${esc(ck.cupom.codigo)}</b> aplicado · ${cupomLabel(ck.cupom)}</span><button class="btn link" data-a="cupomRemove">Remover</button></div>`
    : `${isFirstBuy() ? firstBuyBox() : ''}<label class="coupon-label" for="cupom-code">Cupom de desconto</label><div class="coupon-row"><input id="cupom-code" data-f="cupom-code" placeholder="Digite o cupom" autocapitalize="characters" autocomplete="off" maxlength="30" value="${esc(ck.f['cupom-code'] || '')}"><button class="btn outline" data-a="cupomApply">Aplicar</button></div>`}
    ${ck.cupomMsg ? `<p class="coupon-msg" role="alert">${esc(ck.cupomMsg)}</p>` : ''}</div>`;
}
const cartPayload = () => Object.entries(S.cart).filter(([id]) => prod(id)).map(([id, q]) => ({ id: Number(id), qtd: q }));
const rerender = () => { if ($('#drawer')?.dataset.kind === 'cart') showCart(); else if ($('#modal')?.dataset.kind === 'checkout') showCheckout(); };
async function applyCupom() {
  const codigo = String(ck.f['cupom-code'] || '').trim().toUpperCase();
  if (!codigo) { ck.cupomMsg = 'Digite o código do cupom.'; return rerender(); }
  if (!currentUser()) { ck.cupomMsg = 'Entre na sua conta para aplicar um cupom.'; rerender(); return toast('Entre na sua conta para usar o cupom.', 'error'); }
  if (!cartPayload().length) { ck.cupomMsg = 'Adicione jogos ao carrinho antes de aplicar o cupom.'; return rerender(); }
  try { ck.cupom = await api('cupom.php', { codigo, itens: cartPayload() }); ck.cupomMsg = ''; ck.f['cupom-code'] = ''; toast(`Cupom ${ck.cupom.codigo} aplicado!`); }
  catch (e) { ck.cupom = null; ck.cupomMsg = e.message; }
  rerender();
}
/* o carrinho mudou: confere de novo se o cupom ainda vale (o servidor sempre confere no pagamento) */
async function revalidateCupom() {
  if (!ck.cupom) return;
  try { ck.cupom = await api('cupom.php', { codigo: ck.cupom.codigo, itens: cartPayload() }); }
  catch (e) { ck.cupom = null; ck.cupomMsg = e.message; toast(e.message, 'error'); }
  rerender();
}
function showCart() {
  const items = DB.produtos.filter(p => S.cart[p.id]), qty = Object.values(S.cart).reduce((a, b) => a + b, 0);
  if (!items.length) return openDrawer('cart', dHead('Seu carrinho', 'Mais perto do seu próximo play') + `<div class="drawer-body"><div class="empty-state">${ic('bag', 36)}<p>Seu carrinho está esperando uma aventura.</p><button class="btn" data-a="close">Explorar jogos</button></div></div>`);
  const t = cartTotals(), left = Math.max(0, FREE_SHIP - t.subtotal);
  openDrawer('cart', dHead('Seu carrinho', `${qty} ${qty === 1 ? 'item' : 'itens'} · mídia física original`) +
    `<div class="drawer-body"><div class="ship-bar"><p>${left ? `<span>Faltam <b>${money(left)}</b> para o <b>frete grátis</b></span>` : `${ic('check', 14)}<span>Você ganhou <b>frete grátis</b>!</span>`}</p><div class="bar"><i style="width:${Math.min(100, Math.round(t.subtotal / FREE_SHIP * 100))}%"></i></div></div>` +
    items.map(p => `<div class="cart-item">${cover(p, false)}<div class="ci-info"><span class="genre">${platIcon(p.plataforma_id, 12)}${esc(platName(p.plataforma_id))}</span><h3>${esc(p.nome)}</h3>
      <div class="ci-bottom"><div class="qty"><button class="btn outline" data-a="dec" data-id="${p.id}" title="Diminuir">${ic('minus')}</button><span>${S.cart[p.id]}</span><button class="btn outline" data-a="inc" data-id="${p.id}" title="Aumentar">${ic('plus')}</button></div><strong>${money(price(p) * S.cart[p.id])}</strong></div>
      ${S.cart[p.id] > 1 ? `<small class="muted">${money(price(p))} cada</small>` : ''}</div>
      <button class="btn ghost icon sm ci-rm" data-a="rm" data-id="${p.id}" title="Remover item" aria-label="Remover ${esc(p.nome)}">${ic('trash')}</button></div>`).join('') + `</div>
    <footer class="drawer-foot">${couponBox()}${sumHTML(t)}
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
const ffield = (id, text, attrs = '') => field(id, text, `data-f="${id}" ${attrs}`, ck.f[id] ?? '');
const ufSelect = () => `<div class="field"><label for="end-uf">UF</label><select id="end-uf" data-f="end-uf"><option value="">UF</option>${UFS.map(u => `<option ${ck.f['end-uf'] === u ? 'selected' : ''}>${u}</option>`).join('')}</select></div>`;
const endTxt = e => `${e.logradouro}, ${e.numero}${e.complemento ? ' (' + e.complemento + ')' : ''} · ${e.bairro}, ${e.cidade}/${e.estado} · CEP ${String(e.cep).replace(/^(\d{5})(\d{3})$/, '$1-$2')}`;
const fmtVal = v => { const m = String(v).match(/^(\d{4})-(\d{2})$/); return m ? `${m[2]}/${m[1].slice(2)}` : String(v); };
const ymNow = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };
const expired = c => String(c.validade) < ymNow();
const clearAddr = () => { Object.keys(ck.f).filter(k => k.startsWith('end-')).forEach(k => delete ck.f[k]); ck.editEnd = null; };
const clearCardForm = () => { ck.cardMsg = ''; ['card-number', 'card-holder', 'card-exp', 'card-cvv', 'card-apelido', 'card-save'].forEach(k => delete ck.f[k]); };
const setMine = (t, rows) => { const u = currentUser(); DB[t] = DB[t].filter(x => x.usuario_id !== u.id).concat(rows); };
const luhn = n => { let sum = 0, alt = false; for (let i = n.length - 1; i >= 0; i--) { let d = +n[i]; if (alt) { d *= 2; if (d > 9) d -= 9; } sum += d; alt = !alt; } return sum % 10 === 0; };

/* CEP: preenche rua/bairro/cidade/UF sozinho (ViaCEP); se estiver offline, é só digitar */
async function fillCep() {
  const cep = String(ck.f['end-cep'] || '').replace(/\D/g, ''); if (cep.length !== 8) return;
  try {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 4000);
    const j = await (await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: ctl.signal })).json(); clearTimeout(t);
    if (j.erro) return;
    [['end-log', j.logradouro], ['end-bai', j.bairro], ['end-cid', j.localidade], ['end-uf', j.uf]].forEach(([id, v]) => { if (v && !ck.f[id]) { ck.f[id] = v; const el = document.getElementById(id); if (el) el.value = v; } });
  } catch { }
}
function addrFormHTML(from) {
  const canCancel = ck.editEnd || ck.addAddr || ck.newAddr;
  return `<div class="box stack"><div class="grid2">${ffield('end-cep', 'CEP', 'inputmode="numeric" placeholder="00000-000" autocomplete="postal-code" maxlength="9"')}${ffield('end-apelido', 'Apelido (opcional)', 'placeholder="Casa, Trabalho..." maxlength="50"')}</div>
  ${ffield('end-log', 'Rua / Avenida', 'maxlength="150" autocomplete="address-line1"')}
  <div class="grid2">${ffield('end-num', 'Número', 'maxlength="10" placeholder="123 ou S/N"')}${ffield('end-comp', 'Complemento', 'maxlength="100"')}</div>
  ${ffield('end-bai', 'Bairro', 'maxlength="100"')}
  <div class="grid-city">${ffield('end-cid', 'Cidade', 'maxlength="100" autocomplete="address-level2"')}${ufSelect()}</div>
  <label class="check"><input type="checkbox" data-f="end-princ" ${ck.f['end-princ'] ? 'checked' : ''}> Usar como endereço principal</label>
  <div class="row-actions"><button class="btn" data-a="addrSave" data-from="${from}">${ic('check')}${ck.editEnd ? 'Salvar alterações' : 'Salvar endereço'}</button>${canCancel ? `<button class="btn outline" data-a="addrCancel" data-from="${from}">Cancelar</button>` : ''}</div></div>`;
}
async function saveAddress(from) {
  const u = currentUser(); if (!u) return;
  const f = k => String(ck.f[k] || '').trim();
  if (f('end-cep').replace(/\D/g, '').length !== 8) return toast('CEP inválido: informe 8 números.', 'error');
  if (f('end-log').length < 3) return toast('Informe a rua/avenida.', 'error');
  if (!f('end-num')) return toast('Informe o número (ou S/N).', 'error');
  if (f('end-bai').length < 2) return toast('Informe o bairro.', 'error');
  if (f('end-cid').length < 2) return toast('Informe a cidade.', 'error');
  if (!UFS.includes(f('end-uf'))) return toast('Escolha o estado (UF).', 'error');
  let r;
  try { r = await api('enderecos.php', { acao: 'salvar', id: ck.editEnd || 0, apelido: f('end-apelido'), cep: f('end-cep'), logradouro: f('end-log'), numero: f('end-num'), complemento: f('end-comp'), bairro: f('end-bai'), cidade: f('end-cid'), estado: f('end-uf'), principal: ck.f['end-princ'] ? 1 : 0 }); }
  catch (e) { return toast(e.message, 'error'); }
  setMine('enderecos', r.enderecos); ck.addrId = r.id; clearAddr(); ck.addAddr = false; ck.newAddr = false;
  toast('Endereço salvo no banco de dados.'); from === 'checkout' ? showCheckout() : showAccount();
}
async function deleteAddress(id) {
  if (!confirm('Excluir este endereço?')) return;
  try { const r = await api('enderecos.php', { acao: 'excluir', id }); setMine('enderecos', r.enderecos); if (ck.addrId === id) ck.addrId = null; toast('Endereço excluído.'); showAccount(); }
  catch (e) { toast(e.message, 'error'); }
}
async function mainAddress(id) {
  try { const r = await api('enderecos.php', { acao: 'principal', id }); setMine('enderecos', r.enderecos); toast('Endereço principal atualizado.'); showAccount(); }
  catch (e) { toast(e.message, 'error'); }
}

function cardFormHTML(from) {
  const u = currentUser(); if (ck.f['card-holder'] === undefined && u) ck.f['card-holder'] = u.nome.toUpperCase();
  const co = from === 'checkout';
  return `<div class="box stack">${ffield('card-number', 'Número do cartão', 'inputmode="numeric" autocomplete="cc-number" placeholder="0000 0000 0000 0000" maxlength="23"')}
  ${ffield('card-holder', 'Nome do titular (como no cartão)', 'autocomplete="cc-name" maxlength="100"')}
  <div class="grid2">${ffield('card-exp', 'Validade (MM/AA)', 'inputmode="numeric" autocomplete="cc-exp" placeholder="MM/AA" maxlength="5"')}${co ? ffield('card-cvv', 'CVV', 'inputmode="numeric" autocomplete="cc-csc" placeholder="123" maxlength="4"') : ffield('card-apelido', 'Apelido (opcional)', 'maxlength="50" placeholder="Meu cartão"')}</div>
  ${co ? `${ffield('card-apelido', 'Apelido (se for salvar)', 'maxlength="50" placeholder="Meu cartão"')}<label class="check"><input type="checkbox" data-f="card-save" ${ck.f['card-save'] ? 'checked' : ''}> Salvar este cartão para próximas compras</label>` : ''}
  <p class="muted" style="font-size:11px;line-height:1.5">Guardamos só os 4 últimos dígitos, a bandeira, o titular e a validade — o número completo e o CVV nunca são salvos. Aceita qualquer número de 13 a 19 dígitos (demonstração).</p>
  ${ck.cardMsg ? `<p class="coupon-msg" role="alert">${esc(ck.cardMsg)}</p>` : ''}
  ${co ? '' : `<div class="row-actions"><button class="btn" data-a="cardSave" ${ck.savingCard ? 'disabled' : ''}>${ic('plus')}Salvar cartão</button>${ck.addCard ? '<button class="btn outline" data-a="cardCancel">Cancelar</button>' : ''}</div>`}</div>`;
}
/* valida o cartão no navegador (o servidor valida de novo) */
function readCard(needCvv) {
  const numero = String(ck.f['card-number'] || '').replace(/\D/g, ''), titular = String(ck.f['card-holder'] || '').trim(), validade = String(ck.f['card-exp'] || '');
  if (numero.length < 13 || numero.length > 19) throw new Error('Número do cartão inválido (13 a 19 dígitos).');
  if (titular.length < 3) throw new Error('Informe o nome do titular.');
  const m = /^(\d{2})\/(\d{2})$/.exec(validade);
  if (!m || +m[1] < 1 || +m[1] > 12) throw new Error('Validade inválida. Use mês/ano, por exemplo 08/29.');
  if (`20${m[2]}-${m[1]}` < ymNow()) throw new Error('Cartão vencido. Informe um cartão dentro da validade.');
  if (needCvv && !/^\d{3,4}$/.test(String(ck.f['card-cvv'] || ''))) throw new Error('Informe o CVV (3 ou 4 dígitos).');
  return { numero, titular, validade, apelido: String(ck.f['card-apelido'] || '').trim() };
}
async function saveCardAccount() {
  if (ck.savingCard) return;
  const fail = m => { ck.cardMsg = m; toast(m, 'error'); showAccount(); };
  let c; try { c = readCard(false); } catch (e) { return fail(e.message); }
  ck.savingCard = true; ck.cardMsg = '';
  let r; try { r = await api('cartoes.php', { acao: 'salvar', ...c }); } catch (e) { ck.savingCard = false; return fail(e.message); }
  ck.savingCard = false;
  setMine('cartoes', r.cartoes); ck.cardId = r.id; clearCardForm(); ck.addCard = false;
  toast('Cartão salvo (só os 4 últimos dígitos ficam no banco).'); showAccount();
}
async function deleteCard(id) {
  if (!confirm('Remover este cartão?')) return;
  try { const r = await api('cartoes.php', { acao: 'excluir', id }); setMine('cartoes', r.cartoes); if (ck.cardId === id) ck.cardId = null; toast('Cartão removido.'); showAccount(); }
  catch (e) { toast(e.message, 'error'); }
}
const ORDER_STEPS = [
  ['pago', 'Pedido confirmado', 'Pagamento aprovado no cartão', ic('check', 14)],
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
        <div class="muted"><span>Subtotal</span><span>${money(o.subtotal)}</span></div>${Number(o.desconto) > 0 ? `<div class="disc"><span>Desconto${(DB.pedido_cupons.find(c => c.pedido_id === o.id) || {}).codigo ? ' (' + esc(DB.pedido_cupons.find(c => c.pedido_id === o.id).codigo) + ')' : ''}</span><span>− ${money(o.desconto)}</span></div>` : ''}<div class="muted"><span>Frete</span><span>${o.frete ? money(o.frete) : 'Grátis'}</span></div><div class="sum"><span>Total</span><span>${money(o.total)}</span></div></div>
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
  const orders = DB.pedidos.filter(p => p.usuario_id === u.id).slice().reverse(), mine = DB.cartoes.filter(c => c.usuario_id === u.id), addrs = DB.enderecos.filter(e => e.usuario_id === u.id);
  const active = orders.filter(o => ['pago', 'em_separacao', 'enviado'].includes(o.status)), spent = orders.filter(o => !['cancelado', 'reembolsado'].includes(o.status)).reduce((s, o) => s + Number(o.total), 0);
  const initials = u.nome.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const tabs = [['resumo', 'Resumo', 'user'], ['pedidos', 'Pedidos', 'package'], ['enderecos', 'Endereços', 'pin'], ['cartoes', 'Cartões', 'card']];
  let body = '';
  if (ui.tab === 'resumo') {
    const last = orders[0];
    body = `<div class="stats"><div><b>${orders.length}</b><span>pedidos</span></div><div><b>${active.length}</b><span>em andamento</span></div><div><b>${money(spent)}</b><span>total em compras</span></div></div>
    <h4 class="sec">${last ? 'Último pedido' : 'Pedidos'}</h4>${last ? orderHTML(last) : '<p class="muted" style="font-size:13px">Nenhum pedido ainda. Que tal escolher o primeiro jogo?</p>'}
    <div class="menu-list"><button data-a="wishes">${ic('heart')}<span>Lista de desejos</span><em>${S.wishes.length}</em></button><button data-a="cart">${ic('bag')}<span>Meu carrinho</span><em>${Object.values(S.cart).reduce((a, b) => a + b, 0)}</em></button>
    ${u.tipo === 'admin' ? `<a href="admin.html">${ic('dashboard')}<span>Painel administrativo</span></a>` : ''}</div>`;
  } else if (ui.tab === 'pedidos') {
    body = orders.length ? `<p class="muted" style="font-size:12px">Toque em um pedido para ver a situação detalhada. Situações fictícias, só para demonstração.</p>${orders.map(orderHTML).join('')}` : `<div class="empty-state">${ic('package', 34)}<p>Você ainda não fez pedidos.</p><button class="btn" data-a="close">Ver jogos</button></div>`;
  } else if (ui.tab === 'enderecos') {
    body = `<p class="muted" style="font-size:12px">Seus endereços ficam salvos na sua conta e aparecem na hora de pagar.</p>
    ${addrs.map(e => `<div class="addr-card ${e.principal ? 'main' : ''}"><div class="addr-top"><b>${esc(e.apelido || 'Endereço')}</b>${e.principal ? '<em class="pill-main">Principal</em>' : ''}</div><p>${esc(endTxt(e))}</p>
      <div class="addr-actions">${e.principal ? '' : `<button class="btn ghost sm" data-a="addrMain" data-id="${e.id}">Tornar principal</button>`}<button class="btn ghost sm" data-a="addrEdit" data-id="${e.id}">${ic('pencil', 14)}Editar</button><button class="btn ghost sm" data-a="addrDel" data-id="${e.id}">${ic('trash', 14)}Excluir</button></div></div>`).join('')}
    ${ck.addAddr || !addrs.length ? addrFormHTML('account') : `<button class="btn outline" data-a="addrNew">${ic('plus')}Adicionar endereço</button>`}`;
  } else {
    body = `<p class="muted" style="font-size:12px">Seus cartões: guardamos só a bandeira, os 4 últimos dígitos, o titular e a validade.</p>
    ${mine.map(c => `<div class="vgcard ${expired(c) ? 'expired' : ''}"><span>${esc(c.bandeira)}${expired(c) ? ' · VENCIDO' : ''}</span><b>${masked(c.ultimos_digitos)}</b><div><small>${esc(c.titular)}</small><small>Val. ${fmtVal(c.validade)}</small></div>
      <button class="btn ghost sm card-rm" data-a="cardDel" data-id="${c.id}">${ic('trash', 14)}Remover</button></div>`).join('')}
    ${ck.addCard || !mine.length ? cardFormHTML('account') : `<button class="btn outline" data-a="cardNew">${ic('plus')}Adicionar cartão</button>`}`;
  }
  openDrawer('account', `<header class="drawer-head user-head"><span class="avatar-lg">${esc(initials)}</span><div><h2>Olá, ${esc(u.nome.split(' ')[0])}!</h2><p>${esc(u.email)}</p></div><button class="btn ghost icon" data-a="close" aria-label="Fechar">${ic('x')}</button></header>
  <nav class="drawer-tabs">${tabs.map(t => `<button class="${ui.tab === t[0] ? 'on' : ''}" data-a="tab" data-t="${t[0]}">${ic(t[2], 15)}${t[1]}</button>`).join('')}</nav>
  <div class="drawer-body">${body}</div><footer class="drawer-foot"><button class="btn ghost" data-a="logout">${ic('logout')}Sair da conta</button></footer>`);
}
async function login() {
  const email = $('#acc-email').value.trim().toLowerCase();
  try { await api('auth.php', { acao: 'login', email, senha: $('#acc-pass').value }); await loadDB(); }
  catch (e) { return toast(e.message, 'error'); }
  saveSession(); renderNav(); toast(`Bem-vindo de volta, ${currentUser().nome.split(' ')[0]}!`); showAccount();
}
async function signup() {
  const nome = $('#acc-name').value.trim(), email = $('#acc-email').value.trim().toLowerCase(), senha = $('#acc-pass').value;
  if (nome.length < 3) return toast('Informe seu nome.', 'error');
  if (!/^\S+@\S+\.\S+$/.test(email)) return toast('E-mail inválido.', 'error');
  if (senha.length < 6) return toast('Senha com no mínimo 6 caracteres.', 'error');
  if (senha !== $('#acc-confirm').value) return toast('As senhas não conferem.', 'error');
  try { await api('auth.php', { acao: 'register', nome, email, senha }); await loadDB(); }
  catch (e) { return toast(e.message, 'error'); }
  saveSession(); renderNav(); toast('Conta criada! Cadastre um endereço e um cartão para comprar.'); showAccount();
}

/* checkout */
function cartTotals() {
  const items = Object.entries(S.cart).map(([id, q]) => ({ p: prod(id), q })).filter(i => i.p);
  const subtotal = items.reduce((s, i) => s + price(i.p) * i.q, 0), freteBruto = subtotal >= FREE_SHIP || !subtotal ? 0 : SHIP;
  const c = ck.cupom, desconto = c ? Number(c.desconto || 0) : 0, freteDesc = c ? Number(c.frete_desconto || 0) : 0;
  const frete = Math.max(0, freteBruto - freteDesc);
  return { items, subtotal, freteBruto, frete, desconto, freteDesc, total: Math.max(0, subtotal - desconto + frete) };
}
function showCheckout() {
  const u = currentUser(), t = cartTotals(), { items } = t;
  if (ck.done) { const d = ck.done; return openModal(`<h2>Pedido confirmado</h2><p class="desc">Pedido ${esc(d.codigo)} pago no cartão: <b>${money(d.total)}</b>${d.desconto > 0 ? ` (você economizou ${money(d.desconto)} com o cupom)` : ''}. Acompanhe a situação em Minha conta.</p><div style="text-align:center;color:var(--primary)">${ic('check', 56)}</div><button class="btn" data-a="account">Acompanhar meu pedido</button><button class="btn ghost" data-a="close">Continuar comprando</button>`); }
  if (!u) return openModal(`<h2>Finalizar compra</h2><p class="desc">Entre ou crie sua conta para pagar.</p><button class="btn" data-a="needLogin">${ic('user')}Entrar / Cadastrar</button>`);
  const prev = $('#modal .dialog'), top = prev ? prev.scrollTop : 0;
  const addrs = DB.enderecos.filter(e => e.usuario_id === u.id), cards = DB.cartoes.filter(c => c.usuario_id === u.id), usable = cards.filter(c => !expired(c));
  const addrSel = addrs.find(a => a.id === ck.addrId) || addrs.find(a => a.principal) || addrs[0]; ck.addrId = addrSel ? addrSel.id : null;
  const newCard = ck.payNew || !usable.length, cardSel = newCard ? null : (usable.find(c => c.id === ck.cardId) || usable[0]); ck.cardId = cardSel ? cardSel.id : null;
  const showAddrForm = ck.newAddr || !addrs.length;
  openModal(`<h2>Finalizar compra</h2><p class="desc">${items.length} ${items.length === 1 ? 'jogo' : 'jogos'} no pedido</p>
  <h4 class="sec">1. Endereço de entrega</h4>
  ${addrs.length ? `<div class="stack">${addrs.map(a => `<button class="choice ${addrSel?.id === a.id ? 'on' : ''}" data-a="pickAddr" data-id="${a.id}" aria-pressed="${addrSel?.id === a.id}"><span class="ico">${ic('pin', 16)}</span><span class="main"><b>${esc(a.apelido || 'Endereço')}${a.principal ? ' · principal' : ''}</b><small>${esc(endTxt(a))}</small></span></button>`).join('')}</div>` : '<p class="muted" style="font-size:12px">Cadastre o endereço onde quer receber seus jogos.</p>'}
  ${showAddrForm ? addrFormHTML('checkout') : `<button class="btn outline sm" data-a="addrNewCk">${ic('plus')}Usar outro endereço</button>`}
  <h4 class="sec">2. Cupom de desconto</h4>${couponBox()}
  <h4 class="sec">3. Pagamento</h4>
  ${usable.length ? `<div class="stack">${usable.map(c => `<button class="choice ${cardSel?.id === c.id ? 'on' : ''}" data-a="pickCard" data-id="${c.id}" aria-pressed="${cardSel?.id === c.id}"><span class="ico">${ic('card', 16)}</span><span class="main"><b>${esc(c.bandeira)} ${masked(c.ultimos_digitos)}</b><small>${esc(c.titular)} · val. ${fmtVal(c.validade)}</small></span></button>`).join('')}</div>` : (cards.length ? '<p class="muted" style="font-size:12px">Seus cartões salvos estão vencidos. Use outro cartão.</p>' : '')}
  ${cardSel ? `<div class="grid2">${ffield('card-cvv', 'CVV do cartão', 'inputmode="numeric" autocomplete="cc-csc" placeholder="123" maxlength="4"')}<div></div></div><button class="btn outline sm" data-a="payNew">${ic('plus')}Usar outro cartão</button>` : `${cardFormHTML('checkout')}${usable.length ? `<button class="btn ghost sm" data-a="payUseSaved">Voltar aos cartões salvos</button>` : ''}`}
  <div class="sum-box">${sumHTML(t)}</div>
  <button class="btn lg" data-a="pay" ${items.length && !ck.paying ? '' : 'disabled'}>${ic('wallet')}${ck.paying ? 'Processando...' : `Pagar ${money(t.total)}`}</button>
  <p class="muted note" style="font-size:11px;text-align:center">Demonstração — nenhum pagamento real será realizado.</p>`, true);
  $('#modal').dataset.kind = 'checkout';
  const nd = $('#modal .dialog'); if (nd) nd.scrollTop = top;
}
async function pay() {
  const u = currentUser(); if (!u || ck.paying) return;
  const t = cartTotals(); if (!t.items.length) return toast('Seu carrinho está vazio.', 'error');
  if (!ck.addrId) return toast('Escolha ou cadastre um endereço de entrega.', 'error');
  const cards = DB.cartoes.filter(c => c.usuario_id === u.id && !expired(c)), usingNew = ck.payNew || !cards.length;
  const body = { itens: cartPayload(), endereco_id: ck.addrId, cupom: ck.cupom ? ck.cupom.codigo : '' };
  try {
    if (usingNew) { const c = readCard(true); body.novo_cartao = { numero: c.numero, titular: c.titular, validade: c.validade, apelido: c.apelido, salvar: !!ck.f['card-save'] }; }
    else { if (!/^\d{3,4}$/.test(String(ck.f['card-cvv'] || ''))) throw new Error('Informe o CVV do cartão (3 ou 4 dígitos).'); body.cartao_id = ck.cardId; }
  } catch (e) { ck.cardMsg = usingNew ? e.message : ''; if (usingNew) showCheckout(); return toast(e.message, 'error'); }
  /* o CVV só é conferido aqui no navegador: ele NÃO vai para o servidor nem para o banco */
  ck.paying = true; showCheckout();
  let r;
  try { r = await api('checkout.php', body); }
  catch (e) { ck.paying = false; if (body.novo_cartao) ck.cardMsg = e.message; showCheckout(); return toast(e.message, 'error'); }
  ck.paying = false; S.cart = {}; ck.cupom = null; ck.cupomMsg = ''; ck.payNew = false; clearCardForm();
  try { await loadDB(); } catch { }   /* traz do banco o pedido, o estoque, o cupom usado e os cartões */
  ck.done = r.pedido; ui.open = r.pedido.id; ui.tab = 'pedidos'; renderNav(); renderCatalog(); renderFavs(); saveSession(); toast('Pagamento aprovado!'); showCheckout(); ck.done = null;
}

/* ---------- Catálogo Secreto (+18) ---------- */
const ui18 = { theme: '' };
const adultList = () => DB.produtos.filter(p => p.ativo && p.adulto);
const tagsOf = p => String(p.tags || '').split(',').map(x => x.trim()).filter(Boolean);
const initials = n => String(n).replace(/[^\p{L}\p{N} ]/gu, '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const tagRow = p => `<div class="tag-row">${tagsOf(p).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>`;
function adultCard(p) {
  const r = avg(p.id);
  return `<article class="game-card adult-card" data-a="adultDetail" data-id="${p.id}"><div class="game-cover"><div class="cover adult-cover" style="background:${gradient(p)}">${coverImg(p)}<span class="adult-18">+18</span><span class="adult-initials">${esc(initials(p.nome))}</span></div></div>
  <div class="game-info"><span class="genre">${esc(p.desenvolvedora)}</span><h3>${esc(p.nome)}</h3>${tagRow(p)}
  <div class="game-meta">${r.n ? stars(r.v) : '<span class="muted" style="font-size:11px">Sem avaliações</span>'}</div>
  <div class="game-price-line"><div><strong>${money(price(p))}</strong></div><button class="btn ghost icon" data-a="add" data-id="${p.id}" title="Adicionar ao carrinho" aria-label="Adicionar ${esc(p.nome)} ao carrinho">${ic('plus')}</button></div></div></article>`;
}
function renderSecret() {
  const page = $('#secretPage'); if (!page) return;
  const list = adultList().filter(p => !ui18.theme || tagsOf(p).join(' ').toLowerCase().includes(ui18.theme));
  const themes = [['', 'Todos'], ['femboy', 'Femboy'], ['futanari', 'Futanari'], ['yaoi', 'Yaoi / BL']];
  page.innerHTML = `<header class="secret-head"><div class="secret-title"><span class="adult-18 big">+18</span><div><h1>Catálogo Secreto</h1><p>Área restrita a maiores de 18 anos. Só capas oficiais e informações — sem imagens explícitas.</p></div></div>
  <div class="secret-actions"><button class="btn ghost icon" data-a="cart" title="Carrinho" aria-label="Carrinho">${ic('bag')}<span id="secretCartCount"></span></button><button class="btn outline" data-a="secretExit">${ic('eyeoff')}Sair do modo +18</button><button class="btn" data-a="secretClose">Voltar à loja</button></div></header>
  <div class="secret-body"><div class="chips">${themes.map(([k, n]) => `<button class="chip ${ui18.theme === k ? 'on' : ''}" data-a="theme18" data-t="${k}">${n}</button>`).join('')}</div>
  <div class="game-grid">${list.map(adultCard).join('')}</div>${list.length ? '' : `<div class="empty-state">${ic('search', 30)}<p>Nenhum jogo nesta categoria.</p></div>`}</div>`;
  renderNav();
}
function openSecret() {
  closeModal(); $('#secretPage')?.remove();
  const page = document.createElement('section'); page.id = 'secretPage'; page.className = 'secret-page'; page.setAttribute('aria-label', 'Catálogo Secreto +18');
  document.body.append(page); document.body.classList.add('no-scroll'); ui18.theme = ''; renderSecret(); page.scrollTop = 0;
}
function closeSecret() { $('#secretPage')?.remove(); document.body.classList.remove('no-scroll'); }
function secretEntry() {
  if (!currentUser()) { toast('Para entrar no Catálogo +18 você precisa estar cadastrado e logado.', 'error'); ck.mode = 'cadastrar'; return showAccount(); }
  if (S.adulto) return openSecret();
  openModal(`<h2>Conteúdo para maiores de 18 anos</h2><p class="desc">O Catálogo Secreto reúne jogos classificados como +18. Ao continuar, você declara ter 18 anos ou mais e que o acesso a esse tipo de conteúdo é permitido onde você mora.</p>
  <div class="stack"><button class="btn lg" data-a="age18Yes">${ic('check')}Tenho 18 anos ou mais</button><button class="btn outline lg" data-a="close">Tenho menos de 18 anos — sair</button></div>`);
  $('#modal').dataset.kind = 'age';
}
async function confirmAge() {
  try { await api('idade.php', { acao: 'confirmar', maior18: true }); await loadDB(); } catch (e) { return toast(e.message, 'error'); }
  closeModal(); openSecret(); loadCovers();
}
async function exitAdult() {
  try { await api('idade.php', { acao: 'sair' }); await loadDB(); } catch (e) { S.adulto = false; }
  closeSecret(); renderNav(); saveSession(); toast('Modo +18 desativado.');
}
function showAdultDetail(p) {
  if (!p) return; const low = p.estoque < 10;
  openModal(`<div class="adult-detail-cover" style="background:linear-gradient(oklch(.1 .05 300 /.35),oklch(.1 .05 300 /.7)),${bg(p, coverUrl(p))}"><span class="adult-18">+18</span><strong>${esc(p.nome)}</strong></div>
  <div><h2>${esc(p.nome)}</h2><p class="desc plat-line">${platIcon(p.plataforma_id, 14)}${esc(platName(p.plataforma_id))} · Classificação 18+</p></div>${tagRow(p)}
  <div id="ratingTop">${ratingsHTML(p)}</div>
  <h4 class="sec">Sobre o jogo</h4><p class="synopsis">${esc(p.sinopse || p.descricao)}</p>
  <dl class="specs"><div><dt>Desenvolvedora</dt><dd>${esc(p.desenvolvedora)}</dd></div><div><dt>Publicadora</dt><dd>${esc(p.publicadora)}</dd></div><div><dt>Lançamento</dt><dd>${p.data_lancamento ? dateBR(p.data_lancamento) : '—'}</dd></div><div><dt>Estoque</dt><dd class="${low ? 'danger' : ''}">${low ? `Restam só ${p.estoque} unidades` : 'Em estoque'}</dd></div></dl>
  <div class="buy-row"><div><span class="tag-physical">Mídia física lacrada</span><strong class="big-price">${money(price(p))}</strong></div><div class="buy-actions"><button class="btn lg" data-a="addClose" data-id="${p.id}">${ic('bag')}Adicionar ao carrinho</button></div></div>
  <div id="reviews">${reviewsHTML(p)}</div>`, true);
  $('#modal').dataset.kind = 'detail';
}

/* inicialização da loja */
async function initStore() {
  await boot();
  document.body.insertAdjacentHTML('beforeend', '<div id="toasts"></div>');
  const search = v => { ui.query = v; ui.shown = 12; $('#q').value = v; $('#q2').value = v; renderCatalog(); };
  $('#q').oninput = e => { search(e.target.value); scrollCatalog(); };
  $('#q2').oninput = e => search(e.target.value);
  setInterval(() => { if (!document.hidden && !$('#modal')) { ui.slide = (ui.slide + 1) % nSlides(); renderHero(); } }, 7000);
  /* segundo botão secreto: o pontinho discreto no rodapé abre o Catálogo Secreto (+18) */
  const s18 = $('#secret18'); if (s18) s18.onclick = () => secretEntry();
  /* menu "Git": fecha ao clicar fora ou apertar ESC */
  const gitBtn = $('#gitBtn'), gitMenu = $('#gitMenu');
  if (gitBtn && gitMenu) {
    const gitOpen = o => { gitMenu.classList.toggle('hidden', !o); gitBtn.setAttribute('aria-expanded', String(o)); };
    gitBtn.onclick = e => { e.stopPropagation(); gitOpen(gitMenu.classList.contains('hidden')); };
    document.addEventListener('click', e => { if (!gitMenu.classList.contains('hidden') && !e.target.closest('.git-wrap')) gitOpen(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') gitOpen(false); });
  }
  let clicks = 0, last = 0;
  $('#secret').onclick = () => { const now = Date.now(); clicks = now - last < 700 ? clicks + 1 : 1; last = now; if (clicks >= 5) location.href = 'admin.html'; };
  refresh();
  loadCovers();
}
if (document.body.dataset.page === 'store') initStore();
