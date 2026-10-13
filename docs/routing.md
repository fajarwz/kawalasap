# Routes, language and view state

How an address in Kawal Asap is put together, and why. Read this before adding a page, a
filter or a language.

## The shape of a URL

```
/id/region/kalimantan?window=7d
 ↑   ↑        ↑            ↑
 │   │        │            └─ a filter this page owns, and only when it is not the default
 │   │        └────────────── the page
 │   └─────────────────────── the section of the site
 └─────────────────────────── the language
```

- **The language is the first path segment.** `/id/...` and `/en/...` are the same page in
  two languages, so an English view is a link you can send to someone. `/` redirects to
  `/id`. A prefix we do not speak in front of a real page is corrected and the rest of the
  address is kept: `/zz/explore` → `/id/explore`. A lone unknown segment (`/nope`) is a
  not-found instead, because there is no page to correct it for.
- **A region box is part of the path, not a filter.** `/region/kalimantan` *is* the page
  about that box. The old `?region=kalimantan` made the national map pretend to be a page
  about Kalimantan.
- **A filter is only in the query string of the page that owns it.** See the table below.

## One schema per page

A query string is a page's own state, so a page declares exactly the keys it reads, in
`src/lib/viewState.ts`:

| Route | Carries | Reads |
| --- | --- | --- |
| `/` | `hotspots`, `air` | its preview map's two layer switches |
| `/explore` | `window`, `region`, `confidence`, `minFrp`, `layer`, `wind`, `windLevel`, `basemap`, `pin`, `place`, `hotspots`, `air` | the whole map: it is the page |
| `/region/$regionId`, `/region/$regionId/$placeId` | `window` | the counts and the chart's range |
| `/news`, `/guide`, `/guide/$guideSlug`, `/method` | nothing | no filters at all |

Each route pairs its coercer with `stripSearchParams(<defaults>)`, so a key at its default
value is removed from the address bar:

```
/id/explore?window=24h&region=all   →   /id/explore
/id/region/kalimantan?window=24h    →   /id/region/kalimantan
```

Without that, every page would list every key at its default — which is exactly the wall of
parameters that made a guide page look like a dashboard.

## Moving between pages

Three pickers next to the coercers decide what a link carries:

- `exploreFrom(previous)` — the map's own state, filled out with the map's defaults.
- `homeFrom(previous)` — home's two switches.
- `regionFrom(previous)` — the window, and nothing else.

`src/components/ui/PageLink.tsx` is the one place that knows which destinations need a
search object and which must not have one, so a panel can offer a way on without knowing
where the reader is. A link to `/news` or `/guide` carries nothing by construction.

What travels is what means something at the other end:

| From → to | Carries |
| --- | --- |
| a region page → the map | the window, and the box when the link is about that box |
| the map → a region page | the window |
| home → anywhere | nothing |
| the header nav → anywhere | nothing but the language |

## Changing the language

`Header.tsx` uses `navigate({ to: '.', params: (previous) => ({ ...previous, lang }) })`
with the search passed through unchanged. `to: '.'` resolves against the current match, so
the reader stays on the page they were reading with their filters and their pinned point.

Do **not** bind `from` to the root route here: a relative target resolves against `from`,
so `useNavigate({ from: '/' })` turns "change the language" into "go to the home page",
which is what the switch used to do.

## Adding a page

1. Add the route under `langRoute` in `src/router.tsx`, and give it a `validateSearch` only
   if it reads something.
2. Add the keys it reads to `viewState.ts`: an interface, a coercer, defaults, and
   `stripSearchParams` in the route.
3. If other pages should link to it, add its literal to `SiteTarget` in `PageLink.tsx`.
4. Add a row to the table above and to the route table in `README.md`.
