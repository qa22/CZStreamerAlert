import express from 'express';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import initBot from './bot.js';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: '*' } });

app.get('/health', (req, res) => res.send('OK'));
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Test route to emit a sample donation for local testing
app.get('/test-donation', (req, res) => {
  const name = req.query.name || 'Test Donor';
  const amount = parseFloat(req.query.amount || '5');
  const currency = req.query.currency || 'USD';
  const message = req.query.message || 'This is a test donation 🎉';
  const payload = { name, amount, currency, message };
  io.emit('donation', payload);
  res.json({ ok: true, emitted: payload });
});

// In-memory settings for the overlay/dashboard
const settings = {
  messageOverride: '',
  soundUrl: '/alert.mp3',
  cooldownSeconds: 3,
  specialEffectThresholdUSD: 10,
  enabled: true
};

// API to get/update settings
app.get('/api/settings', (req, res) => res.json(settings));

app.post('/api/settings', (req, res) => {
  const body = req.body || {};
  if (typeof body.messageOverride === 'string') settings.messageOverride = body.messageOverride;
  if (typeof body.soundUrl === 'string') settings.soundUrl = body.soundUrl;
  if (typeof body.cooldownSeconds === 'number') settings.cooldownSeconds = body.cooldownSeconds;
  if (typeof body.specialEffectThresholdUSD === 'number') settings.specialEffectThresholdUSD = body.specialEffectThresholdUSD;
  if (typeof body.enabled === 'boolean') settings.enabled = body.enabled;
  io.emit('settings', settings);
  res.json({ ok: true, settings });
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dashboard.html'));
});

// Endpoint for external forwarders (user-bot) to POST messages into the system
app.post('/incoming', (req, res) => {
  const secret = process.env.FORWARDER_SECRET || '';
  const header = req.get('X-FORWARDER-KEY') || '';
  if (secret && header !== secret) return res.status(403).json({ ok: false, error: 'forbidden' });

  const text = (req.body && req.body.text) || '';
  if (!text) return res.status(400).json({ ok: false, error: 'no_text' });

  const donation = require('./parser.js').default(text);
  if (donation) {
    io.emit('donation', donation);
    return res.json({ ok: true, emitted: donation });
  }
  res.json({ ok: true, message: 'no donation parsed' });
});

io.on('connection', (socket) => {
  console.log('Frontend connected:', socket.id);
});

if (process.env.DISABLE_BOT !== 'true') {
  initBot(io);
} else {
  console.log('Bot disabled by DISABLE_BOT=true — running in test mode.');
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`CZStreamerAlert server running on http://localhost:${PORT}`));
