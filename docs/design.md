# Design rules

The visual language of Kawal Asap. It exists so that a change made by any developer
looks like it was made by the same hand.

We follow the published principles of Vercel's Geist design system
([vercel.com/design](https://vercel.com/design): Colors, Typography, Materials,
Grid). We are not affiliated with Vercel, we use none of their marks or logos, and
this is not an endorsement. The typefaces are Geist Sans and Geist Mono, self hosted
through `@fontsource-variable/geist` and `@fontsource-variable/geist-mono`, so the app
never calls a font CDN.

Everything below is implemented in `src/index.css` (tokens, base styles) and
`tailwind.config.js` (type scale, font stacks, radii). Read those two files first.

## The one idea

Confidence comes from clarity, not from decoration. A haze dashboard has to be
believable, and every glow, gradient and frosted panel spends credibility on nothing.
When in doubt, remove the effect and let the data carry the page.

## Palette

Two page backgrounds, three component fills, two border strengths, two text
strengths, one accent. Solid values only.

| Token | Dark | Light | Used for |
| --- | --- | --- | --- |
| `--bg` | `#000000` | `#ffffff` | The page itself |
| `--surface` | `#0a0a0a` | `#fafafa` | Panels and cards (one step off the page) |
| `--surface-2` | `#171717` | `#f2f2f2` | Hover, active, selected, inputs |
| `--border` | `#262626` | `#e5e5e5` | Every hairline and divider |
| `--border-strong` | `#404040` | `#d4d4d4` | Inputs, buttons, popups |
| `--text` | `#ededed` | `#171717` | Primary text |
| `--muted` | `#a1a1a1` | `#666666` | Secondary text and table cells |
| `--faint` | `#737373` | `#8f8f8f` | Labels, notes, captions |
| `--accent` | `#f97316` | `#ea580c` | The single accent |
| `--accent-soft` | `rgba(249,115,22,.14)` | `rgba(234,88,12,.1)` | Selection, tinted fills |
| `--ok` `--warn` `--bad` `--info` | `#22c55e` `#eab308` `#ef4444` `#38bdf8` | shared | Data semantics only |
| `--shadow` | `0 1px 2px rgba(0,0,0,.6)` | `0 1px 2px rgba(0,0,0,.06)` | Almost nowhere |
| `--shadow-overlay` | `0 8px 24px -8px rgba(0,0,0,.9)` | `0 8px 24px -10px rgba(0,0,0,.25)` | Popups and overlays only |

Why orange: the subject is fire. It is not a brand colour and it is not a second
accent. There is exactly one accent in this product, and the semantic colours above
are reserved for readings and risk bands.

Borders are **solid**. A translucent border (`rgba(255,255,255,.12)`) is not allowed on
a panel: overlapping alpha edges show a seam wherever two borders cross, which is
exactly the tell of a template.

The single exception to "no alpha" is a severity badge: a **solid fill** in the data
colour with **auto-contrast ink** (`contrastInk` in `src/lib/colour.ts`) and an icon
before the label. The ink is chosen by WCAG contrast ratio rather than a brightness
cut, which is why dark ink lands on green, yellow, orange and red, and white ink lands
on deep red and purple. A badge is never coloured text on a tinted background: that was
the low-contrast version of this.

**One badge, every number.** An air reading from a model and our own province risk score
wear the same badge, because a reader should not have to learn two shapes to read a
severity. What separates the two claims is the wording: the risk score names its own
scale ("Risiko provinsi: Sedang", or the band and score in the region table), the note
beside it says the score is our own heuristic and not an official warning, and the tip
explains the term. There is no outlined variant and no colour-only cue: severity is
always fill plus a glyph plus a word.

## Type

Geist Sans for everything, Geist Mono for numbers.

| Tailwind class | Size / line height | Use |
| --- | --- | --- |
| `text-heading-32` | 32 / 40, `-0.02em`, 600 | Page title, used once |
| `text-heading-24` | 24 / 32, `-0.02em`, 600 | Map values if promoted to a hero |
| `text-heading-20` | 20 / 28, `-0.02em`, 600 | Stat values |
| `text-heading-16` | 16 / 24, `-0.01em`, 600 | Card and section titles |
| `text-copy-14` / `text-copy-13` | 14 / 22, 13 / 20 | Body copy |
| `text-label-14` / `-13` / `-12` | 14 / 20, 13 / 16, 12 / 16 | UI labels, buttons, table cells |
| `text-micro` | 11 / 16, `0.04em`, uppercase | Overlines and stats labels |

Do not write `text-[13px]`. If a size is missing from the scale, add it to the scale.

### Numbers

Numbers are data, so they are set in Geist Mono with tabular figures. Add the `num`
class to any element that renders a figure, a timestamp or a coordinate:

```tsx
<span className="num text-heading-20">{formatInt(count, lang)}</span>
```

This keeps columns aligned in tables and stops a value from jittering as it updates.
Format every number through `src/lib/format.ts`, which already knows the language:
`formatInt`, `formatOne`, `relativeTime`, `formatDateTimeWib`. Never call
`toLocaleString` directly, or Indonesian will get English grouping. When a label sits
inside a `num` element (a city name under a value), give it `font-sans` back.

## Materials

| Radius | Class | Use |
| --- | --- | --- |
| 6px | `rounded-sm` | Inputs, small buttons, chart bar tops |
| 8px | `rounded-md` (`rounded`) | Panels, cards, the map frame |
| 12px | `rounded-lg` | Panels, tiles, the map frame |
| full | `rounded-full` | Status chips only |

Shadows belong to overlays. A card on a flat page gets a border, not a shadow. The
map popups and tooltips are the only things that float, and they use
`--shadow-overlay`.

## Layout

A single centred column, `max-w-[1400px]`, with a hairline under the header and above
the footer. Panels sit on an `8px` grid gap. The map is the page's largest element and
should stay that way: it carries `h-[420px]` on phones, `sm:h-[500px]`,
`xl:h-[600px]`.

## What we never do

This list is the reason the old version felt machine made. None of it comes back:

1. No frosted or translucent panels, and no `backdrop-filter`. Not one element.
2. No glow, no neon, no coloured drop shadows.
3. No gradient text and no gradient fills. Bars are flat `var(--accent)`.
4. No decorative background gradients behind the page content.
5. No drop shadow on a card to make it "pop".
6. No `rounded-2xl` cards. Small radii are the look.
7. No second accent, no purple to blue gradient, no "tech" palette.
8. No emoji as interface chrome. The inline SVG glyphs are the entire icon set: the
   wind, dot, spark and link marks, plus the five severity glyphs in
   `src/components/ui/icons.tsx` that a badge carries. Adding an icon library is a
   discussion, not a commit.
9. No animation beyond about 150ms of colour, background or opacity.
10. No invented number. A missing value renders as `tidak tersedia` or `n/a`: see
    `AGENTS.md` for the wording rules, which are part of the design.

## Motion

Colour and background transitions around 150ms on hover only (`transition-colors`).
Nothing slides, bounces, fades in on scroll, or animates on a timer. An updating
figure is allowed to change in place, that is information, not decoration.

## Accessibility

- Focus is always visible: a 2px `--accent` outline with 2px offset, set globally in
  `src/index.css`. Do not set `outline: none` on an interactive element.
- Text strengths are `--text` on `--bg` or `--surface`. Do not use `--faint` for
  anything a reader has to read to understand a value.
- Colour never carries meaning alone: a risk band is colour plus a label, an AQI tone
  is colour plus a number and advice text.
- Numbers get real units in the markup: `µg/m³`, `MW`, `km/jam`.

## Adding a component

1. Reach for the existing pieces first: `Card` for a panel, `Badge`/`PlainBadge`/`Dot`
   for a reading, the token classes for everything visual. "Reusable" means reusing
   what exists, not building a new abstraction.
2. Style with tokens. If you need a value that is not there, add a token to
   `src/index.css` and say what it is for.
3. Titles use `text-heading-16`, labels use `text-micro`, body copy uses
   `text-copy-13`, figures use `.num`.
4. Both themes, by construction: use `var(--...)` and the token switches with
   `data-theme`. A hard-coded hex will break the other theme.
5. Both languages: no string literals in components, and remember Indonesian numbers
   group differently.

## Reviewing a design change

Load the page and check the values, not the vibe:

- `getComputedStyle(document.body).fontFamily` starts with `Geist Variable`.
- A figure's font family is `Geist Mono Variable` and `fontVariantNumeric` is
  `tabular-nums`.
- The count of elements with a `backdropFilter` other than `none` is **0**.
- Panel borders are `solid` in `#262626` (dark) or `#e5e5e5` (light), radius `8px`.
- Dark page background is `rgb(0, 0, 0)`, light is `rgb(255, 255, 255)`.
- Toggling the theme changes every panel, with no unstyled flash and no leftover
  shadow.
- Both languages render, and switching costs no scroll position.

`AGENTS.md` has the one-liner that prints all of this from a live page.

## Motion

Motion is a courtesy, never information. It exists to say *this just changed*, which is
why the city summary counts its numbers up and the marker on the index scale travels with
them: the movement is the reader's only signal that a panel they were not looking at has
been filled in.

- **Small and short.** A panel rises 6 px in 320 ms, an item fades in, nothing bounces and
  nothing loops. `animate-rise-in` and `animate-fade-in` in `tailwind.config.js` are the
  whole vocabulary; add a keyframe there rather than inlining a style.
- **Stagger lists, do not animate the container twice.** The three guidance lines arrive
  80 ms apart, so the eye is led down the list instead of the box appearing all at once.
- **Step aside for `prefers-reduced-motion`.** `src/index.css` overrides animation and
  transition duration globally, and `useCountUp` returns the final value immediately, so
  a reader who asked for less motion still gets every number.
- **A number that animates must read correctly standing still.** Never animate to a
  different value than the one shown, and never rely on motion to carry meaning: the
  count-up ends where the data says, and the scale marker is positioned from the same
  value the figure prints.

## Explaining a number
Use `src/components/ui/InfoTip.tsx`, the small info button, for **definitions**: what
a unit means, what a term covers, how a figure is produced. That is the green light to
delete footnote lines, which is where most of the remaining clutter lives.

- The tip is portalled into `document.body` with fixed positioning because the table
  sits in a horizontal scroll container, which would clip a bubble inside it. It opens
  on hover, on focus and on click, and closes on Escape, outside click or scroll.
- Nine tips ship today: freshness, filters, FRP, AQI, PM2.5, µg/m³, detection,
  confidence and the risk score. Adding a term to the glossary means two entries per
  language in `src/locales/*.json`, plus the button next to the term.

**A warning is never a tip.** The caveat that changes how a number should be read stays
in visible text: the risk score says "heuristic, not an official forecast" in the panel
line, the air panel says its values are modelled, and the map note says one detection
is not one fire. Tips explain; they do not carry the disclaimer.

## The pages, top to bottom

Six surfaces, and each one is allowed one idea. A page that answers two questions answers
neither, which is why the old single dashboard was split three ways: the map, the regional
table and the city summary each wanted to be the page, so every reader scrolled past two of
them on the way to what they came for.

Three rules follow from that, and they are the whole of the visual system's plumbing:

- **One column, one width.** `containerClass` in `src/components/ui/styles.ts` is the only
  page width (`max-w-[1400px]`, `px-4 sm:px-6`). A page that sets its own width makes two
  pages feel like two products.
- **A section is a heading, not a card.** `SectionHeading` is 20px, one step above a card
  title, so a page reads as sections that contain cards rather than as a stack of cards.
  Cards hold a thing; headings state the page's own structure.
- **Shared before local.** `EmptyState`, `SourceTimestamp`, `DataSummaryCard`, `GuideCard`
  and `SectionHeading` exist so the same idea is not rebuilt per page. `styles.ts` is the
  only home for the control classes, which is why the select on the Explore toolbar and the
  select on a region page cannot drift apart.

**`/` — what is happening, and where to go next.** An eyebrow, one `h1`, one supporting
line, and the way in: the same search box the header carries. Three summary cards follow
(detections, air quality, developments), then the map preview beside the latest
developments, the regions, and the four guides.

- **Three cards, each a single number with its scope spelled out in the detail line**
  ("Indonesia only, 24 hour window"). Every count in this product is scoped, and a count
  without its scope is a claim.
- **A card that cannot show a number says so.** Unavailable air quality reads as
  unavailable rather than as `0`, and a source that is not connected says that instead of
  rendering an empty panel. All four states in `src/lib/dataState.ts` get designed.
- **No card for anything we cannot source.** No national average, no trend arrow, no "you
  are here" tile: each of those would be a number we invented.

**`/explore` — the map owns the page.** A toolbar (window, layers, freshness stamp, refresh)
over a two column grid: the map card, and the location panel. The map card carries its
legend, one line saying a click reads the model value at that point, and the note that a
detection is not a measurement of local air. The panel beside it is the master-detail air
card, the region and city selects that scope the page, and the link through to that
region's own page. The regional table and the folded source table sit under the grid:
reference material, not the page's subject.

**`/region/$regionId` and `/region/$regionId/$placeId` — one template, city optional.**
`RegionOverview` renders both, because a reader asking about Kalimantan and a reader asking
about Palembang are asking the same question with a different scope. Head (the place, one
supporting line), the risk line when the region has one, two snapshot cards (detections in
this region box, air quality), the hotspot activity chart, the air-quality list for the
region, the developments section, the guidance for the band, and the closing data note
linking to the method.

- **The scope of every count is stated where the number is.** The counts describe the
  region *box*, not a city boundary and not an administrative province, and the line under
  the number says which. A city page names the box it falls inside before showing the box's
  counts, because that is the fact that makes the number readable.
- **The same sentence cannot say two different things.** The practical steps on a region
  page are the band's steps from `src/lib/guide.ts`, the same strings the air panel shows,
  so the guidance and the number can never disagree.
- **A city without a modelled value says so.** "No recent reading available" plus the way
  to the map, never a substitute value and never a silently shorter list presented as the
  whole picture.

**`/news` — a reading list, not a news desk.** One publisher feed is read in the browser,
filtered to headlines about fire, haze or air, and listed as the original headline, the
publisher, their publication date and a link that leaves the site. No summary, no image, no
article page: the publisher's page is the only complete version of their story, and copying
it is not something this project can stand behind. A place tag appears only when the
publisher's own location metadata names one of our boxes, and the section says whose tag it
is. All four states are designed: loading, empty (the feed was read and nothing is on
subject), failed (the feed answered with an error, which is not evidence of no news) and
ready. The page also says plainly what it is reading: the publisher's feed is their last twenty
posts, so the list is a window on what is being reported now rather than an archive, and it stays
short when little is published. Filling it would mean loosening the filter, which is padding.

**`/guide` and `/guide/$slug` — guidance that cannot contradict the numbers.** The index
carries a featured guide and the list; an article is a quick answer, what to know, the
practical steps for the relevant bands, the reference material it draws on, and the related
guides. The disclaimer is visible text at the foot of every article, never a tip, and the
reference list says the site is not endorsed by the organisations in it.

Every guide carries a line drawing, so a card is scannable before it is readable: the reader
looking for the mask guide finds the mask first. One drawing per guide, inline SVG rather than
an image file, drawn in a 64×64 box with a 1.5 stroke in `currentColor` and exactly one accent
element — the subject the guide is about, so nothing names a colour and both themes work. The
drawing sits first in the card at 44px beside the heading, and at the top of an article beside
the title; it is decorative and `aria-hidden`, so it never becomes part of a link's name. Keep
each one to a few strokes: a shape that only resolves at 200px is clutter at this size.

Panels and sections draw from the same set: `SiteArt` in `src/lib/illustrations.ts` names them
and `SiteIllustration` renders one, at 34px in `--faint` ink at the top of a summary card, where
it says what the card is about before the label is read and stays put when the data fails. The
vocabulary is an enum and the registry is keyed by it, so adding a name without drawing it fails
the build, and a guide's drawing stays keyed by `GuideSlug` — the two cannot drift. Draw a new one
when a surface has a subject to show, not to fill space: the brief's rule against clutter applies
to pictures as much as to cards.

**`/method`** is unchanged and stays the only place the full source table, freshness and
limits live.

## States

Loading, empty and failed are designed, not defaulted. `src/components/ui/Skeleton.tsx`
holds the placeholder used for both.

- **Loading** keeps the page's shape: a map-sized skeleton on Explore, card-shaped
  skeletons on the home page, so nothing jumps when the data arrives. The line under it
  names what is being downloaded and why it is slow the first time: a bare spinner makes a
  twenty second first read feel broken.
- **Empty** means the files were read and nothing was detected. Say that, say why a
  short window can legitimately be empty, and offer the longer window as an action.
  An empty map must never read as "no fires near you".
- **Failed** names the source that failed, keeps the last good timestamp, and says the
  rest of the page still works. Retry sits next to it.

## Where these rules come from

- Vercel's Geist guidance: [vercel.com/design](https://vercel.com/design) (colors,
  typography, materials, grid).
- [Atlassian's spacing system](https://atlassian.design/foundations/spacing/): the 8px
  base, group by proximity, and space inside a group never exceeding the space between
  groups.
- [Dashboard Realism](https://aesthetic.fyi/dashboard-realism): the anti-pattern we
  were drifting into, and the reason the neon, the glow and the 36px bold numbers are
  gone.
- [Dashboard type scale practice](https://www.datarocks.co.nz/blog/design-matters-9-what-the-font-in-practice):
  a small scale used consistently, tabular lining figures for data, uppercase only for
  short labels.

`docs/mockup/redesign.html` is the settled reference for the layout and the scale. It is a
standalone page with the same token names as the app, so the two cannot drift. It shows the
surfaces as they were before they were split into home, explore and the region template; the
tokens, the scale and the materials in it still hold.

## Screenshots

Captured from the running app at 1440x900, twice over, and the only ones to trust:
`app-home-dark.png`, `app-explore-dark.png`, `app-region-dark.png`, `app-home-light.png`.
They are regenerated with `scripts/measure-page.mjs --screenshot=` in the same change as
any visual work, because a stale screenshot is worse than none.

The rest of the directory predates the home/explore/region/guide pass and shows a layout
this product no longer has: `dashboard-dark.png`, `dashboard-light.png`,
`app-after-dark.png` (which is not even dark), `app-badges.png`, `app-empty-state.png`,
`app-info-tip.png`. `mockup-v2-dark.png` is the older mockup, kept as history. The README
embeds only the current one plus the map; regenerate or drop the others rather than
letting them accumulate.
