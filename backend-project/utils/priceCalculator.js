const https = require('https');

const RATES = {
  motorcycle: 200,
  van: 500,
  bus: 100,
};

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

function googleMapsGeocode(location) {
  return new Promise((resolve, reject) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)},+Rwanda&key=${GOOGLE_MAPS_API_KEY}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status !== 'OK' || !json.results.length) {
            resolve(null);
          } else {
            const { lat, lng } = json.results[0].geometry.location;
            resolve({ lat, lng });
          }
        } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

function nominatimGeocode(location) {
  return new Promise((resolve, reject) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)},+Rwanda&format=json&limit=1`;
    https.get(url, { headers: { 'User-Agent': 'GERAYO-App/1.0' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.length === 0) return resolve(null);
          resolve({ lat: parseFloat(json[0].lat), lon: parseFloat(json[0].lon) });
        } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

function googleMapsDistance(origLat, origLng, destLat, destLng) {
  return new Promise((resolve, reject) => {
    const origins = `${origLat},${origLng}`;
    const destinations = `${destLat},${destLng}`;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&key=${GOOGLE_MAPS_API_KEY}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.status !== 'OK' || !json.rows.length || !json.rows[0].elements.length) { resolve(null); return; }
          const element = json.rows[0].elements[0];
          if (element.status !== 'OK') { resolve(null); return; }
          resolve(element.distance.value / 1000);
        } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

async function calculatePrice(currentLocation, destination, vehicleType) {
  const vehicle = vehicleType?.toLowerCase();
  const rate = RATES[vehicle];

  if (!rate) return { distance: 0, price: 0, rate: 0, error: 'Invalid vehicle type' };
  if (!currentLocation?.trim() || !destination?.trim()) return { distance: 0, price: 0, rate, error: 'Locations required' };

  let origin, dest;

  if (GOOGLE_MAPS_API_KEY) {
    [origin, dest] = await Promise.all([
      googleMapsGeocode(currentLocation),
      googleMapsGeocode(destination),
    ]);
  }

  if (!origin || !dest) {
    [origin, dest] = await Promise.all([
      nominatimGeocode(currentLocation),
      nominatimGeocode(destination),
    ]);
  }

  if (!origin || !dest) {
    return { distance: 0, price: 0, rate, error: 'Could not find locations' };
  }

  let distance = null;

  if (GOOGLE_MAPS_API_KEY && origin && dest) {
    distance = await googleMapsDistance(origin.lat, origin.lng || origin.lon, dest.lat, dest.lng || dest.lon);
  }

  if (!distance) {
    distance = haversineKm(origin.lat, origin.lon || origin.lng, dest.lat, dest.lon || dest.lng);
  }

  const price = Math.max(Math.round(distance * rate), 500);

  return { distance, price, rate };
}

module.exports = { calculatePrice, RATES };
