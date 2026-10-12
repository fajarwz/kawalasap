export interface WindPoint {
  lat: number;
  lon: number;
  speed10: number;
  dir10: number;
  speed850: number | null;
  dir850: number | null;
}

export interface ClimateReading {
  regionId: string;
  precip7d: number | null;
  windKmh: number | null;
  windFrom: number | null;
  time: string;
}

/** Uniform sample over the fire prone half of the archipelago. */
export const WIND_GRID: [number, number][] = (() => {
  const points: [number, number][] = [];
  for (let lat = -10; lat <= 6; lat += 4) {
    for (let lon = 93; lon <= 141; lon += 6) {
      points.push([lat, lon]);
    }
  }
  return points;
})();

const COMPASS = [
  'N',
  'NNE',
  'NE',
  'ENE',
  'E',
  'ESE',
  'SE',
  'SSE',
  'S',
  'SSW',
  'SW',
  'WSW',
  'W',
  'WNW',
  'NW',
  'NNW',
];

export function compass16(degrees: number): string {
  const index = Math.round(((degrees % 360) + 360) % 360 / 22.5) % 16;
  return COMPASS[index];
}

/** Meteorological convention: the direction the wind blows FROM. */
export function headingTo(fromDegrees: number): number {
  return (fromDegrees + 180) % 360;
}

export function transportLine(speedKmh: number | null, fromDegrees: number | null): string {
  if (speedKmh === null || fromDegrees === null) return 'No wind data for this region.';
  if (speedKmh < 4) {
    return `Air is nearly still (${Math.round(speedKmh)} km/h), so smoke stays near where it starts.`;
  }
  const strength = speedKmh < 12 ? 'light' : speedKmh < 25 ? 'moderate' : 'strong';
  return `${strength} wind from the ${compass16(fromDegrees)} at ${Math.round(speedKmh)} km/h, pushing smoke toward the ${compass16(headingTo(fromDegrees))}.`;
}
