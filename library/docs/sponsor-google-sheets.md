# Sponsor + request forms → Excel / Google Sheets

Every form submission is saved in two places:

| Form | Local file (open in Excel / Numbers) | Download while the demo runs |
| --- | --- | --- |
| Become a sponsor | `data/sponsors.csv` | http://127.0.0.1:5190/api/sponsors.csv |
| Request an icon / gradient / logo / isometric | `data/requests.csv` | http://127.0.0.1:5190/api/requests.csv |
| Support (name + message) | `data/supporters.csv` | http://127.0.0.1:5190/api/supporters.csv |

Request rows contain: submitted at, name, email, type (Icon, Gradient, Logo, Isometric), request, suggestion and the page it came from.

## Connect a Google Sheet (5 minutes)

1. Create a new Google Sheet, for example "Aerolabs inbox".
2. Open **Extensions → Apps Script**, delete the sample code and paste this. It writes sponsors and requests to two tabs:

```js
const TABS = {
  sponsor: ['Sponsors', ['Submitted at', 'Name', 'Company', 'Email', 'Budget', 'Placement', 'Message'],
    d => [d.company || '', d.email, d.budget || '', (d.placement || []).join(' + '), d.message]],
  request: ['Requests', ['Submitted at', 'Name', 'Email', 'Type', 'Request', 'Suggestion', 'Page'],
    d => [d.email, d.kind, d.request, d.suggestion || '', d.page || '']],
  support: ['Supporters', ['Submitted at', 'Name', 'Message'], d => [d.message]],
};
function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const [name, head, row] = TABS[d.form] || TABS.request;
  const book = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = book.getSheetByName(name) || book.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(head);
  sheet.appendRow([new Date(), d.name, ...row(d)]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}
```

3. Click **Deploy → New deployment → Web app**. Set "Execute as" to **Me** and "Who has access" to **Anyone**, then deploy and copy the Web app URL.
4. Create `.env.local` in this folder with:

```
SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/…/exec
VITE_SHEETS_WEBHOOK=https://script.google.com/macros/s/…/exec
```

5. Restart the dev server (`npm run dev`).

`SHEETS_WEBHOOK_URL` is used by the local server. `VITE_SHEETS_WEBHOOK` lets the static build (for example on Vercel, where there is no local server) send rows straight to the sheet.


## On Vercel

The live site has no `data/` folder. `api/[form].js` forwards every form to the Google Sheet instead:
in Vercel open **Project → Settings → Environment Variables**, add `SHEETS_WEBHOOK_URL` with the Apps Script web-app URL, then redeploy.
Without it the forms show "Could not send".
