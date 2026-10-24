import React, { useState } from 'react';
import axios from 'axios';
import { Target, Moon, Sun, Zap } from 'lucide-react';
import ProjectCardList from './components/ProjectCardList';
import SidebarPanel from './components/SidebarPanel';
import BulkDetectorDashboard from './components/BulkDetectorDashboard';
import { apiUrl } from './api';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('bulk'); // Default to Bulk Detector mode as per screenshot
  // No mock projects: the list starts empty and only shows real API results.
  // A failed search shows an error instead of silently keeping fake data.
  const [projects, setProjects] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleSearch = async (query) => {
    setIsSearching(true);
    setSearchError('');
    try {
      const res = await axios.get(apiUrl(`/api/analyze-single-repo?target=${encodeURIComponent(query)}&count=20`));
      if (res.data?.projects) {
        setProjects(res.data.projects);
      } else {
        setProjects([]);
        setSearchError('No projects were returned for this search.');
      }
    } catch (e) {
      setProjects([]);
      setSearchError(e.response?.data?.error || 'Failed to fetch repositories. Make sure the backend is running.');
    } finally {
      setIsSearching(false);
    }
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
              <ProjectCardList projects={projects} onSearch={handleSearch} darkMode={darkMode} loading={isSearching} error={searchError} />
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