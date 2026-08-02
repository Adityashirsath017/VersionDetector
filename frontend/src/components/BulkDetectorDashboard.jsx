import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Layers, Clock, Play, CheckCircle2, Flame,
  Github, ChevronLeft, ChevronRight, Loader2, Code2, Server, ExternalLink
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import TechIcon from './TechIcon';

ChartJS.register(ArcElement, Tooltip, Legend);

// Preset Language Arrays
const frontendLangs = ['JavaScript', 'TypeScript', 'HTML/CSS', 'React', 'Vue', 'Angular'];
const backendLangs = ['Python', 'Java', 'Node.js', 'Go', 'PHP', 'Ruby', 'C#'];

export default function BulkDetectorDashboard({ darkMode }) {
  const [selectedLang, setSelectedLang] = useState('React');
  const [repoLimit, setRepoLimit] = useState(200);
  const [isScanning, setIsScanning] = useState(false);
  const [repos, setRepos] = useState([]);
  const [error, setError] = useState('');
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Real GitHub API Fetch Function
  const fetchBulkData = async (lang, limit) => {
    setIsScanning(true);
    setError('');

    try {
      const response = await axios.get(
        `http://localhost:5000/api/language-versions?lang=${encodeURIComponent(lang)}&limit=${limit}`
      );
      setRepos(response.data.data || []);
      setCurrentPage(1);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch repositories. Make sure backend is running.');
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    fetchBulkData(selectedLang, repoLimit);
  }, []);

  const handleLanguageClick = (lang) => {
    setSelectedLang(lang);
    fetchBulkData(lang, repoLimit);
  };

  const handleStartScan = () => {
    fetchBulkData(selectedLang, repoLimit);
  };

  // 1. Calculate Dynamic Version Distribution for Donut Chart
  const versionCounts = repos.reduce((acc, repo) => {
    const ver = repo.detectedVersion || 'Not specified';
    acc[ver] = (acc[ver] || 0) + 1;
    return acc;
  }, {});

  // 2. DYNAMICALLY CALCULATE TOP 3 MOST USED VERSIONS FOR PANEL 2
  const sortedTopVersions = Object.entries(versionCounts)
    .map(([version, count]) => ({
      version,
      count,
      percentage: ((count / (repos.length || 1)) * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3); // Top 3 versions

  const donutLabels = Object.keys(versionCounts).slice(0, 5);
  const donutValues = Object.values(versionCounts).slice(0, 5);

  const doughnutData = {
    labels: donutLabels.length > 0 ? donutLabels : ['No Data'],
    datasets: [{
      data: donutValues.length > 0 ? donutValues : [1],
      backgroundColor: ['#38bdf8', '#34d399', '#f59e0b', '#a855f7', '#ec4899', '#64748b'],
      borderWidth: 0,
    }],
  };

  const doughnutOptions = {
    cutout: '72%',
    plugins: { legend: { display: false } },
  };

  // Filter and Pagination
  const filteredRepos = repos.filter(r => 
    r.name.toLowerCase().includes(filterText.toLowerCase()) ||
    (r.detectedVersion && r.detectedVersion.toLowerCase().includes(filterText.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(filteredRepos.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRepos = filteredRepos.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className={`space-y-6 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
      
      {/* 1. Header Banner & Stats Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
            <Layers className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Bulk 200-500 Repos Detector</h2>
            <p className="text-xs text-slate-400 mt-0.5">Scan & Analyze GitHub Repositories for Exact Language & Framework Versions</p>
          </div>
        </div>

        {/* Top Right Stat Cards */}
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl border flex items-center gap-3 ${darkMode ? 'bg-[#0b1120] border-[#182338]' : 'bg-white border-slate-200 shadow-sm'}`}>
            <Github className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Selected Stack</p>
              <p className="text-sm font-extrabold text-cyan-400">{selectedLang}</p>
            </div>
          </div>

          <div className={`p-3 rounded-xl border flex items-center gap-3 ${darkMode ? 'bg-[#0b1120] border-[#182338]' : 'bg-white border-slate-200 shadow-sm'}`}>
            <Layers className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Scanned Repos</p>
              <p className="text-sm font-extrabold text-emerald-400">{repos.length} / {repoLimit}</p>
            </div>
          </div>

          <div className={`p-3 rounded-xl border flex items-center gap-3 ${darkMode ? 'bg-[#0b1120] border-[#182338]' : 'bg-white border-slate-200 shadow-sm'}`}>
            <Clock className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Status</p>
              <p className="text-sm font-extrabold text-slate-200 font-mono">{isScanning ? 'Scanning...' : 'Ready'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Controls Bar */}
      <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0b1120] border-[#182338]' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
          
          {/* Repo Limit Dropdown (50, 100, 200, 300) */}
          <div className="lg:col-span-3">
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">Repo Limit</label>
            <select
              value={repoLimit}
              onChange={(e) => setRepoLimit(Number(e.target.value))}
              className={`w-full text-xs px-3 py-2.5 rounded-xl border focus:outline-none focus:border-cyan-500 font-medium ${
                darkMode ? 'bg-[#060a12] border-[#182338] text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            >
              <option value={50}>50 Repositories</option>
              <option value={100}>100 Repositories</option>
              <option value={200}>200 Repositories (Recommended)</option>
              <option value={300}>300 Repositories</option>
            </select>
          </div>

          {/* Categorized Quick Preset Languages */}
          <div className="lg:col-span-7 space-y-2">
            <label className="text-xs font-semibold text-slate-400 block">Quick Preset Languages</label>
            
            {/* Frontend Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1 min-w-[75px]">
                <Code2 className="w-3.5 h-3.5" /> Frontend:
              </span>
              {frontendLangs.map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageClick(lang)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    selectedLang === lang
                      ? 'bg-cyan-500 text-black border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                      : darkMode
                      ? 'bg-[#060a12] hover:bg-slate-800 border-[#182338] text-slate-300'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Backend Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 min-w-[75px]">
                <Server className="w-3.5 h-3.5" /> Backend:
              </span>
              {backendLangs.map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageClick(lang)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    selectedLang === lang
                      ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-md shadow-emerald-500/20'
                      : darkMode
                      ? 'bg-[#060a12] hover:bg-slate-800 border-[#182338] text-slate-300'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="lg:col-span-2">
            <button
              onClick={handleStartScan}
              disabled={isScanning}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs py-3 px-4 rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-black" />}
              <span>{isScanning ? 'Detecting...' : 'Start Scan'}</span>
            </button>
          </div>

        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs flex items-center gap-2">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* 3. Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Panel 1: Version Distribution Donut Chart */}
        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#0b1120] border-[#182338]' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> Version Breakdown ({selectedLang})
            </h4>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-28 h-28 flex-shrink-0">
              <Doughnut data={doughnutData} options={doughnutOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-extrabold text-white">{repos.length}</span>
                <span className="text-[8px] text-slate-400 leading-tight">Repos<br/>Analyzed</span>
              </div>
            </div>

            <div className="space-y-1 text-[11px] w-full">
              {donutLabels.length > 0 ? (
                donutLabels.map((lbl, i) => (
                  <div key={lbl} className="flex justify-between items-center">
                    <span className="truncate max-w-[110px] text-slate-300">● {lbl}</span>
                    <span className="font-mono text-cyan-400 font-bold">{donutValues[i]} repos</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No versions detected yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Panel 2: TOP 3 MOST USED VERSIONS (UPDATED CARD) */}
        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#0b1120] border-[#182338]' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> Top 3 Most Used Versions
            </h4>
            <span className="text-[10px] bg-cyan-500/10 text-cyan-400 font-bold px-2 py-0.5 rounded-full font-mono border border-cyan-500/20">
              {selectedLang}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {isScanning ? (
              <div className="py-4 text-center text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1 text-cyan-400" />
                <span>Calculating top versions...</span>
              </div>
            ) : sortedTopVersions.length === 0 ? (
              <p className="text-slate-500 text-xs py-2 text-center">No version data available.</p>
            ) : (
              sortedTopVersions.map((item, idx) => {
                const rankBadges = [
                  'bg-amber-500/20 text-amber-400 border-amber-500/30',
                  'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
                  'bg-purple-500/20 text-purple-400 border-purple-500/30'
                ];
                const badgeColor = rankBadges[idx] || 'bg-slate-800 text-slate-300';

                return (
                  <div key={item.version} className={`p-2 rounded-xl border flex items-center justify-between ${
                    darkMode ? 'bg-[#060a12]/60 border-[#182338]' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-md font-bold text-[10px] flex items-center justify-center border ${badgeColor}`}>
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-slate-100 text-xs truncate max-w-[110px]">{item.version}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-emerald-400 text-xs font-mono">{item.count} repos</span>
                      <span className="text-[10px] text-slate-400 block font-mono">({item.percentage}%)</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Panel 3: Detection Sources */}
        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#0b1120] border-[#182338]' : 'bg-white border-slate-200'}`}>
          <h4 className="text-xs font-bold text-slate-200 mb-3">Detection Sources</h4>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span>JS/TS/Frameworks: <strong className="text-slate-200">package.json</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Python: <strong className="text-slate-200">pyproject.toml / runtime.txt</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Java: <strong className="text-slate-200">pom.xml / build.gradle</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
              <span>Go & PHP: <strong className="text-slate-200">go.mod / composer.json</strong></span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Repository Results Table */}
      <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0b1120] border-[#182338]' : 'bg-white border-slate-200 shadow-sm'}`}>
        
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" /> Repository Results for <span className="text-cyan-400 font-extrabold">{selectedLang}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Showing {paginatedRepos.length} of {filteredRepos.length} analyzed repositories</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter by repo name or version..."
              className={`text-xs px-3 py-1.5 rounded-lg border focus:outline-none focus:border-cyan-500 ${
                darkMode ? 'bg-[#060a12] border-[#182338] text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            />

            <div className="flex items-center gap-1 text-xs text-slate-400">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono">{currentPage} / {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Table Body */}
        {isScanning ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Scanning GitHub repositories for {selectedLang} versions...</p>
          </div>
        ) : paginatedRepos.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No repositories found for this filter. Try selecting another language.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b text-slate-400 font-semibold uppercase text-[10px] tracking-wider ${
                  darkMode ? 'bg-[#060a12]/60 border-[#182338]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <th className="p-3">#</th>
                  <th className="p-3">Repository Name</th>
                  <th className="p-3">Stars</th>
                  <th className="p-3">Detected Version</th>
                  <th className="p-3">Stack</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-[#182338]/60' : 'divide-slate-100'}`}>
                {paginatedRepos.map((repo, idx) => (
                  <tr key={repo.id || idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 text-slate-500 font-mono text-[11px]">{startIndex + idx + 1}</td>
                    <td className="p-3 font-bold text-slate-100">
                      <div className="flex items-center gap-2">
                        <Github className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <div>
                          <a href={repo.url} target="_blank" rel="noreferrer" className="hover:text-cyan-400 font-semibold text-slate-200">
                            {repo.name}
                          </a>
                          {repo.description && (
                            <p className="text-[10px] text-slate-400 font-normal truncate max-w-sm mt-0.5">
                              {repo.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-amber-400 font-semibold whitespace-nowrap">
                      ⭐ {repo.stars?.toLocaleString()}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border ${
                        repo.detectedVersion && repo.detectedVersion !== 'Not specified'
                          ? 'bg-purple-900/40 text-purple-300 border-purple-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {repo.detectedVersion || 'Not specified'}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md font-semibold">
                        <TechIcon type={selectedLang} /> {selectedLang}
                      </span>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-semibold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500 hover:text-black border border-cyan-500/20 rounded-lg transition-all"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}