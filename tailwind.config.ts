import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        space: {
          950: "#050811",
          900: "#0B0F19", // Deep space background
          850: "#0E1424",
          800: "#131B2E",
          700: "#1E2A47",
        },
        radar: {
          primary: "#8C52FF", // NISAR radar signal / flood inundation / active
          glow: "#A876FF",
          subtle: "#8C52FF26",
          dark: "#5A28BA",
        },
        mangrove: {
          DEFAULT: "#32CD32", // Healthy mangrove / safe land
          glow: "#4ADE80",
          subtle: "#32CD3226",
          dark: "#1B801B",
        },
        alert: {
          breach: "#EF4444",
          warning: "#F59E0B",
          subsidence: "#EC4899",
          saline: "#06B6D4",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "radar-pulse": "radarPulse 3s cubic-bezier(0, 0, 0.2, 1) infinite",
        "wave-scan": "waveScan 4s linear infinite",
        "fade-in": "fadeIn 0.4s ease-in-out",
      },
      keyframes: {
        radarPulse: {
          "0%": { transform: "scale(0.95)", opacity: "0.8" },
          "50%": { transform: "scale(1.05)", opacity: "0.3" },
          "100%": { transform: "scale(0.95)", opacity: "0.8" },
        },
        waveScan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
