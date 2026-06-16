# 🗺️ Sortir AI

Tool web untuk mengurutkan daftar alamat berdasarkan jarak dari titik referensi.

## Struktur Folder

```
sortir-ai/
├── backend/          ← Node.js + Express
│   ├── index.js
│   ├── package.json
│   └── .env.example
├── frontend/         ← React + Tailwind CSS
│   ├── public/index.html
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── HowItWorks.jsx
│           ├── Leaderboard.jsx
│           └── LoadingSpinner.jsx
└── README.md
```

## Cara Jalankan

### 1. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev     # → http://localhost:3001
```

### 2. Frontend
```bash
cd frontend
npm install
npm start       # → http://localhost:3000
```

## API Key (Opsional)

Secara default app menggunakan **Nominatim** (gratis, tanpa API key).

Untuk geocoding lebih cepat, isi `GOOGLE_MAPS_API_KEY` di `backend/.env`:
1. Buka https://console.cloud.google.com
2. Aktifkan **Geocoding API**
3. Buat API key → salin ke `.env`

## Fitur
- ✅ Input textarea + paste alamat
- ✅ 3 step cards How It Works
- ✅ Leaderboard animasi staggered
- ✅ Klik baris → Google Maps
- ✅ Hover glow + scale effect
- ✅ Dark mode UI
- ✅ Responsive mobile
