import React, { useState } from 'react';
import { Star, GitFork, ExternalLink, ShieldCheck, Layers, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import TechIcon from './TechIcon';

export default function ProjectListReport({ reportData, darkMode }) {
  const { query, totalFound, projects } = reportData;
  const [expandedId, setExpandedId] = useState(projects[0]?.id || null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className={`space-y-6 animate-fadeIn ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
      
      {/* Search Result Banner */}
      <div className={`p-4 rounded-xl border flex justify-between items-center ${darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Analysis Report For:</span>
          <h3 className="text-lg font-bold text-cyan-400">"{query}"</h3>
        </div>
        <span className="bg-cyan-500/20 text-cyan-300 font-bold text-xs px-3 py-1.5 rounded-full border border-cyan-500/30">
          {totalFound} Projects Analyzed
        </span>
      </div>

      {/* 15-20 Projects List */}
      <div className="space-y-4">
        {projects.map((proj, index) => {
          const isExpanded = expandedId === proj.id;
          const { info, languagesBreakdown, detectedStack } = proj;

          return (
            <div
              key={proj.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-lg'
              }`}
            >
              {/* Card Header Header */}
              <div
                onClick={() => toggleExpand(proj.id)}
                className={`p-5 cursor-pointer flex flex-col gap-3 transition-colors ${
                  darkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded-lg border border-cyan-500/20 mt-0.5">
                      #{index + 1}
                    </span>
                    <div>
                      <h3 className="text-base font-bold flex items-center gap-2">
                        {info.name}
                      </h3>
                      <p className={`text-xs mt-1 line-clamp-1 max-w-2xl ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {info.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <span className="flex items-center gap-1 text-amber-400 font-semibold text-xs bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {info.stars.toLocaleString()}
                    </span>
                    <a
                      href={info.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500 hover:text-white rounded-lg transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button className="p-1 text-slate-400 hover:text-slate-200">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* 🌟 NEW FEATURE: DETECTED VERSIONS DIRECTLY UNDER PROJECT  */}
                {/* ========================================================= */}
                <div className={`pt-3 border-t flex flex-wrap items-center gap-2 ${darkMode ? 'border-slate-700/50' : 'border-slate-200'}`}>
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
                    <Tag className="w-3 h-3 text-cyan-400" /> Detected Languages & Versions:
                  </span>

                  {/* 1. Primary Detected Frameworks/Languages Badges */}
                  {detectedStack.length > 0 ? (
                    detectedStack.map((stack, sIdx) => (
                      <div
                        key={sIdx}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${
                          darkMode
                            ? 'bg-slate-900/80 border-slate-700 text-slate-200'
                            : 'bg-slate-100 border-slate-300 text-slate-800'
                        }`}
                      >
                        <TechIcon type={stack.type} className="w-5 h-5 text-[9px]" />
                        <span className="font-semibold">{stack.name}:</span>
                        <span className="text-cyan-400 font-mono font-bold">{stack.version}</span>
                      </div>
                    ))
                  ) : null}

                  {/* 2. Fallback Languages from Repo (if config file versions not explicitly found) */}
                  {languagesBreakdown.map((lang) => {
                    // Avoid duplicate badge if already in detectedStack
                    const alreadyShown = detectedStack.some(s => s.name.toLowerCase().includes(lang.name.toLowerCase()));
                    if (alreadyShown) return null;

                    return (
                      <div
                        key={lang.name}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs ${
                          darkMode
                            ? 'bg-slate-800/60 border-slate-700 text-slate-400'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="font-medium">{lang.name}:</span>
                        <span className="text-slate-500 text-[11px]">Version Not Specified ({lang.percentage}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Collapsible Expanded Details (Languages breakdown + Categorized Grid) */}
              {isExpanded && (
                <div className={`p-5 border-t space-y-5 ${darkMode ? 'border-slate-700/60 bg-slate-900/40' : 'border-slate-100 bg-slate-50/50'}`}>
                  {/* Language Percentage Bar */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider mb-2 text-slate-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" /> Overall Code Distribution
                    </h4>
                    
                    <div className="h-2.5 w-full bg-slate-700/30 rounded-full overflow-hidden flex">
                      {languagesBreakdown.map((lang, idx) => {
                        const colors = ['bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500'];
                        return (
                          <div
                            key={lang.name}
                            style={{ width: `${lang.percentage}%` }}
                            className={`${colors[idx % colors.length]} h-full`}
                            title={`${lang.name}: ${lang.percentage}%`}
                          />
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap gap-3 mt-2">
                      {languagesBreakdown.map((lang, idx) => {
                        const colors = ['bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500'];
                        return (
                          <div key={lang.name} className="flex items-center gap-1.5 text-xs">
                            <span className={`w-2 h-2 rounded-full ${colors[idx % colors.length]}`} />
                            <span>{lang.name}</span>
                            <span className="text-slate-400 font-mono text-[11px]">({lang.percentage}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Detailed Config Sources */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider mb-3 text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Detected Config File Sources
                    </h4>

                    {detectedStack.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No explicit config file (package.json, pom.xml, pyproject.toml) found with version rules.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {detectedStack.map((item, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border flex items-center justify-between ${
                              darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <TechIcon type={item.type} className="w-7 h-7 text-[10px]" />
                              <div>
                                <h5 className="font-bold text-xs">{item.name}</h5>
                                <span className="text-[10px] text-slate-400 block">{item.source}</span>
                              </div>
                            </div>
                            <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[11px] font-mono font-bold px-2 py-0.5 rounded">
                              {item.version}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}