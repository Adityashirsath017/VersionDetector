import React, { useState } from 'react';
import axios from 'axios';
import { Target, Moon, Sun, Zap } from 'lucide-react';
import ProjectCardList from './components/ProjectCardList';
import SidebarPanel from './components/SidebarPanel';
import BulkDetectorDashboard from './components/BulkDetectorDashboard';

const mockProjects = [
  {
    id: 1,
    info: { name: 'facebook / react', description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.', stars: 215000, forks: 45600, updated: '2 days ago', verified: true, url: 'https://github.com/facebook/react' },
    languagesBreakdown: [{ name: 'JavaScript', percentage: 60.3 }, { name: 'TypeScript', percentage: 22.7 }, { name: 'CSS', percentage: 10.5 }, { name: 'HTML', percentage: 6.5 }],
    detectedStack: [
      { name: 'React', version: 'v18.2.0', source: 'package.json', snippet: '"react": "18.2.0"', type: 'react' },
      { name: 'Node.js', version: '>=18.0.0', source: 'package.json', snippet: '"engines": { "node": ">=18.0.0" }', type: 'nodejs' },
      { name: 'TypeScript', version: 'v5.0.4', source: 'package.json', snippet: '"typescript": "^5.0.4"', type: 'typescript' },
      { name: 'Docker', version: '20-alpine', source: 'Dockerfile', snippet: 'FROM node:20-alpine', type: 'docker' },
      { name: 'ESLint', version: 'v8.57.0', source: '.eslintrc.json', snippet: '"eslint": "8.57.0"', type: 'eslint' }
    ]
  },
  {
    id: 2,
    info: { name: 'vercel / next.js', description: 'The React Framework for the Web', stars: 114000, forks: 22100, updated: '1 day ago', verified: true, url: 'https://github.com/vercel/next.js' },
    languagesBreakdown: [{ name: 'TypeScript', percentage: 80 }, { name: 'JavaScript', percentage: 20 }],
    detectedStack: [{ name: 'React', version: 'v18.2.0', source: 'package.json', snippet: '"react": "^18.2.0"', type: 'react' }]
  },
  {
    id: 3,
    info: { name: 'microsoft / typescript', description: 'TypeScript is a superset of JavaScript that compiles to clean JavaScript output.', stars: 92000, forks: 18700, updated: '3 days ago', verified: true, url: 'https://github.com/microsoft/typescript' },
    languagesBreakdown: [{ name: 'TypeScript', percentage: 100 }],
    detectedStack: [{ name: 'Node.js', version: '>=16.0.0', source: 'package.json', snippet: '"node": ">=16.0.0"', type: 'nodejs' }]
  }
];

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('bulk'); // Default to Bulk Detector mode as per screenshot
  const [projects, setProjects] = useState(mockProjects);

  const handleSearch = async (query) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/analyze-single-repo?target=${encodeURIComponent(query)}&count=20`);
      if (res.data?.projects) setProjects(res.data.projects);
    } catch (e) {}
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 font-sans antialiased ${
      darkMode ? 'bg-[#070b14] text-slate-100' : 'bg-slate-100 text-slate-800'
    }`}>
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        
        {/* Header Bar */}
        <header className={`flex flex-col md:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b ${
          darkMode ? 'border-[#182338]' : 'border-slate-300'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
              <Target className="w-6 h-6 text-black font-bold" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight flex items-center gap-1.5">
                VersionDetector<span className="text-cyan-400">.io</span>
              </h1>
              <p className="text-[11px] text-slate-400">Language & Framework Version Detector</p>
            </div>
          </div>

          {/* Dual Pill Tab Switcher */}
          <div className={`flex p-1 rounded-xl border ${
            darkMode ? 'bg-[#0b1120] border-[#182338]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <button
              onClick={() => setActiveTab('deep')}
              className={`flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'deep' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Target className="w-3.5 h-3.5" /> Project Deep Report (15-20 Repos)
            </button>

            <button
              onClick={() => setActiveTab('bulk')}
              className={`flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'bulk' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Bulk 200-500 Repos Detector
            </button>
          </div>

          {/* Theme Switcher Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`flex items-center gap-2 border px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              darkMode 
                ? 'bg-[#0b1120] border-[#182338] text-slate-200 hover:bg-slate-800' 
                : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50 shadow-sm'
            }`}
          >
            {darkMode ? <Moon className="w-3.5 h-3.5 text-cyan-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            <span>{darkMode ? 'Dark' : 'Light'}</span>
          </button>
        </header>

        {/* Dynamic View based on Selected Tab */}
        {activeTab === 'bulk' ? (
          /* TAB 2: Exact Match of Screenshot Dashboard */
          <BulkDetectorDashboard darkMode={darkMode} />
        ) : (
          /* TAB 1: 15-20 Projects Deep Inspection View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <ProjectCardList projects={projects} onSearch={handleSearch} darkMode={darkMode} />
            </div>
            <div className="lg:col-span-4">
              <SidebarPanel activeTab={activeTab} onSearch={handleSearch} onSelectLang={handleSearch} darkMode={darkMode} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}