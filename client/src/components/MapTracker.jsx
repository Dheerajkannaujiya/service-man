import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix default leaflet marker icon assets in webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom customer pin
const customerIcon = new L.DivIcon({
  className: 'custom-customer-icon',
  html: `<div style="background-color: #3b82f6; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

// Custom provider vehicle pin with pulse animation
const providerIcon = new L.DivIcon({
  className: 'custom-provider-icon',
  html: `<div style="background-color: #10b981; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.5);"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v7c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg></div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 19]
});

function MapRecenter({ center, zoom = 13 }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapTracker({
  customerCoords = [28.5204, 77.3736], // [lat, lng]
  providerCoords = [28.5450, 77.3450], // [lat, lng]
  showRoute = true,
  customerName = 'Customer Address',
  providerName = 'Service Professional',
  height = '350px'
}) {
  const validCust = useMemo(() => {
    if (Array.isArray(customerCoords) && customerCoords.length === 2) {
      return customerCoords;
    }
    return [28.5204, 77.3736];
  }, [customerCoords]);

  const validProv = useMemo(() => {
    if (Array.isArray(providerCoords) && providerCoords.length === 2) {
      return providerCoords;
    }
    return [28.5450, 77.3450];
  }, [providerCoords]);

  // Center point
  const mapCenter = useMemo(() => {
    return [
      (validCust[0] + validProv[0]) / 2,
      (validCust[1] + validProv[1]) / 2
    ];
  }, [validCust, validProv]);

  const polylineCoords = useMemo(() => [validCust, validProv], [validCust, validProv]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter center={mapCenter} />

        {/* Customer Marker */}
        <Marker position={validCust} icon={customerIcon}>
          <Popup>
            <div className="text-xs font-semibold text-slate-800">
              📍 {customerName}
            </div>
          </Popup>
        </Marker>

        {/* Provider Live Marker */}
        {validProv && (
          <Marker position={validProv} icon={providerIcon}>
            <Popup>
              <div className="text-xs font-semibold text-emerald-800">
                🚗 {providerName} (Live GPS)
              </div>
            </Popup>
          </Marker>
        )}

        {/* Dynamic Route Polyline */}
        {showRoute && validCust && validProv && (
          <Polyline
            positions={polylineCoords}
            pathOptions={{
              color: '#3b82f6',
              weight: 4,
              opacity: 0.8,
              dashArray: '8, 8'
            }}
          />
        )}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-md flex items-center gap-3 text-xs font-medium text-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span>You</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Technician</span>
        </div>
      </div>
    </div>
  );
}
