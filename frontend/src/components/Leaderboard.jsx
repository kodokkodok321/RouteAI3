import React from 'react';

const MEDALS = ['🥇', '🥈', '🥉'];

function formatDist(km) {
  if (km < 1) return (km * 1000).toFixed(0) + ' m';
  return km.toFixed(1) + ' km';
}

function rankLabel(i) {
  if (i < 3) return MEDALS[i];
  return `#${i+1}`;
}

export default function Leaderboard({ results }) {
  function openMaps(name) {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`, '_blank');
  }

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">🏆 Leaderboard</h2>
        <p className="text-gray-400 text-xs mt-1">{results.length} lokasi diurutkan — terdekat ke terjauh</p>
      </div>
      <ul className="divide-y divide-gray-800">
        {results.map((r, i) => (
          <li
            key={i}
            className="animate-row row-hover flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-indigo-950/40 transition-all"
            style={{ animationDelay: `${i * 80}ms` }}
            onClick={() => openMaps(r.name)}
          >
            <span className="text-2xl w-8 text-center flex-shrink-0">{rankLabel(i)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{r.name}</p>
            </div>
            <span className="bg-indigo-700/50 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0">
              {formatDist(r.distance)}
            </span>
            <span className="text-gray-500 text-lg flex-shrink-0">↗</span>
          </li>
        ))}
      </ul>
    </div>
  );
}