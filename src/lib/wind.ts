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

/** Meteorological convention: the direction the wind blows FROM. */
export function headingTo(fromDegrees: number): number {
  return (fromDegrees + 180) % 360;
}
