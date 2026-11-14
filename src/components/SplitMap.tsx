'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  CloudRain, 
  Satellite, 
  SlidersHorizontal, 
  Layers, 
  MapPin, 
  ShieldAlert, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Eye,
  EyeOff,
  Flame,
  Info
} from 'lucide-react';
import { 
  RadarFrequency, 
  RadarPolarization, 
  TimelineStep, 
  ZoneFeatureProperties, 
  EmbankmentFeatureProperties, 
  FieldPin 
} from '@/types/nisar';

interface SplitMapProps {
  currentStep: TimelineStep;
  frequency: RadarFrequency;
  polarization: RadarPolarization;
  zonesData: GeoJSON.FeatureCollection | null;
  embankmentsData: GeoJSON.FeatureCollection | null;
  fieldPins: FieldPin[];
  selectedZone: ZoneFeatureProperties | null;
  onSelectZone: (zone: ZoneFeatureProperties | null) => void;
  selectedPin: FieldPin | null;
  onSelectPin: (pin: FieldPin | null) => void;
  showEmbankments: boolean;
  showSubsidence: boolean;
}

export const SplitMap: React.FC<SplitMapProps> = ({
  currentStep,
  frequency,
  polarization,
  zonesData,
  embankmentsData,
  fieldPins,
  selectedZone,
  onSelectZone,
  selectedPin,
  onSelectPin,
  showEmbankments,
  showSubsidence,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  
  // Split Slider state (0 to 100 percent)
  const [splitPos, setSplitPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerWidthRef = useRef<number>(1000);

  // Hover state
  const [hoveredZone, setHoveredZone] = useState<{
    properties: ZoneFeatureProperties;
    x: number;
    y: number;
  } | null>(null);

  // Map Loaded state
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Optical cloud veil opacity
  const isCyclone = Boolean(currentStep.cyclone_event);
  const cloudOpacity = isCyclone ? 0.94 : 0.72;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [89.16, 22.30], // Centered between Shyamnagar and Sundarbans
      zoom: 10.8,
      minZoom: 8,
      maxZoom: 16,
      attributionControl: false,
    });

    map.on('load', () => {
      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Layers when map is loaded, or when step/frequency/polarization changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !zonesData) return;

    // Add or update Zones source
    const zoneSourceId = 'nisar-zones-source';
    const zoneSource = map.getSource(zoneSourceId) as maplibregl.GeoJSONSource;

    if (!zoneSource) {
      map.addSource(zoneSourceId, {
        type: 'geojson',
        data: zonesData,
      });

      // Layer 1: Zone Fill (Colorized by Radar Backscatter / Inundation)
      map.addLayer({
        id: 'nisar-zones-fill',
        type: 'fill',
        source: zoneSourceId,
        paint: {
          'fill-color': [
            'case',
            ['get', 'safe_indicator'],
            '#32CD32', // Safe Mangrove green
            '#8C52FF', // Inundated radar purple
          ],
          'fill-opacity': 0.62,
        },
      });

      // Layer 2: Zone Stroke
      map.addLayer({
        id: 'nisar-zones-stroke',
        type: 'line',
        source: zoneSourceId,
        paint: {
          'line-color': [
            'case',
            ['get', 'safe_indicator'],
            '#4ADE80',
            '#A876FF',
          ],
          'line-width': 2,
          'line-opacity': 0.9,
        },
      });

      // Hover and Click events for Zones
      map.on('mousemove', 'nisar-zones-fill', (e) => {
        if (!e.features || !e.features[0]) return;
        map.getCanvas().style.cursor = 'pointer';
        
        try {
          const featProps = e.features[0].properties;
          // Parse temporal JSON string if needed
          const parsedProps = {
            ...featProps,
            temporal: typeof featProps.temporal === 'string' ? JSON.parse(featProps.temporal) : featProps.temporal,
          } as ZoneFeatureProperties;

          setHoveredZone({
            properties: parsedProps,
            x: e.point.x,
            y: e.point.y,
          });
        } catch (err) {
          console.error(err);
        }
      });

      map.on('mouseleave', 'nisar-zones-fill', () => {
        map.getCanvas().style.cursor = '';
        setHoveredZone(null);
      });

      map.on('click', 'nisar-zones-fill', (e) => {
        if (!e.features || !e.features[0]) return;
        try {
          const featProps = e.features[0].properties;
          const parsedProps = {
            ...featProps,
            temporal: typeof featProps.temporal === 'string' ? JSON.parse(featProps.temporal) : featProps.temporal,
          } as ZoneFeatureProperties;

          onSelectZone(parsedProps);
        } catch (err) {
          console.error(err);
        }
      });
    } else {
      zoneSource.setData(zonesData);
    }

    // Dynamic layer styling based on current step
    if (map.getLayer('nisar-zones-fill')) {
      const isSevereFlood = currentStep.inundation_percentage > 40;
      map.setPaintProperty('nisar-zones-fill', 'fill-opacity', isSevereFlood ? 0.72 : 0.58);
    }
  }, [mapLoaded, zonesData, currentStep, frequency, polarization, onSelectZone]);

  // Embankments Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !embankmentsData) return;

    const embSourceId = 'nisar-embankments-source';
    const embSource = map.getSource(embSourceId) as maplibregl.GeoJSONSource;

    if (!embSource) {
      map.addSource(embSourceId, {
        type: 'geojson',
        data: embankmentsData,
      });

      map.addLayer({
        id: 'nisar-embankments-casing',
        type: 'line',
        source: embSourceId,
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
          visibility: showEmbankments ? 'visible' : 'none',
        },
        paint: {
          'line-color': '#0B0F19',
          'line-width': 6,
          'line-opacity': 0.8,
        },
      });

      map.addLayer({
        id: 'nisar-embankments-line',
        type: 'line',
        source: embSourceId,
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
          visibility: showEmbankments ? 'visible' : 'none',
        },
        paint: {
          'line-color': [
            'case',
            ['==', ['get', 'bwdb_status'], 'CRITICAL_RISK'],
            '#EF4444', // Red breach
            ['==', ['get', 'bwdb_status'], 'EXTREME_SUBSIDENCE_RISK'],
            '#F59E0B', // Amber warning
            '#32CD32', // Safe green
          ],
          'line-width': 3.5,
          'line-dasharray': [2, 1],
        },
      });
    } else {
      embSource.setData(embankmentsData);
      if (map.getLayer('nisar-embankments-line') && map.getLayer('nisar-embankments-casing')) {
        map.setLayoutProperty('nisar-embankments-line', 'visibility', showEmbankments ? 'visible' : 'none');
        map.setLayoutProperty('nisar-embankments-casing', 'visibility', showEmbankments ? 'visible' : 'none');
      }
    }
  }, [mapLoaded, embankmentsData, showEmbankments]);

  // Field Pins Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Remove existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    fieldPins.forEach((pin) => {
      const isSelected = selectedPin?.id === pin.id;

      // Custom marker DOM element
      const el = document.createElement('div');
      el.className = 'group relative cursor-pointer';
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full ${isSelected ? 'bg-radar-primary animate-ping' : 'bg-radar-primary/30 group-hover:scale-125'} transition-all"></div>
          <div class="relative w-6 h-6 rounded-full flex items-center justify-center ${
            pin.farmer_advisory.urgency === 'HIGH' ? 'bg-alert-breach shadow-red-500/50' : 'bg-radar-primary shadow-radar-primary/50'
          } border-2 border-white shadow-lg text-white font-bold text-[10px]">
            ${pin.name.includes('Sundarbans') ? '🌲' : pin.name.includes('Breach') ? '⚠️' : '📍'}
          </div>
          <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-md bg-space-950/95 border border-white/20 text-white text-[11px] font-sans font-medium pointer-events-none z-50 shadow-xl">
            ${pin.name}
          </div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectPin(pin);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(pin.coordinates)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [mapLoaded, fieldPins, selectedPin, onSelectPin]);

  // Handle Dragging Split Slider
  const handleMouseDown = () => setIsDragging(true);
  const handleTouchStart = () => setIsDragging(true);

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSplitPos(pct);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Map Controls
  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleResetView = () => {
    mapRef.current?.flyTo({
      center: [89.16, 22.30],
      zoom: 10.8,
      bearing: 0,
      pitch: 0,
      duration: 1200,
    });
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-space-950">
      {/* 1. Underlying MapLibre GL Map (Renders NISAR False-Color Radar) */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* 2. Simulated Optical Cloud-Covered Layer (Clipped to the Left Side of the Split Slider) */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10"
        style={{
          clipPath: `polygon(0 0, ${splitPos}% 0, ${splitPos}% 100%, 0 100%)`,
        }}
      >
        {/* Optical Satellite Ground Tint */}
        <div className="absolute inset-0 bg-[#0d2218]/40 mix-blend-multiply" />

        {/* Swirling Cyclone & Monsoon Cloud Simulation */}
        <div 
          className="absolute inset-0"
          style={{
            opacity: cloudOpacity,
            backgroundImage: `
              radial-gradient(circle at 35% 45%, rgba(255, 255, 255, 0.95) 0%, rgba(230, 240, 255, 0.75) 40%, rgba(200, 220, 240, 0.35) 75%, transparent 100%),
              radial-gradient(circle at 65% 30%, rgba(255, 255, 255, 0.85) 0%, rgba(215, 230, 250, 0.55) 35%, transparent 70%),
              linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(200, 220, 245, 0.2) 100%)
            `,
            filter: 'blur(10px) contrast(140%)',
          }}
        />

        {/* Cyclone Eye / Wind Swirl Graphics */}
        {isCyclone && (
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border-[18px] border-white/40 border-dashed animate-spin [animation-duration:35s] blur-md pointer-events-none" />
        )}
      </div>

      {/* 3. Draggable Comparison Split Slider Divider */}
      <div 
        className="absolute top-0 bottom-0 z-20 w-1 flex items-center justify-center cursor-ew-resize group"
        style={{ left: `${splitPos}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Vertical Glowing Line */}
        <div className="w-0.5 h-full bg-gradient-to-b from-radar-primary via-white to-radar-primary shadow-[0_0_12px_#8C52FF]" />

        {/* Circular Grab Handle */}
        <div className="absolute flex items-center justify-center w-8 h-8 rounded-full bg-space-900 border-2 border-radar-primary text-radar-glow shadow-xl shadow-radar-primary/40 group-hover:scale-110 transition-transform">
          <SlidersHorizontal className="w-4 h-4 rotate-90" />
        </div>

        {/* Split Indicators Badge */}
        <div className="absolute top-4 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
          <span className="px-2 py-0.5 rounded-l-md bg-space-950/90 text-[10px] font-mono text-slate-400 border border-white/10 uppercase shadow-lg">
            Optical (Clouded)
          </span>
          <span className="px-2 py-0.5 rounded-r-md bg-radar-dark/90 text-[10px] font-mono text-radar-glow border border-radar-primary/30 uppercase shadow-lg">
            NISAR Radar
          </span>
        </div>
      </div>

      {/* 4. Map Overlay Viewport Pills */}
      {/* Top Left: Optical View Explanation */}
      <div className="absolute top-4 left-4 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl glass-panel text-xs text-slate-300">
        <CloudRain className="w-4 h-4 text-cyan-400" />
        <div>
          <span className="font-semibold text-white">Left: Optical Satellite</span>
          <p className="text-[10px] text-slate-400">Blinded by {isCyclone ? 'Cyclone Clouds' : 'Monsoon Veil'}</p>
        </div>
      </div>

      {/* Top Right: NISAR Radar Explanation */}
      <div className="absolute top-4 right-16 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl glass-panel text-xs text-slate-300 border-radar-primary/30">
        <Satellite className="w-4 h-4 text-radar-glow" />
        <div>
          <span className="font-semibold text-white">Right: Cloud-Piercing NISAR</span>
          <p className="text-[10px] text-radar-glow font-mono">
            {frequency} &bull; {polarization} Polarized
          </p>
        </div>
      </div>

      {/* 5. Navigation Control Buttons (Floating Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-xl glass-panel hover:bg-space-800 text-slate-300 hover:text-white transition-colors border border-white/10"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-xl glass-panel hover:bg-space-800 text-slate-300 hover:text-white transition-colors border border-white/10"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          className="p-2 rounded-xl glass-panel hover:bg-space-800 text-slate-300 hover:text-white transition-colors border border-white/10"
          title="Reset Camera to Shyamnagar / Sundarbans"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 6. Radar Legend Pill (Floating Bottom Left) */}
      <div className="absolute bottom-6 left-4 z-20 glass-panel px-3 py-2 rounded-xl text-xs space-y-1.5 border border-white/10 shadow-2xl max-w-xs">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 pb-1 border-b border-white/10">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-radar-primary animate-pulse" />
            False-Color Radar Key
          </span>
          <span className="font-mono text-slate-500 text-[10px]">{frequency}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#8C52FF] shadow-sm shadow-radar-primary" />
            <span className="text-slate-200">Flooded / Saline</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#32CD32] shadow-sm shadow-mangrove" />
            <span className="text-slate-200">Mangrove Forest</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-sm bg-[#EF4444]" />
            <span className="text-slate-200">Breached Dyke</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#EC4899]" />
            <span className="text-slate-200">Subsiding Land</span>
          </div>
        </div>
      </div>

      {/* 7. Interactive Hover Tooltip */}
      {hoveredZone && (
        <div 
          className="absolute z-30 pointer-events-none glass-card p-3 rounded-xl border border-radar-primary/40 text-xs space-y-1 shadow-2xl -translate-x-1/2 -translate-y-full mb-3 animate-fade-in"
          style={{ left: hoveredZone.x, top: hoveredZone.y }}
        >
          <div className="font-bold text-white flex items-center justify-between gap-4">
            <span>{hoveredZone.properties.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              hoveredZone.properties.safe_indicator ? 'bg-mangrove/20 text-mangrove' : 'bg-radar-primary/20 text-radar-glow'
            }`}>
              {hoveredZone.properties.category}
            </span>
          </div>
          {hoveredZone.properties.temporal && hoveredZone.properties.temporal[currentStep.id] && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-slate-300 font-mono pt-1 border-t border-white/10">
              <div>
                <span className="text-slate-500">Backscatter &sigma;<sup>0</sup>: </span>
                <span className="text-white font-bold">
                  {hoveredZone.properties.temporal[currentStep.id][frequency === 'L-Band' ? 'L_Band' : 'S_Band'][polarization]} dB
                </span>
              </div>
              <div>
                <span className="text-slate-500">Dielectric &epsilon;<sub>r</sub>: </span>
                <span className="text-cyan-400 font-bold">
                  {hoveredZone.properties.temporal[currentStep.id].dielectric_constant}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Salinity: </span>
                <span className="text-amber-400">
                  {hoveredZone.properties.temporal[currentStep.id].soil_salinity_ppt} ppt
                </span>
              </div>
              <div>
                <span className="text-slate-500">Subsidence: </span>
                <span className="text-pink-400">
                  {hoveredZone.properties.subsidence_mm_yr} mm/yr
                </span>
              </div>
            </div>
          )}
          <div className="text-[10px] text-slate-400 italic pt-1">
            Click to inspect ground-truth telemetry
          </div>
        </div>
      )}
    </div>
  );
};
