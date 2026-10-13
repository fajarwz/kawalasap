# Kawal Asap

**[kawalasap.netlify.app](https://kawalasap.netlify.app)** — deployed, Indonesian by
default, English under `/en`.

Hotspot and haze monitoring for Indonesia, built entirely from free and keyless public
data. No account, no API key, no paid tier, and that is a hard rule rather than a
preference: if a source starts asking for a key, the source goes.

Pantauan titik panas dan kabut asap Indonesia. Datanya dari sumber publik gratis: tanpa
kunci API, tanpa akun, tanpa langganan.

![The home page in dark mode: the country at a glance](docs/screenshots/app-home-dark.png)

![The map in dark mode: the density layer over Indonesia](docs/screenshots/app-explore-dark.png)

## What it shows

- **Hotspots on a map**, from NASA FIRMS satellite detections. Cells merge as you zoom
  out, so an archipelago view stays countable instead of becoming a grey smear.
- **Air quality for 35 Indonesian cities**, plus any place you pick: search a city or
  click the map and the panel reads the model at that point.
- **A city summary** when you pick a place: PM2.5, the index, PM10, the detections in
  that city's province, where the value sits on the index scale, an eight day trend, and
  three concrete lines for that band. The panel is master-detail, so the list and the
  summary are never fighting for the same column.
- **A regional risk table** for the seven Indonesian regions, from a weighted heuristic
  that is labelled as ours wherever it appears.
- **Wind and dryness context**, because a hotspot on its own does not say whether it will
  spread.
- **Pages for places.** Every region box and every monitored city has a page of its own, and
  both are one template, so a shared link opens the same view for everyone.
- **A guide, and a reading list rather than a news desk.** The guide carries the practical
  steps for each index band, using the same wording the panels do. The news page lists fire,
  haze and air-quality reporting from Mongabay Indonesia with the original headline, the
  publisher and the publication date, and links every item straight out to them. There is no
  article page here and nothing is copied from the publisher. The list is short by design: a
  publisher's feed is their last twenty posts, so it is a window on recent reporting rather than
  an archive, and the page says so.
- **Indonesian first, English second.** The language is the first path segment (`/id`, `/en`),
  so an English view is a link you can send someone, and the switch rewrites that one
  segment without leaving the page.
- **One page, one set of filters.** A query string is a page's own state, so `/news`, `/guide`
  and `/method` carry none at all, a region page carries the window its chart reads, and only
  the map carries the whole filter set. A key that is already at its default is stripped from
  the address bar. See [`docs/routing.md`](docs/routing.md).

## Where the data comes from

| Source | What we read from it | Cadence | Cost |
| --- | --- | --- | --- |
| [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/active_fire/) | VIIRS and MODIS thermal anomalies (CSV) | near real time, hours after the satellite pass | free, keyless |
| [Open-Meteo air quality](https://open-meteo.com/en/docs/air-quality-api) | `pm2_5`, `pm10` for 35 cities plus a pinned point, batched into one request | hourly model | free, keyless |
| [Open-Meteo forecast](https://open-meteo.com/en/docs) | wind at 10 m and 850 hPa, seven day precipitation | hourly and daily | free, keyless |
| [Open-Meteo geocoding](https://open-meteo.com/en/docs/geocoding-api) | place names and coordinates, restricted to Indonesia | on demand | free, keyless |
| [OpenStreetMap tiles](https://www.openstreetmap.org/copyright) | the basemap, in both themes | continuous | free, attribution required |
| [Mongabay Indonesia](https://www.mongabay.co.id/) | reporting on fire, haze and air quality, filtered by headline. Only the headline, the publisher, the date and a link are shown | publishes through the day | free, keyless |

Nothing else is fetched, and nothing is sent anywhere. There is no analytics, no account,
and no cookie. What you keep in your browser is a theme preference and a 24 hour cache.

## What it says, and what it will not say

The wording is part of the product, not decoration. If this tool ever reads as an official
warning service, it has failed.

- **A detection is a detection.** We show thermal anomalies from a satellite; we do not
  confirm fires. The Indonesian wording is *deteksi* or *titik panas*, never *kebakaran*.
- **A model value is a model value, and we name the model.** PM2.5 here comes from the
  CAMS global model, so it shows the regional picture well and can miss a street level
  difference.
- **The air index is derived from PM2.5**, using the US EPA 24 hour breakpoints, rather
  than read from the provider's own index: Open-Meteo has answered `us_aqi 550` beside
  `pm2_5 33.3 µg/m³`, and a badge that contradicts the number next to it is a bug.
- **The regional risk score is our heuristic**, not an official forecast or a warning. The
  method page spells out all five weights.
- **Guidance for residents is general guidance for the index band**, in visible text, and
  it says what it is not: not medical advice and not an official warning.
- **Every panel carries its own timestamp.** Stale data with a visible time is honest;
  stale data presented as live is not.
- **Missing data renders as `tidak tersedia` / n/a.** Never a zero, never a guess, never
  yesterday's value.
- **Nothing we cannot support.** There is no "12% down on last week" and no "confirmed
  fire", because this data cannot produce either claim.

## Running it locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run lint
npm run build
npm run api:cli    # fetch the real data and print counts and sizes
```

`npm run dev` is enough for everything except the hotspot layer, because the FIRMS CSV
endpoint sends no CORS header. That is the only reason a server exists in this project:

```bash
netlify dev        # serves netlify/functions/fires.ts and proxies /api/fires
```

Nothing is done until `tsc`, `npm run lint` and `npm run build` are all clean.

## Caching is a feature, not an optimisation

Four layers, all deliberate, so the project stays inside free limits:

| Layer | Where | Window |
| --- | --- | --- |
| Query cache | TanStack Query `staleTime` | 15 minutes |
| Persisted cache | `localStorage` (a reload is served from it) | 24 hours |
| In-function memo | `netlify/functions/fires.ts` | 10 minutes (2 when the payload is partial) |
| CDN | `netlify.toml` `s-maxage` | 15 minutes |

Raising a request count "for freshness" is a regression. Show the timestamp instead.

## Project structure

| Path | Owns |
| --- | --- |
| `src/lib/*` | data shaping, formatting, risk scoring, i18n, view state |
| `src/hooks/*` | one query per external source, plus `useCountUp` |
| `src/components/*` | presentational, no fetching except through the hooks |
| `src/components/ui/*` | `Card`, `Badge`, `InfoTip` and the small primitives |
| `src/routes/*` | layout and three pages, no data logic |
| `src/locales/*.json` | every user visible string, keyed flat |
| `shared/regions.ts` | provinces, bounding boxes, neighbours. Shared with the function |
| `netlify/functions/fires.ts` | the only server code |
| `docs/design.md` | the design system and the reasoning behind it |
| `docs/notes.md` | measurements, dead ends, and why a rule exists |
| `docs/routing.md` | the route tree, the language segment and the view state model |
| `docs/mockup/redesign.html` | the settled layout, kept in sync with the app |
| `AGENTS.md` | the rules for working in this repo |

## Status, honestly

- **Deployed at [kawalasap.netlify.app](https://kawalasap.netlify.app).** The app and its
  function both ship. The one thing that can fail there is the FIRMS download behind the
  hotspot layer: the South East Asia 7 day files are 7.8 MB (VIIRS) and 1.4 MB (MODIS),
  and the function aborts its own download 8 seconds in, well inside Netlify's limit.
  Both files came back inside that window on the deploy, so the layer is live; that is
  close to the limit rather than comfortably inside it. When a download does not make
  it, the source is reported as failed rather than drawn as zero. The fix is decided and
  not built: a scheduled background function that writes the CSV into Netlify Blobs,
  with `fires.ts` reading the blob instead of NASA.
- **CARTO basemaps now need an API key**, so both themes use OpenStreetMap tiles and the
  dark look is a CSS filter on the tile layer only. Detections keep their real colours.
- **NASA's FIRMS WMS looks usable and is not**: it advertises CORS and then returns the
  same 27 KB placeholder tile for every request.
- **GIBS publishes the thermal anomaly layers as Mapbox vector tiles** (`.mvt`, Level 8).
  Unexplored, and the most promising path to dropping the server function entirely.
- **35 curated cities** ship with the app. Anywhere else comes from the geocoder or from a
  click on the map, which is why the place search is restricted to Indonesia.

## Stack

- **React 19 + Vite 7**, TypeScript strict, no server rendering. A dashboard gains nothing
  from SSR and pays a runtime for it.
- **TanStack Router** with real routes, each under a language segment: `/$lang`,
  `/$lang/explore`, `/$lang/region/$regionId`, `/$lang/region/$regionId/$placeId`,
  `/$lang/news`, `/$lang/guide`, `/$lang/guide/$slug`, `/$lang/method`. No hash routing, and
  each page carries only the search keys it reads, so a pinned place rides in the map's URL
  and a guide page has a clean one. Every view is linkable and refreshable —
  `docs/routing.md` is the model.
- **TanStack Query** with a `localStorage` persister, one query per source.
- **Leaflet** with a canvas renderer and zoom-aware binning for the detection layer.
- **Tailwind 3.4** with Geist tokens. Solid 1px borders, no blur, no glow, one accent,
  mono with tabular figures for every number.
- **One Netlify function**, because of a missing CORS header and nothing else.
- Bundle: 676 kB of JavaScript (208 kB gzipped) and 38 kB of CSS (12 kB gzipped).
- **Illustrations are inline SVG, drawn from tokens.** One line drawing per guide (card and
  article), and `SiteArt` drawings on the summary cards, all in `currentColor` with a single
  accent element, so they follow the theme and cost no request.

## Design

`docs/design.md` is the source of truth, and `docs/mockup/redesign.html` is the settled
layout that both the app and the doc are held to. The short version: Geist tokens from
`src/index.css`, one accent, severity always as a solid badge with auto-contrast ink and an
icon, definitions behind an info button while caveats stay in visible text, and motion that
is small, short, and switched off entirely for `prefers-reduced-motion`.

## Licence

MIT. See [LICENSE](LICENSE).

## Credit

The visual language follows [Vercel's Geist design system](https://vercel.com/design).
Basemap tiles are © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
Hotspot data is from [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/active_fire/);
weather, air quality and place names are from [Open-Meteo](https://open-meteo.com/).
