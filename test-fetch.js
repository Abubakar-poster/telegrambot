const { fetchFeed, scrapeDCL } = require('./rss-fetch');

(async () => {
  const bbcNews = await fetchFeed('https://feeds.bbci.co.uk/hausa/rss.xml');
  console.log("BBC Hausa:", bbcNews);

  const dclNews = await scrapeDCL();
  console.log("DCL Hausa:", dclNews);
})();
// test-fetch.js