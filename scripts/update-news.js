import fetch from 'node-fetch';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML_PATH = path.join(__dirname, '..', 'index.html');

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!NEWS_API_KEY || !ANTHROPIC_API_KEY) {
  console.error('Missing required env vars: NEWS_API_KEY, ANTHROPIC_API_KEY');
  process.exit(1);
}

async function fetchHeadlines() {
  const queries = ['gas prices', 'Iran war oil'];
  const results = [];

  for (const q of queries) {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&sortBy=publishedAt&language=en&pageSize=3&apiKey=${NEWS_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.articles) results.push(...data.articles);
  }

  // Deduplicate by title and return top 5
  const seen = new Set();
  return results.filter(a => {
    if (seen.has(a.title)) return false;
    seen.add(a.title);
    return a.title && a.title !== '[Removed]';
  }).slice(0, 5);
}

async function summarizeWithClaude(articles) {
  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const headlines = articles.map((a, i) => `${i + 1}. ${a.title}`).join('\n');

  const tickerRes = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 60,
    messages: [{
      role: 'user',
      content: `Based on these current news headlines about gas prices and the Iran conflict, write ONE punchy ticker-style sentence under 20 words. Use ALL CAPS. No quotes. Just the sentence.\n\n${headlines}`
    }]
  });

  const bannerRes = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 120,
    messages: [{
      role: 'user',
      content: `Based on these current news headlines about gas prices and the Iran conflict, write exactly 2 sentences summarizing what's happening and how it affects gas prices. Keep it factual, under 50 words total. No fluff.\n\n${headlines}`
    }]
  });

  return {
    ticker: tickerRes.content[0].text.trim(),
    banner: bannerRes.content[0].text.trim()
  };
}

function updateHTML(html, ticker, banner) {
  // Update ticker text — replace content between id="tickerText"> and </span>
  // The ticker span has inner content we replace wholesale
  const tickerRe = /(<span class="ticker-inner" id="tickerText">)[\s\S]*?(<\/span>)/;
  const newTickerContent = `\n    &nbsp;&nbsp;&nbsp;&nbsp;⚡ ${ticker} &nbsp;&nbsp;&nbsp;&nbsp;\n  `;
  html = html.replace(tickerRe, `$1${newTickerContent}$2`);

  // Update alert banner paragraph — the <p> inside .alert-text
  const bannerRe = /(<div class="alert-text">[\s\S]*?<p>)[\s\S]*?(<\/p>)/;
  html = html.replace(bannerRe, `$1${banner}$2`);

  return html;
}

async function main() {
  console.log('Fetching headlines...');
  const articles = await fetchHeadlines();

  if (!articles.length) {
    console.log('No articles found, skipping update.');
    process.exit(0);
  }

  console.log(`Found ${articles.length} articles. Summarizing with Claude...`);
  articles.forEach((a, i) => console.log(`  ${i + 1}. ${a.title}`));

  const { ticker, banner } = await summarizeWithClaude(articles);
  console.log('\nTicker:', ticker);
  console.log('Banner:', banner);

  let html = fs.readFileSync(HTML_PATH, 'utf8');
  html = updateHTML(html, ticker, banner);
  fs.writeFileSync(HTML_PATH, html, 'utf8');

  console.log('\nindex.html updated successfully.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
