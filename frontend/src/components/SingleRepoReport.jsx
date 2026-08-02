import React from 'react';
import { Star, GitFork, ExternalLink, ShieldCheck, Layers, FileCode } from 'lucide-react';
import TechIcon from './TechIcon';

export default function SingleRepoReport({ report, darkMode }) {
  const { info, languagesBreakdown, detectedStack } = report;

  return (
    <div className={`space-y-6 animate-fadeIn ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
      {/* Project Overview Card */}
      <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-xl'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{info.name}</h2>
              <span className="text-xs bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 px-2.5 py-0.5 rounded-full font-medium">
                {info.defaultBranch}
              </span>
            </div>
            <p className={`text-sm mt-1 max-w-2xl ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {info.description || 'No description provided for this repository.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-amber-400 font-semibold text-sm bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
              <Star className="w-4 h-4 fill-amber-400" /> {info.stars.toLocaleString()}
            </span>
            <span className={`flex items-center gap-1 font-semibold text-sm border px-3 py-1.5 rounded-lg ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
              <GitFork className="w-4 h-4" /> {info.forks.toLocaleString()}
            </span>
            <a
              href={info.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 bg-cyan-500 hover:bg-cyan-400 text-white font-medium text-sm px-4 py-1.5 rounded-lg transition-all"
            >
              GitHub <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Multi-language Percentage Distribution Bar */}
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-3 text-slate-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" /> Overall Language Breakdown
          </h4>
          
          <div className="h-3 w-full bg-slate-700/40 rounded-full overflow-hidden flex">
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

          <div className="flex flex-wrap gap-4 mt-3">
            {languagesBreakdown.map((lang, idx) => {
              const colors = ['bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500'];
              return (
                <div key={lang.name} className="flex items-center gap-1.5 text-xs font-medium">
                  <span className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`} />
                  <span>{lang.name}</span>
                  <span className="text-slate-400 font-mono">({lang.percentage}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detected Tech Stack & Version Report Grid */}
      <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-xl'}`}>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" /> Detected Frameworks, Libraries & Runtime Versions
        </h3>

        {detectedStack.length === 0 ? (
          <p className="text-sm text-slate-400 py-4">No explicit framework versions found in standard configuration files.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detectedStack.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                  darkMode ? 'bg-slate-900/60 border-slate-700/80 hover:border-slate-600' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <TechIcon type={item.type} className="w-8 h-8 text-xs font-bold" />
                  <div>
                    <h4 className="font-bold text-sm">{item.name}</h4>
                    <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.category}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold px-2.5 py-1 rounded-md">
                    {item.version}
                  </span>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 justify-end mt-1">
                    <FileCode className="w-3 h-3" /> {item.source}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}