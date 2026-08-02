import React, { useState } from 'react';
import { Search, Star, GitFork, ExternalLink, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import TechIcon from './TechIcon';

export default function ProjectCardList({ projects, onSearch, darkMode }) {
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState(projects[0]?.id || 1);
  const [showAll, setShowAll] = useState(false); // Top 3 by default

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  // Slice to 3 repositories if showAll is false
  const displayedProjects = showAll ? projects : projects.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords or GitHub repo (e.g. grocery store or facebook/react)"
            className={`w-full text-xs pl-4 pr-10 py-3 rounded-xl border focus:outline-none focus:border-cyan-500 ${
              darkMode ? 'bg-[#0e1626] border-[#1e2d4a] text-slate-100' : 'bg-white border-slate-300 text-slate-800 shadow-sm'
            }`}
          />
          <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
        </div>
        <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs px-5 py-3 rounded-xl transition-all">
          Search Repositories
        </button>
      </form>

      {/* Top Status Line */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Showing top <strong>{displayedProjects.length}</strong> of <strong>{projects.length}</strong> repositories...</span>
        </div>
      </div>

      {/* Repositories Accordion List */}
      <div className="space-y-3">
        {displayedProjects.map((proj, idx) => {
          const isExpanded = expandedId === proj.id;
          const { info, languagesBreakdown, detectedStack } = proj;

          return (
            <div
              key={proj.id}
              className={`border rounded-2xl overflow-hidden shadow-xl ${
                darkMode ? 'bg-[#0e1626] border-[#1e2d4a]' : 'bg-white border-slate-200'
              }`}
            >
              {/* Repo Card Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : proj.id)}
                className={`p-4 cursor-pointer transition-colors ${
                  darkMode ? 'hover:bg-[#131d32]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center border border-cyan-500/30">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className={`font-bold text-sm ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{info.name}</h3>
                        {info.verified && <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/20" />}
                      </div>
                      <p className={`text-xs mt-1 max-w-xl ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{info.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                        <span className="text-amber-400 flex items-center gap-1">⭐ {(info.stars / 1000).toFixed(1)}k</span>
                        <span className="flex items-center gap-1"><GitFork className="w-3 h-3" /> {(info.forks / 1000).toFixed(1)}k</span>
                        <span className="text-slate-500 text-[11px]">Updated {info.updated}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={info.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className={`border text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                        darkMode ? 'bg-[#070b14] hover:bg-slate-800 border-[#1e2d4a] text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                      }`}
                    >
                      View on GitHub <ExternalLink className="w-3 h-3" />
                    </a>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>

                {/* Quick Detected Version Pills */}
                <div className={`flex flex-wrap gap-2 mt-3 pt-3 border-t ${darkMode ? 'border-[#1e2d4a]/60' : 'border-slate-100'}`}>
                  {detectedStack.map((s, i) => (
                    <div
                      key={i}
                      className={`border rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-xs ${
                        darkMode ? 'bg-[#070b14] border-[#1e2d4a]' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <TechIcon type={s.type} />
                      <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{s.name}</span>
                      <span className="text-cyan-500 font-mono font-bold text-[11px]">{s.version}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expanded Area */}
              {isExpanded && (
                <div className={`p-4 border-t space-y-4 ${darkMode ? 'border-[#1e2d4a] bg-[#090e18]' : 'border-slate-200 bg-slate-50/50'}`}>
                  {/* Overall Code Breakdown */}
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase text-slate-400 mb-2">Overall Code Breakdown</h4>
                    <div className="h-2.5 w-full bg-slate-700/30 rounded-full overflow-hidden flex mb-2">
                      {languagesBreakdown.map((l, i) => {
                        const colors = ['bg-yellow-400', 'bg-blue-500', 'bg-purple-500', 'bg-emerald-500'];
                        return <div key={l.name} style={{ width: `${l.percentage}%` }} className={`h-full ${colors[i % colors.length]}`} />;
                      })}
                    </div>
                    <div className={`flex flex-wrap gap-4 text-xs ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {languagesBreakdown.map((l, i) => {
                        const colors = ['bg-yellow-400', 'bg-blue-500', 'bg-purple-500', 'bg-emerald-500'];
                        return (
                          <div key={l.name} className="flex items-center gap-1.5 text-[11px]">
                            <span className={`w-2 h-2 rounded-full ${colors[i % colors.length]}`} />
                            <span>{l.name}</span>
                            <span className="text-slate-400">{l.percentage}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Detected Versions Details Table */}
                  <div className={`border rounded-xl overflow-hidden text-xs ${darkMode ? 'border-[#1e2d4a]' : 'border-slate-200 bg-white'}`}>
                    <div className={`p-2.5 font-semibold border-b ${darkMode ? 'bg-[#0e1626] border-[#1e2d4a] text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                      Detected Versions Details (from config files)
                    </div>
                    <table className="w-full text-left">
                      <thead className={`text-[10px] uppercase border-b ${darkMode ? 'bg-[#0b101d] border-[#1e2d4a] text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                        <tr>
                          <th className="p-2.5">Tech</th>
                          <th className="p-2.5">Source File</th>
                          <th className="p-2.5">Detected Version</th>
                          <th className="p-2.5">Exact Snippet Found</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${darkMode ? 'divide-[#1e2d4a]/60' : 'divide-slate-100'}`}>
                        {detectedStack.map((item, idx) => (
                          <tr key={idx} className={darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                            <td className={`p-2.5 font-bold flex items-center gap-2 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                              <TechIcon type={item.type} /> {item.name}
                            </td>
                            <td className="p-2.5 text-slate-400">{item.source}</td>
                            <td className="p-2.5 text-emerald-500 font-mono font-bold">{item.version}</td>
                            <td className={`p-2.5 font-mono text-[11px] text-cyan-500 ${darkMode ? 'bg-[#060a12]/50' : 'bg-slate-100'}`}>{item.snippet}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* VIEW ALL BUTTON (Toggles between 3 and total 20 repos) */}
      {projects.length > 3 && (
        <div className="text-center pt-2">
          <button
            onClick={() => setShowAll(!showAll)}
            className="bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-black border border-cyan-500/30 font-bold text-xs px-6 py-2.5 rounded-xl transition-all inline-flex items-center gap-2"
          >
            {showAll ? 'Show Top 3 Repositories Only' : `View All (${projects.length} Repositories)`}
            {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}