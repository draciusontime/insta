require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const { fetchSuggestions } = require('./src/scraper');
const { searchAmazon } = require('./src/serpapi');
const { db, init } = require('./src/db');
const { supabase, initDatabase } = require('./src/supabase');

// simple in-memory cache for search results (TTL: 1 hour)
const cache = {
  searches: {},
  ttl: 3600000 // 1 hour in ms
};

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// ==================== STORIES ENDPOINTS (Supabase) ====================

// GET todas as stories
app.get('/api/stories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Erro ao buscar stories:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST nova story
app.post('/api/stories', async (req, res) => {
  try {
    const { title, price, image, canvas_data, link } = req.body;
    
    if (!title || !canvas_data) {
      return res.status(400).json({ error: 'title e canvas_data são obrigatórios' });
    }

    // Primeiro, remove story antiga do mesmo produto
    const { error: deleteError } = await supabase
      .from('stories')
      .delete()
      .eq('title', title);
    
    if (deleteError) console.warn('Aviso ao deletar story antiga:', deleteError.message);

    // Depois, insere a nova story
    const { data, error } = await supabase
      .from('stories')
      .insert([{ title, price, image, canvas_data, link }])
      .select();
    
    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (err) {
    console.error('Erro ao salvar story:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE story
app.delete('/api/stories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Erro ao deletar story:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==================== PRODUTOS ENDPOINTS ====================

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
  
  // Inicializa Supabase
  const supabaseReady = await initDatabase();
  
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
    console.log(`📊 Supabase: ${supabaseReady ? '✅ Connected' : '⚠️ Check configuration'}`);
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
