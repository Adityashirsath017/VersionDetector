import React from 'react';

export default function TechIcon({ type, className = "w-4 h-4" }) {
  const icons = {
    react: { bg: "#00d8ff", text: "React" },
    nodejs: { bg: "#22c55e", text: "Node.js" },
    typescript: { bg: "#3b82f6", text: "TS" },
    docker: { bg: "#38bdf8", text: "Docker" },
    eslint: { bg: "#a855f7", text: "ESLint" },
    python: { bg: "#eab308", text: "Python" },
    java: { bg: "#f97316", text: "Java" },
    go: { bg: "#06b6d4", text: "Go" },
    php: { bg: "#8b5cf6", text: "PHP" },
    vue: { bg: "#10b981", text: "Vue" },
    angular: { bg: "#ef4444", text: "Angular" },
  };

  const item = icons[type?.toLowerCase()] || { bg: "#3b82f6", text: type };

  return (
    <span className={`inline-flex items-center justify-center font-bold rounded text-[10px] px-1 text-black ${className}`} style={{ backgroundColor: item.bg }}>
      {item.text}
    </span>
  );
}