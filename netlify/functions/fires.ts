/**
 * The only server-side piece of the app.
 *
 * NASA FIRMS serves its hotspot CSVs with no CORS header, so a browser cannot
 * read them directly. This function downloads the Southeast Asia files, keeps
 * the detections inside the Indonesia bounding box, and returns one compact
 * JSON payload.
 *
 * Caching keeps the load on NASA tiny:
 *   - module-level memo, 10 minutes, for warm invocations
 *   - CDN headers (s-maxage 900) so Netlify's edge serves every visitor from cache
 */
import { INDONESIA_BBOX, regionOf } from '../../shared/regions.ts';

interface SourceDef {
  id: string;
  label: string;
  url: string;
  page: string;
}

interface FireRecord {
  lat: number;
  lon: number;
  date: string;
  minutes: number;
  frp: number;
  confidence: number;
  night: number;
  satellite: string;
  sourceIndex: number;
}

export interface WindowCounts {
  last24h: number;
  last48h: number;
  last7d: number;
  frpSum24h: number;
  meanFrp24h: number;
}

export interface SourceMeta {
  id: string;
  label: string;
  page: string;
  file: string;
  fetchedAt: string;
  bytes: number;
  rowsInFile: number;
  rowsInBox: number;
  coversFrom: string | null;
  coversTo: string | null;
  error: string | null;
  satellites: string[];
}

interface DailyRow {
  date: string;
  count: number;
  countIndonesia: number;
  frpSum: number;
  byRegion: Record<string, number>;
}

interface Dataset {
  generatedAt: string;
  dataEndISO: string;
  bbox: [number, number, number, number];
  sources: SourceMeta[];
  records: FireRecord[];
  counts: { indonesia: WindowCounts; neighbour: WindowCounts };
  byRegion: Record<string, WindowCounts>;
  daily: DailyRow[];
  cells: [number, number, number, number][];
}

interface NetlifyEvent {
  httpMethod?: string;
  queryStringParameters?: Record<string, string> | null;
}

const FIRMS_ROOT = 'https://firms.modaps.eosdis.nasa.gov/data/active_fire';

const SOURCES: SourceDef[] = [
  {
    id: 'VIIRS_SNPP_NRT',
    label: 'VIIRS (Suomi NPP)',
    url: `${FIRMS_ROOT}/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_SouthEast_Asia_7d.csv`,
    page: 'https://firms.modaps.eosdis.nasa.gov/active_fire/',
  },
  {
    id: 'MODIS_C61_NRT',
    label: 'MODIS (Terra + Aqua)',
    url: `${FIRMS_ROOT}/modis-c6.1/csv/MODIS_C6_1_SouthEast_Asia_7d.csv`,
    page: 'https://firms.modaps.eosdis.nasa.gov/active_fire/',
  },
];

const CELL_STEP = 0.1;
const MAX_POINTS = 60000;
const MEMO_MS = 10 * 60 * 1000;
const WINDOWS: Record<string, number> = {
  '24h': 86400000,
  '48h': 172800000,
  '7d': 604800000,
};
const SAT_LABELS: Record<string, string> = { N: 'Suomi NPP', T: 'Terra', A: 'Aqua' };

/**
 * Netlify's synchronous functions are cut off after 10 seconds and NASA sends
 * these files at about 200 KB/s, so only roughly 2 MB can arrive in time. A
 * local run has no such limit, which is why the dashboard is developed and used
 * against the dev server. In production the payload has to be built ahead of the
 * request; see the README for the two free ways to do that.
 */
const DEADLINE_MS = isServerless() ? 8000 : Number.POSITIVE_INFINITY;

function isServerless(): boolean {
  return Boolean(
    process.env.NETLIFY || process.env.LAMBDA_TASK_ROOT || process.env.AWS_LAMBDA_FUNCTION_NAME,
  );
}

function describeError(error: unknown): string {
  const aborted =
    error instanceof Error && (error.name === 'AbortError' || /abort/i.test(error.message));
  if (aborted && Number.isFinite(DEADLINE_MS)) {
    return `NASA did not finish sending this file inside the ${Math.round(DEADLINE_MS / 1000)} second function limit`;
  }
  return error instanceof Error ? error.message : String(error);
}

let memo: { at: number; ttl: number; dataset: Dataset } | null = null;

function confidenceRank(value: unknown): number {
  const raw = String(value ?? '').trim().toLowerCase();
  if (raw === 'l' || raw === 'low') return 0;
  if (raw === 'n' || raw === 'nominal') return 1;
  if (raw === 'h' || raw === 'high') return 2;
  const numeric = Number(raw);
  if (Number.isFinite(numeric)) return numeric < 30 ? 0 : numeric < 80 ? 1 : 2;
  return 1;
}

function acquisitionTs(date: string, time: string): number {
  const clock = String(time ?? '').padStart(4, '0');
  return Date.parse(`${date}T${clock.slice(0, 2)}:${clock.slice(2, 4)}:00Z`);
}

function parseCsv(
  text: string,
  sourceIndex: number,
): { rows: FireRecord[]; total: number } {
  const lines = text.split('\n');
  const header = lines[0].replace(/^\uFEFF/, '').trim().split(',');
  const col: Record<string, number> = {};
  header.forEach((name, index) => {
    col[name.trim()] = index;
  });
  const rows: FireRecord[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line) continue;
    const field = line.split(',');
    if (field.length < header.length) continue;
    const lat = Number(field[col.latitude]);
    const lon = Number(field[col.longitude]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    if (lat < INDONESIA_BBOX[0] || lat > INDONESIA_BBOX[1]) continue;
    if (lon < INDONESIA_BBOX[2] || lon > INDONESIA_BBOX[3]) continue;
    rows.push({
      lat,
      lon,
      date: field[col.acq_date],
      minutes: acquisitionTs(field[col.acq_date], field[col.acq_time]),
      frp: Number(field[col.frp]) || 0,
      confidence: confidenceRank(field[col.confidence]),
      night: field[col.daynight] === 'N' ? 1 : 0,
      satellite: field[col.satellite] ?? '',
      sourceIndex,
    });
  }
  return { rows, total: Math.max(lines.length - 1, 0) };
}

async function fetchSource(
  source: SourceDef,
  sourceIndex: number,
  signal?: AbortSignal,
): Promise<{ meta: SourceMeta; records: FireRecord[] }> {
  const fetchedAt = new Date().toISOString();
  const response = await fetch(source.url, {
    headers: { 'user-agent': 'kawalasap/0.1 (public interest haze dashboard, kawalasap.id)' },
    signal,
  });
  if (!response.ok) throw new Error(`NASA FIRMS returned HTTP ${response.status}`);
  const text = await response.text();
  const { rows, total } = parseCsv(text, sourceIndex);
  let coversFrom: string | null = null;
  let coversTo: string | null = null;
  for (const row of rows) {
    if (!coversFrom || row.date < coversFrom) coversFrom = row.date;
    if (!coversTo || row.date > coversTo) coversTo = row.date;
  }
  const satellite = SAT_LABELS[rows[0]?.satellite ?? ''] ?? source.label;
  return {
    meta: {
      id: source.id,
      label: source.label,
      page: source.page,
      file: source.url.split('/').pop() ?? '',
      fetchedAt,
      bytes: new TextEncoder().encode(text).length,
      rowsInFile: total,
      rowsInBox: rows.length,
      coversFrom,
      coversTo,
      error: null,
      satellites: [satellite],
    },
    records: rows,
  };
}

function failedMeta(source: SourceDef, error: unknown): SourceMeta {
  return {
    id: source.id,
    label: source.label,
    page: source.page,
    file: source.url.split('/').pop() ?? '',
    fetchedAt: new Date().toISOString(),
    bytes: 0,
    rowsInFile: 0,
    rowsInBox: 0,
    coversFrom: null,
    coversTo: null,
    error: describeError(error),
    satellites: [],
  };
}

function emptyCounts(): WindowCounts {
  return { last24h: 0, last48h: 0, last7d: 0, frpSum24h: 0, meanFrp24h: 0 };
}

function addToCounts(bucket: WindowCounts, ageMs: number, frp: number): void {
  if (ageMs <= WINDOWS['24h']) {
    bucket.last24h += 1;
    bucket.frpSum24h += frp;
  }
  if (ageMs <= WINDOWS['48h']) bucket.last48h += 1;
  bucket.last7d += 1;
}

async function getDataset(): Promise<Dataset> {
  if (memo && Date.now() - memo.at < memo.ttl) return memo.dataset;

  const controller = new AbortController();
  const deadline = Number.isFinite(DEADLINE_MS)
    ? setTimeout(() => controller.abort(), DEADLINE_MS)
    : null;

  let settled: { meta: SourceMeta; records: FireRecord[] }[];
  try {
    settled = await Promise.all(
      SOURCES.map(async (source, index) => {
        try {
          return await fetchSource(source, index, controller.signal);
        } catch (error) {
          return { meta: failedMeta(source, error), records: [] as FireRecord[] };
        }
      }),
    );
  } finally {
    if (deadline) clearTimeout(deadline);
  }

  const records = settled.flatMap((item) => item.records);
  records.sort((a, b) => b.minutes - a.minutes);

  const dataEnd = records.length ? records[0].minutes : Date.now();

  const counts = { indonesia: emptyCounts(), neighbour: emptyCounts() };
  const byRegion: Record<string, WindowCounts> = {};
  const dailyMap = new Map<string, DailyRow>();
  const cellMap = new Map<string, [number, number, number, number]>();

  for (const row of records) {
    const region = regionOf(row.lat, row.lon);
    const ageMs = dataEnd - row.minutes;
    addToCounts(region === 'neighbour' ? counts.neighbour : counts.indonesia, ageMs, row.frp);
    if (!byRegion[region]) byRegion[region] = emptyCounts();
    addToCounts(byRegion[region], ageMs, row.frp);

    let day = dailyMap.get(row.date);
    if (!day) {
      day = { date: row.date, count: 0, countIndonesia: 0, frpSum: 0, byRegion: {} };
      dailyMap.set(row.date, day);
    }
    day.count += 1;
    day.frpSum += row.frp;
    if (region !== 'neighbour') day.countIndonesia += 1;
    day.byRegion[region] = (day.byRegion[region] ?? 0) + 1;

    const latIndex = Math.round(row.lat / CELL_STEP);
    const lonIndex = Math.round(row.lon / CELL_STEP);
    const cellKey = `${latIndex}|${lonIndex}`;
    const cell = cellMap.get(cellKey);
    if (cell) {
      cell[2] += 1;
      if (row.frp > cell[3]) cell[3] = Number(row.frp.toFixed(1));
    } else {
      cellMap.set(cellKey, [
        Number((latIndex * CELL_STEP).toFixed(2)),
        Number((lonIndex * CELL_STEP).toFixed(2)),
        1,
        Number(row.frp.toFixed(1)),
      ]);
    }
  }

  for (const bucket of [counts.indonesia, counts.neighbour, ...Object.values(byRegion)]) {
    bucket.meanFrp24h = bucket.last24h
      ? Number((bucket.frpSum24h / bucket.last24h).toFixed(1))
      : 0;
    bucket.frpSum24h = Number(bucket.frpSum24h.toFixed(1));
  }

  const dataset: Dataset = {
    generatedAt: new Date().toISOString(),
    dataEndISO: new Date(dataEnd).toISOString(),
    bbox: INDONESIA_BBOX,
    sources: settled.map((item) => item.meta),
    records,
    counts,
    byRegion,
    daily: [...dailyMap.values()].sort((a, b) => (a.date < b.date ? -1 : 1)),
    cells: [...cellMap.values()],
  };

  const partial = settled.some((item) => item.meta.error);
  memo = {
    at: Date.now(),
    // A partial build must not stick around: retry sooner instead.
    ttl: partial ? 2 * 60 * 1000 : MEMO_MS,
    dataset,
  };
  return dataset;
}

function buildPayload(body: Dataset, windowKey: string) {
  const dataEnd = Date.parse(body.dataEndISO);
  const limit = WINDOWS[windowKey];
  const inWindow = body.records.filter((row) => dataEnd - row.minutes <= limit);
  const kept = [...inWindow].sort((a, b) => b.frp - a.frp).slice(0, MAX_POINTS);
  kept.sort((a, b) => b.minutes - a.minutes);

  return {
    generatedAt: body.generatedAt,
    window: windowKey,
    dataEnd: body.dataEndISO,
    bbox: body.bbox,
    sources: body.sources,
    counts: body.counts,
    byRegion: body.byRegion,
    daily: body.daily,
    cells: body.cells,
    points: kept.map((row) => [
      Number(row.lat.toFixed(2)),
      Number(row.lon.toFixed(2)),
      Number(row.frp.toFixed(1)),
      row.confidence,
      row.night,
      Math.round((dataEnd - row.minutes) / 60000),
      row.sourceIndex,
    ]),
    pointsInWindow: inWindow.length,
    pointsTruncated: inWindow.length > MAX_POINTS,
  };
}

export const handler = async (event: NetlifyEvent) => {
  const params = event?.queryStringParameters ?? {};
  const windowKey = WINDOWS[params.window] ? params.window : '48h';
  const headers: Record<string, string> = {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    // Netlify's edge holds this for 15 minutes, so NASA is hit a few times an
    // hour in total rather than once per visitor.
    'cache-control': 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600',
    'netlify-cdn-cache-control': 'public, s-maxage=900, stale-while-revalidate=3600',
  };
  try {
    const dataset = await getDataset();
    const partial = dataset.sources.some((source) => source.error);
    // A complete build can sit at the edge for 15 minutes. A partial one is
    // held briefly so the next visitor gets a chance at a full download.
    const edgeTtl = partial ? 120 : 900;
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'cache-control': `public, max-age=300, s-maxage=${edgeTtl}, stale-while-revalidate=3600`,
        'netlify-cdn-cache-control': `public, s-maxage=${edgeTtl}, stale-while-revalidate=3600`,
        'x-kawal-partial': partial ? 'true' : 'false',
      },
      body: JSON.stringify(buildPayload(dataset, windowKey)),
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({
        error: describeError(error),
        hint: 'NASA FIRMS did not answer. The dashboard shows nothing rather than zero hotspots.',
      }),
    };
  }
};
