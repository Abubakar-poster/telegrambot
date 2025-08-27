// --- Dependencies ---
const RSSParser = require('rss-parser');
const axios = require('axios');
const cheerio = require('cheerio');

const parser = new RSSParser();

// --- Fetch BBC Hausa RSS ---
async function fetchFeed(rssUrl) {
  try {
    const feed = await parser.parseURL(rssUrl);
    return feed.items.map(i => ({
      id: i.link,
      title: i.title?.trim() || "Untitled",
      link: i.link,
      excerpt: (i.contentSnippet || i.content || "").trim(),
      image: i.enclosure?.url || null
    }));
  } catch (err) {
    console.error(`❌ Failed to fetch RSS from ${rssUrl}:`, err.message);
    return [];
  }
}

// --- Scrape DCL Hausa ---
async function scrapeDCL() {
  const url = "https://dclhausa.com/";
  try {
    const res = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(res.data);
    const articles = [];

    $("article, .post, .td-module-container").each((i, el) => {
      const a = $(el).find("a").first();
      const href = a.attr("href");
      const title =
        a.text().trim() || $(el).find("h2, h3").first().text().trim();
      const img = $(el).find("img").first().attr("src") || null;

      if (href && title) {
        articles.push({
          id: href,
          title,
          link: href,
          excerpt: "",
          image: img
        });
      }
    });

    return articles;
  } catch (err) {
    console.error(`❌ Failed to scrape DCL Hausa:`, err.message);
    return [];
  }
}

module.exports = { fetchFeed, scrapeDCL };
