// rss-fetch.js
const RSSParser = require('rss-parser');
const parser = new RSSParser();
const axios = require('axios');
const cheerio = require('cheerio');

// Fetch from RSS feed
async function fetchFeed(rssUrl) {
  try {
    const feed = await parser.parseURL(rssUrl);
    return feed.items.map(i => ({
      id: i.link,
      title: i.title,
      link: i.link,
      excerpt: i.contentSnippet || i.content || '',
      image: i.enclosure && i.enclosure.url ? i.enclosure.url : null
    }));
  } catch (error) {
    console.error(`❌ Error fetching RSS feed: ${error.message}`);
    return [];
  }
}

// Scrape DCL Hausa website
async function scrapeDCL() {
  try {
    const url = 'https://dclhausa.com/';
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);
    const out = [];

    $('article, .post, .td-module-container').each((i, el) => {
      const a = $(el).find('a').first();
      const href = a.attr('href');
      const title = a.text().trim() || $(el).find('h2, h3').text().trim();
      const img = $(el).find('img').first().attr('src') || null;

      if (href && title) {
        out.push({ id: href, title, link: href, excerpt: '', image: img });
      }
    });

    return out;
  } catch (error) {
    console.error(`❌ Error scraping DCL Hausa: ${error.message}`);
    return [];
  }
}

module.exports = { fetchFeed, scrapeDCL };
