const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

const { detectVersion } = require('./versionDetector');
const { analyzeMultipleProjects } = require('./repoAnalyzer');

const app = express();
const PORT = process.env.PORT || 5000;

const cache = new NodeCache({ stdTTL: 900 });

app.use(cors());
app.use(express.json());

// Helper function to map UI language strings to valid GitHub Search API queries
function formatGitHubQuery(langOrQuery) {
  if (!langOrQuery) return 'topic:javascript';
  const clean = langOrQuery.trim().toLowerCase();

  switch (clean) {
    case 'node.js':
    case 'nodejs':
    case 'node':
      return 'topic:nodejs'; // Search Node.js topics instead of invalid language:Node.js

    case 'html/css':
    case 'html':
    case 'css':
      return 'language:html'; // Use valid language:html syntax

    case 'c#':
    case 'csharp':
      return 'language:csharp'; // GitHub expects csharp instead of c#

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

async function processInBatches(items, batchSize, fn) {
  let results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

// ENDPOINT 1: Multi-Project Deep Stack Report (15-20 Repos)
app.get('/api/analyze-single-repo', async (req, res) => {
  const { target, count = 20 } = req.query;

  if (!target) {
    return res.status(400).json({ error: 'Search target query or repo URL is required' });
  }

  const cacheKey = `deep_analyze_${target.toLowerCase()}_count_${count}`;
  if (cache.has(cacheKey)) {
    return res.json(cache.get(cacheKey));
  }

  try {
    const githubToken = process.env.GITHUB_TOKEN;
    const reportData = await analyzeMultipleProjects(target, parseInt(count) || 20, githubToken);

    cache.set(cacheKey, reportData);
    res.json(reportData);
  } catch (err) {
    console.error('Error analyzing projects:', err.response?.data || err.message);
    res.status(500).json({ error: err.message || 'Failed to analyze projects.' });
  }
});

// ENDPOINT 2: Bulk Repositories Search & Version Detector (50-300 Repos)
app.get('/api/language-versions', async (req, res) => {
  const { lang, query, limit = 200 } = req.query;
  const targetLimit = Math.min(Math.max(parseInt(limit) || 200, 10), 500);
  const searchQuery = query || lang;

  if (!searchQuery) {
    return res.status(400).json({ error: 'Language or Search Query is required' });
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

    // Convert UI search query to valid GitHub API query syntax
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
    
    if (error.response?.status === 403) {
      return res.status(429).json({ error: 'GitHub API Rate Limit Exceeded. Please check your GITHUB_TOKEN in backend/.env' });
    }

    res.status(500).json({ error: 'Failed to fetch repositories from GitHub.' });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));