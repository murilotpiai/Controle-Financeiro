(function () {
  const call = (name) => {
    try {
      if (typeof window[name] === "function") window[name]();
    } catch (error) {
      console.error(`[Fincoob] falha em ${name}:`, error);
      if (typeof toast === "function") toast(`Erro em ${name}. O restante da página continua funcionando.`, "error");
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

  const originalDrawCharts = typeof drawCharts === "function" ? drawCharts : null;
  let chartFrame = 0;
  window.drawCharts = drawCharts = function safeDrawCharts() {
    cancelAnimationFrame(chartFrame);
    chartFrame = requestAnimationFrame(() => {
      try {
        if (originalDrawCharts) originalDrawCharts();
      } catch (error) {
        console.error("[Fincoob] falha ao desenhar gráficos:", error);
      }
    });
  };

  window.render = render = function safeRender() {
    normalizeArrays();
    ["dashPrefs", "opts", "dash", "txTable", "reports", "goals", "budget", "investments"].forEach(call);
    window.drawCharts();
  };

  window.addEventListener("error", (event) => {
    console.error("[Fincoob] erro global:", event.error || event.message);
    if (typeof toast === "function") toast("Um erro foi tratado sem travar a página.", "warning");
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("[Fincoob] promessa rejeitada:", event.reason);
    if (typeof toast === "function") toast("Um erro assíncrono foi tratado sem travar a página.", "warning");
  });
}());
