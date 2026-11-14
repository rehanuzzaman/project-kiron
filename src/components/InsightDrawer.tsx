'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  X, 
  MapPin, 
  Sprout, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  Microscope, 
  HelpCircle, 
  ExternalLink,
  Droplets,
  Layers,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { FieldPin, ZoneFeatureProperties, TimelineStep, RadarFrequency, RadarPolarization } from '@/types/nisar';

interface InsightDrawerProps {
  selectedPin: FieldPin | null;
  onClosePin: () => void;
  selectedZone: ZoneFeatureProperties | null;
  onCloseZone: () => void;
  currentStep: TimelineStep;
  frequency: RadarFrequency;
  polarization: RadarPolarization;
}

export const InsightDrawer: React.FC<InsightDrawerProps> = ({
  selectedPin,
  onClosePin,
  selectedZone,
  onCloseZone,
  currentStep,
  frequency,
  polarization,
}) => {
  const [activeTab, setActiveTab] = useState<'advisory' | 'science' | 'policymaker'>('advisory');
  const [imageError, setImageError] = useState<boolean>(false);

  // If neither pin nor zone is selected, don't render drawer
  if (!selectedPin && !selectedZone) return null;

  const handleClose = () => {
    if (selectedPin) onClosePin();
    if (selectedZone) onCloseZone();
    setImageError(false);
  };

  // 1. PIN DETAILS VIEW
  if (selectedPin) {
    const isUrgent = selectedPin.farmer_advisory.urgency === 'HIGH';

    return (
      <aside 
        aria-label="Ground-Truth Field Observation"
        className="fixed top-16 bottom-20 right-0 sm:right-4 z-40 w-full sm:w-[460px] max-h-[calc(100vh-9rem)] overflow-y-auto glass-panel rounded-2xl border border-radar-primary/30 p-5 shadow-2xl space-y-4 animate-fade-in"
      >
        {/* Drawer Header */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-radar-glow uppercase tracking-wider mb-0.5">
              <MapPin className="w-3.5 h-3.5" /> Ground-Truth Field Station
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {selectedPin.name}
            </h2>
            <p className="text-xs text-slate-400">
              {selectedPin.village} &bull; {selectedPin.upazila}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg bg-space-800 hover:bg-space-700 text-slate-400 hover:text-white transition-colors border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ground-Truth Photograph with Graceful Fallback */}
        <div className="relative w-full h-48 rounded-xl overflow-hidden bg-space-950 border border-white/10 shadow-inner group">
          {!imageError ? (
            <img
              src={selectedPin.photo_url}
              alt={selectedPin.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full p-4 text-center space-y-2 bg-space-900">
              <Layers className="w-8 h-8 text-radar-glow" />
              <p className="text-xs text-slate-300 font-semibold">{selectedPin.name}</p>
              <p className="text-[10px] text-slate-500 font-mono">
                Lat {selectedPin.coordinates[1]}°, Lon {selectedPin.coordinates[0]}°
              </p>
            </div>
          )}

          {/* Photo caption badge */}
          <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-space-950 via-space-950/80 to-transparent text-[11px] text-slate-200">
            {selectedPin.photo_caption}
          </div>

          {/* Urgency Pill */}
          <div className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border shadow-lg ${
            isUrgent 
              ? 'bg-red-500/80 border-red-400 text-white animate-pulse'
              : 'bg-emerald-500/80 border-emerald-400 text-white'
          }`}>
            {selectedPin.farmer_advisory.urgency}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-space-800/80 border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('advisory')}
            className={`py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
              activeTab === 'advisory'
                ? 'bg-radar-primary text-white shadow-md shadow-radar-primary/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Farmer Advisory
          </button>
          <button
            onClick={() => setActiveTab('science')}
            className={`py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
              activeTab === 'science'
                ? 'bg-radar-primary text-white shadow-md shadow-radar-primary/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            NISAR Science
          </button>
          <button
            onClick={() => setActiveTab('policymaker')}
            className={`py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
              activeTab === 'policymaker'
                ? 'bg-radar-primary text-white shadow-md shadow-radar-primary/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            BWDB Policy
          </button>
        </div>

        {/* Tab 1: Farmer Field Advisory */}
        {activeTab === 'advisory' && (
          <div className="space-y-3 animate-fade-in text-xs">
            {/* Primary Action Card */}
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <Sprout className="w-4 h-4" />
                <span>Immediate Field Action</span>
              </div>
              <p className="text-slate-200 leading-relaxed">
                {selectedPin.farmer_advisory.primary_action}
              </p>
            </div>

            {/* Seed Recommendation */}
            <div className="p-3.5 rounded-xl bg-space-800/80 border border-white/10 space-y-1.5">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-amber-400" />
                <span>Saline-Tolerant Rice & Crop Selection</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {selectedPin.farmer_advisory.seed_recommendation}
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-slate-400">
                <span className="px-1.5 py-0.5 rounded bg-space-900 border border-white/10">BRRI dhan67</span>
                <span className="px-1.5 py-0.5 rounded bg-space-900 border border-white/10">BINA dhan-10</span>
                <span className="px-1.5 py-0.5 rounded bg-space-900 border border-white/10">Gypsum 120kg/ha</span>
              </div>
            </div>

            {/* Long-Term Strategy */}
            <div className="p-3 rounded-xl bg-space-800/50 border border-white/5 space-y-1 text-slate-300">
              <span className="font-semibold text-slate-400 text-[11px]">Resilience Strategy:</span>
              <p className="text-[11px] leading-relaxed">
                {selectedPin.farmer_advisory.long_term_strategy}
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Scientific Hypothesis */}
        {activeTab === 'science' && (
          <div className="space-y-3 animate-fade-in text-xs">
            <div className="p-3.5 rounded-xl bg-radar-dark/40 border border-radar-primary/30 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-radar-glow">
                <Microscope className="w-4 h-4" />
                <span>Scientific Hypothesis</span>
              </div>
              <h4 className="font-bold text-white text-sm">
                {selectedPin.scientific_hypothesis.title}
              </h4>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {selectedPin.scientific_hypothesis.radar_explanation}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-space-800/80 border border-cyan-400/20 space-y-1">
              <span className="text-[11px] font-mono font-bold text-cyan-300">
                Dielectric Permittivity Shift:
              </span>
              <p className="text-[11px] text-slate-300">
                {selectedPin.scientific_hypothesis.dielectric_shift}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-space-800/40 border border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Primary Physical Driver:</span>
              <span className="text-radar-glow font-bold font-mono">
                {selectedPin.scientific_hypothesis.physical_driver}
              </span>
            </div>
          </div>
        )}

        {/* Tab 3: Policymaker Bulletin */}
        {activeTab === 'policymaker' && (
          <div className="space-y-3 animate-fade-in text-xs">
            <div className={`p-3.5 rounded-xl border space-y-2 ${
              isUrgent ? 'bg-red-950/40 border-red-500/40' : 'bg-space-800/80 border-white/10'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-red-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>BWDB Embankment Early Warning</span>
                </div>
                <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-red-500/20 text-red-300 border border-red-500/30">
                  {selectedPin.policymaker_bulletin.risk_level}
                </span>
              </div>
              <p className="text-slate-200 leading-relaxed">
                {selectedPin.policymaker_bulletin.structural_advice}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-space-800/60 border border-white/10 space-y-1.5 text-slate-300">
              <span className="font-bold text-white text-[11px]">
                Bangladesh Water Development Board (BWDB) Action Protocol:
              </span>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                <li>Deploy pre-positioned geo-textile sandbags to weak riverbend nodes.</li>
                <li>Activate community sluice gate gatekeepers along Kholpetua river.</li>
                <li>Incorporate Tidal River Management (TRM) silt accumulation basins.</li>
              </ul>
            </div>
          </div>
        )}
      </aside>
    );
  }

  // 2. ZONE DETAILS VIEW (When clicking on a polygon zone)
  if (selectedZone) {
    const currentTemporal = selectedZone.temporal ? selectedZone.temporal[currentStep.id] : null;

    return (
      <aside 
        aria-label="Zone Telemetry Inspector"
        className="fixed top-16 bottom-20 right-0 sm:right-4 z-40 w-full sm:w-[440px] max-h-[calc(100vh-9rem)] overflow-y-auto glass-panel rounded-2xl border border-radar-primary/30 p-5 shadow-2xl space-y-4 animate-fade-in"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10">
          <div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-bold ${
              selectedZone.safe_indicator ? 'bg-mangrove/20 text-mangrove' : 'bg-radar-primary/20 text-radar-glow'
            }`}>
              {selectedZone.category}
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight mt-1">
              {selectedZone.name}
            </h2>
            <p className="text-xs text-slate-400">
              Elevation: {selectedZone.elevation_m}m &bull; Subsidence: {selectedZone.subsidence_mm_yr} mm/yr
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg bg-space-800 hover:bg-space-700 text-slate-400 hover:text-white transition-colors border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Temporal State Banner */}
        <div className="p-3 rounded-xl bg-space-800/80 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Temporal Epoch:</span>
            <span className="text-radar-glow font-bold">{currentStep.date}</span>
          </div>

          {currentTemporal && (
            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-white/10">
              <div className="p-2 rounded-lg bg-space-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400">Backscatter ({frequency} {polarization}):</span>
                <p className="text-base font-bold text-white font-mono">
                  {currentTemporal[frequency === 'L-Band' ? 'L_Band' : 'S_Band'][polarization]} dB
                </p>
              </div>

              <div className="p-2 rounded-lg bg-space-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400">Dielectric Permittivity (&epsilon;<sub>r</sub>):</span>
                <p className="text-base font-bold text-cyan-400 font-mono">
                  {currentTemporal.dielectric_constant}
                </p>
              </div>

              <div className="p-2 rounded-lg bg-space-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400">Soil Salinity:</span>
                <p className="text-sm font-bold text-amber-400 font-mono">
                  {currentTemporal.soil_salinity_ppt} ppt
                </p>
              </div>

              <div className="p-2 rounded-lg bg-space-900/80 border border-white/5">
                <span className="text-[10px] text-slate-400">Surface Roughness (k&sigma;):</span>
                <p className="text-sm font-bold text-emerald-400 font-mono">
                  {currentTemporal.surface_roughness}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Ecological & Soil Profile */}
        <div className="space-y-2 text-xs">
          <h4 className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-radar-glow" /> Ecological & Soil Profile
          </h4>
          <div className="p-3 rounded-xl bg-space-800/50 border border-white/5 space-y-1.5 text-slate-300">
            <div>
              <span className="text-slate-500">Dominant Flora/Cover: </span>
              <span className="text-white font-medium">{selectedZone.dominant_species}</span>
            </div>
            <div>
              <span className="text-slate-500">Soil Classification: </span>
              <span className="text-white font-medium">{selectedZone.soil_type}</span>
            </div>
            <div>
              <span className="text-slate-500">InSAR Inclinometer Subsidence: </span>
              <span className="text-pink-400 font-mono font-bold">{selectedZone.subsidence_mm_yr} mm/year</span>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return null;
};
