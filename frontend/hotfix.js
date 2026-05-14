(function () {
  const fallbackToday = () => new Date().toISOString().slice(0, 10);
  const moneyValue = (value, fallback = 0) => {
    if (typeof val === "function") {
      const parsed = val(value);
      if (Number.isFinite(parsed)) return parsed;
    }
    const parsed = Number(String(value || "").replace(/\./g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const numberValue = (value, fallback = 0) => {
    if (typeof value === "string") {
      const raw = value.trim();
      if (!raw) return fallback;
      const parsed = raw.includes(",") ? moneyValue(raw, fallback) : Number(raw);
      return Number.isFinite(parsed) ? parsed : fallback;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const decimalValue = (value) => {
    const raw = String(value || "").trim().replace("%", "");
    if (!raw) return 0;
    const parsed = raw.includes(",") ? Number(raw.replace(/\./g, "").replace(",", ".")) : Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const call = (name) => {
    try {
      if (typeof window[name] === "function") window[name]();
    } catch (error) {
      console.error(`[Fincoob] falha em ${name}:`, error);
      if (typeof toast === "function") toast(`Erro em ${name}. O restante da pagina continua funcionando.`, "error");
    }
  };

  const normalizeArrays = () => {
    try {
      db.categories = Array.isArray(db.categories) ? db.categories : [];
      db.transactions = Array.isArray(db.transactions) ? db.transactions : [];
      db.goals = Array.isArray(db.goals) ? db.goals : [];
      db.budgets = Array.isArray(db.budgets) ? db.budgets : [];
      db.investments = Array.isArray(db.investments) ? db.investments : [];
      db.dashboardCharts = Array.isArray(db.dashboardCharts) ? db.dashboardCharts : ["chartReceitasDespesasPanel", "chartCategoriasPanel", "chartPatrimonioPanel"];
    } catch (error) {
      console.error("[Fincoob] falha ao normalizar dados:", error);
    }
  };

  const normalizeStoredData = () => {
    try {
      const getToday = typeof today === "function" ? today : fallbackToday;
      const getMonth = typeof mon === "function" ? mon : () => fallbackToday().slice(0, 7);
      db.transactions = db.transactions.map((item) => ({ ...item, amount: Math.max(0, numberValue(item.amount ?? item.valor)) })).filter((item) => item.amount > 0);
      db.goals = db.goals.map((item) => ({ ...item, target: numberValue(item.target ?? item.valorDesejado), current: Math.max(0, numberValue(item.current ?? item.valorAtual)), deadline: String(item.deadline || item.prazo || getToday()).slice(0, 10) })).filter((item) => item.name && item.target > 0);
      db.budgets = db.budgets.map((item) => ({ ...item, category: String(item.category || item.categoria || ""), month: String(item.month || item.mes || getMonth()).slice(0, 7), limit: numberValue(item.limit ?? item.limite) })).filter((item) => item.category && item.limit > 0);
      db.investments = db.investments.map((item) => ({ ...item, amount: Math.max(0, numberValue(item.amount ?? item.valorAtual)), monthlyContribution: Math.max(0, numberValue(item.monthlyContribution ?? item.aporteMensal)), annualReturn: Math.max(0, decimalValue(item.annualReturn ?? item.rentabilidadeAnual)), date: String(item.date || item.data || getToday()).slice(0, 10) })).filter((item) => item.name);
    } catch (error) {
      console.error("[Fincoob] falha ao limpar dados salvos:", error);
    }
  };

  const originalLoad = typeof load === "function" ? load : null;
  if (originalLoad) {
    window.load = load = function safeLoad() {
      originalLoad();
      normalizeArrays();
      normalizeStoredData();
      if (typeof save === "function") save();
    };
  }

  if (typeof saveInv === "function") {
    window.saveInv = saveInv = function safeSaveInv(event) {
      event.preventDefault();
      const id0 = $("investmentId").value;
      const amount = moneyValue($("investmentAmount").value);
      const inv = {
        id: id0 || uid(),
        name: $("investmentName").value.trim(),
        type: $("investmentType").value,
        amount,
        monthlyContribution: moneyValue($("investmentMonthlyContribution").value),
        annualReturn: decimalValue($("investmentReturn").value),
        date: $("investmentDate").value || (typeof today === "function" ? today() : fallbackToday())
      };
      if (!inv.name || amount < 0) return toast("Revise o investimento.", "error");
      db.investments = id0 ? db.investments.map((item) => item.id === id0 ? inv : item) : [...db.investments, inv];
      save();
      resetInv();
      render();
    };
  }

  const originalDrawCharts = typeof drawCharts === "function" ? drawCharts : null;
  let chartFrame = 0;
  window.drawCharts = drawCharts = function safeDrawCharts() {
    cancelAnimationFrame(chartFrame);
    chartFrame = requestAnimationFrame(() => {
      try {
        if (originalDrawCharts) originalDrawCharts();
      } catch (error) {
        console.error("[Fincoob] falha ao desenhar graficos:", error);
      }
    });
  };

  window.render = render = function safeRender() {
    normalizeArrays();
    normalizeStoredData();
    ["dashPrefs", "opts", "dash", "txTable", "reports", "goals", "budget", "investments"].forEach(call);
    window.drawCharts();
  };

  window.addEventListener("error", (event) => {
    console.error("[Fincoob] erro global:", event.error || event.message);
    if (typeof toast === "function") toast("Um erro foi tratado sem travar a pagina.", "warning");
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("[Fincoob] promessa rejeitada:", event.reason);
    if (typeof toast === "function") toast("Um erro assincrono foi tratado sem travar a pagina.", "warning");
  });
}());
