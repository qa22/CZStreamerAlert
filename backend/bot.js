import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
dotenv.config();
import parseABAMessage from './parser.js';

export default function initBot(io) {
  const token = process.env.TELEGRAM_TOKEN;
  if (!token) {
    console.warn('TELEGRAM_TOKEN not set — Telegram bot disabled.');
    return;
  }

  const bot = new TelegramBot(token, { polling: true });

  bot.on('message', (msg) => {
    const text = msg.text || msg.caption || '';
    console.log('Telegram message received:', text);
    console.log('Full message object:', JSON.stringify(msg, null, 2));
    const donation = parseABAMessage(text);
    if (donation) {
      io.emit('donation', donation);
      console.log('Donation emitted:', donation);
    } else {
      console.log('No donation parsed from message.');
    }
  });

  // Also listen to channel posts and edited messages (some forwards or channel integrations use these)
  bot.on('channel_post', (msg) => {
    const text = msg.text || msg.caption || '';
    console.log('Telegram channel_post received:', text);
    console.log('Full channel_post object:', JSON.stringify(msg, null, 2));
    const donation = parseABAMessage(text);
    if (donation) {
      io.emit('donation', donation);
      console.log('Donation emitted from channel_post:', donation);
    }
  });

  bot.on('edited_message', (msg) => {
    const text = msg.text || msg.caption || '';
    console.log('Telegram edited_message received:', text);
    console.log('Full edited_message object:', JSON.stringify(msg, null, 2));
    const donation = parseABAMessage(text);
    if (donation) {
      io.emit('donation', donation);
      console.log('Donation emitted from edited_message:', donation);
    }
  });
}
