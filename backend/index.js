require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;
const REF_LAT = parseFloat(process.env.REF_LAT || '-6.2088');
const REF_LNG = parseFloat(process.env.REF_LNG || '106.8456');

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

async function geocodeNominatim(address) {
  const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`, { headers: { 'User-Agent': 'SortirAI/1.0' } });
  if (!res.data.length) throw new Error('Alamat tidak ditemukan: ' + address);
  return { lat: parseFloat(res.data[0].lat), lng: parseFloat(res.data[0].lon) };
}

async function geocodeGoogle(address) {
  const res = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_KEY}`);
  if (res.data.status !== 'OK') throw new Error('Alamat tidak ditemukan: ' + address);
  const loc = res.data.results[0].geometry.location;
  return { lat: loc.lat, lng: loc.lng };
}

async function geocode(address) {
  if (GOOGLE_KEY) return geocodeGoogle(address);
  return geocodeNominatim(address);
}

app.post('/sort', async (req, res) => {
  const { addresses, refLat, refLng } = req.body;
  if (!addresses || !Array.isArray(addresses) || !addresses.length)
    return res.status(400).json({ error: 'Daftar alamat kosong.' });

  const lat0 = refLat || REF_LAT;
  const lng0 = refLng || REF_LNG;
  const results = [], errors = [];

  for (const addr of addresses) {
    const trimmed = addr.trim();
    if (!trimmed) continue;
    try {
      if (!GOOGLE_KEY && results.length > 0) await new Promise(r => setTimeout(r, 1100));
      const { lat, lng } = await geocode(trimmed);
      results.push({ name: trimmed, lat, lng, distance: haversine(lat0, lng0, lat, lng) });
    } catch(e) { errors.push({ name: trimmed, error: e.message }); }
  }

  results.sort((a, b) => a.distance - b.distance);
  res.json({ results, errors, refPoint: { lat: lat0, lng: lng0 } });
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));
app.listen(PORT, () => console.log('Sortir AI backend → http://localhost:' + PORT));
