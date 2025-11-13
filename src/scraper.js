const axios = require('axios');
const cheerio = require('cheerio');

// NOTE: Scraping Amazon may be against their terms and can be blocked. This scraper
// uses the Amazon Brazil site as an example and parses simple page structure. It's
// intentionally minimal and may need adjustments if Amazon changes HTML.

const AMAZON_SEARCH_URL = 'https://www.amazon.com.br/s?k=promo%C3%A7%C3%B5es';

async function fetchSuggestions() {
  try {
    const resp = await axios.get(AMAZON_SEARCH_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Bot/1.0)'
      }
    });

    const $ = cheerio.load(resp.data);
    const results = [];

    // Amazon renders results in divs with data-asin attributes; adapt if needed
    $('div[data-asin]').each((i, el) => {
      if (results.length >= 12) return;
      const asin = $(el).attr('data-asin') || '';
      if (!asin) return;

      const title = $(el).find('h2 a span').first().text().trim();
      const img = $(el).find('img').attr('src') || $(el).find('img').attr('data-src') || '';
      const priceWhole = $(el).find('.a-price-whole').first().text().replace(/[\.\s]/g, '');
      const priceFrac = $(el).find('.a-price-fraction').first().text().trim();
      const price = priceWhole ? `${priceWhole.replace(',', '.')},${priceFrac}` : '';
      const link = img ? `https://www.amazon.com.br/dp/${asin}` : '';

      if (title && img) {
        results.push({ id: asin, title, image: img, price, link });
      }
    });

    return results;
  } catch (err) {
    console.error('fetchSuggestions error', err.message);
    return [];
  }
}

module.exports = { fetchSuggestions };
