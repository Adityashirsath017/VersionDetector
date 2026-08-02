import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function SearchBar({ onSearch, repoLimit, setRepoLimit }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 shadow-lg mb-6">
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Input field */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any custom topic or keyword (e.g. machine-learning, docker, auth, e-commerce)..."
            className="w-full bg-slate-900 text-slate-100 pl-11 pr-4 py-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500 text-sm"
          />
        </div>

        {/* Repos limit selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={repoLimit}
            onChange={(e) => setRepoLimit(Number(e.target.value))}
            className="bg-slate-900 text-slate-200 text-sm py-2.5 px-3 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500 w-full md:w-auto"
          >
            <option value={100}>100 Repositories</option>
            <option value={200}>200 Repositories (Recommended)</option>
            <option value={300}>300 Repositories</option>
            <option value={500}>500 Repositories</option>
          </select>

          <button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-400 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-all flex-shrink-0"
          >
            Detect Versions
          </button>
        </div>
      </div>
    </form>
  );
}