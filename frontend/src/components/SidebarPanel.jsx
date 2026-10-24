import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Layers, Search, ExternalLink, RefreshCw } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { apiUrl } from '../api';

ChartJS.register(ArcElement, Tooltip, Legend);

// Languages rotated every 60 seconds. The numbers shown for each language
// come from the live backend (/api/language-versions), never from a
// hardcoded dataset — a previous version showed fixed counts as if live.
const rotatingLanguages = ['Python', 'Node.js', 'Java', 'Go', 'TypeScript', 'PHP'];
const chartColors = ['#3b82f6', '#22c55e', '#eab308', '#64748b', '#a855f7', '#f97316'];

function formatStars(stars) {
  return `${((stars || 0) / 1000).toFixed(1)}k`;
}

export default function SidebarPanel({ activeTab, onSearch, onSelectLang, darkMode }) {
  const [langIndex, setLangIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [distribution, setDistribution] = useState(null);
  const [latestRepos, setLatestRepos] = useState([]);
  const [sidebarError, setSidebarError] = useState('');
  const [sidebarLoading, setSidebarLoading] = useState(false);

  const language = rotatingLanguages[langIndex];

  const fetchDistribution = useCallback(async (lang) => {
    setSidebarLoading(true);
    setSidebarError('');
    try {
      const res = await axios.get(apiUrl(`/api/language-versions?lang=${encodeURIComponent(lang)}&limit=50`));
      const repos = res.data?.data || [];
      const counts = {};
      repos.forEach((repo) => {
        const version = repo.detectedVersion || 'Not specified';
        counts[version] = (counts[version] || 0) + 1;
      });
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
      const total = repos.length || 1;
      setDistribution({
        language: lang,
        totalAnalyzed: repos.length,
        labels: sorted.map(([version]) => version),
        counts: sorted.map(([, count]) => count),
        percentages: sorted.map(([, count]) => `${((count / total) * 100).toFixed(1)}%`),
        colors: chartColors,
      });
      setLatestRepos(repos.slice(0, 3));
    } catch (e) {
      setDistribution(null);
      setLatestRepos([]);
      setSidebarError(e.response?.data?.error || 'Could not load live version data. Make sure the backend is running.');
    } finally {
      setSidebarLoading(false);
    }
  }, []);

  // 1-Minute Auto-Rotation & Timer Interval
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setLangIndex((current) => (current + 1) % rotatingLanguages.length);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch live data whenever the rotated language changes.
  useEffect(() => {
    fetchDistribution(language);
  }, [language, fetchDistribution]);

  const doughnutData = {
    labels: distribution?.labels?.length ? distribution.labels : ['No Data'],
    datasets: [
      {
        data: distribution?.counts?.length ? distribution.counts : [1],
        backgroundColor: chartColors,
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    cutout: '72%',
    plugins: { legend: { display: false } },
  };

  return (
    <div className="space-y-4">
      {/* 1. Bulk Scan Controls (ONLY visible when Bulk Tab is active) */}
      {activeTab === 'bulk' && (
        <div className={`border rounded-xl p-4 shadow-xl ${darkMode ? 'bg-[#0e1626] border-[#1e2d4a]' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-3 text-purple-400 font-semibold text-sm">
            <Layers className="w-4 h-4" />
            <span>Bulk Scan Controls</span>
          </div>

          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Search any topic or keyword..."
              className={`w-full text-xs pl-3 pr-8 py-2 rounded-lg border focus:outline-none focus:border-cyan-500 ${
                darkMode ? 'bg-[#070b14] border-[#1e2d4a] text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            />
            <Search className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="mb-4">
            <label className="text-[11px] text-slate-400 block mb-1">Repository Limit</label>
            <select className={`w-full text-xs p-2 rounded-lg border focus:outline-none ${
              darkMode ? 'bg-[#070b14] border-[#1e2d4a] text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}>
              <option>200 (Recommended)</option>
              <option>100 Repositories</option>
              <option>500 Repositories</option>
            </select>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 font-semibold block mb-2">Quick Preset Languages</span>
            <p className="text-[10px] text-slate-500 mb-1">Frontend</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {['JavaScript', 'TypeScript', 'React', 'Vue', 'Angular'].map((l) => (
                <button
                  key={l}
                  onClick={() => onSelectLang(l)}
                  className={`border text-[11px] px-2 py-1 rounded-md transition-all ${
                    darkMode ? 'bg-[#070b14] hover:bg-slate-800 border-[#1e2d4a] text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <p className="text-[10px] text-slate-500 mb-1">Backend</p>
            <div className="flex flex-wrap gap-1.5">
              {['Python', 'Java', 'Node.js', 'Go', 'PHP', 'Ruby', 'C#'].map((l) => (
                <button
                  key={l}
                  onClick={() => onSelectLang(l)}
                  className={`border text-[11px] px-2 py-1 rounded-md transition-all ${
                    darkMode ? 'bg-[#070b14] hover:bg-slate-800 border-[#1e2d4a] text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Version Distribution Overview (1-Minute Auto-Updating Card, live data) */}
      <div className={`border rounded-xl p-4 shadow-xl ${darkMode ? 'bg-[#0e1626] border-[#1e2d4a]' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-purple-400">
            Version Distribution ({language})
          </h4>
          <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
            <RefreshCw className="w-2.5 h-2.5 animate-spin" /> {timeLeft}s
          </span>
        </div>

        {sidebarError && (
          <div className="text-xs px-3 py-2 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 mb-3" role="alert">
            {sidebarError}
          </div>
        )}
        {sidebarLoading && !distribution && (
          <div className="text-xs text-slate-400 mb-3">Loading live version data…</div>
        )}

        <div className="flex items-center gap-4">
          <div className="relative w-32 h-32 flex-shrink-0">
            <Doughnut data={doughnutData} options={doughnutOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-base font-extrabold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                {distribution?.totalAnalyzed ?? 0}
              </span>
              <span className="text-[9px] text-slate-400 leading-tight">
                Repositories<br />Analyzed
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-[11px] w-full">
            {(distribution?.labels || []).map((label, idx) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: chartColors[idx % chartColors.length] }} />
                <span className={`truncate max-w-[90px] ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{label}</span>
                <span className="text-slate-400 font-mono text-[10px] ml-auto">
                  {distribution.percentages[idx]}
                </span>
              </div>
            ))}
            {distribution && distribution.labels.length === 0 && (
              <div className="text-slate-400">No version data for this language yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Latest Detected Repositories Table (live, from the same fetch) */}
      <div className={`border rounded-xl p-4 shadow-xl text-xs ${darkMode ? 'bg-[#0e1626] border-[#1e2d4a]' : 'bg-white border-slate-200'}`}>
        <div className="flex justify-between items-center mb-3">
          <span className={`font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Latest Detected Repositories</span>
          <button className="text-[11px] text-cyan-400 hover:underline" onClick={() => onSelectLang(language)}>View All</button>
        </div>

        <div className="space-y-2">
          {latestRepos.map((r, idx) => (
            <div key={r.id || idx} className={`flex items-center justify-between py-1.5 border-b ${darkMode ? 'border-[#1e2d4a]/50' : 'border-slate-100'}`}>
              <span className="text-slate-400 w-4">{idx + 1}</span>
              <a href={r.url} target="_blank" rel="noreferrer" className={`font-medium truncate max-w-[110px] hover:underline ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{r.name}</a>
              <span className="text-amber-400 text-[10px]">⭐ {formatStars(r.stars)}</span>
              <span className="text-emerald-400 font-mono text-[10px]">{r.detectedVersion}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </div>
          ))}
          {latestRepos.length === 0 && !sidebarLoading && (
            <div className="text-slate-400">No repositories to show yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
