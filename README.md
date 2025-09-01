# 💰 Controle Financeiro — Site Estático (LocalStorage)

Aplicação web **100% estática** para controlar receitas e despesas direto no **navegador**, sem servidor.  
Os dados são guardados no **LocalStorage** do seu browser. Possui **gráficos**, **filtros**, **exportação para Excel/Word**, **tema claro/escuro** e **importação de CSV/JSON**.

---

## 📸 Visão Geral

- **Sem backend**: funciona abrindo o `index.html` com duplo-clique.
- **Dados locais**: cada navegador/usuário mantém seus próprios lançamentos.
- **UI moderna e responsiva** com modo **Claro/Escuro**.
- **Gráficos** (mensal e por categoria) com Chart.js.
- **Filtros com “Aplicar” e “Limpar filtros”**.
- **Exportar**:
  - **Excel (.xlsx)** e **Word (.docx)** se as bibliotecas estiverem carregadas;
  - **Fallback** automático para **.xls** e **.doc** (HTML) quando offline/bloqueado.
- **Importar**: CSV ou JSON (modelo compatível).
- **Edição/Exclusão** de lançamentos inline.

---

## 🗂 Estrutura


**Bibliotecas via CDN** (carregadas no `index.html`):
- [Chart.js] para gráficos  
- [SheetJS (xlsx)] para Excel  
- [docx] para Word  
> Se a rede bloquear essas URLs, o app **cai automaticamente** para exportação em `.xls`/`.doc` baseado em HTML.

---

## 🚀 Como rodar

### Opção 1 — Local (recomendado para testes)
1. Baixe/clon​e o repositório.
2. Abra o arquivo **`index.html`** com duplo-clique.

### Opção 2 — Vercel / Netlify / GitHub Pages
- Basta fazer o **deploy estático** da pasta com `index.html`, `style.css` e `script.js`.  
- Não há build. Não há variáveis de ambiente. Tudo roda no cliente.

---

## 🧭 Uso rápido (passo a passo)

1. **Usuário**: preencha o campo no topo e clique **Salvar**.  
   > Importante: o app filtra os lançamentos por `userId`. Sem salvar, ele bloqueia o “Salvar lançamento”.
2. **Novo lançamento**:
   - Selecione **Tipo** (Receita/Despesa), **Categoria**, **Valor**, **Data** e **Descrição** → **Salvar**.
3. **Filtros**:
   - Texto, Tipo, Mês inicial/final → **Aplicar**.
   - Para zerar todos os filtros → **Limpar filtros**.
4. **Exportar**:
   - **Excel**: baixa `controle_financeiro.xlsx` (ou `.xls` fallback).
   - **Word**: baixa `controle_financeiro.docx` (ou `.doc` fallback).
5. **Importar**:
   - Clique **Importar** e envie um **CSV** ou **JSON** no modelo abaixo.
6. **Tema**:
   - Botão **Tema: Claro/Escuro** alterna e salva sua preferência.

---

## 📊 Modelo de dados (Importação)

### JSON (lista de objetos)
```json
[
  {
    "id": "uuid-opcional",
    "userId": "meu-usuario",
    "type": "receita ou despesa",
    "categoria": "Alimentação",
    "valor": 123.45,
    "data": "2025-05-10",
    "descricao": "Exemplo",
    "createdAt": "2025-05-10T12:00:00.000Z"
  }
]
