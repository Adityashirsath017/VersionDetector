const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

const { detectVersion } = require('./versionDetector');
const { analyzeMultipleProjects, analyzeDirectRepo, parseRepoTarget } = require('./repoAnalyzer');

const app = express();
const PORT = process.env.PORT || 5000;

const cache = new NodeCache({ stdTTL: 900 });

app.disable('x-powered-by');

// CORS: allow only configured origins. Set ALLOWED_ORIGINS to a comma-separated
// list, or "*" only if you deliberately want any website to call this API.
// Default is local development origins only.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
}));
app.use(express.json());

// Simple in-memory rate limiter for /api/* (no new dependency).
// 120 requests per IP per 60 seconds is generous for UI use and stops a
// single client from burning the shared GitHub API quota unchecked.
const rateLimitWindowMs = 60 * 1000;
const rateLimitMax = Number(process.env.API_RATE_LIMIT_PER_MINUTE) || 120;
const rateLimitHits = new Map();
app.use('/api/', (req, res, next) => {
  const now = Date.now();
  const key = req.ip || 'unknown';
  const hits = (rateLimitHits.get(key) || []).filter((t) => now - t < rateLimitWindowMs);
  hits.push(now);
  rateLimitHits.set(key, hits);
  if (hits.length > rateLimitMax) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute and try again.' });
  }
  next();
});

// Helper function to map UI language strings to valid GitHub Search API queries
function formatGitHubQuery(langOrQuery) {
  if (!langOrQuery) return 'topic:javascript';
  const clean = langOrQuery.trim().toLowerCase();

  switch (clean) {
    case 'node.js':
    case 'nodejs':
    case 'node':
      return 'topic:nodejs';
    case 'html/css':
    case 'html':
    case 'css':
      return 'language:html';
    case 'c#':
    case 'csharp':
      return 'language:csharp';
    case 'react':
      return 'topic:react';
    case 'vue':
      return 'topic:vue';
    case 'angular':
      return 'topic:angular';
    case 'javascript':
    case 'js':
      return 'language:javascript';
    case 'typescript':
    case 'ts':
      return 'language:typescript';
    case 'python':
      return 'language:python';
    case 'java':
      return 'language:java';
    case 'go':
      return 'language:go';
    case 'php':
      return 'language:php';
    case 'ruby':
      return 'language:ruby';
    default:
      if (clean.includes('/')) return clean.split('/')[0];
      return `language:${clean}`;
  }
}

function githubErrorStatus(err) {
  const status = err.response?.status;
  if (status === 422) return { status: 400, message: 'Invalid search query for GitHub. Try a topic, language, or owner/repo instead.' };
  if (status === 403 || status === 429) return { status: 429, message: 'GitHub API Rate Limit Exceeded. Please check your GITHUB_TOKEN in backend/.env' };
  if (status === 404) return { status: 404, message: 'Repository not found on GitHub.' };
  return { status: 500, message: 'Failed to fetch repositories from GitHub.' };
}

async function processInBatches(items, batchSize, fn) {
  let results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

// ENDPOINT 1: Deep Stack Report (keyword search, or one direct repo)
// - Keyword: /api/analyze-single-repo?target=react&count=20
// - Direct repo: /api/analyze-single-repo?target=facebook/react
//   or ?target=https://github.com/facebook/react (count is ignored then)
app.get('/api/analyze-single-repo', async (req, res) => {
  const { target, count } = req.query;

  if (!target) {
    return res.status(400).json({ error: 'Search target query or repo URL is required' });
  }

  let parsedCount = 20;
  if (count !== undefined) {
    parsedCount = Number(count);
    if (!Number.isInteger(parsedCount) || parsedCount < 1 || parsedCount > 100) {
      return res.status(400).json({ error: 'count must be an integer between 1 and 100' });
    }
  }

  const direct = parseRepoTarget(target);
  const cacheKey = direct
    ? `deep_direct_${direct.owner.toLowerCase()}/${direct.repo.toLowerCase()}`
    : `deep_analyze_${target.toLowerCase()}_count_${parsedCount}`;
  if (cache.has(cacheKey)) {
    return res.json(cache.get(cacheKey));
  }

  try {
    const githubToken = process.env.GITHUB_TOKEN;
    const reportData = direct
      ? await analyzeDirectRepo(direct.owner, direct.repo, githubToken)
      : await analyzeMultipleProjects(target, parsedCount, githubToken);
    cache.set(cacheKey, reportData);
    res.json(reportData);
  } catch (err) {
    console.error('Error analyzing projects:', err.response?.data || err.message);
    const mapped = githubErrorStatus(err);
    res.status(mapped.status).json({ error: mapped.message });
  }
});

// ENDPOINT 2: Bulk Repositories Search & Version Detector (50-300 Repos)
app.get('/api/language-versions', async (req, res) => {
  const { lang, query, limit } = req.query;
  const searchQuery = query || lang;

  if (!searchQuery) {
    return res.status(400).json({ error: 'Language or Search Query is required' });
  }

  let targetLimit = 200;
  if (limit !== undefined) {
    targetLimit = Number(limit);
    if (!Number.isInteger(targetLimit)) {
      return res.status(400).json({ error: 'limit must be an integer' });
    }
    targetLimit = Math.min(Math.max(targetLimit, 10), 500);
  }

  const cacheKey = `${searchQuery.toLowerCase()}_limit_${targetLimit}`;
  if (cache.has(cacheKey)) {
    return res.json({ cached: true, total: cache.get(cacheKey).length, data: cache.get(cacheKey) });
  }

  try {
    const githubToken = process.env.GITHUB_TOKEN;
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Language-Version-Detector-App'
    };
    if (githubToken && githubToken !== 'your_github_personal_access_token_here') {
      headers['Authorization'] = `token ${githubToken}`;
    }

    const finalQuery = formatGitHubQuery(searchQuery);
    const pagesToFetch = Math.ceil(targetLimit / 100);
    let allRepos = [];

    for (let page = 1; page <= pagesToFetch; page++) {
      const perPage = Math.min(100, targetLimit - allRepos.length);
      if (perPage <= 0) break;
      const githubSearchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(finalQuery)}&sort=stars&order=desc&per_page=${perPage}&page=${page}`;
      const searchResponse = await axios.get(githubSearchUrl, { headers });
      if (searchResponse.data.items && searchResponse.data.items.length > 0) {
        allRepos.push(...searchResponse.data.items);
      } else break;
    }

    if (allRepos.length === 0) {
      return res.status(404).json({ error: 'No repositories found for this technology.' });
    }

    const results = await processInBatches(allRepos, 25, async (repo) => {
      const detectedVersion = await detectVersion(
        repo.owner.login, repo.name, repo.default_branch || 'main', lang || searchQuery, githubToken
      );
      return {
        id: repo.id,
        name: repo.full_name,
        url: repo.html_url,
        stars: repo.stargazers_count,
        description: repo.description,
        detectedVersion
      };
    });

    cache.set(cacheKey, results);
    res.json({ cached: false, total: results.length, data: results });
  } catch (error) {
    console.error('GitHub API Search Error:', error.response?.data || error.message);
    const mapped = githubErrorStatus(error);
    res.status(mapped.status).json({ error: mapped.message });
  }
});

// JSON 404 for unknown API routes (previously Express HTML error pages).
app.use('/api/', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// JSON error responses, including CORS rejections (previously Express HTML).
app.use((err, req, res, next) => {
  if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed by CORS' });
  }
  next(err);
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

module.exports = { app, formatGitHubQuery };
