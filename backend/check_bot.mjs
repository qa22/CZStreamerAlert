import dotenv from 'dotenv';
dotenv.config();
import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_TOKEN;
if (!token) {
  console.error('TELEGRAM_TOKEN not found in environment.');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: false });

bot.getMe().then(info => {
  console.log('Bot identity:', info);
  process.exit(0);
}).catch(err => {
  console.error('Failed to get bot info:', err.message || err);
  process.exit(2);
});
