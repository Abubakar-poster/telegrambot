// test-fetch.js
const { fetchFeed, scrapeDCL } = require("./rss-fetch");

(async () => {
  try {
    console.log("⏳ Fetching BBC Hausa RSS...");
    const bbcNews = await fetchFeed("https://feeds.bbci.co.uk/hausa/rss.xml");
    console.log("✅ BBC Hausa fetched:", bbcNews.slice(0, 3)); // show first 3 items

    console.log("\n⏳ Scraping DCL Hausa...");
    const dclNews = await scrapeDCL();
    console.log("✅ DCL Hausa fetched:", dclNews.slice(0, 3)); // show first 3 items
  } catch (err) {
    console.error("❌ Error testing feeds:", err.message);
  }
})();
