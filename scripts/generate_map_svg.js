const fs = require('fs');

async function generateMap() {
  console.log('Fetching GeoJSON...');
  const res = await fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson');
  const json = await res.json();

  const fr = json.features.find(f => f.properties.ADMIN === 'France');
  const be = json.features.find(f => f.properties.ADMIN === 'Belgium');

  // Projection bounds
  const minLon = -5.5;
  const maxLon = 9.8;
  const minLat = 41.2;
  const maxLat = 51.6;

  const width = 1000;
  const height = 1000;

  function project(lon, lat) {
    const x = ((lon - minLon) / (maxLon - minLon)) * width;
    const y = height - ((lat - minLat) / (maxLat - minLat)) * height;
    return [x.toFixed(1), y.toFixed(1)];
  }

  function coordsToPath(coordinates) {
    let d = '';
    for (const ring of coordinates) {
      // Filter out French overseas territories (French Guiana, Réunion, etc.)
      const sample = ring[0];
      if (Array.isArray(sample) && Array.isArray(sample[0])) {
        // MultiPolygon
        for (const subRing of ring) {
          const firstPoint = subRing[0];
          if (firstPoint[0] < minLon - 5 || firstPoint[0] > maxLon + 5 || firstPoint[1] < minLat - 5 || firstPoint[1] > maxLat + 5) {
            continue; // Skip overseas
          }
          d += subRing.reduce((acc, pt, idx) => {
            const [x, y] = project(pt[0], pt[1]);
            return acc + (idx === 0 ? `M${x},${y}` : `L${x},${y}`);
          }, '') + 'Z ';
        }
      } else {
        // Polygon
        const firstPoint = ring[0];
        if (firstPoint[0] < minLon - 5 || firstPoint[0] > maxLon + 5 || firstPoint[1] < minLat - 5 || firstPoint[1] > maxLat + 5) {
          continue; // Skip overseas
        }
        d += ring.reduce((acc, pt, idx) => {
          const [x, y] = project(pt[0], pt[1]);
          return acc + (idx === 0 ? `M${x},${y}` : `L${x},${y}`);
        }, '') + 'Z ';
      }
    }
    return d;
  }

  const frPath = coordsToPath(fr.geometry.coordinates);
  const bePath = coordsToPath(be.geometry.coordinates);

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <!-- Carte de France -->
  <path d="${frPath}" fill="#0f172a" stroke="#ffffff" stroke-width="2" stroke-linejoin="round" />
  <!-- Carte de Belgique -->
  <path d="${bePath}" fill="#1e293b" stroke="#ffffff" stroke-width="2" stroke-linejoin="round" />
</svg>`;

  fs.writeFileSync('public/france-belgique-map.svg', svgContent);
  console.log('Successfully generated public/france-belgique-map.svg');
}

generateMap();
