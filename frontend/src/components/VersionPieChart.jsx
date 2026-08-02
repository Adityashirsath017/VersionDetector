import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function VersionPieChart({ repos }) {
  // Aggregate versions count
  const versionCounts = repos.reduce((acc, repo) => {
    const ver = repo.detectedVersion;
    acc[ver] = (acc[ver] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(versionCounts);
  const dataValues = Object.values(versionCounts);

  const data = {
    labels,
    datasets: [
      {
        label: '# of Repositories',
        data: dataValues,
        backgroundColor: [
          '#38bdf8',
          '#34d399',
          '#a78bfa',
          '#fbbf24',
          '#f87171',
          '#f472b6',
          '#94a3b8',
        ],
        borderColor: '#1e293b',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#cbd5e1',
          font: { size: 12 },
        },
      },
    },
  };

  return (
    <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-700 shadow-xl max-w-md mx-auto my-6">
      <h3 className="text-center font-semibold text-slate-200 mb-4 text-sm tracking-wide">
        Version Distribution Summary
      </h3>
      <Pie data={data} options={options} />
    </div>
  );
}