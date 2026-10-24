const axios = require('axios');
const { cleanVersion } = require('./versionDetector');

async function fetchRawFile(owner, repo, branch, filepath, token) {
  try {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filepath}`;
    const headers = token ? { Authorization: `token ${token}` } : {};
    const res = await axios.get(url, { headers, timeout: 4000 });
    return res.data;
  } catch (err) {
    return null;
  }
}

// Parse a direct repository reference, or return null for a keyword search.
// Accepts "owner/repo" and "https://github.com/owner/repo" (with optional
// ".git", trailing slash, or an extra path such as "/tree/main").
function parseRepoTarget(target) {
  if (!target || typeof target !== 'string') return null;
  const trimmed = target.trim();
  const urlMatch = trimmed.match(/^https?:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?(?:\/.*)?$/i);
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2] };
  const shortMatch = trimmed.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  if (shortMatch) return { owner: shortMatch[1], repo: shortMatch[2] };
  return null;
}

async function fetchRepoData(owner, repo, token) {
  const headers = { 'User-Agent': 'Language-Version-Detector' };
  if (token && token !== 'your_github_personal_access_token_here') {
    headers['Authorization'] = `token ${token}`;
  }
  const res = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, { headers, timeout: 10000 });
  return res.data;
}

function pushStack(detectedStack, name, category, rawVersion, source, snippet, type) {
  const version = cleanVersion(rawVersion);
  if (!version) return;
  detectedStack.push({ name, category, version, source, snippet, type });
}

async function analyzeSingleRepo(repoData, token) {
  const owner = repoData.owner.login;
  const repo = repoData.name;
  const headers = { 'User-Agent': 'Language-Version-Detector' };
  if (token && token !== 'your_github_personal_access_token_here') {
    headers['Authorization'] = `token ${token}`;
  }

  let languagesBreakdown = [];
  try {
    const langRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers, timeout: 4000 });
    const langBytes = langRes.data;
    const totalBytes = Object.values(langBytes).reduce((a, b) => a + b, 0) || 1;
    languagesBreakdown = Object.entries(langBytes).map(([name, bytes]) => ({
      name,
      percentage: parseFloat(((bytes / totalBytes) * 100).toFixed(1))
    }));
  } catch (e) {}

  const branch = repoData.default_branch || 'main';
  const detectedStack = [];

  // package.json parsing — versions really come from package.json, so
  // label them as such (previously ESLint was mislabelled .eslintrc.json).
  const pkgData = await fetchRawFile(owner, repo, branch, 'package.json', token);
  if (pkgData) {
    try {
      const pkg = typeof pkgData === 'object' ? pkgData : JSON.parse(pkgData);
      const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      pushStack(detectedStack, 'React', 'Frontend', allDeps.react, 'package.json', `"react": "${allDeps.react}"`, 'react');
      pushStack(detectedStack, 'Vue', 'Frontend', allDeps.vue, 'package.json', `"vue": "${allDeps.vue}"`, 'vue');
      pushStack(detectedStack, 'TypeScript', 'Language', allDeps.typescript, 'package.json', `"typescript": "${allDeps.typescript}"`, 'typescript');
      pushStack(detectedStack, 'ESLint', 'Linter', allDeps.eslint, 'package.json', `"eslint": "${allDeps.eslint}"`, 'eslint');
      if (pkg.engines?.node) {
        detectedStack.push({ name: 'Node.js', category: 'Runtime', version: pkg.engines.node, source: 'package.json', snippet: `"engines": { "node": "${pkg.engines.node}" }`, type: 'nodejs' });
      }
    } catch (e) {}
  }

  // Dockerfile parsing
  const dockerfile = await fetchRawFile(owner, repo, branch, 'Dockerfile', token);
  if (dockerfile) {
    const fromMatch = dockerfile.match(/FROM\s+([a-zA-Z0-9\_\-\.\/:]+)/i);
    const dockerVer = fromMatch ? fromMatch[1].split(':')[1] || 'latest' : 'configured';
    detectedStack.push({ name: 'Docker', category: 'DevOps', version: dockerVer, source: 'Dockerfile', snippet: fromMatch ? fromMatch[0] : 'FROM node:alpine', type: 'docker' });
  }

  // Python pyproject.toml
  const pyproject = await fetchRawFile(owner, repo, branch, 'pyproject.toml', token);
  if (pyproject) {
    const match = pyproject.match(/requires-python\s*=\s*["']([^"']+)["']/i);
    if (match) detectedStack.push({ name: 'Python', category: 'Language', version: match[1], source: 'pyproject.toml', snippet: `requires-python = "${match[1]}"`, type: 'python' });
  }

  return {
    id: repoData.id,
    info: {
      name: repoData.full_name,
      description: repoData.description,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      url: repoData.html_url,
      // Real last-update date from GitHub, not a hardcoded "2 days ago".
      // GitHub provides no "verified" flag for a repo, so do not claim one.
      updated: repoData.updated_at ? new Date(repoData.updated_at).toISOString().slice(0, 10) : 'Unknown',
      verified: false
    },
    languagesBreakdown,
    detectedStack
  };
}

async function analyzeMultipleProjects(targetQuery, count = 20, token) {
  const headers = { 'User-Agent': 'Language-Version-Detector' };
  if (token && token !== 'your_github_personal_access_token_here') {
    headers['Authorization'] = `token ${token}`;
  }
  let searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(targetQuery)}&sort=stars&order=desc&per_page=${count}`;
  let searchRes = await axios.get(searchUrl, { headers });
  let items = searchRes.data.items || [];
  const reports = await Promise.all(
    items.map((repoData) => analyzeSingleRepo(repoData, token))
  );
  return {
    query: targetQuery,
    totalFound: reports.length,
    projects: reports
  };
}

async function analyzeDirectRepo(owner, repo, token) {
  const repoData = await fetchRepoData(owner, repo, token);
  const project = await analyzeSingleRepo(repoData, token);
  return {
    query: repoData.full_name,
    totalFound: 1,
    projects: [project]
  };
}

module.exports = { analyzeMultipleProjects, analyzeSingleRepo, analyzeDirectRepo, parseRepoTarget, fetchRepoData };
