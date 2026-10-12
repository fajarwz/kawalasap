export interface City {
  id: string;
  name: string;
  region: string;
  lat: number;
  lon: number;
  /** Human readable province or area, set for places the reader pinned. */
  area?: string;
}

/** One city's air quality now, plus the hourly record used for the trend chart. */
export interface CityReading {
  city: City;
  pm25: number | null;
  pm10: number | null;
  usAqi: number | null;
  europeanAqi: number | null;
  time: string | null;
  series: { time: string[]; pm25: (number | null)[] };
}

/**
 * Air-quality reference points: provincial capitals and the cities most often
 * hit by smoke, weighted toward Sumatera and Kalimantan. Values come from the
 * CAMS model (Open-Meteo), not from a ground station.
 */
export const CITIES: City[] = [
  { id: 'banda-aceh', name: 'Banda Aceh', region: 'sumatera', lat: 5.55, lon: 95.32 },
  { id: 'medan', name: 'Medan', region: 'sumatera', lat: 3.59, lon: 98.67 },
  { id: 'pekanbaru', name: 'Pekanbaru', region: 'sumatera', lat: 0.51, lon: 101.45 },
  { id: 'padang', name: 'Padang', region: 'sumatera', lat: -0.95, lon: 100.35 },
  { id: 'jambi', name: 'Jambi', region: 'sumatera', lat: -1.6, lon: 103.62 },
  { id: 'palembang', name: 'Palembang', region: 'sumatera', lat: -2.98, lon: 104.75 },
  { id: 'bengkulu', name: 'Bengkulu', region: 'sumatera', lat: -3.8, lon: 102.26 },
  { id: 'bandar-lampung', name: 'Bandar Lampung', region: 'sumatera', lat: -5.42, lon: 105.26 },
  { id: 'batam', name: 'Batam', region: 'sumatera', lat: 1.13, lon: 104.05 },
  { id: 'pangkal-pinang', name: 'Pangkal Pinang', region: 'sumatera', lat: -2.13, lon: 106.11 },
  { id: 'pontianak', name: 'Pontianak', region: 'kalimantan', lat: -0.02, lon: 109.34 },
  { id: 'sintang', name: 'Sintang', region: 'kalimantan', lat: 0.08, lon: 111.5 },
  { id: 'palangkaraya', name: 'Palangka Raya', region: 'kalimantan', lat: -2.21, lon: 113.92 },
  { id: 'banjarmasin', name: 'Banjarmasin', region: 'kalimantan', lat: -3.32, lon: 114.59 },
  { id: 'samarinda', name: 'Samarinda', region: 'kalimantan', lat: -0.5, lon: 117.15 },
  { id: 'balikpapan', name: 'Balikpapan', region: 'kalimantan', lat: -1.27, lon: 116.83 },
  { id: 'tarakan', name: 'Tarakan', region: 'kalimantan', lat: 3.33, lon: 117.59 },
  { id: 'jakarta', name: 'Jakarta', region: 'jawa', lat: -6.2, lon: 106.85 },
  { id: 'bandung', name: 'Bandung', region: 'jawa', lat: -6.92, lon: 107.61 },
  { id: 'semarang', name: 'Semarang', region: 'jawa', lat: -6.97, lon: 110.42 },
  { id: 'yogyakarta', name: 'Yogyakarta', region: 'jawa', lat: -7.8, lon: 110.36 },
  { id: 'surabaya', name: 'Surabaya', region: 'jawa', lat: -7.25, lon: 112.75 },
  { id: 'denpasar', name: 'Denpasar', region: 'bali_nusa', lat: -8.65, lon: 115.22 },
  { id: 'mataram', name: 'Mataram', region: 'bali_nusa', lat: -8.58, lon: 116.12 },
  { id: 'kupang', name: 'Kupang', region: 'bali_nusa', lat: -10.17, lon: 123.61 },
  { id: 'makassar', name: 'Makassar', region: 'sulawesi', lat: -5.15, lon: 119.43 },
  { id: 'palu', name: 'Palu', region: 'sulawesi', lat: -0.9, lon: 119.87 },
  { id: 'manado', name: 'Manado', region: 'sulawesi', lat: 1.49, lon: 124.84 },
  { id: 'kendari', name: 'Kendari', region: 'sulawesi', lat: -3.98, lon: 122.51 },
  { id: 'ambon', name: 'Ambon', region: 'maluku', lat: -3.7, lon: 128.18 },
  { id: 'ternate', name: 'Ternate', region: 'maluku', lat: 0.79, lon: 127.38 },
  { id: 'sorong', name: 'Sorong', region: 'papua', lat: -0.88, lon: 131.26 },
  { id: 'jayapura', name: 'Jayapura', region: 'papua', lat: -2.53, lon: 140.72 },
  { id: 'timika', name: 'Timika', region: 'papua', lat: -4.55, lon: 136.89 },
  { id: 'merauke', name: 'Merauke', region: 'papua', lat: -8.49, lon: 140.4 },
];

export const CITY_BY_ID = new Map(CITIES.map((city) => [city.id, city]));
