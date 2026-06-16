const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function geocodeNominatim(address) {
  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { format: 'json', q: address, limit: 1 },
      headers: { 'User-Agent': 'SortirAI/1.0' },
      timeout: 8000
    });
    if (res.data && res.data.length > 0) {
      return { lat: parseFloat(res.data[0].lat), lon: parseFloat(res.data[0].lon) };
    }
    return null;
  } catch (err) {
    console.error('Nominatim error:', err.message);
    return null;
  }
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

app.post('/api/sort', async (req, res) => {
  try {
    const { addresses, origin } = req.body;
    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return res.status(400).json({ error: 'addresses array required' });
    }
    let originLat = -6.2088;
    let originLon = 106.8456;
    if (origin) {
      const og = await geocodeNominatim(origin);
      if (og) { originLat = og.lat; originLon = og.lon; }
    }
    const results = [];
    for (const address of addresses) {
      if (!address || !address.trim()) continue;
      const geo = await geocodeNominatim(address.trim());
      if (geo) {
        const distance = haversine(originLat, originLon, geo.lat, geo.lon);
        results.push({ address: address.trim(), distance: Math.round(distance * 10) / 10, lat: geo.lat, lon: geo.lon });
      } else {
        results.push({ address: address.trim(), distance: null, error: 'Geocoding failed' });
      }
    }
    results.sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
    try {
      await supabase.from('sort_history').insert({ addresses: JSON.stringify(addresses), results: JSON.stringify(results) });
    } catch (dbErr) {
      console.error('Supabase error:', dbErr.message);
    }
    return res.json({ results });
  } catch (err) {
    console.error('/api/sort error:', err.message);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log('Sortir AI backend running on port', PORT);
});