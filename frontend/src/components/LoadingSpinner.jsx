import React from 'react';
export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Geocoding alamat & menghitung jarak...</p>
      <p className="text-gray-600 text-xs">Menggunakan Nominatim — ~1 detik per alamat</p>
    </div>
  );
}