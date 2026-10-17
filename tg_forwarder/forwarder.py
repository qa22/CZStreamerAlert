"""
Telethon-based forwarder: logs in as a real Telegram user, listens to a target chat (group/channel),
and POSTs matching message text to the backend `/incoming` endpoint with an optional secret header.

Create a .env in this folder with:
API_ID=123456
API_HASH=your_api_hash
BACKEND_URL=http://localhost:3000/incoming
FORWARDER_SECRET=optional-secret-to-match-X-FORWARDER-KEY
TARGET_CHAT=@your_group_username_or_chat_id

Install requirements:
pip install telethon python-dotenv requests

Run:
python forwarder.py

"""
import os
import re
import requests
from dotenv import load_dotenv
from telethon import TelegramClient, events

load_dotenv()
API_ID = int(os.getenv('API_ID') or 0)
API_HASH = os.getenv('API_HASH')
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:3000/incoming')
FORWARDER_SECRET = os.getenv('FORWARDER_SECRET', '')
TARGET_CHAT = os.getenv('TARGET_CHAT')
SESSION_NAME = os.getenv('SESSION_NAME', 'forwarder_session')

if not API_ID or not API_HASH:
    print('ERROR: API_ID and API_HASH are required in .env (get them from https://my.telegram.org)')
    raise SystemExit(1)

client = TelegramClient(SESSION_NAME, API_ID, API_HASH)

# simple heuristic to forward only messages that look like ABA payment notifications
PAYMENT_RE = re.compile(r'(\$|៛)\s*[0-9\,]+', re.UNICODE)

@client.on(events.NewMessage)
async def handler(event):
    # only from the target chat if configured
    if TARGET_CHAT:
        try:
            chat = await event.get_chat()
            identifier = getattr(chat, 'username', None) or getattr(chat, 'id', None)
            if str(identifier) != str(TARGET_CHAT) and (not (isinstance(TARGET_CHAT, str) and TARGET_CHAT.startswith('@') and identifier == TARGET_CHAT[1:])):
                return
        except Exception:
            pass

    text = event.message.message or ''
    if not text:
        return

    if PAYMENT_RE.search(text):
        print('Forwarding text to backend:', text[:120])
        headers = {}
        if FORWARDER_SECRET:
            headers['X-FORWARDER-KEY'] = FORWARDER_SECRET
        try:
            resp = requests.post(BACKEND_URL, json={'text': text}, headers=headers, timeout=10)
            print('Backend response:', resp.status_code, resp.text)
        except Exception as e:
            print('Error posting to backend:', e)

if __name__ == '__main__':
    print('Starting forwarder...')
    with client:
        client.run_until_disconnected()
