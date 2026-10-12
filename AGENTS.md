# AGENTS.md

How to work in this repository. These rules beat personal preference. If a rule is
wrong, fix it in the same change instead of working around it.

## What this is

**Kawal Asap** is a free, public-interest dashboard for Indonesian fire hotspots and
haze. Indonesian is the default language. Every fact on screen comes from a free,
keyless public source, and that must stay true: nothing in this project may need an
account, an API key, or a paid tier.

Naming: the product is **Kawal Asap**, the repository and the npm package are
`kawalasap`, and the intended domain is `kawalasap.id`. The working directory on the
author's machine is still `kawalkebakaran`, which is cosmetic and the only place the old
name survives.

## Commands

```bash
npm install
npm run dev        # http://localhost:5173
npm run lint
npm run build
npm run api:cli    # fetches the real data and prints counts and sizes
```

Nothing is "done" until all three of these are clean:

```bash
npx tsc --noEmit -p tsconfig.json
npm run lint
npm run build
```

Then load the page and check it, see "Verifying a UI change" below.

## Stack rules

- **TypeScript only.** No `.js` or `.mjs` under `src/`. Config files at the root are
  the only exception.
- **React + Vite SPA.** Not Next, not TanStack Start. Server rendering buys a
  dashboard nothing and costs a runtime.
- **TanStack Router with real routes.** Never hash routing. All view state lives in
  the query string, which makes every view linkable and refreshable.
- **TanStack Query for every fetch.** No bare `fetch` in a component.
- **One server file: `netlify/functions/fires.ts`.** It exists for one reason, the
  NASA FIRMS CSV endpoint sends no CORS header. Do not add a server route to solve a
  problem that belongs on the client.
- **Tailwind for styling, tokens for values.** Never hard-code a colour, radius or
  font stack in a component. See `docs/design.md`.
- **Every option is an enum, never a bare string union.** `WindowKey`, `Confidence`,
  `ConfidenceFilter`, `LayerMode`, `WindLevel`, `Basemap`, `RiskBand`, `AqiTone`,
  `Lang`, `Theme`. Members read in the code (`WindowKey.D7`, not `'7d'`), a typo fails
  the build, and validation sets are built from `Object.values(...)` so they cannot
  drift from the enum. Region ids are the exception: they are data from
  `shared/regions.ts`, not options the UI offers.

### Caching is a feature

The whole point is staying inside free limits. Four layers, all of them deliberate:

| Layer | Where | Window |
| --- | --- | --- |
| Query cache | `src/lib/queryClient.ts` (`staleTime`) | 15 min |
| Persisted cache | `localStorage` via `main.tsx` | 24 h |
| In-function memo | `netlify/functions/fires.ts` | 10 min (2 min when partial) |
| CDN | `netlify.toml` (`s-maxage`) | 15 min |

Raising a request count "just for freshness" is a regression. Show the user the
timestamp instead: every panel already carries its own.

## Routes and state

Three routes: `/`, `/region/$regionId`, `/method`.

- `src/lib/viewState.ts` owns the shape. Add a filter there, in `DashboardSearch` and
  in `coerceSearch`, and nowhere else. `coerceSearch` is the only way to build search
  params, so a hand-written partial can never leak a missing key.
- A place the reader pinned (`?pin=lat~lon~name~area`) is view state like any other:
  `formatPin` and `parsePin` in the same file. Search and map clicks both set it, and a
  shared link reopens the same point. Anything half-typed in the search box stays local
  state: it is not a view.
- Every route declares `validateSearch: coerceSearch`, **including the root route**.
  The root needs it so the header can change the language from any route. Remove it
  and `useNavigate()` in the layout resolves its search type to `never`.
- Filter and language changes must pass `resetScroll: false` to `navigate` or `Link`.
  Jumping to the top when someone ticks a checkbox is the kind of thing that makes a
  tool feel cheap.
- Use `<Link>` for navigation, never `<a href>`, or the SPA reloads and drops the
  cache it just paid for.

## Where things live

| Path | Owns |
| --- | --- |
| `src/lib/*` | data shaping, formatting, risk scoring, i18n, view state |
| `src/hooks/*` | one query per external source, plus `useCountUp` for an animated figure |
| `src/components/*` | presentational, no fetching except through the hooks |
| `src/components/ui/*` | `Card`, `Badge`, the small primitives |
| `src/routes/*` | layout and the three pages, no data logic |
| `shared/regions.ts` | provinces, bounding boxes, neighbours. Shared with the function |
| `src/locales/*.json` | every user-visible string |
| `src/lib/risk.ts` | the heuristic. Weights are named constants, keep them that way |
| `netlify/functions/fires.ts` | the only server code |

## Language and voice

Indonesian first, English second. The dictionaries are JSON, keyed flat
(`dash.assembled`), and `src/lib/i18n.ts` looks them up. `en.json` is the reference
shape: `const idStrings: typeof en = id` makes a missing Indonesian key fail the
build. Extra keys are not caught that way, so keep the two files key-for-key. The
language lives in `?lang=` so an English view is linkable.

The UI wording is part of the product, not decoration:

- A satellite detection is a **deteksi** or **titik panas**. Never `kebakaran`, never
  "fire", never "blaze". We detect thermal anomalies; we do not confirm fires.
- A model value is a model value. Say **nilai model** and name the model. Never imply
  a measurement that did not happen.
- The regional risk score is a **heuristic** we computed, not an official forecast or
  warning. Say so in the table, every time.
- Guidance for residents is guidance, not an order. Keep it to what the index band means
  in practice, keep it in visible text, and say what it is not: not medical advice and not
  an official warning. We are not a warning service.
- Every panel shows when its own data was last updated. Stale data with a visible
  timestamp is honest; stale data presented as live is not.
- Missing data renders as `tidak tersedia` / `n/a`. Never substitute a zero, a guess
  or a previous value.
- Definitions of units and terms live behind the info button (`InfoTip`), so the page
  can stay clean. Caveats and limits stay in visible text: a warning is never a tip.
- Never use alarm words the data cannot support: `siaga`, `waspada` and similar sound
  like an official warning service. We are not one.

## Data

Free and keyless only: NASA FIRMS (hotspots), Open-Meteo (air quality, wind,
climate). Adding a source means all of these, in order:

1. A parser in `src/lib/` or `netlify/functions/`.
2. A row in `SourcesPanel` (`src/components/SourcesPanel.tsx`) with what it provides,
   what it covers, its row count and its fetch time.
3. A row in the Method page (`src/routes/MethodPage.tsx`) with how often it publishes.
4. A failure path. A source that fails must show as failed, not as empty.

## Design

Read `docs/design.md`, and open `docs/mockup/redesign.html` to see the settled layout.
The short version: Geist tokens from `src/index.css`, solid 1px borders, no blur, no
glow, one accent, mono with tabular figures for numbers, and loading, empty and failed
states designed like any other view. A severity badge is a solid fill with auto-contrast
ink and an icon before the label. Never show a derived number that contradicts the value
it came from: the air panel's index is computed from PM2.5 (`usAqiFromPm25` in
`src/lib/aqi.ts`) instead of read from the provider's `us_aqi`, because Open-Meteo has
answered `us_aqi 550` beside `pm2_5 33.3 µg/m³`.

## Verifying a UI change

Screenshots mislead and so does a passing build. Load the page in a real browser and
read the computed values. The skill that ships with this workflow has
`scripts/measure-page.mjs` for exactly this: it drives headless Chrome over CDP, runs
an expression in the page and can screenshot.

```bash
# one-off: start headless Chrome
chrome --headless=new --disable-gpu --remote-debugging-port=9222 \
  --user-data-dir="$LOCALAPPDATA/Temp/chrome-check" --no-first-run about:blank
```

Then, for example, to prove the design tokens actually landed:

```bash
node measure-page.mjs "http://localhost:5173/" 1440 900 \
  '(() => JSON.stringify({font: getComputedStyle(document.body).fontFamily, blur: [...document.querySelectorAll("*")].filter(e => getComputedStyle(e).backdropFilter !== "none").length}))()'
```

That check is how we know the Geist pass worked: `Geist Variable` on the body,
`Geist Mono Variable` on numbers, and `blur: 0`.

## Gotchas that cost us time

- **NASA serves the FIRMS CSV at roughly 0.2 MB/s.** The 7 day South East Asia file is
  about 11 MB, so a cold fetch takes 50 to 60 seconds. That fits local development and
  a background job, but **not** Netlify's 10 second synchronous function limit. The
  fix is decided, not yet built: a scheduled background function writing to Netlify
  Blobs, with `fires.ts` reading the blob.
- **CARTO basemaps need an API key now.** The dark map is OpenStreetMap tiles plus a
  CSS filter on the tile layer only, so detection and city markers keep their real
  colours. Do not reintroduce a keyed basemap.
- **NASA's FIRMS WMS looks usable and is not.** It advertises CORS, then returns the
  same 27 KB placeholder tile for every request, and `GetFeatureInfo` returns 500.
- **The hotspot layer must merge cells as you zoom out.** 111,000 detections drawn
  individually is a grey smear. `cellMergeFactor` in `src/lib/fires.ts` merges 0.1°
  cells up to 1.0° and scales the radius. Keep the merge table and the radius function
  in that file, not in the component.
- **NASAs GIBS service publishes the thermal anomaly layers as Mapbox vector tiles**
  (`.mvt`, `epsg4326`, Level8), not PNG. Unused so far; candidate path for dropping
  the server function entirely.
