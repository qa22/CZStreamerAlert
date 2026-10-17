# CZStreamerAlert

Lightweight Node.js + Socket.IO Telegram donation alert system designed for OBS overlays.

Quick start

1. Install dependencies:

```bash
cd "CZ Stream Project/CZStreamerAlert"
npm install
```

2. Set Telegram token (Windows PowerShell):

```powershell
$env:TELEGRAM_TOKEN = "YOUR_TELEGRAM_TOKEN"
npm start
```

3. In OBS add a Browser Source with URL `http://localhost:3000` and enable transparency.

Files
- backend: server and Telegram bot
- frontend: overlay UI

Notes
- Frontend is served statically by the Express server at `/`.
- Parser looks for `$` or `៛` amounts and `paid by NAME`. Add `Remark: ...` to include a message.
