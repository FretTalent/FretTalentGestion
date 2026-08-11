// Test geocodage des codes postaux des candidats
const fetch = require('node-fetch').default || require('node-fetch');

async function testGeocode() {
  const postalCodes = ['02270', '69002'];

  for (const pc of postalCodes) {
    try {
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${pc}&type=municipality&limit=1`
      );
      const json = await res.json();
      if (json.features && json.features.length > 0) {
        const [lon, lat] = json.features[0].geometry.coordinates;
        const label = json.features[0].properties.label;
        
        // Projection sur la carte (même algo que la page)
        const minLon = -5.5, maxLon = 10.0, minLat = 41.0, maxLat = 51.2;
        const x = ((lon - minLon) / (maxLon - minLon)) * 100;
        const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
        
        console.log(`✅ ${pc} → ${label}`);
        console.log(`   lon=${lon}, lat=${lat}`);
        console.log(`   x=${x.toFixed(1)}%, y=${y.toFixed(1)}%`);
        
        // Vérifier que les coordonnées sont dans les bornes
        if (x < 0 || x > 100 || y < 0 || y > 100) {
          console.log(`   ⚠️ HORS CARTE ! Les coordonnées sont en dehors des bornes.`);
        } else {
          console.log(`   ✅ Dans les bornes de la carte`);
        }
      } else {
        console.log(`❌ ${pc} → Aucun résultat géocodage`);
      }
    } catch (e) {
      console.log(`❌ ${pc} → Erreur: ${e.message}`);
    }
  }
}

testGeocode();
