# AGENTS.md

How to work in this repository. These rules beat personal preference. If a rule is
wrong, fix it in the same change instead of working around it.

**This file holds rules. `docs/notes.md` holds measurements.** File sizes, timings,
provider behaviour, the deploy record, the dead ends, and the numbers behind a rule live
there, so a measurement changing is a one-line edit in that file rather than a rewrite
here. Add a line to this file only when it is something a future change could break twice.

Where the rest lives:

| Read | For |
| --- | --- |
| `docs/notes.md` | measurements, dead ends, what has already been tried |
| `docs/design.md` | the design system and the reasoning behind it |
| `docs/routing.md` | the route tree, the language segment, the view state model |
| `docs/mockup/redesign.html` | the settled layout, kept in sync with the app |

## What this is

**Kawal Asap** is a free, public-interest site for Indonesian fire hotspots and
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

The site is deployed on Netlify from this directory:

```bash
netlify deploy --prod --build   # builds, bundles the function, publishes
```

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
- **One third-party script, and it is the visit counter.** GoatCounter, from `index.html`,
  counted once per route through `src/lib/goatcounter.ts`. It renders nothing, blocks
  nothing, is never a source of a number on screen, and counts without a cookie. Another
  script crossing this boundary needs a reason better than "it would be interesting".
- **Tailwind for styling, tokens for values.** Never hard-code a colour, radius or
  font stack in a component. See `docs/design.md`.
- **Every option is an enum, never a bare string union.** `WindowKey`, `Confidence`,
  `ConfidenceFilter`, `LayerMode`, `WindLevel`, `Basemap`, `RiskBand`, `AqiTone`,
  `Lang`, `Theme`. Members read in the code (`WindowKey.D7`, not `'7d'`), a typo fails
  the build, and validation sets are built from `Object.values(...)` so they cannot
  drift from the enum. Region ids are the exception: they are data from
  `shared/regions.ts`, not options the UI offers.
- **An enum value never reaches the page.** Render a label from a `Record<Enum, StringKey>`
  map (`WINDOW_LABEL_KEY`, `BAND_LABEL_KEY`, `LANG_NAME_KEY`) and the strings from the
  dictionaries, so `all` or `10m` can never be interpolated into a sentence. See
  `docs/notes.md` for the two bugs that rule came from.

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

Each route answers one question rather than owning a screen region:

| Route | Answers |
| --- | --- |
| `/$lang` | "What is happening right now, and where do I go next?" One screen, then out |
| `/$lang/explore` | "Show me everything, and let me read any point" — the map owns the page |
| `/$lang/region/$regionId`, `/$lang/region/$regionId/$placeId` | "What is happening here?" One reusable template, the city optional |
| `/$lang/news` | "What is being reported?" One publisher feed, filtered to fire, haze and air, every item linking out |
| `/$lang/guide`, `/$lang/guide/$slug` | "What should I do?" Guidance, one page per guide |
| `/$lang/method` | "Where does this come from, and what can it not say?" |

A region page and a city page are the same component (`RegionOverview`) with the city
optional, because the two readers ask the same question and the difference between them is
one scope, not one template.

- **`src/lib/viewState.ts` owns the shape.** Add a filter there, in the route's search type
  and in `coerceSearch`, and nowhere else: `coerceSearch` is the only way to build search
  params, so a hand-written partial cannot leak a missing key. Each page declares only the
  keys it reads, and a key already at its default is stripped from the address.
- **Every route declares `validateSearch`, including the root route.** The root needs it so
  the header can change the language from anywhere; remove it and `useNavigate()` in the
  layout resolves its search type to `never`.
- **A URL hierarchy needs nested routes, never sibling paths.** `/region/$regionId` is a
  parent whose children are the box's own page and `$placeId`, so the shared page's
  `useSearch({ from: ... })` resolves. `docs/routing.md` has the failure mode.
- **The language is the first path segment** (`/id/...`, `/en/...`), so an English view is a
  link you can send someone and the switch rewrites one segment without leaving the page.
- **Two controls answer "where", and each has one job.** The search in the chrome
  (`LocationSearch` + `usePlaceNav`) *finds* a place and opens it; the selects inside a page
  (`LocationSelector`) *scope the page you are already on* and must never navigate away.
- **A pinned place is view state** (`?pin=lat~lon~name~area`, `formatPin`/`parsePin`), and
  anything half-typed in the search box is local state, because it is not a view.
- **Filter and language changes pass `resetScroll: false`.** Jumping to the top when someone
  ticks a checkbox makes a tool feel cheap.
- **Use `<Link>` (or `PageLink`) for navigation, never `<a href>`**, or the SPA reloads and
  drops the cache it just paid for. External links are `<a target="_blank" rel="noreferrer">`.

## Where things live

| Path | Owns |
| --- | --- |
| `src/lib/*` | data shaping, formatting, risk scoring, i18n, view state |
| `src/hooks/*` | one query per external source, plus `useCountUp` for an animated figure |
| `src/components/*` | presentational, no fetching except through the hooks |
| `src/components/ui/*` | `Card`, `Badge`, `InfoTip`, the small primitives, `styles.ts` for shared control styles |
| `src/components/site/*` | the header and the footer, the chrome every route shares |
| `src/routes/*` | layout and the pages, no data logic |
| `shared/regions.ts` | provinces, bounding boxes, neighbours. Shared with the function |
| `src/lib/places.ts` | what a place is: our regions, the monitored cities, the local matching search uses |
| `src/lib/guide.ts` | the guide library: slug, the keys its copy lives under, its reference material |
| `src/lib/news.ts` | the news feed: source config, parser, relevance filter, publisher-location to box mapping |
| `src/lib/site.ts` | facts about the site itself, so the chrome cannot disagree with itself |
| `src/lib/dataState.ts` | the four states a panel can be in, so all four get designed |
| `src/locales/*.json` | every user-visible string |
| `src/lib/risk.ts` | the heuristic. Weights are named constants, keep them that way |
| `netlify/functions/fires.ts` | the only server code |

## Language and voice

Indonesian first, English second. The dictionaries are JSON, keyed flat
(`dash.assembled`), and `src/lib/i18n.ts` looks them up. `en.json` is the reference
shape: `const idStrings: typeof en = id` makes a missing Indonesian key fail the
build. Extra keys are not caught that way, so keep the two files key-for-key. The
language is the first path segment (`/id/...`, `/en/...`) so an English view is a link
you can send to someone, and the switch rewrites that one segment without leaving the
page.

A string a component needs is a dictionary key, never a literal and never a ternary that
picks between two literals (`LANG_NAME_KEY[option]`, not `option === Lang.Id ? ... : ...`).

The UI wording is part of the product, not decoration:

- A satellite detection is a **deteksi** or **titik panas**. Never `kebakaran`, never
  "fire", never "blaze". We detect thermal anomalies; we do not confirm fires.
- A model value is a model value. Say **nilai model** and name the model. Never imply
  a measurement that did not happen.
- The regional risk score is a **heuristic** we computed, not an official forecast or
  warning. Say so in the table, every time.
- Satellite detection **confidence** is **tingkat kepercayaan** in Indonesian, the term
  the Indonesian agencies publish. Never `keyakinan`, which reads as faith.
- Guidance for residents is guidance, not an order. Keep it to what the index band means
  in practice, keep it in visible text, and say what it is not: not medical advice and not
  an official warning. We are not a warning service.
- Every panel shows when its own data was last updated. Stale data with a visible
  timestamp is honest; stale data presented as live is not.
- Missing data renders as `tidak tersedia` / `n/a`. Never substitute a zero, a guess
  or a previous value.
- Definitions of units and terms live behind the info button (`InfoTip`), so the page
  can stay clean. Caveats and limits stay in visible text: a warning is never a tip.
  A native `title` attribute is not a tooltip here: it is slow, unstyled, and looks like
  the browser rather than the site.
- Never use alarm words the data cannot support: `siaga`, `waspada` and similar sound
  like an official warning service. We are not one.
- Write Indonesian, do not translate it word for word. A sentence that reads like English
  in Indonesian words is a bug, and so is a phrase nobody would say (`di dalam all`,
  `Hanya yang baru`).

## Data

Free and keyless only: NASA FIRMS (hotspots), Open-Meteo (air quality, wind,
climate). Adding a source means all of these, in order:

1. A parser in `src/lib/` or `netlify/functions/`.
2. A row in `SourcesPanel` (`src/components/SourcesPanel.tsx`) with what it provides,
   what it covers, its row count and its fetch time.
3. A row in the Method page (`src/routes/MethodPage.tsx`) with how often it publishes.
4. A failure path. A source that fails must show as failed, not as empty.

A publisher feed is a source too, and it follows the same rules with one difference:
`SourcesPanel` reports what the hotspot payload carried (row counts, fetch times), so a feed
takes its row in the Method page and shows its own read time on its own page instead. News
is never reproduced: an item is the original headline, the publisher, their publication date
and a link out. There is no article page on this site, and adding one would be a different
product with a different legal footing.

A publisher feed is a rolling window, not an archive, so a short list is correct rather than
a bug to be fixed. Widening it by loosening the relevance terms is padding, not coverage: see
`docs/notes.md` for what the feed actually carries and what was measured.

## Design

Read `docs/design.md`; `docs/mockup/redesign.html` is the settled layout. The short version:
Geist tokens from `src/index.css`, solid 1px borders, no blur, no glow, one accent, mono with
tabular figures for numbers, and loading, empty and failed states designed like any other
view.

Two rules that keep coming back:

- **One badge, every number.** A severity badge is a solid fill in the severity colour with
  auto-contrast ink and an icon before the label. There is no outlined variant and no
  colour-only cue: severity is always fill, glyph and word.
- **Never show a derived number that contradicts the value it came from.** The air panel's
  index is computed from PM2.5 (`usAqiFromPm25` in `src/lib/aqi.ts`) rather than read from the
  provider's `us_aqi`.

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

## Traps

Each of these has bitten us. The evidence, the numbers and the dead ends are in
`docs/notes.md`; the line here is the part that must not be broken again.

- **A source that fails must render as failed**, never as zero, empty or a previous value.
- **No key anywhere.** No keyed basemap, no keyed API, no account. If a source starts
  asking for one, the source goes.
- **The FIRMS download can fail on the serverless deadline**, and it must fail visibly. Its
  own timeout is the one that fires, not the platform's, so the page gets a stated reason.
- **The hotspot layer merges cells as you zoom out.** Keep the merge table and the radius
  function in `src/lib/fires.ts`, not in the component: 111,000 individual detections is a
  grey smear.
- **One window, one anchor.** The map, the counts, the chart and the filter all measure the
  selected window back from the newest detection in the payload. Do not count a file.
- **The map, the counts and the copy describe the same number.** If a panel says "all N",
  N is the window's own total from the payload, not the length of an array that may be
  capped.
