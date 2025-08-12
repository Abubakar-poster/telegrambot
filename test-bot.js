// test-bot.js
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.8380189856:AAGgVPLFl_7gYj2T5L1chTaMngyl8yUEz0A, { polling: true });

bot.on('message', msg => {
  console.log('Got a message:', msg);
  bot.sendMessage(msg.chat.id, 'Hello from test bot!');
});
