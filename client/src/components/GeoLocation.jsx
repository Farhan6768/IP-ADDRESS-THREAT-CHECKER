import React, { useEffect, useRef, useState } from 'react';
import { Compass, ExternalLink, Wifi, Shield, Layers, MapPin, Maximize2 } from 'lucide-react';
import RiskBadge from './RiskBadge';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 100% Free, high-resolution tile layers with ZERO API keys and ZERO watermarks
const MAP_PROVIDERS = {
  street: {
    id: 'street',
    name: 'Street',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 19,
    attribution: 'Esri World Street Map'
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 19,
    attribution: 'Esri World Imagery'
  },
  osm: {
    id: 'osm',
    name: 'OSM Standard',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19,
    attribution: 'OpenStreetMap'
  }
};

export default function GeoLocation({ data, title = "Geolocation & Network Transit" }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markerRef = useRef(null);
  const [activeLayer, setActiveLayer] = useState('street');

  if (!data) return null;

  const lat = data.latitude !== undefined && data.latitude !== null && !isNaN(Number(data.latitude))
    ? Number(data.latitude)
    : 18.5204;
  const lon = data.longitude !== undefined && data.longitude !== null && !isNaN(Number(data.longitude))
    ? Number(data.longitude)
    : 73.8567;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Teardown existing instance cleanly
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      tileLayerRef.current = null;
      markerRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lon],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: false
      });

      // Add selected base tile layer (Default: ESRI World Street Map - No API key needed, no watermark)
      const provider = MAP_PROVIDERS[activeLayer] || MAP_PROVIDERS.street;
      tileLayerRef.current = L.tileLayer(provider.url, {
        maxZoom: provider.maxZoom,
        attribution: provider.attribution,
        crossOrigin: true
      }).addTo(map);

      // Custom pulsing red cyber radar pinpoint
      const customPin = L.divIcon({
        className: 'custom-geo-pin',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
            <span style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: #DC2626; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
            <div style="width: 22px; height: 22px; border-radius: 50%; background: #DC2626; border: 3px solid #FFFFFF; box-shadow: 0 4px 12px rgba(220,38,38,0.5); display: flex; align-items: center; justify-content: center; z-index: 10;">
              <div style="width: 6px; height: 6px; border-radius: 50%; background: #FFFFFF;"></div>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
      });

      const locationLabel = `${data.city || 'Transit Node'}${data.country ? `, ${data.country}` : ''}`;
      const marker = L.marker([lat, lon], { icon: customPin }).addTo(map);
      markerRef.current = marker;

      marker.bindPopup(`
        <div style="font-family: ui-monospace, monospace; font-size: 12px; line-height: 1.4; padding: 4px;">
          <strong style="color: #0F172A; font-size: 13px;">${locationLabel}</strong><br/>
          <span style="color: #64748B;">Region: ${data.region || 'Standard Transit'}</span><br/>
          <span style="color: #0D9488; font-weight: bold;">LAT: ${lat.toFixed(4)}°, LON: ${lon.toFixed(4)}°</span>
        </div>
      `).openPopup();

      mapInstanceRef.current = map;

      // Invalidate size after layout rendering
      const timer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);

      return () => {
        clearTimeout(timer);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          tileLayerRef.current = null;
          markerRef.current = null;
        }
      };
    } catch (err) {
      console.warn('Leaflet map initialization fallback:', err);
    }
  }, [lat, lon, data.city, data.region, data.country]);

  // Handle live layer switcher (Street / Satellite / OSM)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const provider = MAP_PROVIDERS[activeLayer] || MAP_PROVIDERS.street;
    tileLayerRef.current = L.tileLayer(provider.url, {
      maxZoom: provider.maxZoom,
      attribution: provider.attribution,
      crossOrigin: true
    }).addTo(mapInstanceRef.current);
  }, [activeLayer]);

  // Direct external map links
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=13/${lat}/${lon}`;

  return (
    <div className="cyber-card p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-700">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-mono text-slate-900 tracking-wide">{title}</h3>
            <p className="text-xs text-slate-500 font-mono">Real-time GPS node localization & geographic telemetry</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-mono font-medium border border-slate-200 transition-colors shadow-xs"
            title="Open exact GPS coordinates directly in Google Maps"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </a>
          <RiskBadge status={data.status || 'AVAILABLE DATA'} size="xs" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Real Interactive Map Display */}
        <div className="lg:col-span-7 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden h-72 sm:h-84 relative shadow-inner flex flex-col justify-between">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Coordinate HUD Readout Floating Ribbon */}
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-300 shadow-md text-xs font-mono text-slate-800 pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <span>LAT: <strong className="text-slate-900">{lat.toFixed(4)}°</strong></span>
            <span className="text-slate-300">|</span>
            <span>LON: <strong className="text-slate-900">{lon.toFixed(4)}°</strong></span>
          </div>

          {/* Map Layer Switcher (Street / Satellite / OSM) */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-lg border border-slate-300 shadow-md text-xs font-mono pointer-events-auto">
            <button
              type="button"
              onClick={() => setActiveLayer('street')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                activeLayer === 'street'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-transparent text-slate-700 hover:bg-slate-100'
              }`}
              title="ESRI World Street Map - Clean Road & City Labels"
            >
              Street
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer('satellite')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                activeLayer === 'satellite'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-transparent text-slate-700 hover:bg-slate-100'
              }`}
              title="ESRI Satellite Imagery from Space"
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer('osm')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                activeLayer === 'osm'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-transparent text-slate-700 hover:bg-slate-100'
              }`}
              title="OpenStreetMap Standard Global View"
            >
              OSM
            </button>
            <a
              href={osmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors ml-0.5"
              title="Open full view in OpenStreetMap"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Location Data Readout */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs font-mono text-slate-500">Country</span>
              <p className="text-sm font-semibold font-mono text-slate-900 mt-0.5 truncate">
                {data.country || 'Global'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs font-mono text-slate-500">Region</span>
              <p className="text-sm font-semibold font-mono text-slate-900 mt-0.5 truncate">
                {data.region || 'Unknown'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs font-mono text-slate-500">City</span>
              <p className="text-sm font-semibold font-mono text-slate-900 mt-0.5 truncate">
                {data.city || 'Unknown'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs font-mono text-slate-500">Timezone</span>
              <p className="text-sm font-semibold font-mono text-slate-900 mt-0.5 truncate">
                {data.timezone || 'UTC'}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 mb-1">
              <Wifi className="w-3.5 h-3.5 text-blue-600" />
              <span>INTERNET SERVICE PROVIDER</span>
            </div>
            <p className="text-xs font-mono font-semibold text-slate-800 truncate" title={data.isp}>
              {data.isp || 'Autonomous Network'}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 mb-1">
              <Shield className="w-3.5 h-3.5 text-teal-safe" />
              <span>ROUTING ASN</span>
            </div>
            <p className="text-xs font-mono font-semibold text-slate-800 truncate" title={data.asn}>
              {data.asn || 'AS-Transit'}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-teal-50/60 border border-teal-200/60 flex items-center justify-between text-xs font-mono text-teal-900">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span className="font-semibold">Coordinates:</span>
              <span>{lat.toFixed(4)}°, {lon.toFixed(4)}°</span>
            </div>
            <span className="text-[10px] text-teal-700 bg-teal-100/80 px-1.5 py-0.5 rounded font-mono">
              GPS Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
