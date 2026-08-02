import React, { useState } from 'react';
import { ExternalLink, Star, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

export default function RepoTable({ repos }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const totalPages = Math.ceil(repos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRepos = repos.slice(startIndex, startIndex + itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(p => p + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1);
  };

  return (
    <div className="bg-slate-800/80 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
      <div className="p-4 bg-slate-900/40 border-b border-slate-700/60 flex justify-between items-center">
        <span className="text-xs text-slate-400 font-medium">
          Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, repos.length)} of {repos.length} Repositories
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/60 border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
              <th className="p-4">#</th>
              <th className="p-4">Repository Name</th>
              <th className="p-4">Stars</th>
              <th className="p-4">Detected Version</th>
              <th className="p-4 text-right">GitHub Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 text-sm">
            {currentRepos.map((repo, idx) => (
              <tr key={repo.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="p-4 text-xs text-slate-500 font-mono">
                  {startIndex + idx + 1}
                </td>
                <td className="p-4 font-semibold text-slate-100">
                  {repo.name}
                  {repo.description && (
                    <p className="text-xs text-slate-400 font-normal truncate max-w-md mt-1">
                      {repo.description}
                    </p>
                  )}
                </td>
                <td className="p-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {repo.stars.toLocaleString()}
                  </span>
                </td>
                <td className="p-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                    repo.detectedVersion !== 'Not specified'
                      ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                      : 'bg-slate-700 text-slate-400 border-slate-600'
                  }`}>
                    <Tag className="w-3 h-3" />
                    {repo.detectedVersion}
                  </span>
                </td>
                <td className="p-4 text-right whitespace-nowrap">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500 hover:text-white rounded-lg transition-all"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}