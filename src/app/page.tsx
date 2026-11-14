import React from "react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-space-900 text-white">
      <div className="glass-panel p-8 rounded-2xl max-w-xl text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
          <span className="w-3 h-3 rounded-full bg-radar-primary animate-pulse" />
          Project Kiron
        </h1>
        <p className="text-sm text-slate-400">
          Earth's Endless Dance &bull; Team Bengal Orbit &bull; NASA Space Apps Challenge 2026
        </p>
        <p className="text-xs text-slate-500">
          Synthetic Aperture Radar (NISAR) Coastal Inundation & Subsidence Observation
        </p>
      </div>
    </main>
  );
}
