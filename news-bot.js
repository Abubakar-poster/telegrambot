// --- Load environment variables ---
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { fetchFeed, scrapeDCL } = require('./rss-fetch');
const fs = require('fs-extra');
const { uploadImageToWP, createWordpressPost } = require('./wordpress');

// --- Database for posted news ---
let db = fs.existsSync('posted.json') ? fs.readJsonSync('posted.json') : { posted: [] };

function isPosted(id) {
  return db.posted.includes(id);
}

function markPosted(id) {
  if (!db.posted.includes(id)) {
    db.posted.push(id);
    fs.writeJsonSync('posted.json', db, { spaces: 2 });
  }
}

// --- Setup bot ---
const botToken = process.env.BOT_TOKEN;
const channel = process.env.TELEGRAM_CHANNEL;
const pollInterval = parseInt(process.env.POLL_INTERVAL_MIN || "10") * 60 * 1000; // default 10 min

if (!botToken || !channel) {
  console.error("❌ Missing BOT_TOKEN or TELEGRAM_CHANNEL in .env file");
  process.exit(1);
}

const bot = new TelegramBot(botToken, { polling: false });

// --- Send news to Telegram ---
async function postToTelegram(bot, channel, item) {
  const text = `📰 <b>${item.title}</b>\n\n${item.excerpt}\n\n🔗 <a href="${item.link}">Read original</a>`;
  if (item.image) {
    await bot.sendPhoto(channel, item.image, { caption: text, parse_mode: 'HTML' });
  } else {
    await bot.sendMessage(channel, text, { parse_mode: 'HTML' });
  }
  console.log(`✅ Sent to Telegram: ${item.title}`);
}

// --- Send news to WordPress ---
async function postToWordPress(item) {
  let imageId = null;
  if (item.image) {
    imageId = await uploadImageToWP(item.image, 'news-image.jpg');
  }
  await createWordpressPost(
    item.title,
    `<p>${item.excerpt}</p><p><a href="${item.link}">Read more</a></p>`,
    imageId
  );
  console.log(`✅ Posted to WordPress: ${item.title}`);
}

// --- Main fetch & post function ---
async function fetchAndPostNews() {
  try {
    const bbcNews = await fetchFeed('https://feeds.bbci.co.uk/hausa/rss.xml');
    const dclNews = await scrapeDCL();
    const allNews = [...bbcNews, ...dclNews];

    for (const item of allNews) {
      if (!isPosted(item.id)) {
        try {
          await postToTelegram(bot, channel, item);
          await postToWordPress(item);
          markPosted(item.id); // Only mark if both succeed
        } catch (err) {
          console.error(`❌ Failed for ${item.title}: ${err.message}`);
          // Not marking as posted so it retries next time
        }
      }
    }

    console.log("🎯 Cycle completed");
  } catch (err) {
    console.error("❌ Error fetching news:", err.message);
  }
}

// --- Start automatic loop ---
console.log(`⏳ News bot started, checking every ${pollInterval / 60000} minutes...`);
fetchAndPostNews(); // Run immediately
setInterval(fetchAndPostNews, pollInterval);
