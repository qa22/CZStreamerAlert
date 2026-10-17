Telethon Forwarder

This script runs as a regular Telegram user and forwards payment-like messages to the CZStreamerAlert backend `/incoming` endpoint.

Setup

1. Create a virtualenv and install deps:

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install telethon python-dotenv requests
```

2. Create `.env` in `tg_forwarder/` with:

```
API_ID=YOUR_API_ID
API_HASH=YOUR_API_HASH
BACKEND_URL=http://localhost:3000/incoming
FORWARDER_SECRET=some-secret
TARGET_CHAT=@your_group_username_or_chat_id
SESSION_NAME=forwarder_session
```

3. Run the forwarder:

```bash
python forwarder.py
```

Notes
- Get `API_ID` and `API_HASH` from https://my.telegram.org
- The script stores a session file (`forwarder_session.session`) locally after first login.
- `FORWARDER_SECRET` should match `FORWARDER_SECRET` in the backend `.env` to authenticate posts.
- `TARGET_CHAT` can be the group's @username or numeric id.
