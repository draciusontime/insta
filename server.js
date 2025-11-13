require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const { fetchSuggestions } = require('./src/scraper');
const { searchAmazon } = require('./src/serpapi');
const { db, init } = require('./src/db');

// simple in-memory cache for search results (TTL: 1 hour)
const cache = {
  searches: {},
  ttl: 3600000 // 1 hour in ms
};

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/suggestions', async (req, res) => {
  try {
    await db.read();
    res.json(db.data.suggestions || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/save', (req, res) => {
  try {
    const item = req.body;
    (async () => {
      await db.read();
      db.data.products.push(item);
      await db.write();
      res.json(item);
    })();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products', (req, res) => {
  try {
    (async () => {
      await db.read();
      res.json(db.data.products || []);
    })();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// simple trigger to refresh suggestions on demand
app.post('/api/refresh', async (req, res) => {
  try {
    let suggestions = [];
    const serpKey = process.env.SERPAPI_KEY || null;
    if (serpKey) {
      // use SerpApi to get structured results
      suggestions = await searchAmazon('promoções', serpKey);
    } else {
      suggestions = await fetchSuggestions();
    }
    await db.read();
    db.data.suggestions = suggestions;
    await db.write();
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// simple search endpoint that proxies SerpApi when key is configured
app.get('/api/search', async (req, res) => {
  const q = req.query.q || 'promoções';
  const serpKey = process.env.SERPAPI_KEY || null;
  try {
    if (!serpKey) return res.status(400).json({ error: 'SERPAPI_KEY not configured on server' });
    
    // check cache first
    const cacheKey = 'search_' + q;
    if (cache.searches[cacheKey] && (Date.now() - cache.searches[cacheKey].timestamp < cache.ttl)) {
      console.log('Returning cached search results for:', q);
      return res.json(cache.searches[cacheKey].data);
    }
    
    // fetch from SerpApi
    const items = await searchAmazon(q, serpKey);
    
    // store in cache
    cache.searches[cacheKey] = {
      data: items,
      timestamp: Date.now()
    };
    
    res.json(items);
  } catch (err) {
    console.error('/api/search error', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/ping', (req, res) => res.json({ ok: true }));

// image proxy to avoid CORS issues when drawing remote images to canvas
app.get('/api/image-proxy', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'url query required' });
  try {
    const axios = require('axios');
    const resp = await axios.get(url, { responseType: 'stream', timeout: 20000 });
    const contentType = resp.headers['content-type'] || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    resp.data.pipe(res);
  } catch (err) {
    console.error('image-proxy error:', err.message);
    res.status(500).json({ error: 'failed to proxy image' });
  }
});

// schedule scraping every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running scheduled suggestion fetch...');
  try {
    const serpKey = process.env.SERPAPI_KEY || null;
    let suggestions = [];
    if (serpKey) {
      suggestions = await searchAmazon('promoções', serpKey);
    } else {
      suggestions = await fetchSuggestions();
    }
    await db.read();
    db.data.suggestions = suggestions;
    await db.write();
    console.log('Suggestions updated:', suggestions.length);
  } catch (err) {
    console.error('Scheduled fetch failed:', err.message);
  }
});

const port = process.env.PORT || 3000;
(async () => {
  await init();
  const server = app.listen(port, '0.0.0.0', () => {
    const addr = server.address();
    const host = addr && addr.address ? addr.address : 'localhost';
    const p = addr && addr.port ? addr.port : port;
    // Log SerpApi key presence (masked) for debugging, do not print full key
    const serpKey = process.env.SERPAPI_KEY || null;
    if (serpKey) {
      const masked = serpKey.length > 8 ? serpKey.slice(0,4) + '...' + serpKey.slice(-4) : '****';
      console.log(`🚀 Server running on http://${host === '::' ? 'localhost' : host}:${p} - SerpApi: present (${masked})`);
    } else {
      console.log(`🚀 Server running on http://${host === '::' ? 'localhost' : host}:${p} - SerpApi: NOT configured`);
    }
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  process.on('unhandledRejection', (reason, p) => {
    console.error('❌ Unhandled Rejection at:', p, 'reason:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err && err.stack ? err.stack : err);
  });
})();

// config endpoint for debugging (does NOT return the raw key)
app.get('/api/config', (req, res) => {
  const serpKey = process.env.SERPAPI_KEY || null;
  res.json({ serpApiConfigured: !!serpKey, serpApiMasked: serpKey ? (serpKey.length > 8 ? serpKey.slice(0,4) + '...' + serpKey.slice(-4) : '****') : null });
});
