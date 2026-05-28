const express = require('express');
const router = express.Router();
const https = require('https');

function nominatimGeocode(query) {
  return new Promise((resolve) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)},+Rwanda&countrycodes=rw&format=json&limit=5`;
    https.get(url, { headers: { 'User-Agent': 'GERAYO-App/1.0' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.map((r) => ({
            title: r.display_name.split(',')[0].trim(),
            address: r.display_name,
            latitude: parseFloat(r.lat),
            longitude: parseFloat(r.lon),
          })));
        } catch { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.json({ results: [] });

    const apiKey = process.env.SERPAPI_API_KEY;

    if (apiKey) {
      const url = `https://serpapi.com/search?engine=google_local&q=${encodeURIComponent(q)}&api_key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      const results = (data.local_results || []).map((place) => ({
        title: place.title,
        address: place.address || place.formatted_address || '',
        latitude: place.gps_coordinates?.latitude || null,
        longitude: place.gps_coordinates?.longitude || null,
      }));

      return res.json({ results });
    }

    const results = await nominatimGeocode(q);
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/geocode', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.json({ latitude: null, longitude: null });

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (apiKey) {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)},+Rwanda&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'OK' && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return res.json({ latitude: lat, longitude: lng });
      }
    }

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)},+Rwanda&countrycodes=rw&format=json&limit=1`;
    const response = await fetch(url, { headers: { 'User-Agent': 'GERAYO-App/1.0' } });
    const data = await response.json();
    if (data.length > 0) {
      return res.json({ latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) });
    }

    res.json({ latitude: null, longitude: null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
