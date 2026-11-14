export type RadarFrequency = 'L-Band' | 'S-Band';
export type RadarPolarization = 'HH' | 'HV' | 'VV' | 'VH';

export interface TimelineStep {
  id: string;
  date: string;
  title: string;
  season: string;
  cyclone_event: string | null;
  description: string;
  inundation_percentage: number;
  mean_dielectric: number;
  mean_l_hh: number;
  mean_s_hh: number;
  embankment_breach_count: number;
  subsidence_anomaly_rate: number;
  sonification: {
    root_frequency: number;
    chord_type: string;
    tempo_bpm: number;
    dissonance: number;
    drone_intensity: number;
  };
}

export interface ZoneTemporalProperties {
  is_flooded: boolean;
  dielectric_constant: number;
  surface_roughness: number;
  soil_salinity_ppt: number;
  soil_moisture_m3m3: number;
  L_Band: {
    HH: number;
    HV: number;
    VV: number;
    VH: number;
    polarization_ratio_HH_HV: number;
  };
  S_Band: {
    HH: number;
    HV: number;
    VV: number;
    VH: number;
    polarization_ratio_HH_HV: number;
  };
}

export interface ZoneFeatureProperties {
  id: string;
  name: string;
  type: string;
  category: string;
  safe_indicator: boolean;
  elevation_m: number;
  subsidence_mm_yr: number;
  dominant_species: string;
  soil_type: string;
  temporal: Record<string, ZoneTemporalProperties>;
}

export interface EmbankmentFeatureProperties {
  id: string;
  name: string;
  polder_number: number;
  design_crest_height_m: number;
  actual_crest_height_m: number;
  bwdb_status: string;
  temporal: Record<string, {
    status: string;
    breached: boolean;
    risk_score: number;
  }>;
}

export interface FieldPin {
  id: string;
  name: string;
  coordinates: [number, number];
  zone_ref: string;
  village: string;
  upazila: string;
  photo_url: string;
  photo_caption: string;
  scientific_hypothesis: {
    title: string;
    radar_explanation: string;
    dielectric_shift: string;
    physical_driver: string;
  };
  farmer_advisory: {
    primary_action: string;
    seed_recommendation: string;
    long_term_strategy: string;
    urgency: 'HIGH' | 'MODERATE' | 'SAFE / CONSERVATIVE';
  };
  policymaker_bulletin: {
    risk_level: string;
    structural_advice: string;
  };
}
