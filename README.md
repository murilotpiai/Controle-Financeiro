# 💰 Controle Financeiro — simples, direto e seu

Registre **receitas** e **despesas**, veja **gráficos** em tempo real e **exporte CSV**.  
Os dados ficam **no seu Google Sheets**, sob seu controle, via **Google Apps Script**.

> ⚡️ Não precisa de servidor nem cadastro externo. É um site estático (HTML/CSS/JS).

---

## ✨ O que dá pra fazer

- Adicionar **receitas** e **despesas** rapidamente
- Ver **KPIs** (Receitas, Despesas, Saldo)
- **Gráfico mensal** (barras) e **pizza por categoria**
- **Filtros** por texto, tipo e período (mês)
- **Editar** e **excluir** lançamentos
- **Exportar CSV** (um clique)

---

## 🚀 Como usar (3 passos)

1. **Defina seu Usuário**  
   No topo direito, digite seu identificador (ex.: seu e-mail) e clique **Salvar**.  
   > Dica: use sempre o **mesmo** usuário para ver seus próprios lançamentos.

2. **Lance as movimentações**  
   Escolha **Receita** ou **Despesa**, preencha **Categoria**, **Valor**, **Data** e **Descrição** → **Salvar**.

3. **Explore e filtre**  
   Use os campos de **busca**, **tipo** e **período** para filtrar.  
   Baixe tudo em **CSV** quando quiser.

---

## 🔒 Sobre seus dados

- Ficam na **sua planilha do Google** (aba `transacoes`).  
- O site se conecta ao seu **Apps Script (Web App)**, que escreve/lê nessa planilha.  
- Você pode abrir a planilha a qualquer momento para ver/editar linhas.

---

## ❓ Perguntas frequentes

**Preciso criar conta?**  
Não. O “Usuário” é só um identificador para filtrar seus dados (ex.: seu e-mail ou apelido).

**Funciona no celular?**  
Sim. A interface é responsiva.

**Posso apagar/editar um lançamento?**  
Sim. Use os botões ✏️ (editar) e 🗑 (excluir) na tabela.

**Posso baixar meus dados?**  
Sim. Clique em **Exportar CSV**.

**E se eu trocar de navegador?**  
Reutilize o mesmo **Usuário** para ver seus lançamentos.

---

## 🛠️ Requisitos (para quem vai configurar)

- Uma planilha no Google com a aba **`transacoes`**.  
- Um **Apps Script** publicado como **Aplicativo da Web**:  
  - Executar como: **Você**  
  - Quem tem acesso: **Qualquer pessoa**  
  - Copiar a URL de produção (termina em **`/exec`**)  
- No arquivo `config.js` do site, colar essa URL em `APPS_SCRIPT_URL`.

> Usuários comuns não precisam saber disso; basta usar o site pronto.

---

## 📈 Dicas de uso

- Formate a coluna **valor** da planilha como **Moeda (R$)** e a **data** como **AAAA-MM-DD**.  
- Use **categorias** consistentes (ex.: “Alimentação”, “Transporte”, “Saúde”) para relatórios mais claros.  
- Mantenha um **Usuário** único por pessoa (evita misturar dados).

---

## 🗺️ Roadmap (ideias futuras)

- Metas mensais e alertas  
- Lançamentos recorrentes  
- Importação OFX/CSV (bancos)  
- Google Sign-In  
- Modo escuro

---

## 🧾 Licença

Uso livre para fins educacionais e pessoais.  
Se publicar uma versão própria, cite a fonte e mantenha esta seção.

---
