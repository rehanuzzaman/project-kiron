#!/usr/bin/env python3
"""
Project Kiron - Team Bengal Orbit
NASA Space Apps Challenge 2026: "Earth's Endless Dance"

Generates realistic multi-temporal NISAR (NASA-ISRO Synthetic Aperture Radar)
L-band and S-band radar backscatter, dielectric constant, surface roughness,
soil salinity/moisture, and embankment vulnerability datasets for the Bengal Delta
(centered on Shyamnagar, Satkhira & Sundarbans Coast: 22.33° N, 89.10° E).
"""

import json
import math
import os
import numpy as np

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "data")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# -------------------------------------------------------------------------
# 1. Timeline Epochs (2024 - 2026)
# -------------------------------------------------------------------------
TIMELINE_STEPS = [
    {
        "id": "2024-04-12",
        "date": "2024-04-12",
        "title": "Pre-Monsoon Dry Baseline",
        "season": "Dry Spring",
        "cyclone_event": None,
        "description": "Baseline NISAR cal/val orbit during late dry season. Soils are dry to moderate moisture; aquaculture ghers maintain controlled brackish salinity.",
        "inundation_percentage": 14.2,
        "mean_dielectric": 18.5,
        "mean_l_hh": -14.2,
        "mean_s_hh": -16.8,
        "embankment_breach_count": 0,
        "subsidence_anomaly_rate": -14.2,
        "sonification": {
            "root_frequency": 220.0, # A3 calm
            "chord_type": "major_sixth",
            "tempo_bpm": 68,
            "dissonance": 0.08,
            "drone_intensity": 0.25
        }
    },
    {
        "id": "2024-05-27",
        "date": "2024-05-27",
        "title": "Severe Cyclone Remal Inundation",
        "season": "Pre-Monsoon Cyclone",
        "cyclone_event": "Cyclone Remal (Category 1, 115 km/h)",
        "description": "Catastrophic storm surge breaches Polder 5 & 15. Optical satellites blinded by 100% thick cloud veil; NISAR L-band penetrates cloud and deluge, revealing widespread seawater inundation.",
        "inundation_percentage": 58.7,
        "mean_dielectric": 64.8,
        "mean_l_hh": -23.4,
        "mean_s_hh": -21.9,
        "embankment_breach_count": 7,
        "subsidence_anomaly_rate": -26.5,
        "sonification": {
            "root_frequency": 110.0, # A2 deep resonant warning
            "chord_type": "minor_diminished",
            "tempo_bpm": 128,
            "dissonance": 0.85,
            "drone_intensity": 0.95
        }
    },
    {
        "id": "2024-10-18",
        "date": "2024-10-18",
        "title": "Post-Monsoon Drainage & Siltation",
        "season": "Post-Monsoon",
        "cyclone_event": None,
        "description": "Drainage of monsoon floodwaters. L-band reveals high soil moisture retained in root zones and residual salinity crystallization in agricultural topsoils.",
        "inundation_percentage": 24.1,
        "mean_dielectric": 34.2,
        "mean_l_hh": -16.5,
        "mean_s_hh": -17.8,
        "embankment_breach_count": 2,
        "subsidence_anomaly_rate": -16.8,
        "sonification": {
            "root_frequency": 196.0, # G3 transition
            "chord_type": "minor_seventh",
            "tempo_bpm": 84,
            "dissonance": 0.35,
            "drone_intensity": 0.45
        }
    },
    {
        "id": "2025-05-14",
        "date": "2025-05-14",
        "title": "Pre-Monsoon Spring High Tide Surge",
        "season": "Spring Tidal Surge",
        "cyclone_event": "High Tide Spring Inrush",
        "description": "Kholpetua river high tide overtops weakened earthen embankments in Burigoalini. S-band detects surface roughness changes along damaged embankment crests.",
        "inundation_percentage": 42.6,
        "mean_dielectric": 52.4,
        "mean_l_hh": -20.8,
        "mean_s_hh": -19.4,
        "embankment_breach_count": 4,
        "subsidence_anomaly_rate": -22.1,
        "sonification": {
            "root_frequency": 146.8, # D3 alert
            "chord_type": "suspended_fourth_minor",
            "tempo_bpm": 105,
            "dissonance": 0.62,
            "drone_intensity": 0.72
        }
    },
    {
        "id": "2025-11-05",
        "date": "2025-11-05",
        "title": "Embankment Geo-Tube Restoration",
        "season": "Aman Harvest",
        "cyclone_event": None,
        "description": "Community and Bangladesh Water Development Board (BWDB) deploy geo-textile bags and earthen reinforcements. InSAR coherence improves over repaired dikes.",
        "inundation_percentage": 17.8,
        "mean_dielectric": 22.0,
        "mean_l_hh": -15.1,
        "mean_s_hh": -16.4,
        "embankment_breach_count": 1,
        "subsidence_anomaly_rate": -13.5,
        "sonification": {
            "root_frequency": 246.9, # B3 hope
            "chord_type": "major_seventh",
            "tempo_bpm": 74,
            "dissonance": 0.14,
            "drone_intensity": 0.32
        }
    },
    {
        "id": "2026-04-10",
        "date": "2026-04-10",
        "title": "Current Multi-Frequency Orbit",
        "season": "Pre-Monsoon Cal/Val",
        "cyclone_event": None,
        "description": "Active dual L+S band observations. High-fidelity mapping of mangrove resilience, shrimp aquaculture boundaries, and localized land subsidence hotspots in Gabura.",
        "inundation_percentage": 19.4,
        "mean_dielectric": 24.6,
        "mean_l_hh": -15.8,
        "mean_s_hh": -16.9,
        "embankment_breach_count": 1,
        "subsidence_anomaly_rate": -15.1,
        "sonification": {
            "root_frequency": 261.6, # C4 resonant
            "chord_type": "lydian_cluster",
            "tempo_bpm": 80,
            "dissonance": 0.18,
            "drone_intensity": 0.36
        }
    }
]

# -------------------------------------------------------------------------
# 2. Key Geospatial Zones in Shyamnagar & Sundarbans
# Center around ~22.33 N, 89.10 E
# -------------------------------------------------------------------------
ZONE_DEFINITIONS = [
    {
        "id": "sundarbans_munshiganj_core",
        "name": "Sundarbans Munshiganj Buffer & Mangrove Core",
        "type": "mangrove_forest",
        "category": "Protected Forest Ecosystem",
        "coordinates": [
            [89.180, 22.190], [89.280, 22.190], [89.280, 22.250],
            [89.230, 22.260], [89.190, 22.235], [89.180, 22.190]
        ],
        "safe_indicator": True,
        "soil_type": "Saline Tidal Alluvial Gley",
        "dominant_species": "Heritiera fomes (Sundari), Excoecaria agallocha (Gewa)",
        "elevation_m": 1.4,
        "subsidence_mm_yr": -4.2,
        "behavior": {
            # In flood events, L-band HH spikes because of trunk-water double-bounce!
            "L_HH_base": -8.5, "L_HV_base": -14.2, "L_VV_base": -9.8, "L_VH_base": -14.5,
            "S_HH_base": -12.1, "S_HV_base": -17.5, "S_VV_base": -13.0, "S_VH_base": -17.8,
            "dielectric_base": 24.0, "roughness_base": 0.88,
            "flood_response": "double_bounce_spike"
        }
    },
    {
        "id": "burigoalini_polder5_breach",
        "name": "Burigoalini Polder 5 Embankment Breach Zone",
        "type": "settlement_breach",
        "category": "High Vulnerability Settlement",
        "coordinates": [
            [89.110, 22.265], [89.165, 22.270], [89.170, 22.315],
            [89.125, 22.320], [89.095, 22.290], [89.110, 22.265]
        ],
        "safe_indicator": False,
        "soil_type": "Clayey Silt / Saline Intrusion",
        "dominant_species": "Human Settlement & Homestead Gardens",
        "elevation_m": 0.85,
        "subsidence_mm_yr": -19.5,
        "behavior": {
            # In flood events, specular reflection drives HH down severely
            "L_HH_base": -13.2, "L_HV_base": -19.0, "L_VV_base": -14.0, "L_VH_base": -19.5,
            "S_HH_base": -15.5, "S_HV_base": -22.0, "S_VV_base": -16.2, "S_VH_base": -22.3,
            "dielectric_base": 19.5, "roughness_base": 0.42,
            "flood_response": "specular_drop"
        }
    },
    {
        "id": "gabura_island_polder15",
        "name": "Gabura Island Subsidence Hotspot",
        "type": "polder_island",
        "category": "Vulnerable Island Polder",
        "coordinates": [
            [89.155, 22.220], [89.215, 22.235], [89.220, 22.285],
            [89.175, 22.280], [89.145, 22.250], [89.155, 22.220]
        ],
        "safe_indicator": False,
        "soil_type": "Heavy Saline Marine Mud",
        "dominant_species": "Bagda Shrimp Ponds & Sparse Reeds",
        "elevation_m": 0.65,
        "subsidence_mm_yr": -25.8,
        "behavior": {
            "L_HH_base": -16.5, "L_HV_base": -22.4, "L_VV_base": -17.0, "L_VH_base": -22.8,
            "S_HH_base": -18.2, "S_HV_base": -24.8, "S_VV_base": -18.9, "S_VH_base": -25.0,
            "dielectric_base": 38.0, "roughness_base": 0.28,
            "flood_response": "specular_drop"
        }
    },
    {
        "id": "padmapukur_saline_ghers",
        "name": "Padmapukur Brackish Aquaculture Polders",
        "type": "aquaculture_gher",
        "category": "Commercial Shrimp Aquaculture",
        "coordinates": [
            [89.195, 22.280], [89.260, 22.290], [89.265, 22.345],
            [89.210, 22.350], [89.185, 22.315], [89.195, 22.280]
        ],
        "safe_indicator": False,
        "soil_type": "Acid Sulfate Saline Clay",
        "dominant_species": "Penaeus monodon (Bagda), Mud Crab",
        "elevation_m": 0.95,
        "subsidence_mm_yr": -16.4,
        "behavior": {
            "L_HH_base": -20.5, "L_HV_base": -25.2, "L_VV_base": -21.0, "L_VH_base": -25.6,
            "S_HH_base": -22.1, "S_HV_base": -27.5, "S_VV_base": -22.8, "S_VH_base": -27.9,
            "dielectric_base": 68.0, "roughness_base": 0.15,
            "flood_response": "open_water_consistent"
        }
    },
    {
        "id": "nakipur_agricultural_belt",
        "name": "Nakipur Saline-Resistant Rice Belt",
        "type": "agriculture_cropland",
        "category": "Agricultural Transition Plain",
        "coordinates": [
            [89.060, 22.330], [89.135, 22.335], [89.140, 22.395],
            [89.075, 22.400], [89.050, 22.365], [89.060, 22.330]
        ],
        "safe_indicator": True,
        "soil_type": "Moderate Saline Sandy Loam",
        "dominant_species": "BRRI dhan67, BINA dhan-10 (Salt-Tolerant Rice)",
        "elevation_m": 2.1,
        "subsidence_mm_yr": -8.1,
        "behavior": {
            "L_HH_base": -12.4, "L_HV_base": -18.2, "L_VV_base": -13.1, "L_VH_base": -18.5,
            "S_HH_base": -14.6, "S_HV_base": -20.8, "S_VV_base": -15.4, "S_VH_base": -21.2,
            "dielectric_base": 14.5, "roughness_base": 0.55,
            "flood_response": "specular_drop"
        }
    },
    {
        "id": "atulia_kholpetua_floodplain",
        "name": "Atulia & Kholpetua Estuarine Floodplain",
        "type": "riparian_floodplain",
        "category": "Tidal Riverbank & Mudflats",
        "coordinates": [
            [89.120, 22.325], [89.185, 22.330], [89.190, 22.385],
            [89.145, 22.390], [89.105, 22.355], [89.120, 22.325]
        ],
        "safe_indicator": False,
        "soil_type": "Fine Tidal Mud & Silt Deposits",
        "dominant_species": "Pneumatophore Mangrove Grass & Keora Trees",
        "elevation_m": 1.1,
        "subsidence_mm_yr": -17.2,
        "behavior": {
            "L_HH_base": -15.1, "L_HV_base": -21.0, "L_VV_base": -15.8, "L_VH_base": -21.4,
            "S_HH_base": -17.4, "S_HV_base": -23.5, "S_VV_base": -18.1, "S_VH_base": -23.9,
            "dielectric_base": 32.0, "roughness_base": 0.48,
            "flood_response": "specular_drop"
        }
    }
]

# -------------------------------------------------------------------------
# 3. Embankment Vectors (LineStrings)
# -------------------------------------------------------------------------
EMBANKMENT_VECTORS = [
    {
        "id": "emb_polder5_kholpetua",
        "name": "Polder 5 West Dyke (Kholpetua River Front)",
        "coordinates": [
            [89.112, 22.268], [89.130, 22.285], [89.148, 22.302],
            [89.162, 22.325], [89.170, 22.355]
        ],
        "polder_number": 5,
        "design_crest_height_m": 4.5,
        "actual_crest_height_m": 3.1,
        "bwdb_status": "CRITICAL_RISK",
        "temporal_status": {
            "2024-04-12": {"status": "Vulnerable (Eroded Crest)", "breached": False, "risk_score": 68},
            "2024-05-27": {"status": "BREACHED (Surge Overtop)", "breached": True, "risk_score": 98},
            "2024-10-18": {"status": "Emergency Ring Bund Repair", "breached": False, "risk_score": 75},
            "2025-05-14": {"status": "BREACHED (Spring Tide Failure)", "breached": True, "risk_score": 94},
            "2025-11-05": {"status": "Geo-Tube Core Reinforced", "breached": False, "risk_score": 45},
            "2026-04-10": {"status": "Stable (Sensor Monitored)", "breached": False, "risk_score": 38}
        }
    },
    {
        "id": "emb_gabura_perimeter",
        "name": "Gabura Ring Embankment (Polder 15)",
        "coordinates": [
            [89.155, 22.222], [89.212, 22.238], [89.218, 22.282],
            [89.172, 22.278], [89.146, 22.248], [89.155, 22.222]
        ],
        "polder_number": 15,
        "design_crest_height_m": 4.2,
        "actual_crest_height_m": 2.7,
        "bwdb_status": "EXTREME_SUBSIDENCE_RISK",
        "temporal_status": {
            "2024-04-12": {"status": "Low Freeboard (2.7m)", "breached": False, "risk_score": 72},
            "2024-05-27": {"status": "MULTIPLE BREACHES (South & East)", "breached": True, "risk_score": 99},
            "2024-10-18": {"status": "Earthen Patchwork", "breached": False, "risk_score": 82},
            "2025-05-14": {"status": "Partial Toe Scouring", "breached": False, "risk_score": 86},
            "2025-11-05": {"status": "Clay Berm Added", "breached": False, "risk_score": 58},
            "2026-04-10": {"status": "Active InSAR Inclinometer Watch", "breached": False, "risk_score": 52}
        }
    },
    {
        "id": "emb_munshiganj_forest_barrier",
        "name": "Munshiganj Sundarbans Eco-Protection Dyke",
        "coordinates": [
            [89.182, 22.192], [89.225, 22.215], [89.255, 22.235],
            [89.278, 22.258]
        ],
        "polder_number": 7,
        "design_crest_height_m": 5.0,
        "actual_crest_height_m": 4.6,
        "bwdb_status": "STABLE_PROTECTED",
        "temporal_status": {
            "2024-04-12": {"status": "Intact Mangrove Wave Buffer", "breached": False, "risk_score": 18},
            "2024-05-27": {"status": "Wave Attenuated by Mangrove", "breached": False, "risk_score": 35},
            "2024-10-18": {"status": "Minor Silt Accumulation", "breached": False, "risk_score": 22},
            "2025-05-14": {"status": "Intact", "breached": False, "risk_score": 24},
            "2025-11-05": {"status": "Reinforced Stone Pitching", "breached": False, "risk_score": 15},
            "2026-04-10": {"status": "Optimal Health", "breached": False, "risk_score": 12}
        }
    }
]

# -------------------------------------------------------------------------
# 4. Ground-Truth Field Pins & Stories
# -------------------------------------------------------------------------
FIELD_PINS = [
    {
        "id": "pin_burigoalini_breach",
        "name": "Burigoalini Embankment Rupture Point",
        "coordinates": [89.1362, 22.2885],
        "zone_ref": "burigoalini_polder5_breach",
        "village": "Burigoalini Village, Ward 4",
        "upazila": "Shyamnagar, Satkhira",
        "photo_url": "/images/field/burigoalini_breach.svg",
        "photo_caption": "Surge erosion eating through the earthen dike of Polder 5 along the Kholpetua River.",
        "scientific_hypothesis": {
            "title": "Sub-surface Shear Failure under Tidal Hydrostatic Pressure",
            "radar_explanation": "During Cyclone Remal, L-band HH backscatter plummeted from -13 dB to -24 dB as standing saline water flooded agricultural homesteads, turning dry soil into a specular radar mirror. Cross-pol HV loss indicates complete loss of ground canopy roughness.",
            "dielectric_shift": "Soil dielectric permittivity shifted from eps=19.5 (dry clayey silt) to eps=78.2 (saline seawater with 24 ppt NaCl).",
            "physical_driver": "High Dielectric Constant (Saline Water) & Specular Scattering."
        },
        "farmer_advisory": {
            "primary_action": "Urgent Drainage & Saline Flushing with Rainwater",
            "seed_recommendation": "BRRI dhan67 (tolerates up to 12 dS/m salinity at seedling stage) or BINA dhan-10 for the Boro season.",
            "long_term_strategy": "Install check-valves on homestead sluice gates; rotate low-salinity aquaculture with freshwater carp during monsoon flushing.",
            "urgency": "HIGH"
        },
        "policymaker_bulletin": {
            "risk_level": "CRITICAL EMERGENCY",
            "structural_advice": "Transition from uncompacted sand-clay dykes to composite geotextile-tube cores lined with vetiver grass root reinforcement. Raise crest freeboard to 5.2m PWD."
        }
    },
    {
        "id": "pin_gabura_subsidence",
        "name": "Gabura Polder 15 Center (Subsidence Hotspot)",
        "coordinates": [89.1758, 22.2514],
        "zone_ref": "gabura_island_polder15",
        "village": "Chakbara, Gabura Island",
        "upazila": "Shyamnagar, Satkhira",
        "photo_url": "/images/field/gabura_polder.svg",
        "photo_caption": "Subsiding polder settlement surrounded by saline shrimp ghers below mean high tide level.",
        "scientific_hypothesis": {
            "title": "Holocene Sediment Compaction & Ground Water Drainage Subsidence",
            "radar_explanation": "InSAR phase coherence indicates continuous subsidence at -25.8 mm/yr. Because the polder interior is ringed by dikes that block natural tidal sediment siltation, the ground elevation is now 1.2m below average daily high tide level.",
            "dielectric_shift": "Permanent sub-surface waterlogging maintains dielectric constant between 38 and 62 year-round.",
            "physical_driver": "Interferometric SAR (InSAR) Phase Unwrapping & Low Elevation."
        },
        "farmer_advisory": {
            "primary_action": "Tidal River Management (TRM) Silt Trapping",
            "seed_recommendation": "Crab fattening in submerged enclosures; brackish mangrove polyculture with Scylla serrata.",
            "long_term_strategy": "Advocate for controlled TRM beel breaches to let tidal silt naturally elevate land elevation by 10-15 cm per monsoon cycle.",
            "urgency": "HIGH"
        },
        "policymaker_bulletin": {
            "risk_level": "PERMANENT VULNERABILITY",
            "structural_advice": "Deploy BWDB controlled sedimentation basins (TRM). Traditional dyke raising alone will fail due to underlying soft clay bearing capacity limits."
        }
    },
    {
        "id": "pin_munshiganj_station",
        "name": "Munshiganj Sundarbans Eco-Observation Station",
        "coordinates": [89.2312, 22.2045],
        "zone_ref": "sundarbans_munshiganj_core",
        "village": "Munshiganj Forest Gateway",
        "upazila": "Shyamnagar, Satkhira",
        "photo_url": "/images/field/sundarbans_mangrove.svg",
        "photo_caption": "Pneumatophore root systems of Sundari trees dissipating storm wave energy along the river bank.",
        "scientific_hypothesis": {
            "title": "Double-Bounce Canopy Trunk Scattering & Wave Dissipation",
            "radar_explanation": "When tidal surges penetrate the forest floor, L-band (24 cm wavelength) penetrates the dense leaf canopy and bounces off tree trunks into the water and back to the radar sensor. This creates an anomalous 4.5 dB increase in L-HH backscatter, easily distinguishing flooded mangrove from open water.",
            "dielectric_shift": "Stable canopy moisture (dielectric eps=24.0), high root-zone roughness (k*sigma > 2.5).",
            "physical_driver": "Volume Scattering (HV) & Dihedral Double-Bounce (HH)."
        },
        "farmer_advisory": {
            "primary_action": "Maintain 50m Mangrove Greenbelt Buffer",
            "seed_recommendation": "Plant Golpata (Nypa fruticans) and Keora (Sonneratia apetala) seedlings along exterior dyke toes to absorb boat wake and tidal shear.",
            "long_term_strategy": "Avoid clear-cutting canal-edge shrubs for shrimp nursery netting.",
            "urgency": "SAFE / CONSERVATIVE"
        },
        "policymaker_bulletin": {
            "risk_level": "ECOSYSTEM SHIELD (LOW RISK)",
            "structural_advice": "Declare 200m buffer zone as bio-shield. Every 100m of dense mangrove reduces cyclonic wave energy by up to 66%."
        }
    },
    {
        "id": "pin_nakipur_research",
        "name": "Nakipur Agriculture & Climate Adaptation Hub",
        "coordinates": [89.1025, 22.3481],
        "zone_ref": "nakipur_agricultural_belt",
        "village": "Nakipur Sadar",
        "upazila": "Shyamnagar, Satkhira",
        "photo_url": "/images/field/nakipur_agriculture.svg",
        "photo_caption": "Demonstration plots of saline-tolerant Aman rice varieties grown under regulated furrow irrigation.",
        "scientific_hypothesis": {
            "title": "Soil Moisture Dielectric Tuning & Roughness Backscatter Correlation",
            "radar_explanation": "S-band (9 cm wavelength) is acutely sensitive to soil surface plowing roughness and vegetative leaf area index (LAI). Comparing L-band and S-band allows precise separation of topsoil salinity crystallization from underlying root-zone volumetric moisture.",
            "dielectric_shift": "Dielectric shifts from eps=14.5 (dry season) to eps=32.0 after seasonal irrigation.",
            "physical_driver": "Dual-Band Multi-Frequency Inversion (L-band volume vs S-band roughness)."
        },
        "farmer_advisory": {
            "primary_action": "Adopt Alternate Wetting & Drying (AWD) & Saline Soil Gypsum Dressing",
            "seed_recommendation": "BRRI dhan67, BRRI dhan97, and BINA dhan-10. Apply gypsum (calcium sulfate) at 120 kg/ha to displace exchangeable sodium ions.",
            "long_term_strategy": "Harvest rainwater in excavated homestead ponds during monsoon for dry season drip-irrigation of winter vegetables.",
            "urgency": "MODERATE"
        },
        "policymaker_bulletin": {
            "risk_level": "ADAPTATION PRIORITY",
            "structural_advice": "Subsidize community rainwater collection reservoirs and solar pumps to prevent groundwater aquifer over-extraction."
        }
    },
    {
        "id": "pin_padmapukur_fishery",
        "name": "Padmapukur Fishery Cooperative",
        "coordinates": [89.2080, 22.2950],
        "zone_ref": "padmapukur_saline_ghers",
        "village": "Padmapukur Union",
        "upazila": "Shyamnagar, Satkhira",
        "photo_url": "/images/field/padmapukur_gher.svg",
        "photo_caption": "Intensive Bagda shrimp ponds with earthen bunds showing signs of wave-lap erosion.",
        "scientific_hypothesis": {
            "title": "Specular Polarimetric Depolarization in Aquaculture Ponds",
            "radar_explanation": "Calm water in shrimp ghers acts as a near-perfect specular reflector, sending radar pulses away and resulting in extremely low backscatter across all polarizations (-20 to -26 dB). Wind-induced surface ripples increase VV backscatter by 3 to 6 dB.",
            "dielectric_shift": "Permanent high dielectric constant eps=68 to 74 with saline electrolyte concentration.",
            "physical_driver": "High Dielectric Constant & Low Surface Roughness."
        },
        "farmer_advisory": {
            "primary_action": "Strengthen Internal Gher Bunds & Install Aerators",
            "seed_recommendation": "Polyculture with Tilapia (Oreochromis mossambicus) and Seaweed (Gracilaria) to balance pond salinity and reduce toxic sulfur buildup.",
            "long_term_strategy": "Avoid excessive pond deepening that compromises adjacent protective road embankments.",
            "urgency": "MODERATE"
        },
        "policymaker_bulletin": {
            "risk_level": "ECONOMIC ASSET / HIGH EXPOSURE",
            "structural_advice": "Enforce setback zoning regulations prohibiting gher excavation within 50 meters of BWDB river embankments."
        }
    }
]

# -------------------------------------------------------------------------
# 5. Generate GeoJSON for Zones with Multi-Temporal Properties
# -------------------------------------------------------------------------
def generate_zones_geojson():
    features = []
    
    for zone in ZONE_DEFINITIONS:
        # Build multi-temporal attribute maps
        temporal_data = {}
        
        for step in TIMELINE_STEPS:
            step_id = step["id"]
            inund_pct = step["inundation_percentage"]
            breach_cnt = step["embankment_breach_count"]
            
            b = zone["behavior"]
            
            if b["flood_response"] == "double_bounce_spike":
                # In flooded conditions, L_HH spikes because of double-bounce between trunks and water!
                flood_factor = (inund_pct / 60.0)
                l_hh = round(b["L_HH_base"] + (4.8 * flood_factor), 2)
                l_hv = round(b["L_HV_base"] + (1.2 * flood_factor), 2)
                l_vv = round(b["L_VV_base"] + (0.5 * flood_factor), 2)
                l_vh = round(b["L_VH_base"] + (1.1 * flood_factor), 2)
                
                s_hh = round(b["S_HH_base"] - (0.8 * flood_factor), 2)
                s_hv = round(b["S_HV_base"] + (0.4 * flood_factor), 2)
                s_vv = round(b["S_VV_base"] - (0.6 * flood_factor), 2)
                s_vh = round(b["S_VH_base"] + (0.3 * flood_factor), 2)
                
                dielectric = round(b["dielectric_base"] + (18.0 * flood_factor), 1)
                roughness = round(b["roughness_base"] - (0.05 * flood_factor), 2)
                is_flooded = flood_factor > 0.6
                
            elif b["flood_response"] == "specular_drop":
                # In flood conditions, specular water reflection causes severe backscatter drop!
                flood_factor = (inund_pct / 60.0)
                if zone["id"] == "burigoalini_polder5_breach" and breach_cnt > 0:
                    flood_factor = min(1.0, flood_factor * 1.4)
                    
                l_hh = round(b["L_HH_base"] - (9.5 * flood_factor), 2)
                l_hv = round(b["L_HV_base"] - (5.2 * flood_factor), 2)
                l_vv = round(b["L_VV_base"] - (7.8 * flood_factor), 2)
                l_vh = round(b["L_VH_base"] - (5.0 * flood_factor), 2)
                
                s_hh = round(b["S_HH_base"] - (7.4 * flood_factor), 2)
                s_hv = round(b["S_HV_base"] - (4.5 * flood_factor), 2)
                s_vv = round(b["S_VV_base"] - (6.8 * flood_factor), 2)
                s_vh = round(b["S_VH_base"] - (4.2 * flood_factor), 2)
                
                dielectric = round(b["dielectric_base"] + (56.0 * flood_factor), 1)
                roughness = round(max(0.08, b["roughness_base"] - (0.30 * flood_factor)), 2)
                is_flooded = flood_factor > 0.45
                
            else: # open_water_consistent
                l_hh = b["L_HH_base"]
                l_hv = b["L_HV_base"]
                l_vv = b["L_VV_base"]
                l_vh = b["L_VH_base"]
                s_hh = b["S_HH_base"]
                s_hv = b["S_HV_base"]
                s_vv = b["S_VV_base"]
                s_vh = b["S_VH_base"]
                dielectric = b["dielectric_base"]
                roughness = b["roughness_base"]
                is_flooded = True

            temporal_data[step_id] = {
                "is_flooded": is_flooded,
                "dielectric_constant": dielectric,
                "surface_roughness": roughness,
                "soil_salinity_ppt": round(dielectric * 0.35, 1),
                "soil_moisture_m3m3": round(min(0.68, dielectric * 0.009), 3),
                "L_Band": {
                    "HH": l_hh,
                    "HV": l_hv,
                    "VV": l_vv,
                    "VH": l_vh,
                    "polarization_ratio_HH_HV": round(l_hh - l_hv, 2)
                },
                "S_Band": {
                    "HH": s_hh,
                    "HV": s_hv,
                    "VV": s_vv,
                    "VH": s_vh,
                    "polarization_ratio_HH_HV": round(s_hh - s_hv, 2)
                }
            }

        feature = {
            "type": "Feature",
            "id": zone["id"],
            "properties": {
                "id": zone["id"],
                "name": zone["name"],
                "type": zone["type"],
                "category": zone["category"],
                "safe_indicator": zone["safe_indicator"],
                "elevation_m": zone["elevation_m"],
                "subsidence_mm_yr": zone["subsidence_mm_yr"],
                "dominant_species": zone["dominant_species"],
                "soil_type": zone["soil_type"],
                "temporal": temporal_data
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [zone["coordinates"]]
            }
        }
        features.append(feature)

    geojson = {
        "type": "FeatureCollection",
        "name": "nisar_bengal_delta_zones",
        "crs": {
            "type": "name",
            "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}
        },
        "features": features
    }
    return geojson

# -------------------------------------------------------------------------
# 6. Generate GeoJSON for Embankments
# -------------------------------------------------------------------------
def generate_embankments_geojson():
    features = []
    
    for emb in EMBANKMENT_VECTORS:
        feature = {
            "type": "Feature",
            "id": emb["id"],
            "properties": {
                "id": emb["id"],
                "name": emb["name"],
                "polder_number": emb["polder_number"],
                "design_crest_height_m": emb["design_crest_height_m"],
                "actual_crest_height_m": emb["actual_crest_height_m"],
                "bwdb_status": emb["bwdb_status"],
                "temporal": emb["temporal_status"]
            },
            "geometry": {
                "type": "LineString",
                "coordinates": emb["coordinates"]
            }
        }
        features.append(feature)
        
    return {
        "type": "FeatureCollection",
        "name": "nisar_coastal_embankments",
        "features": features
    }

# -------------------------------------------------------------------------
# Main Execution
# -------------------------------------------------------------------------
def main():
    print("[Project Kiron] Synthesizing multi-temporal NISAR datasets...")
    
    # 1. Timeline Master JSON
    timeline_path = os.path.join(OUTPUT_DIR, "nisar_shyamnagar_timeline.json")
    with open(timeline_path, "w", encoding="utf-8") as f:
        json.dump({
            "project": "Project Kiron",
            "team": "Team Bengal Orbit",
            "event": "NASA Space Apps Challenge 2026 (Earth's Endless Dance)",
            "center": [89.10, 22.33],
            "bbox": [89.00, 22.15, 89.30, 22.45],
            "timeline": TIMELINE_STEPS
        }, f, indent=2)
    print(f" -> Wrote: {timeline_path}")

    # 2. Zones GeoJSON
    zones_geojson = generate_zones_geojson()
    zones_path = os.path.join(OUTPUT_DIR, "zones.geojson")
    with open(zones_path, "w", encoding="utf-8") as f:
        json.dump(zones_geojson, f, indent=2)
    print(f" -> Wrote: {zones_path} ({len(zones_geojson['features'])} zones)")

    # 3. Embankments GeoJSON
    emb_geojson = generate_embankments_geojson()
    emb_path = os.path.join(OUTPUT_DIR, "embankments.geojson")
    with open(emb_path, "w", encoding="utf-8") as f:
        json.dump(emb_geojson, f, indent=2)
    print(f" -> Wrote: {emb_path} ({len(emb_geojson['features'])} embankment lines)")

    # 4. Field Pins JSON
    pins_path = os.path.join(OUTPUT_DIR, "field_pins.json")
    with open(pins_path, "w", encoding="utf-8") as f:
        json.dump(FIELD_PINS, f, indent=2)
    print(f" -> Wrote: {pins_path} ({len(FIELD_PINS)} field stations)")

    print("[Project Kiron] NISAR GeoJSON data generation complete!")

if __name__ == "__main__":
    main()
