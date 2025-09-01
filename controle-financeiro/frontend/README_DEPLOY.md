# Deploy: Site Estático + Google Sheets (Apps Script)

Este `frontend/` funciona **sem backend próprio**. Os dados são gravados e lidos de uma **planilha do Google** usando um **Apps Script (Web App)**.

## 1) Criar Planilha
- Crie uma planilha no Google Drive chamada `Controle_Financeiro`.
- Crie uma aba `transacoes` (primeira linha pode conter os cabeçalhos abaixo ou deixe em branco; o script insere linhas mesmo assim):
  ```
  criadoEm | userId | type | categoria | valor | data | descricao | notes
  ```

## 2) Apps Script (Web App)
- Com a planilha aberta, vá em **Extensões → Apps Script** e cole o código abaixo em `Code.gs`.

```javascript
function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName("transacoes") || ss.insertSheet("transacoes");
  sh.appendRow([new Date(), body.userId, body.type, body.categoria, Number(body.valor), body.data, body.descricao || "", body.notes || ""]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const userId = e.parameter.userId || "";
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName("transacoes") || ss.insertSheet("transacoes");
  const values = sh.getDataRange().getValues();
  if (!values.length) {
    return ContentService.createTextOutput(JSON.stringify({ ok: true, data: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  values.shift(); // remove header se houver
  const rows = values
    .filter(r => !userId || r[1] === userId)
    .map(r => ({
      criadoEm: r[0],
      userId: r[1],
      type: r[2],
      categoria: r[3],
      valor: r[4],
      data: r[5],
      descricao: r[6],
      notes: r[7]
    }));
  return ContentService.createTextOutput(JSON.stringify({ ok: true, data: rows }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

- Clique em **Implantar → Implantar como aplicativo da Web**.
  - Tipo de execução: Você mesmo.
  - Quem pode acessar: **Qualquer pessoa com o link**.
- Copie a URL de produção (termina com `/exec`).

## 3) Configurar o frontend
- No arquivo `config.js`, cole a URL em `APPS_SCRIPT_URL`.
- Defina um identificador em `DEFAULT_USER_ID` (ex.: seu e-mail) ou salve no campo “Usuário” do topo da página.

```js
export const APPS_SCRIPT_URL = "https://script.google.com/macros/s/SEU_DEPLOY_ID/exec";
export const DEFAULT_USER_ID = "seu.email@exemplo.com";
```

## 4) Testar localmente
- Abra o `index.html` com um servidor estático (ex.: VSCode Live Server ou `python -m http.server 5500` na pasta `frontend/`).
- Cadastre um usuário (topo à direita) e faça um lançamento. Veja aparecer na planilha.

## 5) Deploy no Vercel (estático)
- Crie um repositório no GitHub com apenas a pasta `frontend/`.
- No Vercel: **New Project → Import from GitHub** → Framework: *Other*, Build command vazio, Output directory: `frontend`.
- Deploy e pronto. O site chamará o Apps Script.

---

### Observações
- Não inclua `.venv/` do backend neste projeto estático.
- Para autenticação real, evolua depois para **Google Identity** no Apps Script ou **Firebase Authentication** (e troque `API_MODE` futuramente).
