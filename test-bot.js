// test-bot.js
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

// Load token from .env
const botToken = process.env.BOT_TOKEN;

if (!botToken) {
  console.error("❌ BOT_TOKEN missing from .env file");
  process.exit(1);
}

const bot = new TelegramBot(botToken, { polling: true });

bot.on("message", (msg) => {
  console.log("📩 Got a message:", msg.text);
  bot.sendMessage(msg.chat.id, "Hello from test bot!");
});
