import React from 'react';

const steps = [
  { icon: '📋', step: '01', title: 'Upload / Paste', desc: 'Masukkan daftar alamat, satu per baris' },
  { icon: '🤖', step: '02', title: 'AI Sortir', desc: 'Sistem otomatis urutkan berdasarkan jarak' },
  { icon: '🏆', step: '03', title: 'Leaderboard & Navigate', desc: 'Klik baris untuk buka Google Maps' },
];

export default function HowItWorks() {
  return (
    <div>
      <h2 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-5">Cara Kerja</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {steps.map((s, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center hover:border-indigo-600 transition-colors">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-xs text-indigo-400 font-bold mb-1">STEP {s.step}</div>
            <div className="font-semibold text-white text-sm mb-1">{s.title}</div>
            <div className="text-gray-400 text-xs">{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}