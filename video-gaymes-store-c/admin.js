/* ===== Video Gay(mes) Store — painel administrativo =====
   Usa o núcleo do app.js (DB, boot, ic, money, esc, openModal, toast, actions).
   Tudo é lido/gravado no mesmo localStorage da loja, então o que você muda aqui aparece lá. */

const MODULES = [
  ['dashboard', 'Visão geral', 'dashboard'], ['produtos', 'Produtos', 'package'], ['categorias', 'Categorias', 'tags'],
  ['plataformas', 'Plataformas', 'gamepad'], ['pedidos', 'Pedidos', 'bag'], ['pagamentos', 'Pagamentos', 'card'],
  ['usuarios', 'Clientes', 'users'], ['enderecos', 'Endereços', 'pin'], ['cupons', 'Cupons', 'ticket'],
  ['avaliacoes', 'Avaliações', 'star'], ['carrinhos', 'Carrinhos', 'bag'], ['lista_desejos', 'Lista de desejos', 'heart']
];
const SUBTITLES = { carrinho_itens: 'Itens dos carrinhos', pedido_itens: 'Itens dos pedidos', pedido_cupons: 'Cupons dos pedidos' };
const PARENT = { pedido_itens: 'pedidos', pedido_cupons: 'pedidos', carrinho_itens: 'carrinhos' };
const TABS = { pedidos: [['pedidos', 'Pedidos'], ['pedido_itens', 'Itens dos pedidos'], ['pedido_cupons', 'Cupons aplicados']], carrinhos: [['carrinhos', 'Carrinhos'], ['carrinho_itens', 'Itens dos carrinhos']] };
TABS.pedido_itens = TABS.pedido_cupons = TABS.pedidos; TABS.carrinho_itens = TABS.carrinhos;

const LABELS = { nome: 'Nome', slug: 'Slug', descricao: 'Descrição', desenvolvedora: 'Desenvolvedora', publicadora: 'Publicadora', preco: 'Preço', preco_promocional: 'Preço promocional', estoque: 'Estoque', categoria_id: 'Categoria', plataforma_id: 'Plataforma', imagem_url: 'URL da imagem', hero_url: 'URL do banner (hero)', trailer_url: 'URL do trailer', classificacao_indicativa: 'Classificação indicativa', data_lancamento: 'Lançamento', ativo: 'Ativo', destaque: 'Destaque', email: 'E-mail', senha: 'Senha', cpf: 'CPF', telefone: 'Telefone', tipo: 'Tipo', codigo: 'Código', usuario_id: 'Cliente', endereco_entrega: 'Endereço de entrega', status: 'Status', subtotal: 'Subtotal', desconto: 'Desconto', frete: 'Frete', total: 'Total', codigo_rastreio: 'Código de rastreio', metodo: 'Método', valor: 'Valor', parcelas: 'Parcelas', bandeira: 'Bandeira', ultimos_digitos: 'Últimos dígitos', transacao_id: 'Transação', valor_minimo: 'Valor mínimo', usos_maximos: 'Limite de usos', usos_atuais: 'Usos atuais', validade: 'Validade', produto_id: 'Produto', nota: 'Nota', comentario: 'Comentário', pedido_id: 'Pedido', carrinho_id: 'Carrinho', quantidade: 'Quantidade', criado_em: 'Criado em', atualizado_em: 'Atualizado em', logradouro: 'Logradouro', numero: 'Número', complemento: 'Complemento', bairro: 'Bairro', cidade: 'Cidade', estado: 'Estado', principal: 'Principal', cep: 'CEP', nome_produto: 'Produto', preco_unitario: 'Preço unitário', cupom_id: 'Cupom', desconto_aplicado: 'Desconto aplicado', sinopse: 'Sinopse', nota_critica: 'Nota da crítica (0-100)', cor1: 'Cor 1 (capa)', cor2: 'Cor 2 (capa)' };
const COLUMNS = {
  produtos: ['nome', 'plataforma_id', 'preco_promocional', 'estoque', 'ativo'], categorias: ['nome', 'slug', 'descricao'], plataformas: ['nome', 'slug'],
  usuarios: ['nome', 'email', 'tipo', 'ativo'], pedidos: ['codigo', 'usuario_id', 'total', 'status', 'criado_em'], pagamentos: ['pedido_id', 'metodo', 'valor', 'status'],
  enderecos: ['usuario_id', 'logradouro', 'cidade', 'estado', 'principal'], cupons: ['codigo', 'tipo', 'valor', 'usos_atuais', 'validade', 'ativo'],
  avaliacoes: ['produto_id', 'usuario_id', 'nota', 'comentario'], carrinhos: ['usuario_id', 'atualizado_em'], lista_desejos: ['usuario_id', 'produto_id', 'criado_em'],
  carrinho_itens: ['carrinho_id', 'produto_id', 'quantidade'], pedido_itens: ['pedido_id', 'nome_produto', 'preco_unitario', 'quantidade'], pedido_cupons: ['pedido_id', 'cupom_id', 'desconto_aplicado']
};
/* campos de um registro novo (usados quando a tabela está vazia ou para completar linhas antigas) */
const TEMPLATES = {
  produtos: { nome: '', slug: '', descricao: '', sinopse: '', nota_critica: 0, desenvolvedora: '', publicadora: '', preco: 0, preco_promocional: 0, estoque: 0, categoria_id: 1, plataforma_id: 1, imagem_url: '', hero_url: '', cor1: '#222222', cor2: '#555555', trailer_url: '', classificacao_indicativa: 0, data_lancamento: '', ativo: 1, destaque: 0 },
  categorias: { nome: '', slug: '', descricao: '' }, plataformas: { nome: '', slug: '' },
  usuarios: { nome: '', email: '', senha: '', cpf: '', telefone: '', tipo: 'cliente', ativo: 1 },
  enderecos: { usuario_id: 1, cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', principal: 0 },
  cupons: { codigo: '', tipo: 'percentual', valor: 0, valor_minimo: 0, usos_maximos: 0, usos_atuais: 0, validade: '', ativo: 1 }
};
const READONLY = ['pagamentos', 'carrinhos', 'lista_desejos', 'carrinho_itens', 'pedido_itens', 'pedido_cupons', 'avaliacoes'];
const ORDER_STATUS = ['aguardando_pagamento', 'pago', 'em_separacao', 'enviado', 'entregue', 'cancelado', 'reembolsado'];
const PAY_STATUS = ['pendente', 'aprovado', 'recusado', 'estornado', 'cancelado'];
const STATUS_NAMES = { aguardando_pagamento: 'Aguardando pagamento', pago: 'Pago', em_separacao: 'Em separação', enviado: 'Enviado', entregue: 'Entregue', cancelado: 'Cancelado', reembolsado: 'Reembolsado', aprovado: 'Aprovado', pendente: 'Pendente', recusado: 'Recusado', estornado: 'Estornado', cartao: 'Cartão', pix: 'Pix', boleto: 'Boleto', percentual: 'Percentual', fixo: 'Fixo', cliente: 'Cliente', admin: 'Administrador' };
const PAGE_SIZE = 8;

const A = { module: 'dashboard', query: '', filter: 'all', days: '30', page: 1, asc: true, sort: 'id' };
const rowsOf = m => DB[m] || [];
const nameOf = (table, id, key = 'nome') => (rowsOf(table).find(r => r.id === id) || {})[key] ?? id;
const current = () => (MODULES.find(m => m[0] === A.module) || [])[1] || SUBTITLES[A.module] || A.module;
const isReadOnly = () => READONLY.includes(A.module);
const pill = v => { const t = String(v); return `<span class="status-pill ${['pago', 'entregue', 'aprovado', '1'].includes(t) ? 'positive' : ''}">${t === '1' ? 'Ativo' : t === '0' ? 'Inativo' : esc(STATUS_NAMES[t] ?? t)}</span>`; };
const orderTotal = () => rowsOf('pedidos').filter(p => !['cancelado', 'reembolsado'].includes(p.status)).reduce((n, p) => n + Number(p.total), 0);
const lowStock = () => DB.produtos.filter(p => p.estoque < 10);
const thumb = p => `<span style="display:inline-block;width:64px;height:30px;border-radius:3px;flex-shrink:0;background:${bg(p, p.imagem_url)}"></span>`;

/* ---------- casca do painel ---------- */
function renderAdmin() {
  const parent = PARENT[A.module] || A.module;
  $('#admin').innerHTML = `<div class="admin-shell">
  <aside class="admin-sidebar">${brand()}<div class="admin-nav-label">GERENCIAR LOJA</div>
    <nav class="admin-nav" aria-label="Administração">${MODULES.map(([id, name, icon]) => `<button class="btn ghost ${parent === id ? 'selected' : ''}" data-a="ad_module" data-m="${id}">${ic(icon)}${name}${id === 'produtos' ? `<span class="count">${DB.produtos.length}</span>` : ''}</button>`).join('')}</nav>
    <div class="admin-bottom"><a class="btn ghost" href="index.html" style="width:100%;justify-content:flex-start">${ic('upright')}Voltar para a loja</a>
    <button class="btn ghost" style="width:100%;justify-content:flex-start" data-a="ad_reset">${ic('download')}Restaurar dados</button><p>Video Gay(mes) Store · 2026</p></div>
  </aside>
  <div class="admin-main">
    <header class="admin-topbar"><h2>Painel administrativo ${ic('chevR', 12)} <b>${esc(current())}</b></h2>
      <div class="who"><button class="btn ghost icon" data-a="ad_bell" title="Alertas de estoque">${ic('bell')}</button><span class="avatar">VG</span><span>${esc(adminUser()?.nome || 'Administrador')}</span><button class="btn ghost icon" data-a="ad_logout" title="Sair">${ic('logout')}</button></div></header>
    <main class="admin-content" id="content"></main>
    <div class="admin-foot"><span>Ambiente demonstrativo · alterações salvas neste navegador (localStorage)</span><a href="index.html" class="text-primary">Abrir loja ${ic('upright', 10)}</a></div>
  </div></div>`;
  renderContent();
}

function renderContent() {
  const dash = A.module === 'dashboard';
  $('#content').innerHTML = `<div class="admin-title"><div><h1>${dash ? 'Um bom dia para dar play.' : esc(current())}</h1><p>${dash ? 'Aqui está o que acontece na sua loja.' : 'Tudo organizado, do seu jeito.'}</p></div><span class="demo-badge">DADOS DE DEMONSTRAÇÃO</span></div>${dash ? dashboardHTML() : moduleHTML()}`;
  if (dash) animateCounters(); else { bindToolbar(); renderTable(); }
}

/* ---------- dashboard ---------- */
function animateCounters() {
  document.querySelectorAll('.counter').forEach(el => {
    const target = Number(el.dataset.v), cur = el.dataset.c === '1', start = performance.now();
    const step = now => { const t = Math.min((now - start) / 700, 1), v = target * (1 - Math.pow(1 - t, 3)); el.textContent = cur ? money(v) : Math.round(v); if (t < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}
function smoothPath(pts) { let d = `M${pts[0][0]},${pts[0][1]}`; for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], mx = (x0 + x1) / 2; d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`; } return d; }
function chartHTML() {
  const days = Number(A.days), total = orderTotal(), W = 600, H = 230, L = 46, R = 12, T = 14, B = 28;
  const data = Array.from({ length: 14 }, (_, i) => ({ dia: Math.round(1 + i * (days - 1) / 13), v: Math.round((total / 14) * (0.5 + Math.sin(i * 1.7) * .3 + i / 12) * (days / 7)) }));
  const max = Math.max(1, ...data.map(d => d.v)) * 1.1;
  const x = i => L + i * (W - L - R) / 13, y = v => T + (1 - v / max) * (H - T - B);
  const pts = data.map((d, i) => [x(i), y(d.v)]), line = smoothPath(pts), base = H - B;
  const grid = [0, .25, .5, .75, 1].map(f => { const yy = T + f * (H - T - B); return `<line x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}" stroke="var(--border)" stroke-dasharray="3 4"/><text x="${L - 8}" y="${yy + 3}" text-anchor="end" font-size="10" fill="var(--muted-foreground)">${Math.round(max * (1 - f) / 100) / 10}k</text>`; }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico de vendas simulado">${grid}
  <path d="${line} L${pts[13][0]},${base} L${pts[0][0]},${base} Z" fill="var(--brand-deep)" fill-opacity=".18"/>
  <path d="${line}" fill="none" stroke="var(--accent)" stroke-width="2"/>
  ${data.map((d, i) => `<text x="${x(i)}" y="${H - 8}" text-anchor="middle" font-size="10" fill="var(--muted-foreground)">${i % 2 === 0 ? d.dia : ''}</text><circle cx="${x(i)}" cy="${y(d.v)}" r="5" fill="var(--accent)" fill-opacity="0" stroke="none" onmouseover="this.setAttribute('fill-opacity',1)" onmouseout="this.setAttribute('fill-opacity',0)"><title>Dia ${d.dia}: ${money(d.v)}</title></circle>`).join('')}</svg>`;
}
function dashboardHTML() {
  const pedidos = rowsOf('pedidos'), total = orderTotal(), low = lowStock();
  const sold = {}; rowsOf('pedido_itens').forEach(i => sold[i.produto_id] = (sold[i.produto_id] || 0) + Number(i.quantidade));
  const top = [...DB.produtos].sort((a, b) => (sold[b.id] || 0) - (sold[a.id] || 0) || a.id - b.id).slice(0, 3);
  const stats = [
    ['Vendas do período', total, 1, 'card', `${pedidos.length} pedidos`], ['Pedidos recebidos', pedidos.length, 0, 'bag', 'no período'],
    ['Ticket médio', pedidos.length ? total / pedidos.length : 0, 1, 'upright', 'por pedido'], ['Clientes cadastrados', rowsOf('usuarios').length, 0, 'users', 'na sua loja']
  ];
  return `<div class="stat-grid">${stats.map(([l, v, c, icon, note]) => `<div class="stat-card"><div class="stat-label">${l}${ic(icon, 16)}</div><strong><span class="counter" data-v="${v}" data-c="${c}">0</span></strong><div class="stat-change">${ic('check', 10)} ${note}<span>Dados de exemplo</span></div></div>`).join('')}</div>
  <div class="dashboard-charts">
    <section class="chart-panel"><div class="panel-heading"><div><h3>Vendas ao longo do tempo</h3><p>Receita por dia · simulação</p></div><div style="display:flex;gap:4px">${['7', '30', '90'].map(d => `<button class="btn sm ${A.days === d ? 'secondary' : 'ghost'}" data-a="ad_days" data-d="${d}">${d} dias</button>`).join('')}</div></div><div class="chart-frame">${chartHTML()}</div></section>
    <section class="chart-panel"><div class="panel-heading"><div><h3>Pedidos por status</h3><p>De olho em cada etapa</p></div>${ic('bag', 16)}</div>
      <div class="status-list">${['pago', 'em_separacao', 'enviado', 'entregue'].map(s => { const n = pedidos.filter(p => p.status === s).length; return `<div><div class="status-item"><span>${STATUS_NAMES[s]}</span><span>${n} <span class="muted">pedidos</span></span></div><progress value="${n}" max="${pedidos.length || 1}"></progress></div>`; }).join('')}</div>
      <div class="row-between" style="font-size:12px;padding-top:12px;border-top:1px solid var(--border)"><span class="muted">Total de pedidos</span><strong>${pedidos.length}</strong></div></section>
  </div>
  <div class="dashboard-bottom">
    <section class="chart-panel"><div class="panel-heading"><div><h3>Últimos pedidos</h3><p>As aventuras que acabaram de começar</p></div><button class="btn sm ghost" data-a="ad_module" data-m="pedidos">Ver todos ${ic('right')}</button></div>${tableHTML([...pedidos].reverse().slice(0, 5), ['codigo', 'total', 'status'], false, 'pedidos')}</section>
    <section class="chart-panel"><div class="panel-heading"><div><h3>Atenção ao estoque</h3><p>${low.length} produtos precisam de reposição</p></div><span class="danger">${ic('package', 16)}</span></div>
      ${low.map(p => `<div class="stock-row">${cover(p, false)}<div class="grow"><h4>${esc(p.nome)}</h4><p>${p.estoque} unidades restantes</p></div><button class="btn ghost icon" data-a="ad_edit" data-m="produtos" data-id="${p.id}" title="Editar estoque de ${esc(p.nome)}">${ic('upright')}</button></div>`).join('') || '<p class="muted" style="font-size:12px;padding:12px 0">Estoque em dia. 🎮</p>'}
      <button class="btn sm ghost" style="width:100%;margin-top:16px" data-a="ad_module" data-m="produtos">Gerenciar produtos ${ic('right')}</button></section>
  </div>
  <div class="dashboard-bottom">
    <section class="chart-panel"><div class="panel-heading"><h3>Jogos mais vendidos</h3><span class="text-primary">${ic('star', 16)}</span></div>
      ${top.map((p, i) => `<div class="stock-row"><span class="muted" style="font-size:12px;width:20px">0${i + 1}</span>${cover(p, false)}<div class="grow"><h4>${esc(p.nome)}</h4><span class="muted" style="font-size:10px">${sold[p.id] || 0} vendidos</span></div><strong style="font-size:12px">${money(p.preco_promocional)}</strong></div>`).join('')}</section>
    <section class="chart-panel"><div class="panel-heading"><h3>Cupons ativos</h3><span class="text-primary">${ic('ticket', 16)}</span></div>
      ${rowsOf('cupons').filter(c => c.ativo).map(c => `<div class="stock-row"><div class="grow"><h4>${esc(c.codigo)}</h4><span class="muted" style="font-size:10px">${c.usos_atuais} de ${c.usos_maximos} usos · até ${dateBR(c.validade)}</span></div><span class="text-primary" style="font-size:12px">${c.tipo === 'percentual' ? c.valor + '%' : money(c.valor)}</span></div>`).join('')}
      <button class="btn sm ghost" style="width:100%;margin-top:16px" data-a="ad_module" data-m="cupons">Gerenciar cupons ${ic('right')}</button></section>
  </div>`;
}

/* ---------- módulos (listagem) ---------- */
function moduleHTML() {
  const tabs = TABS[A.module], hasStatus = ['pedidos', 'pagamentos', 'produtos', 'usuarios', 'cupons'].includes(A.module);
  const opts = A.module === 'pedidos' ? ORDER_STATUS : A.module === 'pagamentos' ? PAY_STATUS : ['1', '0'];
  return `${tabs ? `<div class="module-tabs">${tabs.map(([m, n]) => `<button class="btn ${A.module === m ? 'secondary' : 'ghost'}" data-a="ad_module" data-m="${m}">${n}</button>`).join('')}</div>` : ''}
  <div class="module-toolbar"><div class="left"><input id="adQ" aria-label="Buscar em ${esc(current())}" placeholder="Buscar em ${esc(current().toLowerCase())}..." value="${esc(A.query)}">
    ${hasStatus ? `<select id="adF" aria-label="Filtrar status"><option value="all">Todos os status</option>${opts.map(s => `<option value="${s}" ${A.filter === s ? 'selected' : ''}>${s === '1' ? 'Ativo' : s === '0' ? 'Inativo' : STATUS_NAMES[s]}</option>`).join('')}</select>` : ''}</div>
    <div class="right"><button class="btn outline icon" data-a="ad_csv" title="Exportar CSV">${ic('download')}</button>${!isReadOnly() && A.module !== 'pedidos' ? `<button class="btn" data-a="ad_new">${ic('plus')}Novo registro</button>` : ''}</div></div>
  <div id="tableArea"></div>`;
}
function bindToolbar() {
  $('#adQ').oninput = e => { A.query = e.target.value; A.page = 1; renderTable(); };
  const f = $('#adF'); if (f) f.onchange = () => { A.filter = f.value; A.page = 1; renderTable(); };
}
function cell(r, k, mod) {
  const v = r[k] ?? '—';
  if (['status', 'ativo', 'principal'].includes(k)) return pill(v);
  if (['total', 'preco_promocional', 'preco_unitario', 'valor', 'desconto_aplicado'].includes(k)) return (k === 'valor' && mod === 'cupons' && r.tipo === 'percentual') ? v + '%' : money(Number(v));
  if (k === 'plataforma_id') return esc(nameOf('plataformas', v));
  if (k === 'usuario_id') return esc(nameOf('usuarios', v));
  if (k === 'produto_id') return esc(nameOf('produtos', v));
  if (k === 'pedido_id') return esc(nameOf('pedidos', v, 'codigo'));
  if (k === 'cupom_id') return esc(nameOf('cupons', v, 'codigo'));
  if (k === 'metodo' || (k === 'tipo' && STATUS_NAMES[v])) return esc(STATUS_NAMES[v] ?? v);
  if (k === 'estoque') return `<span class="${Number(v) < 10 ? 'danger' : 'muted'}">${v} unidades</span>`;
  if (k === 'nota') return `<span class="text-primary">${'★'.repeat(Number(v))}</span>`;
  if (k === 'nome' && mod === 'produtos') return `<div style="display:flex;align-items:center;gap:12px">${thumb(r)}<strong>${esc(v)}</strong></div>`;
  return esc(String(v));
}
function tableHTML(data, keys, actions, mod) {
  const arrow = k => A.sort === k ? (A.asc ? ' ▲' : ' ▼') : '';
  return `<div class="table-wrap"><table><thead><tr>${keys.map(k => `<th><button data-a="ad_sort" data-k="${k}">${LABELS[k] ?? k}${actions ? arrow(k) : ''}</button></th>`).join('')}${actions ? '<th style="text-align:right">Ações</th>' : ''}</tr></thead>
  <tbody>${data.map(r => `<tr>${keys.map(k => `<td>${cell(r, k, mod)}</td>`).join('')}${actions ? `<td><div class="actions">
    <button class="btn ghost icon sm" data-a="ad_detail" data-id="${r.id}" title="Ver detalhes">${ic('search')}</button>
    ${!READONLY.includes(mod) ? `<button class="btn ghost icon sm" data-a="ad_edit" data-m="${mod}" data-id="${r.id}" title="Editar">${ic('pencil')}</button>` : ''}
    ${!READONLY.includes(mod) && !['pedidos', 'usuarios'].includes(mod) ? `<button class="btn ghost icon sm" data-a="ad_del" data-id="${r.id}" title="Excluir">${ic('trash')}</button>` : ''}</div></td>` : ''}</tr>`).join('')}</tbody></table>
  ${data.length ? '' : '<div class="empty-state">Nenhum registro encontrado.</div>'}</div>`;
}
function filteredRows() {
  const q = A.query.toLowerCase();
  return rowsOf(A.module).filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(q)) && (A.filter === 'all' || String(r.status ?? r.ativo) === A.filter))
    .sort((a, b) => String(a[A.sort] ?? '').localeCompare(String(b[A.sort] ?? ''), 'pt-BR', { numeric: true }) * (A.asc ? 1 : -1));
}
function renderTable() {
  const list = filteredRows(), pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  if (A.page > pages) A.page = pages;
  $('#tableArea').innerHTML = tableHTML(list.slice((A.page - 1) * PAGE_SIZE, A.page * PAGE_SIZE), COLUMNS[A.module] || [], true, A.module) +
    `<div class="pager"><span>${list.length} registros</span><div><button class="btn ghost sm" data-a="ad_page" data-d="-1" ${A.page === 1 ? 'disabled' : ''}>Anterior</button><span>${A.page} / ${pages}</span><button class="btn ghost sm" data-a="ad_page" data-d="1" ${A.page >= pages ? 'disabled' : ''}>Próxima</button></div></div>`;
}

/* ---------- formulário de criar/editar ---------- */
function control(key, val, mod) {
  const label = LABELS[key] ?? key, num = typeof val === 'number', attrs = `id="f-${key}" data-key="${key}" data-t="${num ? 'n' : 's'}" aria-label="${esc(label)}"`;
  let opts = null;
  if (['ativo', 'destaque', 'principal'].includes(key)) opts = [['1', 'Sim'], ['0', 'Não']];
  else if (key === 'status') opts = (mod === 'pedidos' ? ORDER_STATUS : PAY_STATUS).map(s => [s, STATUS_NAMES[s]]);
  else if (key === 'tipo') opts = (mod === 'usuarios' ? ['cliente', 'admin'] : ['percentual', 'fixo']).map(s => [s, STATUS_NAMES[s]]);
  else if (key === 'metodo') opts = ['cartao', 'pix', 'boleto'].map(s => [s, STATUS_NAMES[s]]);
  else if (key === 'categoria_id') opts = DB.categorias.map(c => [String(c.id), c.nome]);
  else if (key === 'plataforma_id') opts = DB.plataformas.map(c => [String(c.id), c.nome]);
  else if (key === 'usuario_id') opts = DB.usuarios.map(c => [String(c.id), c.nome]);
  else if (key === 'produto_id') opts = DB.produtos.map(c => [String(c.id), c.nome]);
  if (opts) return `<label>${label}<select ${attrs}>${opts.map(([o, n]) => `<option value="${esc(o)}" ${String(val) === o ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>`;
  const type = ['validade', 'data_lancamento'].includes(key) ? 'date' : ['cor1', 'cor2'].includes(key) ? 'color' : key === 'senha' ? 'password' : key === 'email' ? 'email' : num ? 'number' : 'text';
  return `<label>${label}<input ${attrs} type="${type}" ${num ? 'step="any" min="0"' : ''} value="${esc(val)}"></label>`;
}
function openForm(mod, row) {
  A.formModule = mod;
  const isNew = !row, base = isNew ? { ...(TEMPLATES[mod] || {}) } : { ...(TEMPLATES[mod] || {}), ...row };
  const data = Object.entries(base).filter(([k]) => k !== 'id' && !k.endsWith('_em') && (mod !== 'pedidos' || ['status', 'codigo_rastreio'].includes(k)));
  A.editId = isNew ? null : row.id;
  openModal(`<h2>${isNew ? 'Criar' : 'Editar'} · ${esc(MODULES.find(m => m[0] === mod)?.[1] || mod)}</h2><p class="desc">Alterações de demonstração, salvas só neste navegador.</p>
  <form id="adForm"><div class="form-grid">${data.map(([k, v]) => control(k, v, mod)).join('')}</div>
  ${mod === 'cupons' ? `<button type="button" class="btn outline" style="margin-top:16px" data-a="ad_gen">Gerar código</button>` : ''}
  <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:22px"><button type="button" class="btn outline" data-a="close">Cancelar</button><button type="submit" class="btn">${ic('check')}Salvar alterações</button></div></form>`, true);
  $('#adForm').onsubmit = e => { e.preventDefault(); saveForm(); };
}
function saveForm() {
  const mod = A.formModule, rec = {};
  document.querySelectorAll('#adForm [data-key]').forEach(el => rec[el.dataset.key] = el.dataset.t === 'n' ? Number(el.value) : el.value);
  const req = ['produtos', 'usuarios', 'categorias', 'plataformas'].includes(mod) ? 'nome' : mod === 'cupons' ? 'codigo' : null;
  if (req && !String(rec[req] ?? '').trim()) return toast(`Preencha ${LABELS[req].toLowerCase()}.`, 'error');
  if (mod === 'produtos') {
    if (rec.preco <= 0) return toast('Informe um preço maior que zero.', 'error');
    if (rec.preco_promocional < 0 || rec.estoque < 0) return toast('Preço e estoque não podem ser negativos.', 'error');
    if (!rec.preco_promocional) rec.preco_promocional = rec.preco;
    if (rec.preco_promocional > rec.preco) return toast('O preço promocional não pode ser maior que o preço.', 'error');
    if (!rec.slug.trim()) rec.slug = rec.nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  if (mod === 'usuarios' && !/^\S+@\S+\.\S+$/.test(rec.email)) return toast('Informe um e-mail válido.', 'error');
  if (mod === 'usuarios' && DB.usuarios.some(u => u.email.toLowerCase() === rec.email.toLowerCase() && u.id !== A.editId)) return toast('Esse e-mail já está em uso.', 'error');
  if (mod === 'cupons' && rec.valor <= 0) return toast('O desconto deve ser maior que zero.', 'error');
  const rows = DB[mod];
  if (A.editId) Object.assign(rows.find(r => r.id === A.editId), rec);
  else rows.push({ id: nextId(rows), ...rec });
  saveDB(); closeModal(); toast('Alterações salvas nesta demonstração.');
  A.module = mod; renderAdmin();
}

/* ---------- detalhes ---------- */
function showDetail(row) {
  const mod = A.module, hide = ['imagem_url', 'trailer_url', 'descricao', 'sinopse', 'senha', 'cor1', 'cor2'];
  const show = (k, v) => k === 'usuario_id' ? nameOf('usuarios', v) : k === 'produto_id' ? nameOf('produtos', v) : k === 'categoria_id' ? nameOf('categorias', v) : k === 'plataforma_id' ? nameOf('plataformas', v) : k === 'pedido_id' ? nameOf('pedidos', v, 'codigo') : ['ativo', 'principal', 'destaque'].includes(k) ? (v ? 'Sim' : 'Não') : ['preco', 'preco_promocional', 'subtotal', 'desconto', 'frete', 'total', 'valor_minimo', 'preco_unitario'].includes(k) ? money(v) : (STATUS_NAMES[String(v)] ?? (v === '' || v == null ? '—' : v));
  let extra = '';
  if (mod === 'pedidos') {
    const items = rowsOf('pedido_itens').filter(i => i.pedido_id === row.id);
    extra = `<h3 style="font-size:14px;margin-top:6px">Itens do pedido</h3>${items.map(i => `<p style="font-size:12px">${i.quantidade}× ${esc(i.nome_produto)} · ${money(i.preco_unitario)}</p>`).join('') || '<p class="muted" style="font-size:12px">Sem itens cadastrados neste pedido de exemplo.</p>'}`;
  }
  if (mod === 'usuarios') {
    const ends = rowsOf('enderecos').filter(e => e.usuario_id === row.id), ped = rowsOf('pedidos').filter(p => p.usuario_id === row.id);
    extra = `<h3 style="font-size:14px;margin-top:6px">Endereços</h3>${ends.map(e => `<p style="font-size:12px">${esc(e.logradouro)}, ${esc(e.numero)} · ${esc(e.cidade)}/${esc(e.estado)}</p>`).join('') || '<p class="muted" style="font-size:12px">Nenhum endereço.</p>'}<h3 style="font-size:14px;margin-top:6px">Pedidos</h3><p style="font-size:12px">${ped.length} pedido(s) · ${money(ped.reduce((s, p) => s + p.total, 0))}</p>`;
  }
  openModal(`<h2>Detalhes · ${esc(current())}</h2><p class="desc">Registro #${row.id}</p>
  <dl>${Object.entries(row).filter(([k]) => !hide.includes(k)).map(([k, v]) => `<div><dt>${LABELS[k] ?? k}</dt><dd>${esc(show(k, v))}</dd></div>`).join('')}</dl>${extra}`, true);
}

/* ---------- CSV ---------- */
function exportCsv() {
  const mod = A.module === 'dashboard' ? 'pedidos' : A.module, rows = rowsOf(mod), keys = Object.keys(rows[0] || {});
  if (!rows.length) return toast('Nada para exportar.', 'error');
  const safe = v => { let s = String(v ?? ''); if (/^[=+\-@]/.test(s)) s = "'" + s; return '"' + s.replaceAll('"', '""') + '"'; }; // evita injeção de fórmula no Excel
  const csv = '﻿' + [keys.join(';'), ...rows.map(r => keys.map(k => safe(r[k])).join(';'))].join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = mod + '.csv'; a.click(); URL.revokeObjectURL(a.href);
  toast('Relatório exportado.');
}

/* ---------- ações (data-a="ad_...") ---------- */
const go = m => { A.module = m; A.query = ''; A.filter = 'all'; A.page = 1; A.sort = 'id'; A.asc = true; renderAdmin(); };
const rowById = (m, id) => rowsOf(m).find(r => r.id === Number(id));
Object.assign(actions, {
  ad_module: d => go(d.m),
  ad_days: d => { A.days = d.d; renderContent(); },
  ad_bell: () => { go('produtos'); toast(`${lowStock().length} jogos com estoque abaixo de 10 unidades.`); },
  ad_sort: d => { if (A.module === 'dashboard') return; A.asc = A.sort === d.k ? !A.asc : true; A.sort = d.k; renderTable(); },
  ad_page: d => { A.page += Number(d.d); renderTable(); },
  ad_new: () => openForm(A.module, null),
  ad_edit: d => { const m = d.m || A.module; if (A.module === 'dashboard' || A.module !== m) { A.module = m; renderAdmin(); } openForm(m, rowById(m, d.id)); },
  ad_detail: d => showDetail(rowById(A.module, d.id)),
  ad_del: d => {
    const r = rowById(A.module, d.id); A.delId = r.id;
    openModal(`<h2>Excluir este registro?</h2><p class="desc">O registro será removido apenas desta demonstração.</p><p style="font-size:14px">${esc(r.nome ?? r.codigo ?? 'Registro #' + r.id)}</p>
    <div style="display:flex;justify-content:flex-end;gap:12px"><button class="btn outline" data-a="close">Cancelar</button><button class="btn destructive" data-a="ad_del_ok">${ic('trash')}Excluir</button></div>`);
  },
  ad_del_ok: () => { DB[A.module] = DB[A.module].filter(r => r.id !== A.delId); saveDB(); closeModal(); toast('Registro excluído.'); renderAdmin(); },
  ad_gen: () => { $('#f-codigo').value = 'PLAY' + Math.random().toString(36).slice(2, 8).toUpperCase(); },
  ad_csv: exportCsv,
  ad_reset: () => { if (confirm('Apagar todas as alterações e voltar aos dados do data.json?')) resetDemo(); }
});

/* ---------- login do admin ---------- */
const AKEY = 'vg_admin_v1';
const adminUser = () => { /* vale o login feito aqui ou o login de admin feito na loja */
  let id = null; try { id = JSON.parse(localStorage.getItem(AKEY)); } catch { }
  for (const cand of [id, S.userId]) { const u = DB.usuarios.find(x => x.id === cand); if (u && u.tipo === 'admin' && u.ativo) return u; }
  return null; };
function renderLogin() {
  $('#admin').innerHTML = `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px"><form id="adLogin" class="dialog" style="max-width:380px">
    <div style="text-align:center">${brand()}</div><h2 style="text-align:center">Painel administrativo</h2><p class="desc" style="text-align:center">Entre com sua conta de administrador.</p>
    ${field('lg-email', 'E-mail', 'type="email" autocomplete="username" placeholder="admin@gmail.com"')}${field('lg-pass', 'Senha', 'type="password" autocomplete="current-password"')}
    <button class="btn" type="submit">${ic('user')}Entrar</button><a class="btn link" href="index.html" style="justify-content:center">← Voltar para a loja</a></form></div>`;
  $('#adLogin').onsubmit = e => {
    e.preventDefault();
    const email = $('#lg-email').value.trim().toLowerCase(), u = DB.usuarios.find(x => x.email.toLowerCase() === email && x.tipo === 'admin' && x.ativo);
    if (!u || u.senha !== $('#lg-pass').value) return toast('E-mail ou senha incorretos.', 'error');
    try { localStorage.setItem(AKEY, JSON.stringify(u.id)); } catch { }
    renderAdmin(); toast('Bem-vindo, ' + u.nome + '!');
  };
}
actions.ad_logout = () => { try { localStorage.removeItem(AKEY); } catch { } if (currentUser()?.tipo === 'admin') { S.userId = null; saveSession(); } renderLogin(); };
const _renderAdmin = renderAdmin;
renderAdmin = function () { return adminUser() ? _renderAdmin() : renderLogin(); };

(async () => { await boot(); renderAdmin(); })();
