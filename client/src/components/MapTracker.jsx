import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, ExternalLink, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

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
  html: `<div style="background: linear-gradient(135deg, #6366f1, #3b82f6); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff; box-shadow: 0 6px 18px rgba(99, 102, 241, 0.5);"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

// Custom provider vehicle pin with pulse animation
const providerIcon = new L.DivIcon({
  className: 'custom-provider-icon',
  html: `<div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
    <span style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: rgba(16, 185, 129, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
    <div style="position: relative; background: linear-gradient(135deg, #10b981, #059669); width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff; box-shadow: 0 6px 18px rgba(16, 185, 129, 0.5);">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v7c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
    </div>
  </div>`,
  iconSize: [42, 42],
  iconAnchor: [21, 21]
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
  height = '380px'
}) {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [mapEngine, setMapEngine] = useState('leaflet'); // 'leaflet' or 'google'
  const [tileTheme, setTileTheme] = useState('dark'); // 'dark' or 'light'

  const validCust = useMemo(() => {
    if (Array.isArray(customerCoords) && customerCoords.length === 2 && !isNaN(customerCoords[0])) {
      return customerCoords;
    }
    return [28.5204, 77.3736];
  }, [customerCoords]);

  const validProv = useMemo(() => {
    if (Array.isArray(providerCoords) && providerCoords.length === 2 && !isNaN(providerCoords[0])) {
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

  // Direct Google Maps Turn-by-Turn Navigation Link
  const googleNavUrl = `https://www.google.com/maps/dir/?api=1&origin=${validProv[0]},${validProv[1]}&destination=${validCust[0]},${validCust[1]}&travelmode=driving`;

  // Google Maps Embed URL (works with free embed API key or standard embed)
  const googleEmbedUrl = googleMapsApiKey
    ? `https://www.google.com/maps/embed/v1/directions?key=${googleMapsApiKey}&origin=${validProv[0]},${validProv[1]}&destination=${validCust[0]},${validCust[1]}&mode=driving`
    : `https://maps.google.com/maps?saddr=${validProv[0]},${validProv[1]}&daddr=${validCust[0]},${validCust[1]}&output=embed`;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-900 group" style={{ height }}>
      {/* Map Engine Toggle Bar */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/70 shadow-lg text-xs">
        <button
          type="button"
          onClick={() => setMapEngine('leaflet')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
            mapEngine === 'leaflet'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🛰️ OpenStreetMap
        </button>
        <button
          type="button"
          onClick={() => setMapEngine('google')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
            mapEngine === 'google'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/39/Google_Maps_icon_%282020%29.svg" alt="Google" className="w-3.5 h-3.5" />
          Google Maps
        </button>
        {mapEngine === 'leaflet' && (
          <button
            type="button"
            onClick={() => setTileTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            title="Toggle Map Dark/Light Theme"
            className="px-2 py-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            {tileTheme === 'dark' ? '🌙' : '☀️'}
          </button>
        )}
      </div>

      {/* External Direct Google Maps Navigation Button */}
      <div className="absolute top-3 right-3 z-[1000]">
        <a
          href={googleNavUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 backdrop-blur-md text-white text-xs font-semibold shadow-lg transition-all hover:scale-105"
        >
          <Navigation size={13} className="text-white" />
          <span>Open Google Maps</span>
          <ExternalLink size={11} className="opacity-75" />
        </a>
      </div>

      {/* Render Selected Map Engine */}
      {mapEngine === 'google' ? (
        <div className="w-full h-full relative">
          <iframe
            title="Google Maps Live Directions"
            src={googleEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />
          {!googleMapsApiKey && (
            <div className="absolute bottom-3 left-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Google Maps Embed active (Free Mode). Set <code className="text-indigo-300">VITE_GOOGLE_MAPS_API_KEY</code> for custom markers.</span>
              </span>
              <button
                type="button"
                onClick={() => setMapEngine('leaflet')}
                className="text-indigo-400 hover:underline font-medium text-xs ml-2 whitespace-nowrap"
              >
                Switch to Interactive Pin Mode
              </button>
            </div>
          )}
        </div>
      ) : (
        <MapContainer
          center={mapCenter}
          zoom={13}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url={
              tileTheme === 'dark'
                ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
                : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            }
          />

          <MapRecenter center={mapCenter} />

          {/* Customer Marker */}
          <Marker position={validCust} icon={customerIcon}>
            <Popup>
              <div className="p-1">
                <p className="text-xs font-bold text-slate-100 flex items-center gap-1">
                  <MapPin size={12} className="text-indigo-400" /> Destination Address
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5">{customerName}</p>
              </div>
            </Popup>
          </Marker>

          {/* Provider Live Marker */}
          {validProv && (
            <Marker position={validProv} icon={providerIcon}>
              <Popup>
                <div className="p-1">
                  <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    🚗 Live Service Professional
                  </p>
                  <p className="text-[11px] text-slate-200 mt-0.5 font-medium">{providerName}</p>
                  <p className="text-[10px] text-emerald-400/80 mt-0.5">● Transmitting Real-Time Telemetry</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Dynamic Route Polyline */}
          {showRoute && validCust && validProv && (
            <Polyline
              positions={polylineCoords}
              pathOptions={{
                color: '#6366f1',
                weight: 4,
                opacity: 0.85,
                dashArray: '8, 8'
              }}
            />
          )}
        </MapContainer>
      )}

      {/* Map Legend Overlay for Leaflet mode */}
      {mapEngine === 'leaflet' && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 shadow-xl flex items-center gap-3 text-xs font-medium text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
            <span>Your Location</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
            <span>Technician (Live)</span>
          </div>
        </div>
      )}
    </div>
  );
}
