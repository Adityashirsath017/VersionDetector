import React, { useState, useEffect } from 'react';
import { Layers, Search, ExternalLink, RefreshCw } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

// Authentic Language Versions Datasets for 1-minute Rotation
const languageDataList = [
  {
    language: 'Python',
    totalAnalyzed: 200,
    labels: ['Python 3.12', 'Python 3.11', 'Python 3.10', 'Python 3.9', 'Others'],
    counts: [70, 60, 40, 20, 10],
    percentages: ['35.0%', '30.0%', '20.0%', '10.0%', '5.0%'],
    colors: ['#3b82f6', '#22c55e', '#eab308', '#64748b', '#a855f7']
  },
  {
    language: 'Node.js',
    totalAnalyzed: 200,
    labels: ['Node 20.x (LTS)', 'Node 18.x (LTS)', 'Node 16.x', 'Node 22.x', 'Others'],
    counts: [84, 66, 30, 14, 6],
    percentages: ['42.0%', '33.0%', '15.0%', '7.0%', '3.0%'],
    colors: ['#22c55e', '#06b6d4', '#eab308', '#a855f7', '#64748b']
  },
  {
    language: 'Java',
    totalAnalyzed: 200,
    labels: ['Java 21 (LTS)', 'Java 17 (LTS)', 'Java 11', 'Java 8', 'Others'],
    counts: [76, 70, 36, 14, 4],
    percentages: ['38.0%', '35.0%', '18.0%', '7.0%', '2.0%'],
    colors: ['#f97316', '#3b82f6', '#10b981', '#ef4444', '#64748b']
  },
  {
    language: 'Go',
    totalAnalyzed: 200,
    labels: ['Go 1.22', 'Go 1.21', 'Go 1.20', 'Go 1.19', 'Others'],
    counts: [90, 64, 28, 12, 6],
    percentages: ['45.0%', '32.0%', '14.0%', '6.0%', '3.0%'],
    colors: ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b']
  },
  {
    language: 'TypeScript',
    totalAnalyzed: 200,
    labels: ['TS 5.4', 'TS 5.3', 'TS 5.0', 'TS 4.9', 'Others'],
    counts: [80, 60, 36, 16, 8],
    percentages: ['40.0%', '30.0%', '18.0%', '8.0%', '4.0%'],
    colors: ['#3b82f6', '#06b6d4', '#22c55e', '#a855f7', '#64748b']
  },
  {
    language: 'PHP',
    totalAnalyzed: 200,
    labels: ['PHP 8.3', 'PHP 8.2', 'PHP 8.1', 'PHP 7.4', 'Others'],
    counts: [72, 68, 36, 16, 8],
    percentages: ['36.0%', '34.0%', '18.0%', '8.0%', '4.0%'],
    colors: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#64748b']
  }
];

export default function SidebarPanel({ activeTab, onSearch, onSelectLang, darkMode }) {
  const [langIndex, setLangIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  // 1-Minute Auto-Rotation & Timer Interval
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setLangIndex((current) => (current + 1) % languageDataList.length);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentData = languageDataList[langIndex];

  const doughnutData = {
    labels: currentData.labels,
    datasets: [
      {
        data: currentData.counts,
        backgroundColor: currentData.colors,
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

      {/* 2. Version Distribution Overview (1-Minute Auto-Updating Card) */}
      <div className={`border rounded-xl p-4 shadow-xl ${darkMode ? 'bg-[#0e1626] border-[#1e2d4a]' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-purple-400">
            Version Distribution ({currentData.language})
          </h4>
          <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
            <RefreshCw className="w-2.5 h-2.5 animate-spin" /> {timeLeft}s
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-32 h-32 flex-shrink-0">
            <Doughnut data={doughnutData} options={doughnutOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-base font-extrabold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                {currentData.totalAnalyzed}
              </span>
              <span className="text-[9px] text-slate-400 leading-tight">
                Repositories<br />Analyzed
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-[11px] w-full">
            {currentData.labels.map((label, idx) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: currentData.colors[idx] }} />
                <span className={`truncate max-w-[90px] ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{label}</span>
                <span className="text-slate-400 font-mono text-[10px] ml-auto">
                  {currentData.percentages[idx]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Latest Detected Repositories Table */}
      <div className={`border rounded-xl p-4 shadow-xl text-xs ${darkMode ? 'bg-[#0e1626] border-[#1e2d4a]' : 'bg-white border-slate-200'}`}>
        <div className="flex justify-between items-center mb-3">
          <span className={`font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Latest Detected Repositories</span>
          <button className="text-[11px] text-cyan-400 hover:underline">View All</button>
        </div>

        <div className="space-y-2">
          {[
            { id: 1, name: 'django / django', stars: '59.2k', ver: 'Python 3.11.4' },
            { id: 2, name: 'psf / requests', stars: '49.3k', ver: 'Python 3.10+' },
            { id: 3, name: 'pallets / flask', stars: '63.1k', ver: 'Python 3.11.2' },
          ].map((r) => (
            <div key={r.id} className={`flex items-center justify-between py-1.5 border-b ${darkMode ? 'border-[#1e2d4a]/50' : 'border-slate-100'}`}>
              <span className="text-slate-400 w-4">{r.id}</span>
              <span className={`font-medium truncate max-w-[110px] ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{r.name}</span>
              <span className="text-amber-400 text-[10px]">⭐ {r.stars}</span>
              <span className="text-emerald-400 font-mono text-[10px]">{r.ver}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}