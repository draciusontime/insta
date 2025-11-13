const axios = require('axios');

// Minimal SerpApi helper for Amazon searches.
// Uses SerpApi Search endpoint: https://serpapi.com/search.json?engine=amazon&q=QUERY&amazon_domain=amazon.com.br&api_key=KEY

async function searchAmazon(query, apiKey) {
  if (!apiKey) throw new Error('SerpApi key required');
  const url = 'https://serpapi.com/search.json';
    const params = {
      engine: 'amazon',
      // SerpApi Amazon engine expects 'k' (keyword) or 'node' (category) param
      k: query,
      amazon_domain: 'amazon.com.br',
      api_key: apiKey,
      ia: 'product'
    };

  try {
    const resp = await axios.get(url, { params, timeout: 20000 });
    const data = resp.data || {};
    const items = [];

    const results = data.search_results || data.organic_results || data.products || [];
    for (const r of results) {
      const title = r.title || r.link_title || r.name || r.product_title || '';
      const link = r.link || r.url || r.product_link || r.link_to_product || '';
      const image = r.thumbnail || r.image || (r.product && r.product.thumbnail) || r.thumbnail_url || '';
      const price = (r.price && (r.price.value || r.price)) || r.extracted_price || r.price || '';
      if (title && image) {
        items.push({ id: r.position || r.id || link, title, image, price, link });
      }
    }

    return items;
  } catch (err) {
    // include response info if available
    const msg = err.response ? `SerpApi error ${err.response.status} ${JSON.stringify(err.response.data).slice(0,200)}` : err.message;
    console.error('searchAmazon error:', msg);
    throw new Error(msg);
  }
}

module.exports = { searchAmazon };
