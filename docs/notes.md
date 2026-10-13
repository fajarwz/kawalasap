# Notes: measurements, dead ends, and why a rule exists

`AGENTS.md` holds the rules. This file holds the evidence behind them: what was measured,
what was tried and abandoned, and what a number actually was when a rule was written. A
measurement going stale should be a one-line edit here, not a rewrite of the rules.

Dates are when the measurement was taken, so a stale number can be recognised as stale.

## The deploy

- Live at **<https://kawalasap.netlify.app>**. `netlify status` and `netlify sites:list`
  have the team and the project id for anyone who needs them; repeating them here would
  only go stale.
- Published with `netlify deploy --prod --build`, which runs `npm run build` and bundles
  `netlify/functions/fires.ts` through esbuild as `netlify.toml` says. The project is linked
  through `.netlify/state.json`, which is gitignored.
- The repository's *Website* field points at the live URL, so it is one click from GitHub.

### What that first deploy taught us (13 Oct 2026)

The function gives its own download 8 seconds (`DEADLINE_MS`, 8 s when serverless, never
locally) and then aborts, reporting the source as failed rather than being killed by the
platform. On the deploy both FIRMS files came back inside that window and the payload was
byte-for-byte what the same code produced locally: `last24h` 1416, `last48h` 20664,
`last7d` 85995, newest detection `2026-10-13T06:59Z`, VIIRS 7,802,753 bytes and MODIS
1,383,840 bytes. So the hotspot layer works live, but that is close to the limit rather
than comfortably inside it, and the honest failure mode matters more than the happy path.

Latency varies by an order of magnitude between measurements (0.2 MB/s was measured once,
several MB/s on the deploy), which is why the durable fix stays worthwhile: a scheduled
background function writing the CSV into Netlify Blobs, with `fires.ts` reading the blob.

## The sources, as they actually are

| File | Size | Rows | Kept by the Indonesia bbox |
| --- | --- | --- | --- |
| `SUOMI_VIIRS_C2_SouthEast_Asia_7d.csv` (VIIRS, Suomi NPP) | 7.8 MB | 95,340 | ~79,000 |
| `MODIS_C6_1_SouthEast_Asia_7d.csv` (MODIS, Terra + Aqua) | 1.4 MB | 17,926 | ~14,000 |

Base: `https://firms.modaps.eosdis.nasa.gov/data/active_fire/`. About 113,000 rows come
down, roughly 93,000 land inside the box, and the density layer's cells are built from the
same filtered set. VIIRS reports confidence as `l`/`n`/`h` and MODIS as a percentage; both
are normalised to low/nominal/high, and satellite codes `N`/`T`/`A` become names.

## Counting, and the bug that made three numbers disagree

Measured on 13 Oct 2026, before the fix, on the default 24 hour view:

| What the page said | The number |
| --- | --- |
| the card | 8,638 detections |
| the density layer, painted | 109,064 detections |

The cells were built once from the whole seven day file, so the default view painted
twelve times more than the number above it. The seven day column was worse in the other
direction: it counted every row in the file (108,657) while the map drew a rolling seven
days from the newest detection (93,070). And the client always fetched `?window=48h`
regardless of the selection, so the seven day view could not draw more than 48 hours:
25,996 dots under a card saying 92,720.

All three now use one anchor, the newest detection in the payload, and the client asks for
the window it is showing. Rules that came out of it are in `AGENTS.md`: *one window, one
anchor*, and *the map, the counts and the copy describe the same number*.

## Raw values reaching the page

Two Indonesian translation bugs, both the same shape: an enum value interpolated into a
sentence. `regionLabel('all')` produced "Di dalam all" on the explore panel, and the
confidence filter label rendered as "Keyakinan", which reads as faith or religion rather
than a satellite's confidence. The fix was `RegionScope` for the first and the agency term
**tingkat kepercayaan** for the second, plus a `Record<Enum, StringKey>` label map wherever
an enum needs words. See the rule in `AGENTS.md`.

## Badges

The outline variant (`BadgeVariant.Outlined`) was introduced so a value we computed would
not look like a value we read from a source, then removed: an air reading and a risk score
wear the same badge, and the wording and the note beside the score carry the difference.
There is no `BadgeVariant` any more. A native `title` used to carry advice and score
drivers on the badge; it is gone too, because it is slow and unstyled, and the definition
belongs in an `InfoTip`.

## The news feed

- Source: `https://mongabay.co.id/feed/` (no `www`), CORS `*`, no key.
- It is the publisher's **last twenty posts**, it ignores `?paged=`, and its category feed
  mirrors the main feed. About a fifth of the items are on subject, so a four to five item
  list is correct rather than broken.
- Only the headline, the publisher, the publication date and a link are shown. No article
  page exists here, and adding one would be a different product with a different legal
  footing.
- Widening the relevance terms to fill the page was measured and rejected as padding.
  Volume can only come from keeping items as they appear, which needs storage this
  repository does not have yet.

## Dead ends

- **CARTO basemaps need an API key now**, so the dark map is OpenStreetMap tiles with a CSS
  filter on the tile layer only. Detection and city markers keep their real colours, which
  is why the filter is on the tiles and not on the map.
- **NASA's FIRMS WMS looks usable and is not.** It advertises CORS, then returns the same
  27 KB placeholder tile for every request, and `GetFeatureInfo` returns 500.
- **GIBS publishes the thermal anomaly layers as Mapbox vector tiles** (`.mvt`, `epsg4326`,
  Level 8), not PNG. Unexplored, and the most promising path to dropping the server
  function entirely.

## Zooming, merging and drawing

A whole-dataset draw is about 111,000 detections, which as individual dots is a grey smear.
`src/lib/fires.ts` merges 0.1° cells up to 1.0° and scales the radius with
`cellMergeFactor`; the merge table and the radius function live there, not in the
component. Colouring is by the strongest detection in a cell, which is also why the merge
has to be window-aware: the cells are built from the requested window now, not the whole
file.

## Verifying in a headless browser

`scripts/measure-page.mjs` (in the `react-vite-app` skill) attaches to a Chrome on port
9222, evaluates one expression in the page, and can screenshot with
`--screenshot=<path>`; it sets `deviceScaleFactor: 2`, so 1440x900 comes out as 2880x1800.

One limitation worth knowing: a programmatically dispatched `click`, `mouseover`,
`pointerover` or `focus` does **not** open the `InfoTip` bubble, so a probe cannot assert
its contents. Judge the tooltip by its trigger in the markup and check it by hand, or read
the bubble's text out of the component's own strings.

Screenshot set: see `docs/design.md`, which lists which files are current and which are
history.
