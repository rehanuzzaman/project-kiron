'use client';

import React from 'react';
import { X, Satellite, Layers, Waves, Activity, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';

interface ScienceBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScienceBriefModal: React.FC<ScienceBriefModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-4xl max-h-[88vh] overflow-y-auto glass-panel rounded-2xl border border-radar-primary/30 p-6 sm:p-8 space-y-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-radar-glow uppercase tracking-wider mb-1">
              <Satellite className="w-4 h-4" /> NASA Space Apps Challenge 2026 &bull; Earth&apos;s Endless Dance
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Project Kiron: Scientific Mission Briefing
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Developed by <strong className="text-white">Team Bengal Orbit</strong> for coastal climate resilience across Shyamnagar, Satkhira & the Sundarbans Mangrove Delta (22.33° N, 89.10° E).
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-space-800 hover:bg-space-700 text-slate-400 hover:text-white transition-colors border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Cloud-Piercing SAR Physics */}
          <div className="glass-card p-5 rounded-xl border border-radar-primary/20 space-y-2.5">
            <div className="flex items-center gap-2 text-radar-glow font-bold text-sm">
              <Satellite className="w-4 h-4" />
              <span>1. Cloud-Piercing Active Radar vs. Blind Optical</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              During severe cyclonic surges (e.g. Cyclone Remal) and summer monsoons, the Bengal Delta is cloaked under dense, 10-kilometer-deep cloud cover. Optical sensors (MODIS, Landsat, Sentinel-2) are 100% blinded by cloud reflectivity.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              NISAR operates in the microwave spectrum, actively transmitting electromagnetic pulses that pierce unhindered through dense rain clouds, smoke, and total night darkness.
            </p>
          </div>

          {/* Card 2: Dual-Frequency Synergy */}
          <div className="glass-card p-5 rounded-xl border border-mangrove/20 space-y-2.5">
            <div className="flex items-center gap-2 text-mangrove font-bold text-sm">
              <Layers className="w-4 h-4" />
              <span>2. Dual-Frequency Synergy (L-Band & S-Band)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">L-Band (~24 cm wavelength, NASA):</strong> Penetrates dense mangrove tree canopies and deep into soil root zones. Detects double-bounce dihedral reflections between tree trunks and floodwater beneath the canopy.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-white">S-Band (~9.3 cm wavelength, ISRO):</strong> Sensitive to surface roughness, soil top crusts, and delicate changes along earthen embankment crests before catastrophic breaches occur.
            </p>
          </div>

          {/* Card 3: Physical Drivers: Dielectric & Roughness */}
          <div className="glass-card p-5 rounded-xl border border-cyan-500/20 space-y-2.5">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Activity className="w-4 h-4" />
              <span>3. Physical Drivers: Dielectric Constant & Roughness</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Dielectric Permittivity (&epsilon;<sub>r</sub>):</strong> Dry soil has a dielectric constant of &sim;3–5, while saline seawater is &sim;70–82 with high electrical conductivity. Flood water and saline intrusion drastically alter backscatter amplitude.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Surface Roughness (k&sigma;):</strong> Smooth open water specularly reflects radar energy away from the sensor (dark backscatter &lt; -22 dB). Rough mangrove canopies generate strong diffuse volume scattering.
            </p>
          </div>

          {/* Card 4: Data Sonification "Earth's Waltz" */}
          <div className="glass-card p-5 rounded-xl border border-amber-500/20 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Waves className="w-4 h-4" />
              <span>4. Data Sonification: &ldquo;Earth&apos;s Endless Dance&rdquo;</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              To make invisible radar backscatter and temporal tidal shifts tangible to farmers, students, and policymakers, Project Kiron sonifies multi-temporal radar observations in real time using the Web Audio API synthesizer.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Intact mangrove forest and dry fertile soils generate warm, harmonic major-sixth chords; breached dykes and saline floods trigger low-frequency dissonant warning bass pulses.
            </p>
          </div>
        </div>

        {/* Local Delta Context */}
        <div className="p-4 rounded-xl bg-space-800/60 border border-white/10 space-y-2">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Field Ground-Truthing: Shyamnagar, Satkhira & Sundarbans
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Shyamnagar Upazila borders the Sundarbans mangrove forest—the world&apos;s largest contiguous mangrove ecosystem. Low-elevation coastal polders (Polder 5 and Polder 15 Gabura) face severe land subsidence (-15 to -28 mm/year) and embankment scour from the Kholpetua and Kobadak tidal rivers. Project Kiron translates raw NISAR backscatter into life-saving early warnings, saline-tolerant rice seed guidance (BRRI dhan67/BINA dhan-10), and policy recommendations.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>NASA Space Apps Challenge 2026</span>
            <span>&bull;</span>
            <span>Open Source (MIT License)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-radar-primary hover:bg-radar-glow text-white font-semibold transition-all shadow-lg shadow-radar-primary/30"
          >
            Enter Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
