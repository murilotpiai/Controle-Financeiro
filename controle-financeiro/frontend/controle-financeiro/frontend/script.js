
const STORAGE_KEY = "cf_v1_transactions";
const STORAGE_USER = "cf_userId";
const THEME_KEY   = "cf_theme";
let state = { userId:"", transacoes:[], editId:null, chartMensal:null, chartCat:null };

const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const real = (n) => (n || 0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const toMonthKey = (iso) => { const d=new Date((iso||"")+"T00:00:00"); return isNaN(d)?"":d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0"); };
const parseBRL = (s) => Number(String(s||"").replace(/\./g,"").replace(",",".")||0);
const formatMoneyInput = (v) => { const d=String(v||"").replace(/\D/g,""); if(!d) return ""; const n=Number(d)/100; return n.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2}); };
const uuid = () => (crypto.randomUUID?crypto.randomUUID():"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,c=>{const r=Math.random()*16|0,v=c==="x"?r:(r&0x3|0x8);return v.toString(16);} ));
const loadAll = () => { try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); } catch { return []; } };
const saveAll = (arr) => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
const downloadBlob = (blob, filename) => { const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(url),500); };
const show = (id) => document.getElementById(id);


const userIdInput=show("userId"), btnSalvarUsuario=show("btnSalvarUsuario");
const btnTheme=show("btnTheme"), btnExportXLSX=show("btnExportXLSX"), btnExportDOCX=show("btnExportDOCX"), fileImport=show("fileImport");
const form=show("formLancamento"), alertForm=show("alertForm"), editBadge=show("editBadge"), btnCancelarEdicao=show("btnCancelarEdicao"), btnSubmit=show("btnSubmit");
const tabela=show("tabelaLancamentos").querySelector("tbody"), kpiReceitas=show("kpiReceitas"), kpiDespesas=show("kpiDespesas"), kpiSaldo=show("kpiSaldo");
const filtroTexto=show("filtroTexto"), filtroTipo=show("filtroTipo"), filtroDataIni=show("filtroDataIni"), filtroDataFim=show("filtroDataFim"), btnAplicarFiltros=show("btnAplicarFiltros");
const btnLimparFiltros = show("btnLimparFiltros"); 
const inputValor=show("valor");


function applyThemeBtn(){
  const dark = document.documentElement.classList.contains("theme-dark");
  btnTheme.innerHTML = `<span class="theme-dot"></span>Tema: ${dark ? "Escuro" : "Claro"}`;
}
function setTheme(mode){ 
  document.documentElement.classList.toggle("theme-dark", mode==="dark");
  localStorage.setItem(THEME_KEY, mode);
  applyThemeBtn();
  updateChartMensal(state.transacoes);
  updateChartCategoria(getFiltered());
}
function loadTheme(){
  const saved = localStorage.getItem(THEME_KEY) || "light";
  setTheme(saved);
}


function boot(){
  state.userId = localStorage.getItem(STORAGE_USER) || "";
  userIdInput.value = state.userId;
  inputValor.addEventListener("input", ()=>{ inputValor.value = formatMoneyInput(inputValor.value); inputValor.selectionStart=inputValor.selectionEnd=inputValor.value.length; });
  loadTheme();
  refresh();
}
window.addEventListener("DOMContentLoaded", boot);

btnTheme.addEventListener("click", ()=>{
  const dark = document.documentElement.classList.contains("theme-dark");
  setTheme(dark ? "light" : "dark");
});

btnSalvarUsuario.addEventListener("click", ()=>{ 
  state.userId = userIdInput.value.trim(); 
  localStorage.setItem(STORAGE_USER, state.userId); 
  resetEditMode(); 
  refresh(); 
});

btnAplicarFiltros.addEventListener("click", ()=> drawTable());

btnLimparFiltros.addEventListener("click", () => {
  filtroTexto.value = "";
  filtroTipo.value = "";
  filtroDataIni.value = "";
  filtroDataFim.value = "";
  refresh(); 
});

document.getElementById("tabelaLancamentos").addEventListener("click", onTableClick);
btnCancelarEdicao.addEventListener("click", (e)=>{ e.preventDefault(); form.reset(); resetEditMode(); });

form.addEventListener("submit", (e)=>{
  e.preventDefault();
  if(!state.userId){ showAlert("Defina um Usuário no topo e clique em Salvar.", true); return; }
  const type=form.querySelector("input[name='type']:checked").value;
  const categoria=document.getElementById("categoria").value;
  const valorNum=parseBRL(document.getElementById("valor").value);
  const data=document.getElementById("data").value;
  const descricao=document.getElementById("descricao").value.trim();
  if(!categoria || !data || isNaN(valorNum)){ showAlert("Preencha todos os campos obrigatórios.", true); return; }

  const all=loadAll();
  if(state.editId){
    const i=all.findIndex(x=>x.id===state.editId);
    if(i>=0) all[i]={...all[i], userId:state.userId, type, categoria, valor:valorNum, data, descricao, createdAt:new Date().toISOString()};
    saveAll(all); showAlert("Lançamento atualizado!", false);
  } else {
    all.push({ id:uuid(), userId:state.userId, type, categoria, valor:valorNum, data, descricao, createdAt:new Date().toISOString() });
    saveAll(all); showAlert("Lançamento salvo!", false);
  }
  form.reset(); resetEditMode(); refresh();
});

fileImport.addEventListener("change", async (e)=>{
  const file=e.target.files?.[0]; if(!file) return;
  const text=await file.text(); let imported=[];
  try{ imported = text.trim().startsWith("[") ? JSON.parse(text) : parseCSV(text); }
  catch(err){ showAlert("Arquivo inválido: "+err.message, true); return; }
  const all=loadAll();
  for(const r of imported){
    const rec={ id:r.id||uuid(), userId:r.userId||state.userId||"local", type:r.type||"despesa", categoria:r.categoria||"Outros",
                valor:Number(String(r.valor).replace(",", "."))||0, data:(r.data||"").slice(0,10), descricao:r.descricao||"", createdAt:r.createdAt||new Date().toISOString() };
    if(!all.find(x=>x.id===rec.id)) all.push(rec);
  }
  saveAll(all); showAlert("Importação concluída!", false); refresh(); fileImport.value="";
});

btnExportXLSX.addEventListener("click", exportExcel);
btnExportDOCX.addEventListener("click", exportWord);

function refresh(){
  const all=loadAll();
  state.transacoes = state.userId ? all.filter(r=>r.userId===state.userId) : all.slice();
  state.transacoes.sort((a,b)=> (a.data > b.data ? -1 : 1));
  drawKPIs(); const rowsShown=drawTable(); updateChartMensal(state.transacoes); updateChartCategoria(rowsShown);
}

function getFiltered(){
  const text=(filtroTexto.value||"").toLowerCase().trim();
  const tipo=filtroTipo.value, mIni=filtroDataIni.value, mFim=filtroDataFim.value;
  let rows=[...state.transacoes];
  if(text) rows=rows.filter(r => (r.descricao||"").toLowerCase().includes(text) || (r.categoria||"").toLowerCase().includes(text));
  if(tipo) rows=rows.filter(r => r.type===tipo);
  if(mIni) rows=rows.filter(r => toMonthKey(r.data) >= mIni);
  if(mFim) rows=rows.filter(r => toMonthKey(r.data) <= mFim);
  return rows;
}

function drawKPIs(){
  const receitas=state.transacoes.filter(t=>t.type==="receita").reduce((a,t)=>a+(t.valor||0),0);
  const despesas=state.transacoes.filter(t=>t.type==="despesa").reduce((a,t)=>a+(t.valor||0),0);
  const saldo=receitas - despesas;
  kpiReceitas.textContent = real(receitas);
  kpiDespesas.textContent = real(despesas);
  kpiSaldo.textContent = real(saldo);
}

function themeColors(){
  return {
    rec: css("--success") || "#10b981",
    desp: css("--danger") || "#ef4444",
    donut: [
      css("--primary") || "#2563eb",
      css("--success") || "#10b981",
      "#f59e0b", "#a78bfa", "#f97316", "#22d3ee", "#e879f9", "#84cc16"
    ]
  };
}

function updateChartMensal(data){
  const byMonth={};
  for(const t of data){
    const key=toMonthKey(t.data||""); if(!key) continue;
    if(!byMonth[key]) byMonth[key]={rec:0,desp:0};
    if(t.type==="receita") byMonth[key].rec += t.valor||0;
    if(t.type==="despesa") byMonth[key].desp += t.valor||0;
  }
  const labels=Object.keys(byMonth).sort();
  const receitas=labels.map(k=>byMonth[k].rec);
  const despesas=labels.map(k=>byMonth[k].desp);
  const c=themeColors();
  const ctx=document.getElementById("chartMensal").getContext("2d");
  if(state.chartMensal) state.chartMensal.destroy();
  state.chartMensal=new Chart(ctx,{
    type:"bar",
    data:{ labels, datasets:[
      {label:"Receitas",data:receitas, backgroundColor:c.rec},
      {label:"Despesas",data:despesas, backgroundColor:c.desp}
    ]},
    options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true}}}
  });
}

function updateChartCategoria(rows){
  const somaCat={};
  for(const t of rows){ if(t.type!=="despesa") continue; const k=t.categoria||"Sem categoria"; somaCat[k]=(somaCat[k]||0)+(t.valor||0); }
  const labels=Object.keys(somaCat).sort();
  const valores=labels.map(k=>somaCat[k]);
  const c=themeColors();
  const bg = labels.map((_,i)=> c.donut[i % c.donut.length]);
  const ctx=document.getElementById("chartCategoria").getContext("2d");
  if(state.chartCat) state.chartCat.destroy();
  state.chartCat=new Chart(ctx,{ type:"doughnut", data:{ labels, datasets:[{label:"Despesas",data:valores, backgroundColor:bg}] }, options:{responsive:true,maintainAspectRatio:false} });
}

function onTableClick(e){
  const btn=e.target.closest(".icon-btn"); if(!btn) return;
  const action=btn.dataset.action, id=btn.dataset.id; if(!id) return;
  if(action==="delete") return handleDelete(id);
  if(action==="edit") return handleEdit(id);
}

function handleDelete(id){
  if(!confirm("Excluir este lançamento?")) return;
  const all=loadAll().filter(x=>x.id!==id);
  saveAll(all); refresh();
}

function handleEdit(id){
  const all=loadAll(); const r=all.find(x=>x.id===id); if(!r) return;
  state.editId=id;
  document.querySelector(`input[name="type"][value="${r.type}"]`).checked=true;
  document.getElementById("categoria").value=r.categoria||"";
  document.getElementById("valor").value=(r.valor??0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
  document.getElementById("data").value=r.data||"";
  document.getElementById("descricao").value=r.descricao||"";
  editBadge.classList.remove("hidden"); btnSubmit.textContent="Atualizar";
}

function resetEditMode(){ state.editId=null; editBadge.classList.add("hidden"); btnSubmit.textContent="Salvar"; }

function showAlert(msg,isError=false){
  alertForm.classList.remove("hidden");
  alertForm.textContent=msg;
  alertForm.style.background=isError?"#fee2e2":"rgba(37,99,235,.10)";
  alertForm.style.borderColor=isError?"#fecaca":"rgba(37,99,235,.25)";
  alertForm.style.color="inherit";
  clearTimeout(showAlert.__t); showAlert.__t=setTimeout(()=>alertForm.classList.add("hidden"),4000);
}

function exportExcel(){
  const rows=getFiltered();

  if (window.XLSX) {
    try {
      const data=rows.map(r=>({ Data:r.data, Tipo:r.type, Categoria:r.categoria, Valor:r.valor, Descrição:r.descricao }));
      const ws=XLSX.utils.json_to_sheet(data);
      const wb=XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Lancamentos");
      const rec=rows.filter(t=>t.type==="receita").reduce((a,t)=>a+(t.valor||0),0);
      const desp=rows.filter(t=>t.type==="despesa").reduce((a,t)=>a+(t.valor||0),0);
      const ws2=XLSX.utils.json_to_sheet([{ Receitas: rec, Despesas: desp, Saldo: rec-desp }]);
      XLSX.utils.book_append_sheet(wb, ws2, "Resumo");
      XLSX.writeFile(wb, "controle_financeiro.xlsx");
      return;
    } catch (err) {
      console.warn("Falha no XLSX, usando fallback HTML:", err);
    }
  }

  const html = tableHTML(rows);
  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  downloadBlob(blob, "controle_financeiro.xls");
}

function exportWord(){
  const rows=getFiltered();

  if (window.docx && window.docx.Document) {
    try {
      const { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, WidthType } = window.docx;
      const rec=rows.filter(t=>t.type==="receita").reduce((a,t)=>a+(t.valor||0),0);
      const desp=rows.filter(t=>t.type==="despesa").reduce((a,t)=>a+(t.valor||0),0);
      const resumoLine = new Paragraph(`Receitas: ${real(rec)}   •   Despesas: ${real(desp)}   •   Saldo: ${real(rec-desp)}`);

      const header = new TableRow({ children: ["Data","Tipo","Categoria","Valor","Descrição"].map(h => new TableCell({ children:[ new Paragraph({ text:h }) ] })) });
      const bodyRows = rows.map(r => new TableRow({ children: [
        new TableCell({ children:[ new Paragraph(r.data||"") ] }),
        new TableCell({ children:[ new Paragraph(r.type||"") ] }),
        new TableCell({ children:[ new Paragraph(r.categoria||"") ] }),
        new TableCell({ children:[ new Paragraph(real(r.valor)) ] }),
        new TableCell({ children:[ new Paragraph(r.descricao||"") ] }),
      ]}));
      const table = new Table({ rows: [header, ...bodyRows], width: { size: 100, type: WidthType.PERCENTAGE } });
      const doc = new Document({ sections: [{ children: [
        new Paragraph({ text: "Relatório — Controle Financeiro", heading: HeadingLevel.HEADING_1 }),
        new Paragraph(`Usuário: ${state.userId || "-"}`),
        resumoLine, new Paragraph(" "), table ] }]});
      Packer.toBlob(doc).then(blob => downloadBlob(blob, "controle_financeiro.docx"));
      return;
    } catch (err) {
      console.warn("Falha no DOCX, usando fallback .doc (HTML):", err);
    }
  }

  const html = `
    <html><head><meta charset="UTF-8"></head><body>
      <h1>Relatório — Controle Financeiro</h1>
      <p><b>Usuário:</b> ${state.userId || "-"}</p>
      ${summaryHTML(getFiltered())}
      ${tableHTML(rows)}
    </body></html>`;
  const blob = new Blob([html], { type: "application/msword" });
  downloadBlob(blob, "controle_financeiro.doc");
}

function summaryHTML(rows){
  const rec=rows.filter(t=>t.type==="receita").reduce((a,t)=>a+(t.valor||0),0);
  const desp=rows.filter(t=>t.type==="despesa").reduce((a,t)=>a+(t.valor||0),0);
  return `<p><b>Receitas:</b> ${real(rec)} &nbsp; • &nbsp; <b>Despesas:</b> ${real(desp)} &nbsp; • &nbsp; <b>Saldo:</b> ${real(rec-desp)}</p>`;
}
function tableHTML(rows){
  const head = `<tr><th>Data</th><th>Tipo</th><th>Categoria</th><th>Valor</th><th>Descrição</th></tr>`;
  const body = rows.map(r=>`<tr>
      <td>${r.data||""}</td><td>${r.type||""}</td><td>${r.categoria||""}</td>
      <td>${String(r.valor).replace(".",",")}</td><td>${(r.descricao||"").replace(/</g,"&lt;")}</td>
    </tr>`).join("");
  return `<table border="1" cellspacing="0" cellpadding="4">${head}${body}</table>`;
}

function drawTable(){
  const rows=getFiltered();
  tabela.innerHTML = rows.map(r=>`
    <tr>
      <td>${r.data || "-"}</td>
      <td>${r.type}</td>
      <td>${r.categoria || "-"}</td>
      <td class="right">${real(r.valor)}</td>
      <td>${(r.descricao || "").replace(/</g,"&lt;")}</td>
      <td class="actions">
        <button class="icon-btn" title="Editar" data-action="edit" data-id="${r.id}">✏️</button>
        <button class="icon-btn" title="Excluir" data-action="delete" data-id="${r.id}">🗑</button>
      </td>
    </tr>
  `).join("");
  return rows;
}
