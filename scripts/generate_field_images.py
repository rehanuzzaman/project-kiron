#!/usr/bin/env python3
"""
Generates crisp, stylized SVG field photographs for Project Kiron.
Depicting the real physical phenomena:
1. Burigoalini Embankment Rupture
2. Gabura Island Polder Subsidence
3. Sundarbans Mangrove Buffer
4. Nakipur Salt-Tolerant Rice Research Hub
5. Padmapukur Brackish Shrimp Ghers
"""

import os

FIELD_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "field")
os.makedirs(FIELD_DIR, exist_ok=True)

IMAGES = {
    "burigoalini_breach.svg": {
        "title": "Burigoalini Polder 5 Embankment Rupture",
        "badge": "SURGE INUNDATION: 24 ppt Salinity",
        "coords": "22.2885° N, 89.1362° E",
        "bg_top": "#1a0b2e", "bg_bot": "#0a192f",
        "primary_color": "#8C52FF",
        "accent_color": "#EF4444",
        "water_color": "#3B82F6",
        "narrative": "Tidal surge tearing through earthen dike into village homes"
    },
    "gabura_polder.svg": {
        "title": "Gabura Island Ring Polder",
        "badge": "SUBSIDENCE RATE: -25.8 mm/yr",
        "coords": "22.2514° N, 89.1758° E",
        "bg_top": "#181829", "bg_bot": "#0e1a24",
        "primary_color": "#EC4899",
        "accent_color": "#F59E0B",
        "water_color": "#06B6D4",
        "narrative": "Polder settlement interior 1.2m below daily mean high tide level"
    },
    "sundarbans_mangrove.svg": {
        "title": "Sundarbans Munshiganj Forest Buffer",
        "badge": "WAVE DISSIPATION: 66% Wave Energy Cut",
        "coords": "22.2045° N, 89.2312° E",
        "bg_top": "#062415", "bg_bot": "#04140d",
        "primary_color": "#32CD32",
        "accent_color": "#4ADE80",
        "water_color": "#059669",
        "narrative": "Sundari tree pneumatophore roots stabilizing coastal sediments"
    },
    "nakipur_agriculture.svg": {
        "title": "Nakipur Salt-Tolerant Rice Research Hub",
        "badge": "AGRI ADAPTATION: BRRI dhan67 & BINA-10",
        "coords": "22.3481° N, 89.1025° E",
        "bg_top": "#192212", "bg_bot": "#0f1710",
        "primary_color": "#84CC16",
        "accent_color": "#EAB308",
        "water_color": "#14B8A6",
        "narrative": "Regulated furrow irrigation testing high-salinity rice tolerance"
    },
    "padmapukur_gher.svg": {
        "title": "Padmapukur Brackish Shrimp Ghers",
        "badge": "DIELECTRIC CONSTANT: eps = 68.0",
        "coords": "22.2950° N, 89.2080° E",
        "bg_top": "#0c1b33", "bg_bot": "#091322",
        "primary_color": "#38BDF8",
        "accent_color": "#A855F7",
        "water_color": "#1D4ED8",
        "narrative": "Bagda aquaculture ponds creating specular radar reflection zones"
    }
}

def create_svg(filename, data):
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="100%" height="100%">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="{data['bg_top']}" />
      <stop offset="100%" stop-color="{data['bg_bot']}" />
    </linearGradient>
    <linearGradient id="radarScan" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="{data['primary_color']}" stop-opacity="0" />
      <stop offset="50%" stop-color="{data['primary_color']}" stop-opacity="0.3" />
      <stop offset="100%" stop-color="{data['primary_color']}" stop-opacity="0" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Sky -->
  <rect width="800" height="480" fill="url(#skyGrad)" />

  <!-- Grid overlay -->
  <g opacity="0.12" stroke="#ffffff" stroke-width="0.8">
    <line x1="0" y1="80" x2="800" y2="80" />
    <line x1="0" y1="160" x2="800" y2="160" />
    <line x1="0" y1="240" x2="800" y2="240" />
    <line x1="0" y1="320" x2="800" y2="320" />
    <line x1="0" y1="400" x2="800" y2="400" />
    <line x1="160" y1="0" x2="160" y2="480" />
    <line x1="320" y1="0" x2="320" y2="480" />
    <line x1="480" y1="0" x2="480" y2="480" />
    <line x1="640" y1="0" x2="640" y2="480" />
  </g>

  <!-- Physical Feature Silhouette: River & Landforms -->
  <path d="M 0 340 Q 200 310 400 350 T 800 320 L 800 480 L 0 480 Z" fill="{data['bg_bot']}" />
  <path d="M 0 370 Q 240 330 460 380 T 800 360 L 800 480 L 0 480 Z" fill="{data['water_color']}" opacity="0.65" />
  
  <!-- Radar Wave arcs -->
  <g stroke="{data['primary_color']}" stroke-width="1.5" opacity="0.4" fill="none">
    <circle cx="400" cy="80" r="120" />
    <circle cx="400" cy="80" r="220" stroke-dasharray="4 6" />
    <circle cx="400" cy="80" r="320" />
  </g>

  <!-- Horizon features / Trees / Dikes -->
  <path d="M 40 340 L 90 315 L 140 340 L 190 320 L 250 345 L 320 310 L 380 340" stroke="{data['accent_color']}" stroke-width="3" fill="none" opacity="0.8" />
  <circle cx="90" cy="315" r="5" fill="{data['accent_color']}" filter="url(#glow)" />
  <circle cx="190" cy="320" r="5" fill="{data['accent_color']}" />
  <circle cx="320" cy="310" r="6" fill="{data['primary_color']}" filter="url(#glow)" />

  <!-- Badge Pill -->
  <rect x="36" y="32" width="340" height="32" rx="16" fill="rgba(11,15,25,0.85)" stroke="{data['primary_color']}" stroke-width="1.2" />
  <circle cx="54" cy="48" r="5" fill="{data['primary_color']}" filter="url(#glow)" />
  <text x="68" y="53" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="700" letter-spacing="0.5">
    {data['badge']}
  </text>

  <!-- Title & Narrative Box -->
  <rect x="36" y="370" width="728" height="85" rx="12" fill="rgba(11, 15, 25, 0.88)" stroke="rgba(255,255,255,0.12)" />
  <text x="56" y="402" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="18" font-weight="800">
    {data['title']}
  </text>
  <text x="56" y="425" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="12">
    {data['narrative']}
  </text>
  <text x="56" y="442" fill="{data['primary_color']}" font-family="monospace" font-size="11">
    COORDINATES: {data['coords']} | NISAR L+S BAND OBSERVATION
  </text>

  <!-- Satellite Sensor Symbol -->
  <g transform="translate(710, 40)">
    <rect x="-18" y="-10" width="36" height="20" rx="3" fill="#334155" stroke="{data['primary_color']}" stroke-width="1.5" />
    <line x1="-36" y1="0" x2="-18" y2="0" stroke="{data['primary_color']}" stroke-width="2" />
    <line x1="18" y1="0" x2="36" y2="0" stroke="{data['primary_color']}" stroke-width="2" />
    <rect x="-48" y="-8" width="12" height="16" fill="#0EA5E9" opacity="0.8" />
    <rect x="36" y="-8" width="12" height="16" fill="#0EA5E9" opacity="0.8" />
    <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
  </g>
</svg>"""
    filepath = os.path.join(FIELD_DIR, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(svg)
    print(f" -> Wrote field image: {filepath}")

def main():
    for filename, data in IMAGES.items():
        create_svg(filename, data)

if __name__ == "__main__":
    main()
