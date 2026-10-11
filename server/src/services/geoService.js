/**
 * Geo Service: Haversine distance, NCR coordinates mapping, ETA calculations
 */

const NCR_CITIES = {
  noida: { name: 'Noida', lat: 28.5355, lng: 77.3910 },
  delhi: { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
  gurugram: { name: 'Gurugram', lat: 28.4595, lng: 77.0266 },
  ghaziabad: { name: 'Ghaziabad', lat: 28.6692, lng: 77.4538 },
  faridabad: { name: 'Faridabad', lat: 28.4089, lng: 77.3178 },
  meerut: { name: 'Meerut', lat: 28.9845, lng: 77.7064 }
};

// Calculate distance in kilometers using the Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const radlat1 = (Math.PI * lat1) / 180;
  const radlat2 = (Math.PI * lat2) / 180;
  const theta = lon1 - lon2;
  const radtheta = (Math.PI * theta) / 180;
  let dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) dist = 1;
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  return Number((dist * 1.609344).toFixed(2)); // km
}

// Calculate Estimated Arrival Time in minutes (assuming average city traffic 25 km/h)
function calculateEta(distanceKm) {
  const averageSpeedKmH = 25; // km/h
  const travelTimeMinutes = Math.ceil((distanceKm / averageSpeedKmH) * 60);
  const prepTimeMinutes = 5;
  return Math.max(5, travelTimeMinutes + prepTimeMinutes);
}

// Get coordinates for NCR city default
function getCityDefaultCoordinates(cityName = 'Noida') {
  const normalized = cityName.toLowerCase().trim();
  return NCR_CITIES[normalized] || NCR_CITIES.noida;
}

module.exports = {
  NCR_CITIES,
  calculateDistance,
  calculateEta,
  getCityDefaultCoordinates
};
