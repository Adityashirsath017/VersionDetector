const axios = require('axios');

async function fetchRawFile(owner, repo, branch, filepath, token) {
  try {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filepath}`;
    const headers = token ? { Authorization: `token ${token}` } : {};
    const response = await axios.get(url, { headers, timeout: 4000 });
    return response.data;
  } catch (err) {
    return null;
  }
}

// Normalise a raw version string for display.
// Returns null for placeholder protocols that are not real versions, so
// callers can fall through to the next candidate instead of showing
// nonsense like "TypeScript catalog:" or "Angular workspace:*".
function cleanVersion(raw) {
  if (raw === undefined || raw === null) return null;
  const value = String(raw).trim();
  if (!value) return null;
  if (value.includes('catalog:') || value.includes('workspace:')) return null;
  return value.replace(/^[~^]/, '');
}

async function detectVersion(owner, repo, defaultBranch, lang, token) {
  const lowerLang = (lang || '').toLowerCase();

  try {
    // 1. JavaScript / Node.js / TypeScript / React / Vue / Angular
    if (['javascript', 'node.js', 'nodejs', 'node', 'typescript', 'react', 'vue', 'angular', 'js', 'ts'].includes(lowerLang) || !lang) {
      const pkgData = await fetchRawFile(owner, repo, defaultBranch, 'package.json', token);
      if (pkgData) {
        let pkg = typeof pkgData === 'object' ? pkgData : JSON.parse(pkgData);
        const candidates = [
          pkg.dependencies?.react ? ['React', pkg.dependencies.react] : null,
          pkg.dependencies?.vue ? ['Vue', pkg.dependencies.vue] : null,
          pkg.dependencies?.['@angular/core'] ? ['Angular', pkg.dependencies['@angular/core']] : null,
          (pkg.devDependencies?.typescript || pkg.dependencies?.typescript)
            ? ['TypeScript', pkg.devDependencies?.typescript || pkg.dependencies?.typescript]
            : null,
          pkg.engines?.node ? ['Node.js', pkg.engines.node] : null,
        ];
        for (const candidate of candidates) {
          if (!candidate) continue;
          const version = cleanVersion(candidate[1]);
          if (version) return `${candidate[0]} ${version}`;
        }
      }

      const nvmrc = await fetchRawFile(owner, repo, defaultBranch, '.nvmrc', token);
      if (nvmrc) {
        const version = cleanVersion(nvmrc.toString().trim());
        if (version) return `Node.js ${version}`;
      }
    }

    // 2. Python
    if (lowerLang === 'python' || !lang) {
      const pyproject = await fetchRawFile(owner, repo, defaultBranch, 'pyproject.toml', token);
      if (pyproject) {
        const match = pyproject.match(/requires-python\s*=\s*["']([^"']+)["']/i) || pyproject.match(/python_requires\s*=\s*["']([^"']+)["']/i);
        if (match) return `Python ${match[1]}`;
      }
      const runtime = await fetchRawFile(owner, repo, defaultBranch, 'runtime.txt', token);
      if (runtime && runtime.toLowerCase().includes('python')) return runtime.trim();
    }

    // 3. Java
    if (lowerLang === 'java' || !lang) {
      const pom = await fetchRawFile(owner, repo, defaultBranch, 'pom.xml', token);
      if (pom) {
        const match = pom.match(/<java\.version>(.*?)<\/java\.version>/i) || pom.match(/<maven\.compiler\.release>(.*?)<\/maven\.compiler\.release>/i) || pom.match(/<maven\.compiler\.source>(.*?)<\/maven\.compiler\.source>/i);
        if (match) return `Java ${match[1].trim()}`;
      }
      const javaVersionFile = await fetchRawFile(owner, repo, defaultBranch, '.java-version', token);
      if (javaVersionFile) return `Java ${javaVersionFile.toString().trim()}`;
      for (const gradleFile of ['build.gradle', 'build.gradle.kts']) {
        const gradle = await fetchRawFile(owner, repo, defaultBranch, gradleFile, token);
        if (gradle) {
          const match = gradle.match(/sourceCompatibility\s*=\s*['"]?([0-9\.]+)['"]?/i) || gradle.match(/targetCompatibility\s*=\s*['"]?([0-9\.]+)['"]?/i) || gradle.match(/languageVersion\s*=\s*JavaLanguageVersion\.of\((\d+)\)/i);
          if (match) return `Java ${match[1].trim()}`;
        }
      }
    }

    // 4. Go
    if (lowerLang === 'go' || !lang) {
      const goMod = await fetchRawFile(owner, repo, defaultBranch, 'go.mod', token);
      if (goMod) {
        const match = goMod.match(/^go\s+([0-9\.]+)/m);
        if (match) return `Go ${match[1]}`;
      }
      const goVersionFile = await fetchRawFile(owner, repo, defaultBranch, '.go-version', token);
      if (goVersionFile) return `Go ${goVersionFile.toString().trim()}`;
    }

    // 5. PHP
    if (lowerLang === 'php' || !lang) {
      const composer = await fetchRawFile(owner, repo, defaultBranch, 'composer.json', token);
      if (composer) {
        let comp = typeof composer === 'object' ? composer : JSON.parse(composer);
        if (comp.require && comp.require.php) {
          const version = cleanVersion(comp.require.php);
          if (version) return `PHP ${version}`;
        }
      }
    }

    // 6. Ruby
    if (lowerLang === 'ruby' || !lang) {
      const gemfile = await fetchRawFile(owner, repo, defaultBranch, 'Gemfile', token);
      if (gemfile) {
        const match = gemfile.match(/ruby\s+['"]([^'"]+)['"]/i);
        if (match) return `Ruby ${match[1]}`;
      }
      const gemfileLock = await fetchRawFile(owner, repo, defaultBranch, 'Gemfile.lock', token);
      if (gemfileLock) {
        const match = gemfileLock.match(/RUBY VERSION\s*\n\s*ruby\s+([0-9\.]+)/i);
        if (match) return `Ruby ${match[1]}`;
      }
      const rubyVer = await fetchRawFile(owner, repo, defaultBranch, '.ruby-version', token);
      if (rubyVer) return `Ruby ${rubyVer.toString().trim()}`;
    }

    // 7. C#
    if (['c#', 'csharp'].includes(lowerLang) || !lang) {
      const csproj = await fetchRawFile(owner, repo, defaultBranch, `${repo}.csproj`, token);
      if (csproj) {
        const match = csproj.match(/<TargetFramework>(.*?)<\/TargetFramework>/i);
        if (match) return `.NET ${match[1].trim()}`;
      }
    }

    if (['html/css', 'html', 'css'].includes(lowerLang)) {
      return "HTML5 / CSS3";
    }
  } catch (err) {
    // Fail silently to keep processing fast
  }

  return "Not specified";
}

module.exports = { detectVersion, cleanVersion };
