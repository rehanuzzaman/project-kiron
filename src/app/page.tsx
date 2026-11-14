'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { SplitMap } from '@/components/SplitMap';
import { RadarControls } from '@/components/RadarControls';
import { SonificationPlayer } from '@/components/SonificationPlayer';
import { InsightDrawer } from '@/components/InsightDrawer';
import { ScienceBriefModal } from '@/components/ScienceBriefModal';
import { 
  RadarFrequency, 
  RadarPolarization, 
  TimelineStep, 
  ZoneFeatureProperties, 
  FieldPin 
} from '@/types/nisar';
import { Radio, Sliders, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

export default function Home() {
  // Application Data States
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(1); // Default to Cyclone Remal step (vivid demonstration)
  const [zonesData, setZonesData] = useState<GeoJSON.FeatureCollection | null>(null);
  const [embankmentsData, setEmbankmentsData] = useState<GeoJSON.FeatureCollection | null>(null);
  const [fieldPins, setFieldPins] = useState<FieldPin[]>([]);

  // Radar Settings
  const [frequency, setFrequency] = useState<RadarFrequency>('L-Band');
  const [polarization, setPolarization] = useState<RadarPolarization>('HH');
  const [showEmbankments, setShowEmbankments] = useState<boolean>(true);
  const [showSubsidence, setShowSubsidence] = useState<boolean>(true);

  // Selection States
  const [selectedZone, setSelectedZone] = useState<ZoneFeatureProperties | null>(null);
  const [selectedPin, setSelectedPin] = useState<FieldPin | null>(null);

  // UI Modals & Sidebars
  const [isScienceBriefOpen, setIsScienceBriefOpen] = useState<boolean>(false);
  const [isControlsExpanded, setIsControlsExpanded] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch JSON and GeoJSON assets on client mount
  useEffect(() => {
    async function loadData() {
      try {
        const [timelineRes, zonesRes, embRes, pinsRes] = await Promise.all([
          fetch('/data/nisar_shyamnagar_timeline.json').then((r) => r.json()),
          fetch('/data/zones.geojson').then((r) => r.json()),
          fetch('/data/embankments.geojson').then((r) => r.json()),
          fetch('/data/field_pins.json').then((r) => r.json()),
        ]);

        if (timelineRes && timelineRes.timeline) {
          setTimeline(timelineRes.timeline);
        }
        setZonesData(zonesRes);
        setEmbankmentsData(embRes);
        setFieldPins(pinsRes);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load NISAR datasets:', err);
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const currentStep = timeline[currentStepIndex] || {
    id: '2024-05-27',
    date: '2024-05-27',
    title: 'Severe Cyclone Remal Inundation',
    season: 'Pre-Monsoon Cyclone',
    cyclone_event: 'Cyclone Remal (Category 1, 115 km/h)',
    description: 'Catastrophic storm surge breaches Polder 5 & 15. Optical satellites blinded by cloud veil; NISAR L-band reveals seawater inundation.',
    inundation_percentage: 58.7,
    mean_dielectric: 64.8,
    mean_l_hh: -23.4,
    mean_s_hh: -21.9,
    embankment_breach_count: 7,
    subsidence_anomaly_rate: -26.5,
    sonification: {
      root_frequency: 110.0,
      chord_type: 'minor_diminished',
      tempo_bpm: 128,
      dissonance: 0.85,
      drone_intensity: 0.95,
    },
  };

  const handleSelectZone = (zone: ZoneFeatureProperties | null) => {
    setSelectedZone(zone);
    if (zone) setSelectedPin(null); // Mutually exclusive focus
  };

  const handleSelectPin = (pin: FieldPin | null) => {
    setSelectedPin(pin);
    if (pin) setSelectedZone(null); // Mutually exclusive focus
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-space-950 text-white space-y-4">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-radar-dark/40 border border-radar-primary/50 shadow-2xl">
          <Radio className="w-8 h-8 text-radar-glow animate-pulse" />
          <div className="absolute inset-0 rounded-2xl border border-radar-primary animate-ping opacity-30" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            PROJECT KIRON
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Acquiring NISAR L-Band & S-Band Radar Aperture &bull; Bengal Delta
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-screen w-screen overflow-hidden bg-space-950 font-sans">
      {/* 1. Header & Live Telemetry Bar */}
      <Header
        currentStep={currentStep}
        frequency={frequency}
        polarization={polarization}
        onOpenInfo={() => setIsScienceBriefOpen(true)}
      />

      {/* 2. Main Geospatial Viewport */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        {/* Full-bleed MapLibre Split-Screen Map */}
        <SplitMap
          currentStep={currentStep}
          frequency={frequency}
          polarization={polarization}
          zonesData={zonesData}
          embankmentsData={embankmentsData}
          fieldPins={fieldPins}
          selectedZone={selectedZone}
          onSelectZone={handleSelectZone}
          selectedPin={selectedPin}
          onSelectPin={handleSelectPin}
          showEmbankments={showEmbankments}
          showSubsidence={showSubsidence}
        />

        {/* Floating Left: Radar Controls Dock */}
        <div className="absolute top-4 left-4 z-30 transition-all duration-300">
          {isControlsExpanded ? (
            <div className="relative">
              <RadarControls
                frequency={frequency}
                onChangeFrequency={setFrequency}
                polarization={polarization}
                onChangePolarization={setPolarization}
                showEmbankments={showEmbankments}
                onToggleEmbankments={() => setShowEmbankments((p) => !p)}
                showSubsidence={showSubsidence}
                onToggleSubsidence={() => setShowSubsidence((p) => !p)}
              />
              {/* Collapse Button */}
              <button
                onClick={() => setIsControlsExpanded(false)}
                className="absolute -top-2.5 -right-2.5 p-1 rounded-full bg-space-900 border border-white/20 text-slate-400 hover:text-white shadow-xl hover:scale-105 transition-transform"
                title="Collapse Radar Panel"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsControlsExpanded(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl glass-panel text-xs text-white border border-radar-primary/30 hover:border-radar-primary shadow-xl hover:scale-105 transition-transform"
              title="Expand Radar Configuration"
            >
              <Sliders className="w-4 h-4 text-radar-glow" />
              <span className="font-bold font-mono">{frequency} / {polarization}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>

        {/* Floating Right: Ground-Truth Field Stories & Farmer Insight Drawer */}
        <InsightDrawer
          selectedPin={selectedPin}
          onClosePin={() => setSelectedPin(null)}
          selectedZone={selectedZone}
          onCloseZone={() => setSelectedZone(null)}
          currentStep={currentStep}
          frequency={frequency}
          polarization={polarization}
        />
      </main>

      {/* 3. Bottom: "Earth's Waltz" Multi-Temporal Sonification Player */}
      {timeline.length > 0 && (
        <SonificationPlayer
          timeline={timeline}
          currentStepIndex={currentStepIndex}
          onSelectStepIndex={setCurrentStepIndex}
          selectedZone={selectedZone}
          frequency={frequency}
          polarization={polarization}
        />
      )}

      {/* 4. Science Brief & Mission Modal */}
      <ScienceBriefModal
        isOpen={isScienceBriefOpen}
        onClose={() => setIsScienceBriefOpen(false)}
      />
    </div>
  );
}
