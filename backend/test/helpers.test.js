const test = require('node:test');
const assert = require('node:assert/strict');
const { cleanVersion } = require('../versionDetector');
const { parseRepoTarget } = require('../repoAnalyzer');
const { formatGitHubQuery } = require('../server');

test('cleanVersion strips range prefixes but keeps ranges', () => {
  assert.equal(cleanVersion('^5.4.3'), '5.4.3');
  assert.equal(cleanVersion('~1.2.0'), '1.2.0');
  assert.equal(cleanVersion('>=18.0.0'), '>=18.0.0');
  assert.equal(cleanVersion('  20-alpine  '), '20-alpine');
});

test('cleanVersion rejects placeholder protocols', () => {
  assert.equal(cleanVersion('catalog:dev'), null);
  assert.equal(cleanVersion('workspace:*'), null);
  assert.equal(cleanVersion(''), null);
  assert.equal(cleanVersion(null), null);
});

test('parseRepoTarget accepts owner/repo and GitHub URLs', () => {
  assert.deepEqual(parseRepoTarget('facebook/react'), { owner: 'facebook', repo: 'react' });
  assert.deepEqual(parseRepoTarget('https://github.com/facebook/react'), { owner: 'facebook', repo: 'react' });
  assert.deepEqual(parseRepoTarget('https://github.com/facebook/react.git'), { owner: 'facebook', repo: 'react' });
  assert.deepEqual(parseRepoTarget('https://github.com/facebook/react/tree/main/'), { owner: 'facebook', repo: 'react' });
});

test('parseRepoTarget returns null for keyword searches', () => {
  assert.equal(parseRepoTarget('react'), null);
  assert.equal(parseRepoTarget('grocery store'), null);
  assert.equal(parseRepoTarget('https://example.com/facebook/react'), null);
  assert.equal(parseRepoTarget(''), null);
});

test('formatGitHubQuery maps UI labels to valid GitHub queries', () => {
  assert.equal(formatGitHubQuery('node.js'), 'topic:nodejs');
  assert.equal(formatGitHubQuery('C#'), 'language:csharp');
  assert.equal(formatGitHubQuery('HTML/CSS'), 'language:html');
  assert.equal(formatGitHubQuery('react'), 'topic:react');
  assert.equal(formatGitHubQuery('python'), 'language:python');
  assert.equal(formatGitHubQuery('machine learning'), 'language:machine learning');
});
