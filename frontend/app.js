const K = "fincoob_app_v4";
const OLD = "fincoob_app_v3";
const cats0 = [
  ["Alimentação", "despesa"], ["Transporte", "despesa"], ["Moradia", "despesa"], ["Saúde", "despesa"],
  ["Educação", "despesa"], ["Lazer", "despesa"], ["Compras", "despesa"], ["Assinaturas", "despesa"],
  ["Cartão de crédito", "despesa"], ["Salário", "receita"], ["Freelance", "receita"], ["Outros", "ambos"]
].map(([name, type], i) => ({ id: `cat-${i}`, name, type, isDefault: true }));
const pays = ["Pix", "Dinheiro", "Cartão de débito", "Cartão de crédito", "Transferência", "Boleto", "Outro"];
let db = emptyState(), charts = {}, sug = null;
const $ = (id) => document.getElementById(id);
const brl = (v) => {
  const n = Number(v);
  return (Number.isFinite(n) ? n : 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};
const today = () => new Date().toISOString().slice(0, 10);
const mon = (d = today()) => String(d).slice(0, 7);
const uid = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
const val = (v) => Number(String(v || "").replace(/\s/g, "").replace(/\./g, "").replace(",", "."));
const num = (v, fallback = 0) => {
  if (typeof v === "string") {
    const raw = v.trim();
    if (!raw) return fallback;
    const parsed = raw.includes(",") ? val(raw) : Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  const parsed = Number(v);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const decimal = (v) => {
  const raw = String(v || "").trim().replace("%", "");
  if (!raw) return 0;
  const parsed = raw.includes(",") ? Number(raw.replace(/\./g, "").replace(",", ".")) : Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
};
const fmt = (v) => {
  const d = String(v || "").replace(/\D/g, "");
  return d ? (Number(d) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";
};
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || "#2563eb";

function emptyState() {
  return { version: 3, user: "", theme: "light", categories: [...cats0], transactions: [], goals: [], budgets: [], investments: [], dashboardCharts: ["chartReceitasDespesasPanel", "chartCategoriasPanel", "chartPatrimonioPanel"] };
}

function normalizeTx(x) {
  const amount = num(x.amount ?? x.valor), type = x.type === "receita" ? "receita" : x.type === "despesa" ? "despesa" : "", date = String(x.date || x.data || "").slice(0, 10);
  if (!type || !date || !Number.isFinite(amount) || amount <= 0) return null;
  return { id: String(x.id || uid()), type, description: String(x.description || x.descricao || "Lançamento").slice(0, 120), amount, date, category: String(x.category || x.categoria || "Outros"), payment: String(x.payment || "Outro"), note: String(x.note || x.observacao || ""), createdAt: x.createdAt || new Date().toISOString() };
}

function normalizeGoal(x) {
  const target = num(x.target ?? x.valorDesejado), current = Math.max(0, num(x.current ?? x.valorAtual));
  if (!String(x.name || x.nome || "").trim() || target <= 0) return null;
  return { id: String(x.id || uid()), name: String(x.name || x.nome).slice(0, 80), target, current, deadline: String(x.deadline || x.prazo || today()).slice(0, 10), description: String(x.description || x.descricao || "").slice(0, 200) };
}

function normalizeBudget(x) {
  const limit = num(x.limit ?? x.limite), month = String(x.month || x.mes || mon()).slice(0, 7);
  if (!String(x.category || x.categoria || "").trim() || limit <= 0) return null;
  return { id: String(x.id || uid()), category: String(x.category || x.categoria), month, limit };
}

function normalizeInvestment(x) {
  const amount = Math.max(0, num(x.amount ?? x.valorAtual));
  if (!String(x.name || x.nome || "").trim()) return null;
  return { id: String(x.id || uid()), name: String(x.name || x.nome).slice(0, 80), type: String(x.type || x.tipo || "Outros"), amount, monthlyContribution: Math.max(0, num(x.monthlyContribution ?? x.aporteMensal)), annualReturn: Math.max(0, decimal(x.annualReturn ?? x.rentabilidadeAnual)), date: String(x.date || x.data || today()).slice(0, 10) };
}

function load() {
  try { db = { ...emptyState(), ...(JSON.parse(localStorage.getItem(K) || localStorage.getItem(OLD) || "{}")) }; } catch { db = emptyState(); }
  db.categories = Array.isArray(db.categories) && db.categories.length ? db.categories : [...cats0];
  cats0.forEach(c => { if (!db.categories.some(x => x.name.toLowerCase() === c.name.toLowerCase())) db.categories.push(c); });
  db.transactions = (db.transactions || []).map(normalizeTx).filter(Boolean);
  db.goals = (Array.isArray(db.goals) ? db.goals : []).map(normalizeGoal).filter(Boolean);
  db.budgets = (Array.isArray(db.budgets) ? db.budgets : []).map(normalizeBudget).filter(Boolean);
  db.investments = (Array.isArray(db.investments) ? db.investments : []).map(normalizeInvestment).filter(Boolean);
  db.dashboardCharts = Array.isArray(db.dashboardCharts) ? db.dashboardCharts : emptyState().dashboardCharts;
  save();
}

function save() { localStorage.setItem(K, JSON.stringify(db)); }
function toast(msg, type = "success") { const t = $("toast"); if (!t) return; t.textContent = msg; t.className = `toast ${type}`; clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.add("hidden"), 3000); }
function setTheme(t) { db.theme = t; document.documentElement.classList.toggle("theme-dark", t === "dark"); if ($("btnTheme")) $("btnTheme").innerHTML = `<span class="theme-dot"></span><span>${t === "dark" ? "Tema escuro" : "Tema claro"}</span>`; save(); drawCharts(); }

function ensureDom() {
  if (!document.querySelector("[data-view='investimentos']")) {
    const b = document.createElement("button"); b.className = "nav-link"; b.type = "button"; b.dataset.view = "investimentos"; b.textContent = "Investimentos";
    document.querySelector("[data-view='backup']")?.before(b);
  }
  $("chartReceitasDespesas")?.closest(".panel")?.setAttribute("id", "chartReceitasDespesasPanel");
  $("chartCategorias")?.closest(".panel")?.setAttribute("id", "chartCategoriasPanel");
  if (!$("kpiInvestimentos")) document.querySelector("#view-dashboard .kpi-grid")?.insertAdjacentHTML("beforeend", `<article class="kpi-card"><span>Patrimônio investido</span><strong id="kpiInvestimentos">R$ 0,00</strong><small id="kpiPrevisaoPatrimonio">Sem previsão</small></article>`);
  const dg = document.querySelector("#view-dashboard .dashboard-grid");
  if (dg && !$("dashboardChartToggles")) dg.insertAdjacentHTML("afterbegin", `<section class="panel wide"><div class="panel-head"><h3>Gráficos no dashboard</h3><span>Personalização simples</span></div><div class="toggle-row" id="dashboardChartToggles"><label><input type="checkbox" value="chartReceitasDespesasPanel" checked /> Receitas x despesas</label><label><input type="checkbox" value="chartCategoriasPanel" checked /> Despesas por categoria</label><label><input type="checkbox" value="chartPatrimonioPanel" checked /> Patrimônio e metas</label></div></section>`);
  if (dg && !$("chartPatrimonioPanel")) $("chartCategoriasPanel")?.insertAdjacentHTML("afterend", `<section id="chartPatrimonioPanel" class="panel"><div class="panel-head"><h3>Patrimônio e metas</h3><span>Projeção</span></div><div class="chart-box"><canvas id="chartPatrimonio"></canvas></div></section>`);
  if (!$("view-investimentos")) {
    const s = document.createElement("section"); s.id = "view-investimentos"; s.className = "view";
    s.innerHTML = `<div class="page-title"><div><span class="eyebrow">Patrimônio</span><h2>Investimentos</h2></div><p>Registre investimentos, resultados e previsão de evolução.</p></div>
    <div class="kpi-grid compact"><article class="kpi-card"><span>Total investido</span><strong id="investmentTotal">R$ 0,00</strong></article><article class="kpi-card success"><span>Aporte mensal</span><strong id="investmentMonthly">R$ 0,00</strong></article><article class="kpi-card accent"><span>Estimado em 12 meses</span><strong id="investmentProjection">R$ 0,00</strong></article><article class="kpi-card"><span>Ativos</span><strong id="investmentCount">0</strong></article></div>
    <div class="content-grid"><section class="panel form-panel"><div class="panel-head"><h3 id="investmentFormTitle">Novo investimento</h3><button id="btnCancelInvestmentEdit" class="link-button hidden" type="button">Cancelar edição</button></div><form id="investmentForm" class="form"><input id="investmentId" type="hidden" /><div class="form-row two"><div><label for="investmentName">Nome</label><input id="investmentName" type="text" placeholder="Ex.: Tesouro Selic" required /></div><div><label for="investmentType">Tipo</label><select id="investmentType"><option>Renda fixa</option><option>Fundo</option><option>Ações</option><option>ETF</option><option>Cripto</option><option>Outros</option></select></div></div><div class="form-row two"><div><label for="investmentAmount">Valor atual</label><input id="investmentAmount" inputmode="numeric" required /></div><div><label for="investmentMonthlyContribution">Aporte mensal</label><input id="investmentMonthlyContribution" inputmode="numeric" /></div></div><div class="form-row two"><div><label for="investmentReturn">Rentabilidade anual estimada (%)</label><input id="investmentReturn" type="text" inputmode="decimal" /></div><div><label for="investmentDate">Data inicial</label><input id="investmentDate" type="date" required /></div></div><div class="form-actions"><button class="btn ghost" type="reset">Limpar</button><button class="btn primary" type="submit">Salvar investimento</button></div></form></section><section class="panel"><div class="panel-head"><h3>Evolução estimada</h3><span>12 meses</span></div><div class="chart-box"><canvas id="chartInvestimentos"></canvas></div></section></div><section class="panel"><div id="investmentList" class="cards-grid"></div></section>`;
    $("view-backup")?.before(s);
  }
}

function bind() {
  const on = (id, event, handler) => { const el = $(id); if (el) el[`on${event}`] = handler; };
  document.querySelectorAll(".nav-link").forEach(b => b.onclick = () => show(b.dataset.view));
  document.querySelectorAll("[data-go-view]").forEach(b => b.onclick = () => show(b.dataset.goView));
  on("btnSaveUser", "click", () => { db.user = $("userName").value.trim(); save(); toast("Usuário salvo."); });
  on("btnTheme", "click", () => setTheme(db.theme === "dark" ? "light" : "dark"));
  on("transactionForm", "submit", saveTx); on("transactionForm", "reset", () => setTimeout(resetTx)); on("btnCancelTransactionEdit", "click", resetTx);
  document.querySelectorAll("[name='transactionType']").forEach(i => i.onchange = opts);
  on("transactionsTable", "click", txAction); on("categoryForm", "submit", saveCat); on("categoryList", "click", catAction);
  on("goalForm", "submit", saveGoal); on("goalForm", "reset", () => setTimeout(resetGoal)); on("btnCancelGoalEdit", "click", resetGoal); on("goalsList", "click", goalAction); on("goalSuggestion", "click", useSug);
  on("budgetForm", "submit", saveBudget); on("budgetMonth", "input", () => { budget(); drawCharts(); }); on("budgetList", "click", budgetAction);
  on("investmentForm", "submit", saveInv); on("investmentForm", "reset", () => setTimeout(resetInv)); on("btnCancelInvestmentEdit", "click", resetInv); on("investmentList", "click", invAction);
  on("dashboardChartToggles", "change", saveDashPrefs);
  ["transactionAmount", "goalTarget", "goalCurrent", "budgetLimit", "investmentAmount", "investmentMonthlyContribution"].forEach(id => on(id, "input", e => { e.target.value = fmt(e.target.value); try { e.target.setSelectionRange(e.target.value.length, e.target.value.length); } catch {} }));
  ["filterText", "filterType", "filterCategory", "filterStart", "filterEnd"].forEach(id => on(id, "input", txTable));
  on("btnClearFilters", "click", () => { ["filterText", "filterType", "filterCategory", "filterStart", "filterEnd"].forEach(id => { if ($(id)) $(id).value = ""; }); txTable(); });
  ["reportStart", "reportEnd", "reportType", "reportCategory", "reportPayment"].forEach(id => on(id, "input", () => { reports(); drawCharts(); }));
  on("btnExportJson", "click", exportJson); on("btnExportAllExcel", "click", exportExcel); on("btnExportReport", "click", exportReport); on("btnExportWord", "click", exportWord); on("backupImport", "change", importJson); on("btnClearData", "click", clearAll);
}

function show(v) { document.querySelectorAll(".nav-link").forEach(b => b.classList.toggle("active", b.dataset.view === v)); document.querySelectorAll(".view").forEach(s => s.classList.toggle("active", s.id === `view-${v}`)); render(); }
function render() { dashPrefs(); opts(); dash(); txTable(); reports(); goals(); budget(); investments(); drawCharts(); }
function opts() {
  const type = document.querySelector("[name='transactionType']:checked")?.value || "receita";
  const all = db.categories.slice().sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  const selectedCategory = $("transactionCategory")?.value || "";
  const selectedFilter = $("filterCategory")?.value || "";
  const selectedReport = $("reportCategory")?.value || "";
  const selectedBudget = $("budgetCategory")?.value || "";
  $("transactionCategory").innerHTML = `<option value="">Selecione</option>${all.filter(c => c.type === type || c.type === "ambos").map(c => `<option>${esc(c.name)}</option>`).join("")}`;
  const allOpt = `<option value="">Todas as categorias</option>${all.map(c => `<option>${esc(c.name)}</option>`).join("")}`;
  $("filterCategory").innerHTML = allOpt; $("reportCategory").innerHTML = allOpt; $("budgetCategory").innerHTML = `<option value="">Categoria de despesa</option>${all.filter(c => c.type !== "receita").map(c => `<option>${esc(c.name)}</option>`).join("")}`;
  if ([...$("transactionCategory").options].some(o => o.value === selectedCategory)) $("transactionCategory").value = selectedCategory;
  if ([...$("filterCategory").options].some(o => o.value === selectedFilter)) $("filterCategory").value = selectedFilter;
  if ([...$("reportCategory").options].some(o => o.value === selectedReport)) $("reportCategory").value = selectedReport;
  if ([...$("budgetCategory").options].some(o => o.value === selectedBudget)) $("budgetCategory").value = selectedBudget;
  $("reportPayment").innerHTML = `<option value="">Todas as formas</option>${pays.map(p => `<option>${p}</option>`).join("")}`;
  $("categoryList").innerHTML = all.map(c => `<div class="tag-item"><div><strong>${esc(c.name)}</strong> <span class="pill">${c.type}</span></div><div>${c.isDefault ? "<span class='pill'>Padrão</span>" : `<button class="mini-btn" data-a="edit-cat" data-id="${c.id}">Editar</button><button class="mini-btn" data-a="del-cat" data-id="${c.id}">Remover</button>`}</div></div>`).join("");
}

function saveCat(e) { e.preventDefault(); const id = $("categoryId").value, name = $("categoryName").value.trim(), type = $("categoryType").value; if (!name) return toast("Informe uma categoria.", "error"); const old = db.categories.find(c => c.id === id && !c.isDefault); if (old) { const prev = old.name; old.name = name; old.type = type; db.transactions.forEach(t => { if (t.category === prev) t.category = name; }); } else db.categories.push({ id: uid(), name, type, isDefault: false }); $("categoryForm").reset(); $("categoryId").value = ""; save(); render(); }
function catAction(e) { const b = e.target.closest("[data-a]"); if (!b) return; const c = db.categories.find(x => x.id === b.dataset.id); if (!c || c.isDefault) return; if (b.dataset.a === "edit-cat") { $("categoryId").value = c.id; $("categoryName").value = c.name; $("categoryType").value = c.type; return; } if (confirm("Remover categoria?")) { db.transactions.forEach(t => { if (t.category === c.name) t.category = "Outros"; }); db.categories = db.categories.filter(x => x.id !== c.id); save(); render(); } }

function saveTx(e) { e.preventDefault(); const id0 = $("transactionId").value, amount = val($("transactionAmount").value), x = { id: id0 || uid(), type: document.querySelector("[name='transactionType']:checked").value, description: $("transactionDescription").value.trim(), amount, date: $("transactionDate").value, category: $("transactionCategory").value, payment: $("transactionPayment").value, note: $("transactionNote").value.trim(), createdAt: new Date().toISOString() }; if (!x.description || !x.date || !x.category || !x.payment || !(amount > 0)) return toast("Revise os campos obrigatórios.", "error"); db.transactions = id0 ? db.transactions.map(t => t.id === id0 ? x : t) : [...db.transactions, x]; save(); resetTx(); render(); toast("Lançamento salvo."); }
function resetTx() { $("transactionForm").reset(); $("transactionId").value = ""; $("transactionDate").value = today(); $("typeReceita").checked = true; $("transactionFormTitle").textContent = "Novo lançamento"; $("btnCancelTransactionEdit").classList.add("hidden"); opts(); }
function txAction(e) { const b = e.target.closest("[data-action]"); if (!b) return; const x = db.transactions.find(t => t.id === b.dataset.id); if (!x) return; if (b.dataset.action === "edit-transaction") { $("transactionId").value = x.id; $(x.type === "receita" ? "typeReceita" : "typeDespesa").checked = true; opts(); $("transactionDescription").value = x.description; $("transactionAmount").value = fmt(Math.round(x.amount * 100)); $("transactionDate").value = x.date; $("transactionCategory").value = x.category; $("transactionPayment").value = x.payment; $("transactionNote").value = x.note || ""; $("transactionFormTitle").textContent = "Editar lançamento"; $("btnCancelTransactionEdit").classList.remove("hidden"); return; } if (confirm("Excluir lançamento?")) { db.transactions = db.transactions.filter(t => t.id !== x.id); save(); render(); } }
function rows() { return db.transactions.slice().sort((a, b) => b.date.localeCompare(a.date)); }
function filtered() { const q = $("filterText").value.toLowerCase(); return rows().filter(x => (!q || `${x.description} ${x.category} ${x.note}`.toLowerCase().includes(q)) && (!$("filterType").value || x.type === $("filterType").value) && (!$("filterCategory").value || x.category === $("filterCategory").value) && (!$("filterStart").value || mon(x.date) >= $("filterStart").value) && (!$("filterEnd").value || mon(x.date) <= $("filterEnd").value)); }
function tr(x, act = true) { return `<tr><td>${new Date(`${x.date}T00:00:00`).toLocaleDateString("pt-BR")}</td><td><strong>${esc(x.description)}</strong>${x.note ? `<br><small>${esc(x.note)}</small>` : ""}</td><td><span class="pill ${x.type}">${x.type}</span></td><td>${esc(x.category)}</td><td>${esc(x.payment)}</td><td class="right">${brl(x.amount)}</td>${act ? `<td><button class="mini-btn" data-action="edit-transaction" data-id="${x.id}">Editar</button> <button class="mini-btn" data-action="delete-transaction" data-id="${x.id}">Excluir</button></td>` : ""}</tr>`; }
function txTable() { const r = filtered(); $("transactionsTable").innerHTML = r.length ? r.map(x => tr(x)).join("") : `<tr><td colspan="7" class="empty-state">Nenhum lançamento encontrado.</td></tr>`; }
function sum(r) { const income = r.filter(x => x.type === "receita").reduce((s, x) => s + x.amount, 0), expense = r.filter(x => x.type === "despesa").reduce((s, x) => s + x.amount, 0); return { income, expense, balance: income - expense, count: r.length }; }
function byMonth(m) { return db.transactions.filter(x => mon(x.date) === m); }
function catTotals(r = byMonth(mon())) { const g = {}; r.filter(x => x.type === "despesa").forEach(x => g[x.category] = (g[x.category] || 0) + x.amount); return Object.entries(g).map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total); }
function invSum() { return { total: db.investments.reduce((s, x) => s + num(x.amount), 0), monthly: db.investments.reduce((s, x) => s + num(x.monthlyContribution), 0), count: db.investments.length }; }
function invProjection(n = 12) { const s = invSum(), avg = db.investments.length ? db.investments.reduce((a, x) => a + decimal(x.annualReturn), 0) / db.investments.length : 0, mr = Math.pow(1 + avg / 100, 1 / 12) - 1, labels = [], values = [], base = []; let cur = s.total; for (let i = 0; i <= n; i++) { labels.push(i ? `${i}m` : "Hoje"); values.push(+cur.toFixed(2)); base.push(s.total + s.monthly * i); cur = cur * (1 + mr) + s.monthly; } return { labels, values, base }; }
function dash() { const all = sum(db.transactions), cur = sum(byMonth(mon())), inv = invSum(), proj = invProjection(12); $("dashboardMonthLabel").textContent = `Resumo de ${mon().split("-").reverse().join("/")}`; $("kpiSaldoAtual").textContent = brl(all.balance); $("kpiReceitas").textContent = brl(all.income); $("kpiDespesas").textContent = brl(all.expense); $("kpiResultadoMes").textContent = brl(cur.balance); $("kpiTotalLancamentos").textContent = `${all.count} lançamentos`; $("kpiComparativoMes").textContent = "Comparativo disponível com histórico"; $("kpiInvestimentos").textContent = brl(inv.total); $("kpiPrevisaoPatrimonio").textContent = inv.total ? `${brl(proj.values.at(-1))} em 12 meses` : "Sem previsão"; $("ultimosLancamentos").innerHTML = rows().slice(0, 5).map(x => `<div class="stack-item"><div><strong>${esc(x.description)}</strong><span>${esc(x.category)}</span></div><strong>${brl(x.amount)}</strong></div>`).join("") || `<div class="empty-state">Cadastre seu primeiro lançamento.</div>`; const top = catTotals().slice(0, 5); $("topCategorias").innerHTML = top.map((x, i) => `<div class="rank-item"><strong>${i + 1}. ${esc(x.category)}</strong><strong>${brl(x.total)}</strong></div>`).join("") || `<div class="empty-state">Sem despesas no mês.</div>`; $("dicasFinanceiras").innerHTML = `<article class="tip-card"><p>${top[0] ? `Maior gasto: ${esc(top[0].category)}. Reduzir 10% economizaria ${brl(top[0].total * .1)}.` : "Cadastre despesas para receber dicas automáticas."}</p></article>`; }
function reportRows() { return rows().filter(x => (!$("reportStart").value || x.date >= $("reportStart").value) && (!$("reportEnd").value || x.date <= $("reportEnd").value) && (!$("reportType").value || x.type === $("reportType").value) && (!$("reportCategory").value || x.category === $("reportCategory").value) && (!$("reportPayment").value || x.payment === $("reportPayment").value)); }
function reports() { const selected = $("reportPayment").value; $("reportPayment").innerHTML = `<option value="">Todas as formas</option>${pays.map(p => `<option>${p}</option>`).join("")}`; $("reportPayment").value = selected; const r = reportRows(), s = sum(r); $("reportReceitas").textContent = brl(s.income); $("reportDespesas").textContent = brl(s.expense); $("reportSaldo").textContent = brl(s.balance); $("reportCount").textContent = s.count; $("reportTable").innerHTML = r.length ? r.map(x => tr(x, false)).join("") : `<tr><td colspan="6" class="empty-state">Nenhum dado encontrado.</td></tr>`; }
function monthsUntil(d) { const end = new Date(`${d}T00:00:00`), now = new Date(); return Number.isNaN(end.getTime()) || end <= now ? 0 : Math.max(1, (end.getFullYear() - now.getFullYear()) * 12 + end.getMonth() - now.getMonth()); }
function saveGoal(e) { e.preventDefault(); const id0 = $("goalId").value, target = val($("goalTarget").value), current = val($("goalCurrent").value), g = { id: id0 || uid(), name: $("goalName").value.trim(), target, current, deadline: $("goalDeadline").value, description: $("goalDescription").value.trim() }; if (!g.name || !g.deadline || !(target > 0) || current < 0) return toast("Revise os dados da meta.", "error"); db.goals = id0 ? db.goals.map(x => x.id === id0 ? g : x) : [...db.goals, g]; save(); resetGoal(); render(); }
function resetGoal() { $("goalForm").reset(); $("goalId").value = ""; $("goalDeadline").value = today(); $("goalFormTitle").textContent = "Nova meta"; $("btnCancelGoalEdit").classList.add("hidden"); }
function goals() { const top = catTotals()[0]; sug = top ? { id: uid(), name: `Economizar em ${top.category}`, target: top.total * .1, current: 0, deadline: today(), description: `Reduzir 10% dos gastos em ${top.category}.` } : null; $("goalSuggestion").innerHTML = sug ? `<p>Meta sugerida: economizar ${brl(sug.target)} em ${esc(top.category)}.</p><button class="btn primary" data-use="1">Usar sugestão</button>` : `<div class="empty-state">Cadastre despesas para receber sugestão.</div>`; $("goalsList").innerHTML = db.goals.map(g => { const p = Math.min(100, g.current / g.target * 100), miss = Math.max(0, g.target - g.current), need = monthsUntil(g.deadline) ? miss / monthsUntil(g.deadline) : miss; return `<article class="goal-card"><header><strong>${esc(g.name)}</strong><span class="pill">${Math.round(p)}%</span></header><div class="progress"><span style="width:${p}%"></span></div><p>Faltam ${brl(miss)}. Previsão: ${brl(need)} por mês.</p><div class="inline-money"><input data-goal-money="${g.id}" inputmode="numeric" placeholder="Adicionar valor" /><button class="mini-btn" data-a="add-goal" data-id="${g.id}">Aportar</button></div><button class="mini-btn" data-a="edit-goal" data-id="${g.id}">Editar</button> <button class="mini-btn" data-a="del-goal" data-id="${g.id}">Excluir</button></article>`; }).join("") || `<div class="empty-state">Nenhuma meta cadastrada.</div>`; document.querySelectorAll("[data-goal-money]").forEach(i => i.oninput = e => e.target.value = fmt(e.target.value)); }
function useSug(e) { if (e.target.dataset.use && sug) { db.goals.push(sug); save(); render(); } }
function goalAction(e) { const b = e.target.closest("[data-a]"); if (!b) return; const g = db.goals.find(x => x.id === b.dataset.id); if (!g) return; if (b.dataset.a === "add-goal") { const amount = val(document.querySelector(`[data-goal-money="${g.id}"]`)?.value); if (!(amount > 0)) return toast("Informe um aporte válido.", "error"); g.current = Math.min(g.target, g.current + amount); save(); render(); return; } if (b.dataset.a === "edit-goal") { $("goalId").value = g.id; $("goalName").value = g.name; $("goalTarget").value = fmt(g.target * 100); $("goalCurrent").value = fmt(g.current * 100); $("goalDeadline").value = g.deadline; $("goalDescription").value = g.description || ""; $("goalFormTitle").textContent = "Editar meta"; $("btnCancelGoalEdit").classList.remove("hidden"); return; } if (confirm("Excluir meta?")) { db.goals = db.goals.filter(x => x.id !== g.id); save(); render(); } }
function saveBudget(e) { e.preventDefault(); const b = { id: uid(), category: $("budgetCategory").value, month: $("budgetMonth").value, limit: val($("budgetLimit").value) }; if (!b.category || !b.month || !(b.limit > 0)) return toast("Revise o orçamento.", "error"); db.budgets = db.budgets.filter(x => !(x.category === b.category && x.month === b.month)); db.budgets.push(b); save(); render(); }
function budgetRows() { const m = $("budgetMonth")?.value || mon(); return db.budgets.filter(b => b.month === m).map(b => ({ ...b, spent: db.transactions.filter(x => x.type === "despesa" && x.category === b.category && mon(x.date) === m).reduce((s, x) => s + x.amount, 0) })); }
function budget() { const r = budgetRows(); $("budgetList").innerHTML = r.map(b => { const used = b.spent / b.limit * 100; return `<article class="budget-item ${used >= 100 ? "over" : used >= 80 ? "warning" : ""}"><header><strong>${esc(b.category)}</strong><span class="pill">${Math.round(used)}%</span></header><p>${brl(b.spent)} de ${brl(b.limit)}</p><div class="progress"><span style="width:${Math.min(used, 100)}%"></span></div><button class="mini-btn" data-id="${b.id}">Remover</button></article>`; }).join("") || `<div class="empty-state">Defina um orçamento.</div>`; }
function budgetAction(e) { const b = e.target.closest("[data-id]"); if (b && confirm("Remover orçamento?")) { db.budgets = db.budgets.filter(x => x.id !== b.dataset.id); save(); render(); } }
function saveInv(e) { e.preventDefault(); const id0 = $("investmentId").value, amount = val($("investmentAmount").value), inv = { id: id0 || uid(), name: $("investmentName").value.trim(), type: $("investmentType").value, amount, monthlyContribution: val($("investmentMonthlyContribution").value) || 0, annualReturn: decimal($("investmentReturn").value), date: $("investmentDate").value || today() }; if (!inv.name || amount < 0) return toast("Revise o investimento.", "error"); db.investments = id0 ? db.investments.map(x => x.id === id0 ? inv : x) : [...db.investments, inv]; save(); resetInv(); render(); }
function resetInv() { $("investmentForm").reset(); $("investmentId").value = ""; $("investmentDate").value = today(); $("investmentFormTitle").textContent = "Novo investimento"; $("btnCancelInvestmentEdit").classList.add("hidden"); }
function project(x, n = 12) { let cur = num(x.amount), mr = Math.pow(1 + decimal(x.annualReturn) / 100, 1 / 12) - 1; for (let i = 0; i < n; i++) cur = cur * (1 + mr) + num(x.monthlyContribution); return cur; }
function investments() { const s = invSum(), p = invProjection(12); $("investmentTotal").textContent = brl(s.total); $("investmentMonthly").textContent = brl(s.monthly); $("investmentProjection").textContent = brl(p.values.at(-1)); $("investmentCount").textContent = s.count; $("investmentList").innerHTML = db.investments.map(x => `<article class="goal-card"><header><strong>${esc(x.name)}</strong><span class="pill">${decimal(x.annualReturn).toFixed(2)}% a.a.</span></header><div class="investment-meta"><p>Atual: <strong>${brl(x.amount)}</strong></p><p>Aporte mensal: <strong>${brl(x.monthlyContribution)}</strong></p><p>Estimado em 12 meses: <strong>${brl(project(x))}</strong></p><p>Resultado: <strong>${brl(project(x) - num(x.amount) - num(x.monthlyContribution) * 12)}</strong></p></div><button class="mini-btn" data-a="edit-inv" data-id="${x.id}">Editar</button> <button class="mini-btn" data-a="del-inv" data-id="${x.id}">Excluir</button></article>`).join("") || `<div class="empty-state">Nenhum investimento cadastrado.</div>`; }
function invAction(e) { const b = e.target.closest("[data-a]"); if (!b) return; const x = db.investments.find(i => i.id === b.dataset.id); if (!x) return; if (b.dataset.a === "edit-inv") { $("investmentId").value = x.id; $("investmentName").value = x.name; $("investmentType").value = x.type; $("investmentAmount").value = fmt(x.amount * 100); $("investmentMonthlyContribution").value = fmt((x.monthlyContribution || 0) * 100); $("investmentReturn").value = x.annualReturn || ""; $("investmentDate").value = x.date || today(); $("investmentFormTitle").textContent = "Editar investimento"; $("btnCancelInvestmentEdit").classList.remove("hidden"); return; } if (confirm("Excluir investimento?")) { db.investments = db.investments.filter(i => i.id !== x.id); save(); render(); } }
function chart(id, cfg) { const c = $(id); if (!window.Chart || !c || c.offsetParent === null) return; if (charts[id]) charts[id].destroy(); charts[id] = new Chart(c, cfg); }
function chartOpts() { return { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: css("--text") } } }, scales: { x: { ticks: { color: css("--text-soft") }, grid: { color: css("--border") } }, y: { beginAtZero: true, ticks: { color: css("--text-soft") }, grid: { color: css("--border") } } } }; }
function series() { const ks = [...new Set(db.transactions.map(x => mon(x.date)))].sort(); if (!ks.length) ks.push(mon()); return { labels: ks.map(k => k.split("-").reverse().join("/")), income: ks.map(k => sum(byMonth(k)).income), expense: ks.map(k => sum(byMonth(k)).expense), balance: ks.map(k => sum(byMonth(k)).balance) }; }
function drawCharts() { const s = series(), top = catTotals(), bud = budgetRows(), pr = invProjection(12); chart("chartReceitasDespesas", { type: "bar", data: { labels: s.labels, datasets: [{ label: "Receitas", data: s.income, backgroundColor: css("--success") }, { label: "Despesas", data: s.expense, backgroundColor: css("--danger") }] }, options: chartOpts() }); chart("chartCategorias", { type: "doughnut", data: { labels: top.map(x => x.category), datasets: [{ data: top.map(x => x.total), backgroundColor: [css("--primary"), css("--success"), css("--warning"), css("--accent"), "#0ea5e9", "#f97316"] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } } }); chart("chartSaldo", { type: "line", data: { labels: s.labels, datasets: [{ label: "Saldo", data: s.balance, borderColor: css("--primary"), backgroundColor: css("--primary-soft"), fill: true, tension: .25 }] }, options: chartOpts() }); const pay = reportRows().filter(x => x.type === "despesa").reduce((a, x) => ({ ...a, [x.payment]: (a[x.payment] || 0) + x.amount }), {}); chart("chartPagamento", { type: "bar", data: { labels: Object.keys(pay), datasets: [{ label: "Despesas", data: Object.values(pay), backgroundColor: css("--accent") }] }, options: chartOpts() }); chart("chartOrcamento", { type: "bar", data: { labels: bud.map(x => x.category), datasets: [{ label: "Gasto", data: bud.map(x => x.spent), backgroundColor: css("--danger") }, { label: "Limite", data: bud.map(x => x.limit), backgroundColor: css("--primary") }] }, options: chartOpts() }); chart("chartPatrimonio", { type: "line", data: { labels: pr.labels, datasets: [{ label: "Patrimônio estimado", data: pr.values, borderColor: css("--success"), backgroundColor: css("--success-soft"), fill: true, tension: .25 }, { label: "Aportes sem rendimento", data: pr.base, borderColor: css("--primary"), borderDash: [6, 6] }] }, options: chartOpts() }); chart("chartInvestimentos", { type: "line", data: { labels: pr.labels, datasets: [{ label: "Evolução estimada", data: pr.values, borderColor: css("--success"), backgroundColor: css("--success-soft"), fill: true, tension: .25 }] }, options: chartOpts() }); }
function dashPrefs() { document.querySelectorAll("#dashboardChartToggles input").forEach(i => { i.checked = db.dashboardCharts.includes(i.value); $(i.value)?.classList.toggle("hidden", !i.checked); }); }
function saveDashPrefs() { db.dashboardCharts = [...document.querySelectorAll("#dashboardChartToggles input:checked")].map(i => i.value); save(); dashPrefs(); drawCharts(); }
function expRows(r) { return r.map(x => ({ Data: x.date, Descricao: x.description, Tipo: x.type, Categoria: x.category, Pagamento: x.payment, Valor: x.amount, Observacao: x.note })); }
function exportExcel() { if (!window.XLSX) return toast("Excel indisponível.", "error"); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expRows(db.transactions)), "Lancamentos"); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(db.goals), "Metas"); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(db.budgets), "Orcamentos"); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(db.investments), "Investimentos"); XLSX.writeFile(wb, `fincoob-dados-${today()}.xlsx`); }
function exportReport() { if (!window.XLSX) return toast("Excel indisponível.", "error"); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expRows(reportRows())), "Relatorio"); XLSX.writeFile(wb, `fincoob-relatorio-${today()}.xlsx`); }
function exportJson() { download(new Blob([JSON.stringify(db, null, 2)], { type: "application/json" }), `fincoob-backup-${today()}.json`); }
async function importJson(e) { const f = e.target.files?.[0]; if (!f) return; try { db = { ...emptyState(), ...JSON.parse(await f.text()) }; db.transactions = (db.transactions || []).map(normalizeTx).filter(Boolean); db.goals = (Array.isArray(db.goals) ? db.goals : []).map(normalizeGoal).filter(Boolean); db.budgets = (Array.isArray(db.budgets) ? db.budgets : []).map(normalizeBudget).filter(Boolean); db.investments = (Array.isArray(db.investments) ? db.investments : []).map(normalizeInvestment).filter(Boolean); save(); render(); toast("Backup importado."); } catch (err) { toast("JSON inválido.", "error"); } finally { e.target.value = ""; } }
function exportWord() { download(new Blob([`<html><meta charset="UTF-8"><body><h1>Relatório Fincoob</h1><table border="1">${reportRows().map(x => `<tr><td>${x.date}</td><td>${esc(x.description)}</td><td>${brl(x.amount)}</td></tr>`).join("")}</table></body></html>`], { type: "application/msword" }), `fincoob-relatorio-${today()}.doc`); }
function clearAll() { if (!confirm("Apagar todos os dados?")) return; const theme = db.theme; db = emptyState(); db.theme = theme; save(); render(); }
function download(blob, name) { const u = URL.createObjectURL(blob), a = document.createElement("a"); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 500); }
window.addEventListener("DOMContentLoaded", () => { ensureDom(); load(); $("userName").value = db.user || ""; $("transactionDate").value = today(); $("goalDeadline").value = today(); $("budgetMonth").value = mon(); $("investmentDate").value = today(); $("reportStart").value = `${mon()}-01`; $("reportEnd").value = today(); bind(); setTheme(db.theme || "light"); render(); });
