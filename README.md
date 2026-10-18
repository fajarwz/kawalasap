# Kawal Asap

[![MIT](https://img.shields.io/badge/license-MIT-16a34a.svg)](LICENSE) ![visitors](https://img.shields.io/badge/dynamic/json?url=https://kawalasap.goatcounter.com/counter/TOTAL.json&query=count&label=Visits&color=blue) [![Web](https://img.shields.io/badge/web-kawalasap.netlify.app-0b0f14.svg)](https://kawalasap.netlify.app)

Hotspot and haze monitoring for Indonesia, built from public data.

![The home page in dark mode](docs/screenshots/app-home-dark.png)

![The map in dark mode](docs/screenshots/app-explore-dark.png)

## What it does

- **Hotspots on a map**, from NASA FIRMS detections. Cells merge as you zoom out, so an
  archipelago view stays countable.
- **Air quality for 35 Indonesian cities**, or any place you pick: search it, or click it on
  the map.
- **A page for every place.** Region boxes and cities use one template, so a shared link
  opens the same view for everyone.
- **A guide, and a reading list rather than a news desk.** The guide carries the steps for
  each index band. The news page links out to fire, haze and air-quality reporting from
  Mongabay Indonesia with the headline, the publisher and the date. Nothing is copied, and
  there is no article page.
- **Indonesian first, English second.** It supports Indonesian and English.

## Where the data comes from

| Source | Reads | Cadence |
| --- | --- | --- |
| [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/active_fire/) | VIIRS and MODIS thermal anomalies | hours after the satellite pass |
| [Open-Meteo air quality](https://open-meteo.com/en/docs/air-quality-api) | `pm2_5` and `pm10` for 35 cities, or one pinned point, in one request | hourly model |
| [Open-Meteo forecast](https://open-meteo.com/en/docs) | wind at 10 m and 850 hPa, seven day precipitation | hourly and daily |
| [Open-Meteo geocoding](https://open-meteo.com/en/docs/geocoding-api) | place names, restricted to Indonesia | on demand |
| [OpenStreetMap tiles](https://www.openstreetmap.org/copyright) | the basemap, in both themes | continuous |
| [Mongabay Indonesia](https://www.mongabay.co.id/) | fire, haze and air-quality headlines | through the day |

All free and keyless.

## Running it locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run lint
npm run build
npm run api:cli    # fetch the real data and print counts and sizes
```

`npm run dev` covers everything except the hotspot layer, because the FIRMS CSV endpoint
sends no CORS header. That is the only reason this project has a server:

```bash
netlify dev        # serves netlify/functions/fires.ts and proxies /api/fires
```

Nothing is done until `npx tsc --noEmit`, `npm run lint` and `npm run build` are clean.
Deploying is `netlify deploy --prod --build`.

## Stack

- **React 19 + Vite 7**, TypeScript, no server rendering.
- **TanStack Router** with real routes under a language segment. Never hash routing.
- **TanStack Query** for every fetch, with a `localStorage` persister.
- **Leaflet** with a canvas renderer and zoom-aware binning.
- **Tailwind 3.4** with Geist tokens: solid 1px borders, no blur, one accent, mono with
  tabular figures for numbers.
- **One Netlify function**, for the missing CORS header and nothing else.

## Known limits

- The FIRMS download is the one thing that can fail in production. It aborts its own
  download after 8 seconds and reports the source as failed rather than drawing it as zero.
- Both themes use OpenStreetMap tiles, with the dark look as a CSS filter on the tile layer
  only, because CARTO's basemaps now need an API key.

## Docs

| Read | For |
| --- | --- |
| `AGENTS.md` | the rules for working in this repo |
| `docs/design.md` | the design system and the reasoning behind it |
| `docs/routing.md` | the route tree, the language segment and the view state model |
| `docs/notes.md` | measurements, dead ends, and why a rule exists |

## Licence

MIT. See [LICENSE](LICENSE).

## Credit

The visual language follows [Vercel's Geist design system](https://vercel.com/design).
Basemap tiles are © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
Hotspot data is from [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/active_fire/);
weather, air quality and place names are from [Open-Meteo](https://open-meteo.com/).
