'use client';

import React, { useState } from 'react';
import { 
  Radio, 
  Satellite, 
  Sliders, 
  Layers, 
  Info, 
  Activity, 
  Waves, 
  HelpCircle,
  Eye,
  ShieldAlert,
  TreeDeciduous,
  Droplet
} from 'lucide-react';
import { RadarFrequency, RadarPolarization } from '@/types/nisar';

interface RadarControlsProps {
  frequency: RadarFrequency;
  onChangeFrequency: (freq: RadarFrequency) => void;
  polarization: RadarPolarization;
  onChangePolarization: (pol: RadarPolarization) => void;
  showEmbankments: boolean;
  onToggleEmbankments: () => void;
  showSubsidence: boolean;
  onToggleSubsidence: () => void;
}

export const RadarControls: React.FC<RadarControlsProps> = ({
  frequency,
  onChangeFrequency,
  polarization,
  onChangePolarization,
  showEmbankments,
  onToggleEmbankments,
  showSubsidence,
  onToggleSubsidence,
}) => {
  const [activeDriverTooltip, setActiveDriverTooltip] = useState<'dielectric' | 'roughness' | null>(null);

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 shadow-2xl space-y-4 max-w-sm w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Satellite className="w-4 h-4 text-radar-glow" />
          <h3 className="text-sm font-bold text-white tracking-wide uppercase">
            Radar Sensor Configuration
          </h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-radar-primary/20 text-radar-glow font-mono">
          NISAR Active
        </span>
      </div>

      {/* 1. Frequency Switcher (L-Band vs S-Band) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            Microwave Frequency Band
          </label>
          <span className="text-[11px] font-mono text-slate-500">
            {frequency === 'L-Band' ? 'NASA 1.25 GHz (~24 cm)' : 'ISRO 3.2 GHz (~9.3 cm)'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-space-800/80 border border-white/10">
          <button
            onClick={() => onChangeFrequency('L-Band')}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              frequency === 'L-Band'
                ? 'bg-radar-primary text-white shadow-lg shadow-radar-primary/30 border border-radar-glow'
                : 'text-slate-400 hover:text-white hover:bg-space-700/50'
            }`}
          >
            <span>L-Band (NASA)</span>
            <span className="text-[10px] font-mono font-normal opacity-80">
              Deep Canopy / Soil Pen.
            </span>
          </button>

          <button
            onClick={() => onChangeFrequency('S-Band')}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              frequency === 'S-Band'
                ? 'bg-radar-primary text-white shadow-lg shadow-radar-primary/30 border border-radar-glow'
                : 'text-slate-400 hover:text-white hover:bg-space-700/50'
            }`}
          >
            <span>S-Band (ISRO)</span>
            <span className="text-[10px] font-mono font-normal opacity-80">
              Surface / Dyke Roughness
            </span>
          </button>
        </div>
      </div>

      {/* 2. Polarimetric Channel Switcher (HH, HV, VV, VH) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-radar-glow" />
            Polarimetric Channels
          </label>
          <span className="text-[11px] font-mono text-radar-glow font-bold">
            {polarization} Channel
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-space-800/80 border border-white/10">
          {(['HH', 'HV', 'VV', 'VH'] as RadarPolarization[]).map((pol) => {
            const isSelected = polarization === pol;
            return (
              <button
                key={pol}
                onClick={() => onChangePolarization(pol)}
                className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all text-center ${
                  isSelected
                    ? 'bg-gradient-to-br from-radar-primary to-radar-dark text-white border border-radar-glow shadow-md shadow-radar-primary/40'
                    : 'text-slate-400 hover:text-white hover:bg-space-700/50'
                }`}
              >
                {pol}
              </button>
            );
          })}
        </div>

        {/* Polarimetric Explanation Hint */}
        <p className="text-[11px] text-slate-400 italic">
          {polarization === 'HH' && 'HH: Horizontal Tx/Rx — High sensitivity to flood specular reflection & trunk-water double-bounce.'}
          {polarization === 'HV' && 'HV: Cross-Pol — Dominant volume scattering from mangrove forest canopy & branch geometry.'}
          {polarization === 'VV' && 'VV: Vertical Tx/Rx — Responds to vertical emergent reeds, paddy stems, and rough water waves.'}
          {polarization === 'VH' && 'VH: Cross-Pol — Complementary volumetric biomass and depolarizing terrain features.'}
        </p>
      </div>

      {/* 3. Physical Drivers Scientific Insight Cards */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            Physical Drivers of Radar Backscatter
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Dielectric Constant Driver */}
          <div 
            onClick={() => setActiveDriverTooltip(activeDriverTooltip === 'dielectric' ? null : 'dielectric')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              activeDriverTooltip === 'dielectric' 
                ? 'bg-cyan-950/40 border-cyan-400/60 shadow-lg' 
                : 'bg-space-800/60 hover:bg-space-800 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300">
              <span className="flex items-center gap-1">
                <Droplet className="w-3 h-3 text-cyan-400" /> Dielectric (&epsilon;<sub>r</sub>)
              </span>
              <HelpCircle className="w-3 h-3 opacity-70" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
              Water (&sim;80) vs Dry Soil (&sim;3-5). High salinity spikes electrical conductivity.
            </p>
          </div>

          {/* Surface Roughness Driver */}
          <div 
            onClick={() => setActiveDriverTooltip(activeDriverTooltip === 'roughness' ? null : 'roughness')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              activeDriverTooltip === 'roughness' 
                ? 'bg-amber-950/40 border-amber-400/60 shadow-lg' 
                : 'bg-space-800/60 hover:bg-space-800 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
              <span className="flex items-center gap-1">
                <Waves className="w-3 h-3 text-amber-400" /> Roughness (k&sigma;)
              </span>
              <HelpCircle className="w-3 h-3 opacity-70" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
              Smooth water mirrors waves away; rough mangrove canopy scatters diffuse energy back.
            </p>
          </div>
        </div>

        {/* Expanded Tooltip Content */}
        {activeDriverTooltip === 'dielectric' && (
          <div className="p-3 rounded-xl bg-cyan-950/70 border border-cyan-400/30 text-xs space-y-1.5 animate-fade-in">
            <div className="font-bold text-cyan-300 flex items-center justify-between">
              <span>Dielectric Permittivity (&epsilon; = &epsilon;&apos; - j&epsilon;&apos;&apos;)</span>
              <span className="font-mono text-[10px] text-cyan-200">Saline Surge Driver</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              When seawater breaches an embankment, the soil dielectric constant leaps from 15 to &gt;65. The imaginary component &epsilon;&apos;&apos; (dielectric loss) scales directly with dissolved NaCl salinity (ppt), allowing NISAR to differentiate freshwater monsoon floods from saline storm surges.
            </p>
          </div>
        )}

        {activeDriverTooltip === 'roughness' && (
          <div className="p-3 rounded-xl bg-amber-950/70 border border-amber-400/30 text-xs space-y-1.5 animate-fade-in">
            <div className="font-bold text-amber-300 flex items-center justify-between">
              <span>Surface Roughness Parameter (k&sigma;)</span>
              <span className="font-mono text-[10px] text-amber-200">Rayleigh Criterion</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Calculated as wavenumber k multiplied by root-mean-square height &sigma;. A surface appears smooth to L-band (24 cm) when roughness is under 2 cm, causing specular reflection. The shorter S-band (9.3 cm) registers subtle embankment cracks and tidal mud flat ripples.
            </p>
          </div>
        )}
      </div>

      {/* 4. Layer Visibility Toggles */}
      <div className="space-y-1.5 pt-2 border-t border-white/10">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-radar-glow" />
          Map Overlays & InSAR Risk
        </label>

        <div className="space-y-1">
          {/* Embankments Toggle */}
          <button
            onClick={onToggleEmbankments}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
              showEmbankments 
                ? 'bg-space-800 text-white border border-white/20' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <ShieldAlert className={`w-3.5 h-3.5 ${showEmbankments ? 'text-red-400' : 'text-slate-500'}`} />
              <span>Coastal Embankments & Breaches</span>
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${showEmbankments ? 'bg-red-500/20 text-red-300' : 'text-slate-600'}`}>
              {showEmbankments ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Subsidence Toggle */}
          <button
            onClick={onToggleSubsidence}
            className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
              showSubsidence 
                ? 'bg-space-800 text-white border border-white/20' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Activity className={`w-3.5 h-3.5 ${showSubsidence ? 'text-pink-400' : 'text-slate-500'}`} />
              <span>InSAR Land Subsidence Rates</span>
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${showSubsidence ? 'bg-pink-500/20 text-pink-300' : 'text-slate-600'}`}>
              {showSubsidence ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
