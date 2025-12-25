import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const API_BASE = process.env.API_BASE || 'http://localhost:8000/api';
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

async function fetchLatestArticle() {
  const { data } = await axios.get(`${API_BASE}/articles`, { params: { limit: 1 } });
  if (!Array.isArray(data) || data.length === 0) throw new Error('No articles available');
  return data[0];
}

async function searchGoogle(query) {
  if (!GOOGLE_API_KEY || !GOOGLE_CX) throw new Error('Missing GOOGLE_API_KEY or GOOGLE_CX');
  const { data } = await axios.get('https://www.googleapis.com/customsearch/v1', {
    params: { key: GOOGLE_API_KEY, cx: GOOGLE_CX, q: query, num: 5, lr: 'lang_en' },
  });
  const items = data.items || [];
  return items
    .filter((item) => item.link && item.link.startsWith('http'))
    .slice(0, 2)
    .map((item) => ({ title: item.title, link: item.link }));
}

async function scrapeContent(url) {
  const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const $ = cheerio.load(data);
  const paragraphs = [];
  $('article p, main p, p').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 40) paragraphs.push(text);
  });
  return paragraphs.slice(0, 40).join('\n\n');
}

async function synthesizeWithLLM(original, references) {
  // Use fallback when no OpenAI key or quota exceeded
  if (!openai) {
    console.log('Using fallback synthesis (no LLM key)');
    const refTexts = references.map((r, i) => `[${i + 1}] ${r.link}`).join('\n');
    const stitched = `${original.body}\n\n## References\n${refTexts}`;
    return { title: `${original.title} (Refreshed)`, body: stitched, citations: references.map((r) => r.link) };
  }

  try {
    const refTexts = references
      .map((r, i) => `Ref ${i + 1}: ${r.link}\n${r.content?.slice(0, 800)}`)
      .join('\n\n');

    const prompt = `Rewrite this article to match competitor tone and SEO. Keep facts aligned.\n` +
      `Original:\n${original.body}\n\n` +
      `Competitors:\n${refTexts}\n\n` +
      `Output markdown with citations at end.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 1500,
    });

    const body = completion.choices[0].message.content;
    return { title: `${original.title} (Updated)`, body, citations: references.map((r) => r.link) };
  } catch (err) {
    console.warn('LLM call failed, using fallback:', err.message);
    const refTexts = references.map((r, i) => `[${i + 1}] ${r.link}`).join('\n');
    const stitched = `${original.body}\n\n## References\n${refTexts}`;
    return { title: `${original.title} (Refreshed)`, body: stitched, citations: references.map((r) => r.link) };
  }
}

async function publishArticle(payload) {
  const { data } = await axios.post(`${API_BASE}/articles`, payload);
  return data;
}

async function main() {
  try {
    const latest = await fetchLatestArticle();
    console.log('Latest article:', latest.title);

    const googleResults = await searchGoogle(latest.title);
    console.log('Google top hits:', googleResults.map((r) => r.link));

    const scrapedRefs = [];
    for (const hit of googleResults) {
      try {
        const content = await scrapeContent(hit.link);
        scrapedRefs.push({ ...hit, content });
      } catch (e) {
        console.warn('Failed to scrape', hit.link, ':', e.message);
      }
    }

    const updated = await synthesizeWithLLM(latest, scrapedRefs);
    const published = await publishArticle({
      title: updated.title,
      body: updated.body,
      summary: updated.body.slice(0, 240),
      source_url: latest.source_url,
      is_original: false,
      citations: updated.citations,
    });

    console.log('Published updated article id:', published.id);
  } catch (err) {
    console.error('Pipeline error:', err.message, err.stack);
    process.exit(1);
  }
}

main();
