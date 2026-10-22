import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { BusStop, Language } from '../types';

interface LeafletRouteMapProps {
  stops: BusStop[];
  selectedStopIds?: string[];
  highlightOriginId?: string;
  highlightDestinationId?: string;
  lang: Language;
  height?: string;
}

export const LeafletRouteMap: React.FC<LeafletRouteMapProps> = ({
  stops,
  selectedStopIds,
  highlightOriginId,
  highlightDestinationId,
  lang,
  height = '360px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Filter only verified stops that have coordinates
  const verifiedStops = stops.filter(
    s => s.isVerified && s.latitude !== undefined && s.longitude !== undefined
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center around Kovilpatti - Kalugumalai corridor (approx 9.16, 77.72)
      const map = L.map(mapContainerRef.current, {
        center: [9.165, 77.71],
        zoom: 11,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    const latLngs: [number, number][] = [];

    // Filter relevant stops to display
    const stopsToRender = selectedStopIds && selectedStopIds.length > 0
      ? verifiedStops.filter(s => selectedStopIds.includes(s.id))
      : verifiedStops;

    // Sort if selectedStopIds provided to draw ordered route line
    if (selectedStopIds && selectedStopIds.length > 0) {
      stopsToRender.sort((a, b) => {
        return selectedStopIds.indexOf(a.id) - selectedStopIds.indexOf(b.id);
      });
    }

    stopsToRender.forEach(stop => {
      if (stop.latitude && stop.longitude) {
        const isOrigin = stop.id === highlightOriginId;
        const isDestination = stop.id === highlightDestinationId;

        // Custom clean SVG pin
        let pinColor = '#2563eb'; // blue
        let pinLabel = 'Stop';

        if (isOrigin) {
          pinColor = '#16a34a'; // green
          pinLabel = 'Origin';
        } else if (isDestination) {
          pinColor = '#dc2626'; // red
          pinLabel = 'Destination';
        }

        const iconHtml = `
          <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%);">
            <div style="background-color: ${pinColor}; color: white; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); white-space: nowrap; margin-bottom: 2px; border: 1px solid white;">
              ${pinLabel === 'Stop' ? (lang === 'ta' ? 'நிறுத்தம்' : 'Stop') : (isOrigin ? (lang === 'ta' ? 'புறப்பாடு' : 'Start') : (lang === 'ta' ? 'முடிவு' : 'End'))}
            </div>
            <div style="width: 14px; height: 14px; background-color: ${pinColor}; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'custom-bus-pin',
          html: iconHtml,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        const stopName = lang === 'ta' ? stop.nameTa : stop.nameEn;
        const landmark = lang === 'ta' ? stop.landmarkTa : stop.landmarkEn;

        const marker = L.marker([stop.latitude, stop.longitude], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 13px; min-width: 180px;">
            <div style="font-weight: 700; color: #1e293b; margin-bottom: 4px;">${stopName}</div>
            <div style="color: #64748b; font-size: 11px; margin-bottom: 4px;"><strong>Code:</strong> ${stop.code} | ${stop.district}</div>
            ${landmark ? `<div style="color: #0f766e; font-size: 11px; background: #f0fdf4; padding: 3px 6px; border-radius: 4px;">📍 ${landmark}</div>` : ''}
            <div style="margin-top: 6px; display: inline-block; font-size: 10px; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 3px; font-weight: 600;">
              ✓ Verified Location
            </div>
          </div>
        `);

        markersLayer.addLayer(marker);
        latLngs.push([stop.latitude, stop.longitude]);
      }
    });

    // Draw connecting corridor line if route stops provided
    if (latLngs.length > 1) {
      polylineRef.current = L.polyline(latLngs, {
        color: '#0284c7',
        weight: 4,
        opacity: 0.8,
        dashArray: '6, 6',
      }).addTo(map);

      map.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40] });
    } else if (latLngs.length === 1) {
      map.setView(latLngs[0], 13);
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [verifiedStops, selectedStopIds, highlightOriginId, highlightDestinationId, lang]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height, minHeight: '260px' }}
        className="z-0"
        role="region"
        aria-label="Verified bus stops map"
      />
      <div className="absolute top-2 right-2 z-[400] bg-white/90 backdrop-blur-xs text-[11px] px-2.5 py-1 rounded shadow text-slate-700 font-medium border border-slate-200 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
        <span>{lang === 'ta' ? 'சரிபார்க்கப்பட்ட நிறுத்தங்கள் மட்டும்' : 'Only Verified Stops Plotted'}</span>
      </div>
    </div>
  );
};
