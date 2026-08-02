import React from 'react';
import { Code2, Server } from 'lucide-react';

const frontendLangs = ['JavaScript', 'TypeScript', 'HTML/CSS', 'React', 'Vue', 'Angular'];
const backendLangs = ['Python', 'Java', 'Node.js', 'Go', 'PHP', 'Ruby', 'C#'];

export default function LanguageSelector({ selectedLang, onSelectLang }) {
  return (
    <div className="space-y-6">
      {/* Frontend Section */}
      <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-700">
        <div className="flex items-center gap-2 mb-4 text-cyan-400 font-semibold">
          <Code2 className="w-5 h-5" />
          <h2>Frontend Languages & Frameworks</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {frontendLangs.map((lang) => (
            <button
              key={lang}
              onClick={() => onSelectLang(lang)}
              className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 border ${
                selectedLang === lang
                  ? 'bg-cyan-500 text-white border-cyan-400 shadow-lg shadow-cyan-500/30 scale-105'
                  : 'bg-slate-700/50 hover:bg-slate-700 text-slate-200 border-slate-600 hover:border-slate-500'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Backend Section */}
      <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-700">
        <div className="flex items-center gap-2 mb-4 text-emerald-400 font-semibold">
          <Server className="w-5 h-5" />
          <h2>Backend Languages & Environments</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {backendLangs.map((lang) => (
            <button
              key={lang}
              onClick={() => onSelectLang(lang)}
              className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 border ${
                selectedLang === lang
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/30 scale-105'
                  : 'bg-slate-700/50 hover:bg-slate-700 text-slate-200 border-slate-600 hover:border-slate-500'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}