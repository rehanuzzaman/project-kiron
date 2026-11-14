import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Kiron | NISAR Radar Earth Observation Dashboard",
  description: "Earth's Endless Dance - Visualizing NASA-ISRO Synthetic Aperture Radar (NISAR) data for coastal inundation, embankment breaches, land subsidence, and soil moisture across the Bengal Delta (Team Bengal Orbit, NASA Space Apps Challenge 2026)",
  keywords: [
    "NISAR",
    "NASA Space Apps 2026",
    "Synthetic Aperture Radar",
    "Bengal Delta",
    "Sundarbans",
    "Shyamnagar",
    "Earth's Endless Dance",
    "Coastal Inundation",
    "Sonification",
  ],
  authors: [{ name: "Team Bengal Orbit" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-space-900 text-slate-100 antialiased selection:bg-radar-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}
