'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward, 
  Music, 
  Radio, 
  Waves, 
  ShieldAlert, 
  Sparkles,
  Calendar,
  Zap
} from 'lucide-react';
import { TimelineStep, ZoneFeatureProperties } from '@/types/nisar';

interface SonificationPlayerProps {
  timeline: TimelineStep[];
  currentStepIndex: number;
  onSelectStepIndex: (index: number) => void;
  selectedZone: ZoneFeatureProperties | null;
  frequency: string;
  polarization: string;
}

export const SonificationPlayer: React.FC<SonificationPlayerProps> = ({
  timeline,
  currentStepIndex,
  onSelectStepIndex,
  selectedZone,
  frequency,
  polarization,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.65);
  const [tempoBpm, setTempoBpm] = useState<number>(75);

  const currentStep = timeline[currentStepIndex] || timeline[0];

  // Web Audio API refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const pulseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Equalizer visual bars state
  const [visualBars, setVisualBars] = useState<number[]>([20, 35, 60, 45, 80, 55, 30, 40, 65, 50, 25, 45]);

  // Initialize Audio Context on user gesture
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      const master = ctx.createGain();
      master.gain.setValueAtTime(volume, ctx.currentTime);
      master.connect(ctx.destination);

      audioCtxRef.current = ctx;
      masterGainRef.current = master;
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  // Play Harmonic Chords according to current step sonification profile
  const playHarmonics = useCallback(() => {
    if (!isAudioEnabled || !audioCtxRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    // Stop previous oscillators
    oscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore
      }
    });
    oscillatorsRef.current = [];

    const son = currentStep.sonification;
    const rootFreq = son.root_frequency;
    const isSevere = currentStep.inundation_percentage > 40;

    // Harmonic ratios based on chord type
    let intervals: number[] = [1, 1.25, 1.5, 1.667]; // default major sixth
    if (son.chord_type === 'minor_diminished') {
      intervals = [1, 1.189, 1.414, 1.682]; // Dissonant tritone & diminished
    } else if (son.chord_type === 'minor_seventh') {
      intervals = [1, 1.2, 1.5, 1.78];
    } else if (son.chord_type === 'suspended_fourth_minor') {
      intervals = [1, 1.333, 1.5, 1.888];
    } else if (son.chord_type === 'lydian_cluster') {
      intervals = [1, 1.25, 1.414, 1.5, 1.875];
    }

    // Create polyphonic oscillator voices
    intervals.forEach((ratio, idx) => {
      const osc = ctx.createOscillator();
      const voiceGain = ctx.createGain();

      osc.type = idx === 0 ? 'triangle' : isSevere ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(rootFreq * ratio, ctx.currentTime);

      // Low pass filter for warm delta atmosphere
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isSevere ? 1800 : 900, ctx.currentTime);

      // Envelope: gentle fade-in
      const targetGain = (0.28 / intervals.length) * (son.drone_intensity || 0.5);
      voiceGain.gain.setValueAtTime(0.001, ctx.currentTime);
      voiceGain.gain.exponentialRampToValueAtTime(Math.max(0.001, targetGain), ctx.currentTime + 0.3);

      osc.connect(filter);
      filter.connect(voiceGain);
      voiceGain.connect(masterGainRef.current!);

      osc.start();
      oscillatorsRef.current.push(osc);
    });
  }, [isAudioEnabled, currentStep]);

  // Radar Pulse Beep on tempo
  const triggerPulse = useCallback(() => {
    if (!isAudioEnabled || !audioCtxRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;
    const isSevere = currentStep.inundation_percentage > 40;

    const pulseOsc = ctx.createOscillator();
    const pulseGain = ctx.createGain();

    pulseOsc.type = isSevere ? 'sawtooth' : 'sine';
    pulseOsc.frequency.setValueAtTime(isSevere ? 660 : 440, ctx.currentTime);
    pulseOsc.frequency.exponentialRampToValueAtTime(isSevere ? 220 : 330, ctx.currentTime + 0.12);

    pulseGain.gain.setValueAtTime(isSevere ? 0.35 : 0.12, ctx.currentTime);
    pulseGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);

    pulseOsc.connect(pulseGain);
    pulseGain.connect(masterGainRef.current);

    pulseOsc.start();
    pulseOsc.stop(ctx.currentTime + 0.16);

    // Randomize visual bar animation
    setVisualBars((prev) =>
      prev.map((val) => {
        const base = isSevere ? 60 : 30;
        return Math.floor(base + Math.random() * (isSevere ? 40 : 35));
      })
    );
  }, [isAudioEnabled, currentStep]);

  // Trigger sound when step changes or audio toggled
  useEffect(() => {
    if (isAudioEnabled) {
      playHarmonics();
      setTempoBpm(currentStep.sonification.tempo_bpm);

      if (pulseTimerRef.current) clearInterval(pulseTimerRef.current);
      const intervalMs = (60 / currentStep.sonification.tempo_bpm) * 1000;
      pulseTimerRef.current = setInterval(triggerPulse, intervalMs);
    } else {
      oscillatorsRef.current.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      });
      oscillatorsRef.current = [];
      if (pulseTimerRef.current) clearInterval(pulseTimerRef.current);
    }

    return () => {
      if (pulseTimerRef.current) clearInterval(pulseTimerRef.current);
    };
  }, [isAudioEnabled, currentStep, playHarmonics, triggerPulse]);

  // Auto-play timeline advance
  useEffect(() => {
    if (isPlaying) {
      playbackTimerRef.current = setInterval(() => {
        onSelectStepIndex((currentStepIndex + 1) % timeline.length);
      }, 4500);
    } else {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    }

    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlaying, currentStepIndex, timeline.length, onSelectStepIndex]);

  // Volume slider update
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(newVol, audioCtxRef.current.currentTime);
    }
  };

  const toggleAudio = () => {
    initAudio();
    setIsAudioEnabled((prev) => !prev);
  };

  const handleNext = () => {
    onSelectStepIndex((currentStepIndex + 1) % timeline.length);
  };

  const handlePrev = () => {
    onSelectStepIndex((currentStepIndex - 1 + timeline.length) % timeline.length);
  };

  return (
    <div className="glass-panel w-full border-t border-white/10 px-4 py-3 sm:px-6 shadow-2xl z-30">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* 1. Left: Current Temporal Epoch Title & Sonification Metadata */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAudio}
              className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                isAudioEnabled
                  ? 'bg-radar-primary text-white shadow-lg shadow-radar-primary/40 border border-radar-glow animate-pulse'
                  : 'bg-space-800 text-slate-400 hover:text-white border border-white/10'
              }`}
              title={isAudioEnabled ? 'Mute Sonification' : 'Listen to the Land (Web Audio Engine)'}
            >
              {isAudioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              {isAudioEnabled && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-radar-glow opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-radar-primary" />
                </span>
              )}
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-radar-glow">
                  {currentStep.date}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-space-800 border border-white/10 font-mono text-slate-300">
                  {currentStep.season}
                </span>
                {currentStep.cyclone_event && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/50 text-red-300 font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-red-400" />
                    {currentStep.cyclone_event}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                {currentStep.title}
              </h3>
            </div>
          </div>

          {/* Audio Visualizer Equalizer Bars */}
          <div className="flex items-end gap-1 h-7 px-3 py-1 rounded-lg bg-space-950/80 border border-white/10">
            {visualBars.map((bar, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isAudioEnabled 
                    ? currentStep.inundation_percentage > 40 ? 'bg-radar-primary' : 'bg-mangrove' 
                    : 'bg-slate-700'
                }`}
                style={{ height: isAudioEnabled ? `${bar}%` : '20%' }}
              />
            ))}
          </div>
        </div>

        {/* 2. Center: Timeline Step Scrubber Bar */}
        <div className="flex-1 w-full max-w-2xl space-y-2">
          {/* Step Pill Buttons */}
          <div className="grid grid-cols-6 gap-1.5">
            {timeline.map((step, idx) => {
              const isSelected = idx === currentStepIndex;
              const hasCyclone = Boolean(step.cyclone_event);
              return (
                <button
                  key={step.id}
                  onClick={() => onSelectStepIndex(idx)}
                  className={`group relative flex flex-col items-center py-1 px-1.5 rounded-lg text-center transition-all border ${
                    isSelected
                      ? hasCyclone
                        ? 'bg-red-950/70 border-red-500 text-white shadow-lg shadow-red-500/20'
                        : 'bg-radar-primary/30 border-radar-primary text-white shadow-lg shadow-radar-primary/30'
                      : 'bg-space-800/60 hover:bg-space-800 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold leading-tight">
                    {step.date.slice(0, 7)}
                  </span>
                  <span className="text-[9px] truncate max-w-full font-medium opacity-80">
                    {hasCyclone ? '⚡ Cyclone' : step.title.split(' ')[0]}
                  </span>
                  {isSelected && (
                    <div className="absolute -top-1 w-2 h-2 rounded-full bg-radar-glow animate-ping" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Timeline Description Sentence */}
          <p className="text-[11px] text-slate-300 leading-snug line-clamp-1 italic text-center">
            &ldquo;{currentStep.description}&rdquo;
          </p>
        </div>

        {/* 3. Right: Playback Transport Controls & Audio Volume */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-space-800 border border-white/10">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-space-700 transition-colors"
              title="Previous Temporal Epoch"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying((p) => !p)}
              className={`p-2 rounded-lg font-bold transition-all ${
                isPlaying
                  ? 'bg-radar-primary text-white shadow-lg shadow-radar-primary/30'
                  : 'text-slate-200 hover:text-white hover:bg-space-700'
              }`}
              title={isPlaying ? 'Pause Auto-Play' : 'Auto-Play Multi-Temporal Orbit'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-space-700 transition-colors"
              title="Next Temporal Epoch"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Volume Slider */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-space-800/80 border border-white/10">
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1 accent-radar-primary cursor-pointer bg-slate-700 rounded-lg"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
