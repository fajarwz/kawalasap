export const INDONESIA_BBOX: [number, number, number, number] = [-11.5, 7.5, 92.0, 142.0]; // minLat, maxLat, minLon, maxLon

export interface Region {
  id: string;
  name: string;
  bbox: [number, number, number, number];
  centre: [number, number];
}

/**
 * Approximate grouping boxes, checked in order (first match wins).
 * They cover Indonesia's main land masses and deliberately overlap a little
 * neighbouring land (Sabah/Sarawak, Timor-Leste), so counts are "region boxes",
 * not administrative provinces. Anything outside every box is reported as
 * "neighbour" and kept out of the Indonesian totals.
 */
export const REGIONS: Region[] = [
  { id: 'sumatera', name: 'Sumatera', bbox: [-6.5, 6.5, 94.5, 106.5], centre: [-0.6, 101.5] },
  { id: 'jawa', name: 'Jawa', bbox: [-9.3, -5.0, 105.0, 114.6], centre: [-7.3, 110.0] },
  { id: 'bali_nusa', name: 'Bali & Nusa Tenggara', bbox: [-11.5, -7.4, 114.5, 128.5], centre: [-8.6, 119.0] },
  { id: 'kalimantan', name: 'Kalimantan', bbox: [-4.5, 7.5, 108.0, 119.5], centre: [-1.0, 114.0] },
  { id: 'sulawesi', name: 'Sulawesi', bbox: [-6.0, 2.0, 118.5, 125.5], centre: [-1.8, 121.0] },
  { id: 'maluku', name: 'Maluku', bbox: [-8.5, 3.0, 125.0, 130.0], centre: [-3.0, 128.0] },
  { id: 'papua', name: 'Papua', bbox: [-9.5, 1.0, 130.0, 142.0], centre: [-5.0, 137.0] },
];

export const REGION_IDS: string[] = REGIONS.map((region) => region.id);

export const NEIGHBOUR = { id: 'neighbour', name: 'Neighbouring areas', centre: null };

export function regionOf(lat: number, lon: number): string {
  for (const region of REGIONS) {
    const [minLat, maxLat, minLon, maxLon] = region.bbox;
    if (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon) return region.id;
  }
  return NEIGHBOUR.id;
}
