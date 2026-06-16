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

async function geocode(address) {
  try {
    const r = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { format: 'json', q: address, limit: 1 },
      headers: { 'User-Agent': 'SortirAI/1.0' },
      timeout: 8000
    });
    if (r.data && r.data[0]) {
      return { lat: parseFloat(r.data[0].lat), lon: parseFloat(r.data[0].lon) };
    }
    return null;
  } catch (e) {
    console.error('geocode error:', e.message);
    return null;
  }
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

app.post('/api/sort', async (req, res) => {
  try {
    const { addresses, origin } = req.body;
    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return res.status(400).json({ error: 'addresses array required' });
    }
    let oLat = -6.2088;
    let oLon = 106.8456;
    if (origin) {
      const og = await geocode(origin);
      if (og) { oLat = og.lat; oLon = og.lon; }
    }
    const results = [];
    for (const addr of addresses) {
      if (!addr || !addr.trim()) continue;
      const g = await geocode(addr.trim());
      if (g) {
        const km = haversine(oLat, oLon, g.lat, g.lon);
        results.push({ address: addr.trim(), distance: Math.round(km * 10) / 10, lat: g.lat, lon: g.lon });
      } else {
        results.push({ address: addr.trim(), distance: null, error: 'Geocoding failed' });
      }
    }
    results.sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
    try {
      await supabase.from('sort_history').insert({
        addresses: JSON.stringify(addresses),
        results: JSON.stringify(results)
      });
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