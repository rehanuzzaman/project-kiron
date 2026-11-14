'use client';

import React, { useState } from 'react';
import { 
  Radio, 
  Satellite, 
  Waves, 
  ShieldAlert, 
  Info, 
  ExternalLink, 
  Globe2,
  Sparkles,
  Layers,
  ChevronRight,
  X
} from 'lucide-react';
import { TimelineStep } from '@/types/nisar';

interface HeaderProps {
  currentStep: TimelineStep;
  frequency: string;
  polarization: string;
  onOpenInfo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  frequency,
  polarization,
  onOpenInfo,
}) => {
  const [showTelemetryDetails, setShowTelemetryDetails] = useState(false);

  return (
    <header className="relative z-30 w-full glass-panel border-b border-white/10 px-4 py-2.5 sm:px-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Brand & Mission Badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-radar-dark/60 border border-radar-primary/40 shadow-lg shadow-radar-primary/20">
              <Radio className="w-5 h-5 text-radar-glow animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-mangrove glow-mangrove animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  PROJECT KIRON
                  <span className="text-xs px-2 py-0.5 rounded-full bg-radar-primary/20 text-radar-glow font-mono font-medium border border-radar-primary/30">
                    2026
                  </span>
                </h1>
                <span className="hidden sm:inline-block text-xs text-slate-500 font-mono">
                  v1.0-nisar
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Team Bengal Orbit</span>
                <span>&bull;</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Earth&apos;s Endless Dance
                </span>
                <span className="hidden md:inline">&bull;</span>
                <span className="hidden md:inline text-slate-400">NASA Space Apps Challenge</span>
              </div>
            </div>
          </div>

          {/* Mobile Info Toggle */}
          <button
            onClick={onOpenInfo}
            className="lg:hidden p-2 rounded-lg bg-space-800 text-slate-300 hover:text-white border border-white/10"
            title="Scientific Mission Briefing"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Real-Time Geospatial Telemetry HUD */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-xs">
          {/* Target Coordinates */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-space-800/80 border border-white/10 text-slate-300 font-mono">
            <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>22.33° N, 89.10° E</span>
            <span className="text-slate-500 hidden sm:inline">(Shyamnagar & Sundarbans)</span>
          </div>

          {/* Sensor Mode Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-radar-primary/10 border border-radar-primary/30 text-radar-glow font-mono">
            <Satellite className="w-3.5 h-3.5" />
            <span className="font-bold">{frequency}</span>
            <span className="text-slate-400">/</span>
            <span className="font-bold text-white">{polarization}</span>
          </div>

          {/* Inundation Telemetry Pill */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono transition-colors ${
            currentStep.inundation_percentage > 40 
              ? 'bg-radar-primary/20 border-radar-primary text-radar-glow animate-pulse'
              : 'bg-space-800/80 border-white/10 text-slate-300'
          }`}>
            <Waves className="w-3.5 h-3.5 text-radar-glow" />
            <span>Flood:</span>
            <span className="font-bold text-white">{currentStep.inundation_percentage}%</span>
          </div>

          {/* Breaches Telemetry */}
          {currentStep.embankment_breach_count > 0 ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 font-mono">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-bounce" />
              <span>Breaches:</span>
              <span className="font-bold text-white">{currentStep.embankment_breach_count}</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-mangrove-subtle border border-mangrove/30 text-mangrove-glow font-mono">
              <span className="w-2 h-2 rounded-full bg-mangrove" />
              <span>Dykes Intact</span>
            </div>
          )}

          {/* Mission Briefing Button */}
          <button
            onClick={onOpenInfo}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-space-800 hover:bg-space-700 text-slate-200 hover:text-white border border-white/10 transition-all shadow-sm"
          >
            <Info className="w-3.5 h-3.5 text-radar-glow" />
            <span>Science Brief</span>
          </button>
        </div>
      </div>
    </header>
  );
};
