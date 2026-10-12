/**
 * Run the hotspot function outside Netlify and print what it costs:
 *   node scripts/api-cli.ts [24h|48h|7d]
 * Prints counts, the newest detection time, payload size raw and gzipped.
 */
import { gzipSync } from 'node:zlib';
import { handler } from '../netlify/functions/fires.ts';

const windowKey = process.argv[2] ?? '48h';
const started = Date.now();
const result = await handler(
  { httpMethod: 'GET', queryStringParameters: { window: windowKey } },
);
const elapsed = Date.now() - started;

console.log(`status           ${result.statusCode}`);
if (result.statusCode !== 200) {
  console.log(result.body);
  process.exit(1);
}

const body = JSON.parse(result.body);
const raw = Buffer.byteLength(result.body);
const gz = gzipSync(Buffer.from(result.body)).length;

console.log(`window           ${body.window}`);
console.log(`generated        ${body.generatedAt}`);
console.log(`newest detection ${body.dataEnd}`);
console.log(`partial          ${result.headers['x-kawal-partial']}`);
for (const source of body.sources) {
  console.log(
    `source           ${source.id.padEnd(14)} ${
      source.error ? `FAILED: ${source.error}` : `${source.rowsInBox} rows in box, ${source.rowsInFile} in file, ${(source.bytes / 1e6).toFixed(1)} MB`
    }`,
  );
}
console.log(`Indonesia 24h    ${body.counts.indonesia.last24h}`);
console.log(`Indonesia 48h    ${body.counts.indonesia.last48h}`);
console.log(`Indonesia 7d     ${body.counts.indonesia.last7d}`);
console.log(`neighbour 24h    ${body.counts.neighbour.last24h}`);
console.log('by region 24h:');
for (const [id, counts] of Object.entries(body.byRegion) as [
  string,
  { last24h: number; meanFrp24h: number },
][]) {
  console.log(
    `  ${id.padEnd(12)} ${String(counts.last24h).padStart(6)}   mean FRP ${counts.meanFrp24h}`,
  );
}
console.log(`daily rows       ${body.daily.length} (${body.daily[0]?.date} to ${body.daily.at(-1)?.date})`);
console.log(`cells            ${body.cells.length}`);
console.log(
  `points           ${body.points.length} in window, ${body.pointsInWindow} present, truncated=${body.pointsTruncated}`,
);
console.log(
  `payload          ${(raw / 1024).toFixed(0)} KB raw, ${(gz / 1024).toFixed(0)} KB gzipped`,
);
console.log(`handler time     ${elapsed} ms`);
