import React, { useState } from 'react';
import HowItWorks from './components/HowItWorks';
import Leaderboard from './components/Leaderboard';
import LoadingSpinner from './components/LoadingSpinner';

export default function App() {
  const [addresses, setAddresses] = useState('');
  const [refAddress, setRefAddress] = useState('');
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSort() {
    const lines = addresses.split('\n').filter(l => l.trim());
    if (!lines.length) { setError('Masukkan minimal satu alamat.'); return; }
    setLoading(true); setError(''); setResults(null);

    try {
      const body = { addresses: lines };
      if (refAddress.trim()) body.refAddress = refAddress.trim();

      const res = await fetch('/sort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memproses.');
      setResults(data.results);
      setErrors(data.errors || []);
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 py-6 px-4 text-center">
        <h1 className="text-3xl font-bold text-indigo-400 tracking-tight">🗺️ Sortir AI</h1>
        <p className="text-gray-400 mt-1 text-sm">Urutkan daftar alamat berdasarkan jarak — otomatis & instan</p>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-10">
        {/* How It Works */}
        <HowItWorks />

        {/* Input */}
        <div className="bg-gray-900 rounded-2xl p-6 space-y-4 border border-gray-800">
          <h2 className="text-lg font-semibold text-white">📋 Daftar Alamat</h2>
          <textarea
            className="w-full bg-gray-800 text-white rounded-xl p-4 text-sm resize-none border border-gray-700 focus:border-indigo-500 focus:outline-none h-40 placeholder-gray-500"
            placeholder={"Jl. Sudirman No.1, Jakarta\nJl. Braga No.10, Bandung\nJl. Malioboro, Yogyakarta"}
            value={addresses}
            onChange={e => setAddresses(e.target.value)}
          />
          <div>
            <label className="text-sm text-gray-400 block mb-1">📍 Titik Referensi <span className="text-gray-600">(opsional — default: Jakarta Pusat)</span></label>
            <input
              className="w-full bg-gray-800 text-white rounded-xl p-3 text-sm border border-gray-700 focus:border-indigo-500 focus:outline-none placeholder-gray-500"
              placeholder="cth: Monas Jakarta / Jl. Sudirman No.1 Jakarta"
              value={refAddress}
              onChange={e => setRefAddress(e.target.value)}
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            onClick={handleSort}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            {loading ? '⏳ Sedang Memproses...' : '🚀 Sortir Sekarang'}
          </button>
        </div>

        {/* Loading */}
        {loading && <LoadingSpinner />}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4">
            <p className="text-yellow-400 text-sm font-semibold mb-2">⚠️ Beberapa alamat gagal diproses:</p>
            {errors.map((e,i) => <p key={i} className="text-yellow-300 text-xs">• {e.name}: {e.error}</p>)}
          </div>
        )}

        {/* Leaderboard */}
        {results && <Leaderboard results={results} />}
      </main>
    </div>
  );
}