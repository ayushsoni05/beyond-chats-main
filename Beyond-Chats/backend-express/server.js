import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_FILE = join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'BeyondChats API', version: '1.0.0', endpoints: ['/api/articles', '/api/scrape'] });
});

// Mock DB
function getDB() {
  if (!existsSync(DB_FILE)) return { articles: [] };
  return JSON.parse(readFileSync(DB_FILE, 'utf-8'));
}

function saveDB(data) {
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// CRUD Routes
app.get('/api/articles', (req, res) => {
  const db = getDB();
  const { limit, per_page = 10, updated_only } = req.query;
  let articles = db.articles;
  if (updated_only === 'true') articles = articles.filter((a) => !a.is_original);
  articles = articles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  if (limit) return res.json(articles.slice(0, parseInt(limit)));
  const page = parseInt(req.query.page) || 1;
  const start = (page - 1) * per_page;
  res.json({
    data: articles.slice(start, start + per_page),
    total: articles.length,
    per_page,
    current_page: page,
  });
});

app.get('/api/articles/:id', (req, res) => {
  const db = getDB();
  const article = db.articles.find((a) => a.id === parseInt(req.params.id));
  if (!article) return res.status(404).json({ error: 'Not found' });
  res.json(article);
});

app.post('/api/articles', (req, res) => {
  const db = getDB();
  const { title, body, summary, source_url, is_original, citations } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'title and body required' });
  const id = Math.max(...db.articles.map((a) => a.id), 0) + 1;
  const article = {
    id,
    title,
    slug: title.toLowerCase().replace(/\s+/g, '-'),
    body,
    summary: summary || body.slice(0, 240),
    source_url: source_url || null,
    is_original: is_original !== false,
    citations: citations || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.articles.push(article);
  saveDB(db);
  res.status(201).json(article);
});

app.put('/api/articles/:id', (req, res) => {
  const db = getDB();
  const article = db.articles.find((a) => a.id === parseInt(req.params.id));
  if (!article) return res.status(404).json({ error: 'Not found' });
  Object.assign(article, req.body, { updated_at: new Date().toISOString() });
  saveDB(db);
  res.json(article);
});

app.delete('/api/articles/:id', (req, res) => {
  const db = getDB();
  const idx = db.articles.findIndex((a) => a.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.articles.splice(idx, 1);
  saveDB(db);
  res.status(204).send();
});

// Scrape endpoint (populates with initial articles)
app.post('/api/scrape', async (req, res) => {
  const url = req.body.url || 'https://beyondchats.com/blogs/';
  const take = req.body.take || 5;
  try {
    const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(response.data);
    const articles = [];

    // Scrape article links
    $('article a, [class*="post"] a, [class*="card"] a').each((_, el) => {
      const href = $(el).attr('href');
      if (href && href.startsWith('http')) {
        articles.push(href);
      }
    });

    const unique = [...new Set(articles)].slice(-take);
    const scraped = [];

    for (const link of unique) {
      try {
        const res = await axios.get(link, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $doc = cheerio.load(res.data);
        const title = $doc('h1').first().text() || 'Untitled';
        const paragraphs = [];
        $doc('article p, main p, p').each((_, el) => {
          const text = $(el).text().trim();
          if (text.length > 40) paragraphs.push(text);
        });
        const body = paragraphs.slice(0, 20).join('\n\n');

        scraped.push({
          title,
          body: body || 'No content found',
          summary: body.slice(0, 240),
          source_url: link,
          is_original: true,
          citations: [],
        });
      } catch {
        continue;
      }
    }

    const db = getDB();
    for (const article of scraped) {
      const id = Math.max(...db.articles.map((a) => a.id), 0) + 1;
      db.articles.push({
        id,
        slug: article.title.toLowerCase().replace(/\s+/g, '-'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...article,
      });
    }
    saveDB(db);

    res.json({ saved: scraped.length, articles: scraped });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
