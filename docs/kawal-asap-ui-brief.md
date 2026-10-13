# Kawal Asap — UI/UX Brief for Hermes

**Repository:** https://github.com/fajarwz/kawalasap  
**Product:** Kawal Asap  
**Audience:** People in Indonesia who want to understand nearby fire hotspots, available air-quality readings, local developments, and practical ways to reduce haze exposure.

## 1. Role and workflow

Act as a senior product designer and frontend engineer. First inspect the repository, existing framework, routes, components, styling, package scripts, and current implementation. Reuse the current stack and working code. Do not rewrite the architecture or add dependencies without a clear need.

Give a brief plan based on the actual repository, then implement the UI rather than stopping at the plan. Build reusable templates, not bespoke pages for every region. Run available lint, type-check, build, or test commands after changes and report their actual results. Never claim a command passed if you did not run it.

If live data is not integrated, use clearly labeled demo/mock data or intentional empty states. Never fabricate live readings, current hotspot counts, news, source attribution, timestamps, or integrations.

## 2. Product purpose

Kawal Asap helps people move from “I don't understand what the haze data means” to “I understand what is known about my area and what precautions I can consider today.”

The product connects four things:
1. **Fire hotspots:** satellite-detected locations that may indicate fires.
2. **Air quality:** available PM2.5/AQI readings from monitoring stations.
3. **Regional developments:** relevant news and official notices about fires, haze, health, school disruptions, public impact, and government response.
4. **Practical guidance:** plain-language advice about outdoor activities, masks, indoor air, children, symptoms, and interpreting the data.

This is a public information and environmental monitoring website, not a social network, community platform, or technical-only dashboard.

### Accuracy rules

- A hotspot detection does not automatically mean nearby air is unhealthy.
- Poor air quality does not prove a nearby hotspot caused it.
- Wind, distance, timing, weather, and other pollution sources can affect local conditions.
- One monitoring station must not be presented as representative of an entire province or city.
- Identify the source and timestamp of data wherever available.
- Distinguish measured readings, satellite detections, forecasts, and derived information.
- If data is missing or stale, say so. Never invent values or call demo data “live.”
- Do not create a national AQI score or composite risk score without a valid, explained methodology.
- Health guidance must be based on authoritative sources; do not invent medical claims.

## 3. Visual direction

Create a calm, trustworthy, modern public-information site with a light editorial feel. It should feel designed for ordinary people, not like a generic admin dashboard or a dense data-science interface.

### Visual system

- Light theme by default.
- Background: warm off-white or very pale neutral.
- Main text: dark charcoal/near-black.
- Secondary text: muted but readable gray/slate.
- Primary accent: deep forest green.
- Secondary accent: restrained teal or sage.
- Hotspot/fire accent: muted orange/amber, used only for fire-related information.
- AQ status colors used sparingly and always paired with text/icons.
- Subtle borders; flat cards or very soft shadows; consistent moderate corner radius.
- Clean, readable sans-serif typography, comfortable body text around 16px where appropriate, and generous line height.
- Simple consistent line icons. Do not decorate every heading with an emoji.
- Illustrations only when they explain a guide topic. Avoid random stock photos and oversized decorative graphics.

Avoid excessive gradients, glassmorphism, floating widgets, giant hero typography, many competing colors, too many pills/badges, walls of KPI cards, nested cards, and card-inside-card layouts.

### Text density — highest priority

The site must not feel crowded. Follow these rules strictly:

1. One section = one main idea.
2. Headings usually 2–6 words.
3. Introductory copy is usually 1–2 short sentences.
4. Cards have a short label, value/status, one supporting line or timestamp, and at most one action.
5. Do not display every available statistic. Prioritize what a resident needs first.
6. Maximum three primary summary cards in a desktop row; stack them on mobile.
7. Avoid repeating the same information in the hero, cards, headings, and sidebars.
8. Use short paragraphs and bullets for instructions.
9. Keep secondary filters compact or behind “More filters.”
10. Add visible breathing room between major sections.
11. Do not fill whitespace with invented metrics, generic slogans, or irrelevant features.
12. On mobile, reflow content into a clear vertical sequence; do not squeeze desktop columns into narrow cards.
13. When unsure whether to add a component, leave it out unless it helps users understand their location, the evidence, or what to do next.

## 4. Information architecture

Main navigation:
- Home
- Explore
- News
- Haze Guide
- Search location (a visible search action)

Routes:

```text
/
/explore
/region/{province}
/region/{province}/{city-or-regency}
/news
/news/{article-slug}
/guide
/guide/{guide-slug}
```

Examples: `/region/riau`, `/region/riau/pekanbaru`, adapted to existing route conventions.

Rules:
- Logo/name links to Home.
- Keep the header compact.
- Use one consistent location search experience throughout the site.
- No login, profiles, comments, forums, likes, follows, or community features.
- Do not create separate top-level Hotspots and Air Quality pages for the initial version; these belong as layers/sections inside Explore and Regional Overview.
- Use one reusable regional template for provinces, cities, and regencies.
- Do not invent news if the content source is not ready. Use a clear empty state or explicitly labeled demo content.
- Footer links: About, Data sources, Methodology, Contact, if appropriate.

### Location search and selectors

Search placeholder: **“Search province, city, or regency…”**

Example results: Riau Province, Pekanbaru City, Dumai City. Label each result by its administrative type. Selecting a result opens its Regional Overview.

For filters, use Province first, then optional City / Regency, then date range only where useful, and map layers on Explore. Do not force users to select both province and city before seeing content. Do not imply that city-level AQ data exists merely because a city is selectable. In Indonesian, distinguish Kota and Kabupaten; in English use “City / Regency.”

## 4.1 ASCII wireframes — visual layout reference

These wireframes define the intended layout and content hierarchy. They are not pixel-perfect designs. Follow them for the relative placement and priority of elements, then use the detailed page specifications below for exact copy and behavior.

**Important:** Do not interpret every line as a separate card. Use whitespace, typography, and subtle dividers to group content. The finished interface should feel less boxed-in than these ASCII diagrams.

### Home (`/`) — desktop

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ KAWAL ASAP       Home   Explore   News   Haze Guide       [Search 🔍]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  UNDERSTAND THE HAZE                                                     │
│  Know the fires. Understand the air.                                   │
│  Explore fire hotspots, available air-quality readings, and local      │
│  developments across Indonesia.                                        │
│                                                                         │
│  [ Search province, city, or regency…                         ] [→]     │
│  Explore the map →                                                      │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  INDONESIA AT A GLANCE                                                  │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
│  │ Fire hotspots    │  │ Air quality      │  │ Latest developments  │  │
│  │ Available data   │  │ Station readings │  │ Regional updates     │  │
│  │ Source · Time    │  │ Source · Time    │  │ Latest stories       │  │
│  │ Explore →        │  │ Explore →        │  │ Read news →          │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘  │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  EXPLORE INDONESIA                                                      │
│                                                                         │
│  ┌───────────────────────────────────────┐  ┌───────────────────────┐  │
│  │                                       │  │ LATEST DEVELOPMENTS   │  │
│  │          MAP OF INDONESIA             │  │                       │  │
│  │                                       │  │ Story headline        │  │
│  │  [Hotspots] [Air quality]             │  │ Source · Date         │  │
│  │                                       │  │                       │  │
│  │                                       │  │ Another headline      │  │
│  │                                       │  │ Source · Date         │  │
│  │                                       │  │                       │  │
│  │  Open interactive map →               │  │ View all news →       │  │
│  └───────────────────────────────────────┘  └───────────────────────┘  │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  EXPLORE BY REGION                                                      │
│  Choose a place to see local data and developments.                     │
│                                                                         │
│  [ Province ▼ ]  [ City / Regency ▼ ]                                   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  PROTECT YOURSELF FROM HAZE                                              │
│  Practical guidance for days when smoke or poor air quality may matter. │
│                                                                         │
│  Going outside     Choosing a mask     Indoor air     Children & school │
│  Explore all guidance →                                                 │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  About     Data sources     Methodology     Contact                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### Home (`/`) — mobile

```text
┌──────────────────────────────┐
│ KAWAL ASAP          [☰] [🔍] │
├──────────────────────────────┤
│ UNDERSTAND THE HAZE          │
│                              │
│ Know the fires.              │
│ Understand the air.          │
│                              │
│ Explore hotspots, available  │
│ air-quality readings, and    │
│ local developments.          │
│                              │
│ [ Search a location…      ]  │
│                              │
│ Explore the map →            │
├──────────────────────────────┤
│ INDONESIA AT A GLANCE        │
│                              │
│ Fire hotspots                │
│ Available data · Source/time │
│ Explore →                    │
│                              │
│ Air quality                  │
│ Available readings           │
│ Source/time · Explore →      │
│                              │
│ Latest developments          │
│ Regional updates             │
│ Read news →                  │
├──────────────────────────────┤
│ EXPLORE INDONESIA            │
│                              │
│       MAP PREVIEW            │
│                              │
│ [Hotspots] [Air quality]     │
│ Open interactive map →       │
├──────────────────────────────┤
│ LATEST DEVELOPMENTS          │
│                              │
│ Story headline               │
│ Source · Date                │
│                              │
│ Another headline             │
│ Source · Date                │
│ View all news →              │
├──────────────────────────────┤
│ EXPLORE BY REGION            │
│ [ Province ▼ ]               │
│ [ City / Regency ▼ ]         │
├──────────────────────────────┤
│ PROTECT YOURSELF FROM HAZE   │
│                              │
│ Going outside →              │
│ Choosing a mask →            │
│ Indoor air →                 │
│ Children & school →          │
├──────────────────────────────┤
│ About · Sources · Methodology│
└──────────────────────────────┘
```

### Explore Map (`/explore`) — desktop

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ KAWAL ASAP       Home   Explore   News   Haze Guide       [Search 🔍]   │
├─────────────────────────────────────────────────────────────────────────┤
│ Explore the map                                                         │
│ View satellite-detected hotspots and available air-quality readings.    │
│                                                                         │
│ [ Province ▼ ] [ City / Regency ▼ ] [ Date range ▼ ]                   │
│ [✓ Hotspots] [✓ Air quality]                                            │
├──────────────────────────────────────────────────────┬──────────────────┤
│                                                      │ SELECT A LOCATION│
│                                                      │                  │
│                                                      │ Choose a place   │
│                                                      │ on the map to    │
│                                                      │ view available   │
│                                                      │ readings and     │
│                                                      │ local updates.   │
│                                                      │                  │
│                   INTERACTIVE MAP                    │                  │
│                                                      │                  │
│             🔥 Hotspot       ● Air station           │                  │
│                                                      │                  │
│                                                      │                  │
│                                                      │                  │
├──────────────────────────────────────────────────────┴──────────────────┤
│ Legend · Data sources · Last updated                                    │
│ Hotspot detections do not by themselves establish local air quality.    │
│ How to interpret this data →                                            │
└─────────────────────────────────────────────────────────────────────────┘
```

When a location is selected, replace the right-hand placeholder with a **compact summary**:

```text
┌──────────────────────────┐
│ PEKANBARU                │
│ City                     │
│                          │
│ HOTSPOTS                 │
│ Available count          │
│ Source · Time            │
│                          │
│ AIR QUALITY              │
│ Latest available reading │
│ Station · Time           │
│                          │
│ RELATED NEWS             │
│ Short headline           │
│                          │
│ View regional overview → │
└──────────────────────────┘
```

Do not show all of these groups when data is unavailable. Do not invent readings to fill the panel.

### Explore Map (`/explore`) — mobile

```text
┌──────────────────────────────┐
│ KAWAL ASAP          [☰] [🔍] │
├──────────────────────────────┤
│ Explore the map              │
│                              │
│ [ Province ▼ ]               │
│ [ City / Regency ▼ ]         │
│ [Layers ▼]                   │
├──────────────────────────────┤
│                              │
│                              │
│          MAP                 │
│                              │
│    🔥              ●         │
│                              │
│                              │
│                              │
│                              │
├──────────────────────────────┤
│ Legend · Source · Updated    │
└──────────────────────────────┘

When a marker is selected:

┌──────────────────────────────┐
│ PEKANBARU              [ × ]  │
│ Latest available information  │
│                              │
│ Hotspots · Air quality       │
│ Source and timestamp         │
│                              │
│ View regional overview →     │
└──────────────────────────────┘
```

The selected-location panel should appear as a bottom sheet over the map. Keep the map usable and the sheet easy to dismiss.

### Regional Overview (`/region/{province}/{city?}`)

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Home / Indonesia / Riau                                                 │
│                                                                         │
│ Riau                                                                    │
│ Fire activity, air quality, and local developments for Riau.            │
│                                                                         │
│ [ Choose city / regency ▼ ]                                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  HOTSPOT DETECTIONS                     AIR QUALITY                     │
│  Latest available count                 Latest available reading       │
│  Period · Source · Time                 Station · Source · Time         │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ HOTSPOT ACTIVITY                                                        │
│                                                                         │
│  ┌─────────────────────────────────────┐                                │
│  │                                     │  Short explanation of recent   │
│  │       SMALL REGIONAL MAP            │  activity, if data supports it │
│  │                                     │                                │
│  └─────────────────────────────────────┘                                │
│  View hotspots on the map →                                             │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ AIR QUALITY                                                             │
│                                                                         │
│ Station name · Reading · Timestamp · Source                             │
│ Station name · Reading · Timestamp · Source                             │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ WHAT'S HAPPENING IN RIAU?                                               │
│                                                                         │
│ Headline                                                                │
│ Publisher · Date                                                        │
│                                                                         │
│ Another headline                                                        │
│ Publisher · Date                                                        │
│ View all Riau news →                                                    │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ WHAT YOU CAN DO                                                         │
│                                                                         │
│ Going outside →      Choosing a mask →      Indoor air →                │
│ Children & symptoms →                                                    │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ Sources and methodology →                                               │
└─────────────────────────────────────────────────────────────────────────┘
```

On mobile, stack each section vertically. Use a compact summary first, then hotspot activity, air quality, local news, and practical guidance. The map is only a preview; the Explore page owns the full map experience.

### News Listing (`/news`)

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ News & developments                                                     │
│ Reporting and official updates about fires, haze, and local impact.     │
│                                                                         │
│ [ Province ▼ ] [ City / Regency ▼ ] [ Topic ▼ ]                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  Headline about a regional development                │
│  │              │  One- or two-sentence original summary.               │
│  │  OPTIONAL    │  Publisher · Date · Region                             │
│  │  THUMBNAIL   │  Read original →                                       │
│  └──────────────┘                                                       │
│                                                                         │
│  ───────────────────────────────────────────────────────────────────    │
│                                                                         │
│  Headline about another development                                     │
│  One- or two-sentence original summary.                                 │
│  Publisher · Date · Region · Read original →                            │
│                                                                         │
│  ───────────────────────────────────────────────────────────────────    │
│                                                                         │
│  Another headline                                                       │
│  Publisher · Date · Region · Read original →                            │
│                                                                         │
│                         [ Load more ]                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

Prefer an editorial list with subtle separators over a grid of large image cards. The headline should be the most prominent element; source and date should be visible but secondary.

### News Article (`/news/{article-slug}`)

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Home / News                                                             │
│                                                                         │
│ Headline describing the development                                     │
│ Publisher · Publication date · Region                                   │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │                     OPTIONAL ARTICLE IMAGE                          │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ SUMMARY                                                                 │
│ A concise explanation in original wording.                             │
│                                                                         │
│ WHY IT MATTERS                                                          │
│ Explain local relevance only when it can be supported.                 │
│                                                                         │
│ RELATED LOCAL DATA                                                      │
│ Separate source and timestamp; omit if unavailable or irrelevant.      │
│                                                                         │
│ Read the original report →                                              │
│                                                                         │
│ Related stories · Regional overview →                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

Keep the article column narrower than the full desktop viewport for comfortable reading. Do not reproduce the original article in full.

### Haze Guide (`/guide`)

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Haze guide                                                              │
│ Practical steps for understanding haze and reducing exposure.           │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ START WITH THE BASICS                                               │ │
│ │ Learn how to check air quality and understand what the data means.  │ │
│ │ Understand air quality →                                            │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ GUIDES                                                                  │
│                                                                         │
│ Going outside              Choosing a mask                             │
│ Practical outdoor tips     What masks can and cannot do                │
│                                                                         │
│ Indoor air                  Children and school                         │
│ Reduce smoke indoors       Considerations for families                 │
│                                                                         │
│ Symptoms and getting help  Understanding the data                       │
│ Warning signs              Hotspots vs air-quality readings             │
│                                                                         │
│ Sources and health guidance                                                │
└─────────────────────────────────────────────────────────────────────────┘
```

Keep guide cards simple. Use a two-column layout on desktop and one column on mobile. Avoid making every guide a large illustrated promotional tile.

### Guide Article (`/guide/{guide-slug}`)

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Home / Haze guide / Choosing a mask                                     │
│                                                                         │
│ Choosing a mask                                                         │
│ A short introduction to the question this guide answers.                │
│                                                                         │
│ QUICK ANSWER                                                            │
│ One to three concise sentences based on reputable guidance.             │
│                                                                         │
│ WHAT TO KNOW                                                            │
│ Short section with clear subheading and readable paragraphs.            │
│                                                                         │
│ PRACTICAL STEPS                                                         │
│ 1. Clear action                                                         │
│ 2. Clear action                                                         │
│ 3. Clear action                                                         │
│                                                                         │
│ WHO MAY NEED EXTRA CARE                                                 │
│ Include only when supported by authoritative guidance.                  │
│                                                                         │
│ SOURCES                                                                 │
│ Links to the original authoritative sources · Review date if applicable │
│                                                                         │
│ Related guidance →                                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

The article body should have a comfortable reading width. Do not wrap the whole article in one card or turn each paragraph into a separate card.

### Shared interaction states

Location search:

```text
┌──────────────────────────────────────────────┐
│ Search Indonesia                             │
│ [ Enter province, city, or regency…       ]  │
│                                              │
│ SUGGESTED LOCATIONS                          │
│ Riau Province                                │
│ Pekanbaru City                               │
│ Dumai City                                   │
└──────────────────────────────────────────────┘
```

No data:

```text
No recent data available

This source has not provided a recent reading
for this location.

View data sources →
```

No news results:

```text
No updates found

Try another location or topic, or check back later.

[ Clear filters ]
```

Loading and error states should be concise and should not make the page jump dramatically when content appears.

### Final wireframe rule

The wireframes establish **content order and visual priority**, not a requirement to display every possible piece of information. If the real data is unavailable, omit the section or use the appropriate unavailable state. Never add filler content simply to match the diagram.

On every page, the user should quickly understand:
1. Where they are.
2. What the available information says.
3. Where the information came from and how recent it is.
4. What they can do next.

## 5. Page specifications

## A. Home (`/`)

**Purpose:** A clear front door to the site: explain the value, let users find a place, show a restrained snapshot, and guide them to deeper data or practical advice. This is not a full analytics dashboard.

### A1. Header

Left: Kawal Asap wordmark/name. Right: Home, Explore, News, Haze Guide, and a search action. Keep the header compact.

### A2. Hero

Text-led; no huge background image, animated globe, or giant decorative illustration.

- Eyebrow: `UNDERSTAND THE HAZE`
- Headline: `Know the fires. Understand the air.`
- Description: `Explore fire hotspots, available air-quality readings, and local developments across Indonesia.`
- Main control: location search with placeholder `Search province, city, or regency…`
- Optional helper: `Start with a place to see its latest available information.`
- Optional quiet link: `Explore the map →`

Do not add several competing hero buttons.

### A3. National snapshot

Heading: `Indonesia at a glance`  
Optional supporting line: `A quick look at the latest available information.`

Use at most three compact summary cards:

1. **Fire hotspots** — real value only if connected; otherwise `Data not connected`. Descriptor: `Satellite detections`. Show source/time when available. Action: `Explore hotspots →`.
2. **Air quality** — summarize nationally only if coverage supports it. If coverage is limited, say `Available station readings`, not “Indonesia's air quality.” Show source/time when available. Action: `View air-quality data →`.
3. **Latest developments** — show actual recent items, not invented counts. Action: `Read regional updates →`.

Each card contains only label, value/status, one supporting line or timestamp, and at most one link. No mini charts. If national coverage is incomplete, rename the section `Latest available data`.

### A4. Explore Indonesia

Heading: `Explore Indonesia`

Two-column desktop layout:
- Left, larger: restrained map preview of Indonesia with minimal controls. If no map integration exists, show an honest placeholder that can be connected later; do not pretend a static image is interactive.
- Right, smaller: up to three recent regional developments.

Map heading: `Fire hotspots and air quality`  
Layer labels: `Hotspots`, `Air quality`  
Action: `Open interactive map →`

Each news item: short headline, region, publisher/source, date. Keep it to 2–3 lines. Link: `View all news →`.

On mobile, stack map and news vertically.

### A5. Explore by region

Heading: `Explore by region`  
Description: `Choose a place to see local data and developments.`

Use a compact province selector and optional city/regency selector. Show only a few region links on Home, and only when data/content exists. No huge grid of all administrative regions. Do not invent risk ratings or “most affected” rankings.

### A6. Practical guidance

Heading: `Protect yourself from haze`  
Description: `Simple steps for days when smoke or poor air quality may affect your area.`

Show up to four guide links:
- `Going outside`
- `Choosing a mask`
- `Indoor air`
- `Children and school`

Each has at most one short explanatory line. Include `Explore all guidance →` if useful.

### A7. Footer

About, Data sources, Methodology, Contact. A short note that data availability varies by source and location is appropriate.

### Mobile Home order

Compact header → hero → location search → snapshot cards → map preview → latest developments → region selection → guide links → footer. No narrow two-column layouts, no horizontal scrolling, and no critical information hidden in carousels.

## B. Explore Map (`/explore`)

**Purpose:** Explore satellite hotspot detections and available air-quality readings geographically. Do not turn this into a page of unrelated charts.

### B1. Heading

Title: `Explore the map`  
Description: `View satellite-detected hotspots and available air-quality readings by location.`

### B2. Compact filter bar

- Province selector
- Optional City / Regency selector
- Date range, only if supported by the source
- Layer controls: `Hotspots`, `Air quality`

Do not add wind/weather until its data is actually integrated. Keep controls in one compact toolbar; put secondary filters behind `More filters`.

### B3. Map and selected-location panel

Desktop: map uses roughly 65–70% of the main content width; selected-location panel uses the remainder. Give the map useful height.

Map requirements:
- Clear legend for visible layers.
- Visually distinguish hotspot markers and air-quality stations.
- Do not show an AQ value where no reading exists.
- Accessible marker interactions where supported.
- Loading, error, and no-data states.
- Source and last-updated information just below or beside the map.
- No large text overlays covering the map.
- Reuse any existing map implementation. If none exists, build an honest placeholder/structure rather than pretending a static image is a live interactive map.

Initial selected panel:
- Heading: `Select a location`
- Text: `Choose a place on the map to view available readings and regional updates.`

After selection, show only relevant information:
- Location name and type
- Hotspot summary, if available
- AQ reading plus station and timestamp, if available
- Up to two related news items, if available
- Main action: `View regional overview →`

Hide unavailable groups or show `No recent data available`. Avoid multiple charts in this panel.

### B4. Data note

`Hotspots are satellite detections, not confirmed measurements of local air quality. Air-quality readings are available only where monitoring data is provided.`

Link: `How to interpret this data →`.

### Mobile Explore

Heading and compact filters at top; map occupies most of the initial screen. Filters may collapse behind a button while keeping active filter state visible. Selecting a marker opens a bottom sheet with the short location summary and `View regional overview`. Keep controls clear of mobile safe-area edges. Do not force a permanent side panel into a narrow column.

## C. Regional Overview (`/region/{province}/{city-or-regency?}`)

**Purpose:** A readable, shareable overview of what is known about a province, city, or regency. Use one template for all places.

### C1. Breadcrumb and title

Example breadcrumb: `Home / Indonesia / Riau`  
Title: `Riau`  
Description: `Fire activity, available air-quality readings, and local developments for Riau.`

For city pages, show hierarchy clearly, e.g. `Riau / Pekanbaru`. Include a compact `Choose city / regency` selector where relevant.

### C2. Regional snapshot

At most two primary cards:
- `Hotspot detections`
- `Air quality`

Hotspot counts must be labeled satellite detections and have a supported time period. AQ must show actual reading, station name/location, timestamp, and source. If a station is outside the selected location, state its actual location and distance only when reliable. If no reading exists, say `No recent reading available`. Do not create an unsupported overall risk score.

### C3. Hotspot activity

Heading: `Hotspot activity`

Use a small map preview **or** a restrained trend chart, not a large map plus several charts. Include a short summary, source/update timestamp, and `View hotspots on the map →`.

### C4. Air quality

Heading: `Air quality`

Show only available station readings. Each item includes station name, reading and index/unit type, plain-language status only if supported by a known standard, timestamp, and source. Show a small number first. Make stale/missing coverage obvious without a long warning paragraph.

### C5. Local developments

Heading: `What's happening in {location}?`

Show up to three genuinely relevant stories. Each has a short headline, source, date, and region/topic if useful. Do not treat every story from the same island as local.

Empty state: `No recent local updates are available yet.`

### C6. What residents can do

Heading: `What you can do`  
Description: `Conditions and individual needs vary. Use available air-quality readings alongside official local advice.`

Show 3–4 compact links: Going outside, Choosing a mask, Improving indoor air, Children and symptoms. This is navigation, not a long medical article.

### C7. Data note

`Hotspot detections and air-quality readings describe different things. Their presence near one another does not, by itself, establish a cause-and-effect relationship.`

Link to sources and methodology.

Avoid a duplicate large interactive map, too many KPI cards, unsupported “worst city today” rankings, long technical explanations before useful data, unrelated news, and repeated copy.

## D. News Listing (`/news`)

**Purpose:** Help users find relevant reporting and official notices without turning the site into a full news publisher.

Heading: `News & developments`  
Description: `Relevant reporting and official updates about fires, haze, air quality, and their local impact.`

Compact filters: Province, optional City / Regency, and topic only if content volume justifies it. Possible topics: All updates, Fires, Air quality, Public impact, Official updates. Do not use a large filter panel.

Use a simple editorial list or restrained cards. Each item includes headline, original 1–2 sentence summary, publisher/source, publication date, relevant region, optional appropriately sourced image, and `Read original →` or `Read summary →`. Headline is strongest; metadata is secondary and should not all be badges. Use pagination or Load more if needed.

Empty state:
- Heading: `No updates found`
- Text: `Try another location or topic, or check back later.`
- Provide a clear reset-filters action.

News rules: no invented headlines, publishers, dates, or links. Do not reproduce full copyrighted articles. Write summaries in original wording and link to the publisher. Keep attribution visible. Separate official notices from general reporting where possible. Only label a story local if it genuinely relates to that location.

## E. News Article/Summary (`/news/{article-slug}`)

Layout:
1. Breadcrumb: `Home / News / {headline or section}`
2. Region/topic label only if useful
3. Headline
4. Publisher, publication date, and original article link
5. Image only if properly sourced and permitted
6. Short original summary
7. `Why it matters` only when relevance can be explained responsibly
8. Related local data, if useful, clearly labeled with its own source and timestamp
9. Main action: `Read the original report →`
10. A few related stories or regional overview link

Do not make every story a long article. Do not imply independent verification that has not occurred. Do not invent missing details if the original story is unavailable.

## F. Haze Guide (`/guide`)

**Purpose:** A practical library of plain-language answers, not a medical encyclopedia.

Heading: `Haze guide`  
Description: `Practical steps for understanding haze and reducing exposure when air quality is poor.`

Only implement guide search if it really searches guide content. Otherwise omit it for the first version.

Featured item:
- Title: `Start with the basics`
- Text: `Learn how to check air quality and decide what precautions may help.`
- Link: `Understand air quality →`

Show 4–6 guide links:
- `Going outside` — `How to think about outdoor activity when air quality is poor.`
- `Choosing a mask` — `What masks can and cannot do to reduce particle exposure.`
- `Indoor air` — `Practical ways to reduce smoke entering your home.`
- `Children and school` — `Things families and caregivers may need to consider.`
- `Symptoms and getting help` — `Warning signs and when to seek medical advice.`
- `Understanding the data` — `What hotspots and air-quality readings actually tell you.`

Do not add categories just to fill space. At the bottom:
`Guidance should be based on reputable public-health sources. It is general information and does not replace advice from a qualified health professional or local authorities.`

Link to actual sources. Do not claim medical review unless it happened.

## G. Guide Article (`/guide/{guide-slug}`)

Use one reusable article template. Example `/guide/masks`:

- Breadcrumb: `Home / Haze guide / Choosing a mask`
- Title: `Choosing a mask`
- One short intro explaining the question answered
- `Quick answer`: 1–3 concise sentences, modest styling, no alarming colored box
- `What to know`: a few short titled sections
- `Practical steps`: numbered list or bullets, each starting with a clear action
- `Who may need extra care`: only when supported by reputable guidance
- `When to seek help`: only where warranted and properly sourced
- `Sources`: direct links to authoritative sources
- Review date only if a real review process/date exists

Keep paragraphs short and the page scannable. Do not put the entire article inside one card. Avoid unreferenced medical claims or guarantees.

Reusable guide routes may include `/guide/outdoor-activities`, `/guide/indoor-air`, `/guide/children`, `/guide/health-symptoms`, and `/guide/understanding-air-quality`.

## 6. Shared components

Create/reuse only components that improve consistency:

- **Header:** wordmark, navigation, search action, responsive mobile navigation.
- **LocationSearch:** input, typed results, keyboard-accessible results, no-results/loading states when applicable.
- **LocationSelector:** province first, optional City / Regency, dependent options if supported, clear reset.
- **DataSummaryCard:** label, value/status, one supporting line or timestamp, optional source, optional single link.
- **SourceTimestamp:** source name/link, timestamp, data type when necessary.
- **NewsItem:** headline, short summary if appropriate, publisher/date, region/topic if relevant, link.
- **GuideCard:** short title, one-line description, useful simple icon/illustration only when needed, link.
- **DataStatus/EmptyState:** consistent states such as `Loading data…`, `Data temporarily unavailable`, `No recent data available`, `Source has not provided a recent update`, and `No results found`.
- **Footer:** About, Data sources, Methodology, Contact.

Do not hide source/time metadata so deeply that users cannot discover it. Be specific about data errors only when the cause is known.

## 7. Responsive behavior

### Mobile

- Single-column reading flow.
- Compact, accessible header.
- Search fits the screen without horizontal scrolling.
- Summary cards stack or use a compact layout only if legible.
- News headlines and publisher/date remain readable.
- Explore map selection uses a bottom sheet.
- Filters collapse when necessary while showing active selections.
- Comfortable touch targets and readable text; do not shrink text to fit more data.
- No horizontal page overflow. Avoid carousels for critical information.

### Tablet/desktop

- Centered max-width content container.
- Two columns only when they improve scanning.
- Reasonable text line lengths.
- Large map on Explore.
- Consistent whitespace and section spacing.

## 8. Data and integration boundaries

Inspect existing sources and APIs first. Potential sources to evaluate separately include SiPongi+, BMKG, IQAir, ASMC, NASA FIRMS, and OpenAQ. Do not assume any is connected. Verify availability, terms, coverage, update frequency, and redistribution permissions before integration.

If live integration is not available:
- Use a small mock dataset only to demonstrate layout.
- Keep mock data explicit in code and easy to replace.
- Never label mock data live/current.
- Never invent today's hotspot counts, AQI, weather, station names, news, or timestamps.
- Prefer intentional unavailable states over fake precision.
- Do not build complex data architecture just for static UI.

## 9. Accessibility and quality

- Semantic headings in logical order.
- Links navigate; buttons perform actions.
- Inputs have accessible names.
- Keyboard navigation and visible focus states.
- Status colors paired with text/icons.
- Meaningful alt text for informative images; decorative images should not add screen-reader noise.
- Sufficient contrast for body and secondary text.
- Respect reduced-motion preferences if animations exist.
- Loading/error/empty states for interactive sections.
- Avoid unnecessary animation and layout shift.
- Preserve existing working functionality and project conventions.

## 10. Explicitly out of scope

Do not add these unless already present and genuinely required:
- Accounts/login
- Social/community features
- Comments, forums, likes, follows
- User-submitted hotspot reports
- Alerts or subscriptions
- Complex personalization
- Full analytics dashboard with many charts
- Large admin dashboard
- Unverified health-risk scores
- Weather/wind system before integration
- Extra top-level pages for each data type
- Decorative widgets that do not help users understand information

Prioritize a cohesive, trustworthy UI over feature count.

## 11. Suggested implementation order

1. Inspect project and current behavior.
2. Establish visual tokens: typography, spacing, colors, containers, buttons, cards, statuses, responsive rules.
3. Header, footer, location search/selector.
4. Home page; get hierarchy and spacing right before adding secondary data.
5. Regional Overview template, including missing/stale-data states.
6. Explore Map, reusing the current map if present and keeping controls compact.
7. Haze Guide and guide article template.
8. News listing and article/summary template, using only available or explicitly labeled demo content.
9. Responsive/accessibility pass.
10. Run checks/build and fix regressions.

Do not implement everything in one huge component. Use small reusable components and existing repository conventions.

## 12. Definition of done

- Main navigation and page hierarchy are clear.
- Home feels calm, useful, and not crowded.
- The first screen communicates the purpose, offers location search, and has one obvious next step.
- Primary information is prioritized; secondary details do not compete.
- Home, Explore, Regional Overview, News, and Haze Guide have distinct purposes.
- Province and optional City / Regency selection are consistent.
- Data presented as real has source/time context where applicable.
- Missing/stale data is represented honestly.
- UI does not suggest hotspots prove poor local air quality.
- No fake live data or invented news is presented as fact.
- Mobile works without horizontal overflow.
- Shared components are consistent.
- Existing conventions are respected.
- Checks/build pass, or pre-existing failures are explicitly identified.

## 13. Final instruction

Prioritize **clarity, restraint, and trust** over visual density. A detailed brief is not an instruction to display all details at once. The interface itself must remain simple.

Before adding a card, metric, badge, filter, chart, illustration, or paragraph, ask:

> Does this help an ordinary person understand their location, the available evidence, or what to do next?

If not, leave it out.

After implementation, report briefly:
1. What changed.
2. Which routes/pages are implemented.
3. What still uses mock data or is not integrated.
4. Which checks/build commands ran and their actual results.
5. Important assumptions or blockers.

## News sourcing and ingestion requirements

The News feature must use a realistic source strategy. Do not build a news UI that depends on invented articles or assumes every publisher provides RSS.

### Source discovery
- Inspect potential official sources and news publishers relevant to Indonesian forest fires, haze, air quality, public health, and regional impact.
- Check whether each source offers RSS/Atom, an official API, or another permitted integration method.
- Verify source availability, terms of use, attribution requirements, content reuse permissions, update frequency, and geographic coverage before integration.
- Prefer official agencies for authoritative notices and established publishers for reporting.
- Keep source configuration separate from the UI so sources can be added or removed without redesigning the page.
- Do not scrape websites by default or bypass access controls.

### Ingestion
- Fetch available feeds through a scheduled backend job, not on every visitor request.
- Store the original URL, headline, publisher, publication timestamp, fetch timestamp, relevant locations, topic classification, optional permitted image URL, and deduplication identifier.
- Handle invalid feeds, timeouts, missing publication dates, duplicate URLs, and temporary source failures gracefully.
- Preserve original publication dates. Do not substitute the fetch time and present it as the publication time.
- Record ingestion failures sufficiently to diagnose problems without exposing internal errors to visitors.

### Relevance and geographic classification
- Prioritize forest/land fires, haze, air quality, public-health impacts, school disruptions, evacuations where relevant, and official responses.
- Use keywords and source metadata as an initial filter. More advanced classification can be added later if needed.
- Associate an article with a province, city, or regency only when the relationship is sufficiently supported by the article or reliable metadata.
- Do not assume a story is relevant to every location in the same island or broad region.
- Avoid duplicates and near-duplicates from syndicated reporting.
- Allow uncertain location/topic classifications to remain unassigned rather than inventing precision.

### Display and copyright
- Show the original headline, publisher, publication date, and link to the original source.
- Write short summaries in original wording only when permitted by the source's terms and applicable law.
- Do not republish full articles or assume images can be reused merely because they are publicly accessible.
- Clearly distinguish official notices from news reporting when useful.
- Do not imply that Kawal Asap independently verified a claim when it has not.
- If no relevant articles are available, show a useful empty state rather than fabricated stories.

### Editorial independence and source diversity

Kawal Asap must not depend exclusively on government communications. Prioritize a diverse set of relevant independent news publishers, environmental journalism, local reporting, civil-society sources, public observations, and authoritative data providers.

Government sources may be included when they provide useful data, official notices, or attributable statements. Their claims must not automatically be treated as independently verified facts.

Keep these information types distinct:
- Satellite-detected hotspots
- Measured air-quality readings
- Journalism and reported claims
- Official statements and announcements
- Public social media reports
- Independently corroborated observations

### MVP scope
Begin with a small number of verified sources and RSS/Atom where available. Use scheduled ingestion, basic relevance filtering, deduplication, and visible attribution. Do not build a complex editorial system or AI summarization pipeline unless the initial implementation demonstrates a genuine need.

If suitable live sources have not been verified or integrated, implement the UI with clearly labeled demo data and document the missing integration. Never present demo articles as current real-world reporting.

### Social media signals — future feature

Explore a future feature called "What people are reporting" or "Community signals."

Its purpose is to help users notice emerging local reports of smoke, haze, and public disruption that may warrant further investigation.

Requirements:
- Use permitted platform APIs or authorized providers.
- Clearly distinguish social media activity from measured environmental conditions.
- Show the collection period, platform, and coverage limitations for any trend.
- Do not treat post volume, likes, shares, or reposts as proof of truth or severity.
- Avoid counting reposts of the same underlying claim as independent corroboration.
- Label unverified reports explicitly and link to original posts where permitted.
- Do not infer a precise location from a user's profile or an ambiguous post.
- Do not expose private information or encourage users to investigate or confront individuals.
- Do not present an automated classification as human verification.
- If reliable social data cannot be obtained, omit the feature until a legitimate source is available.

The goal is source transparency and evidence comparison, not replacing one authority with another or making unsupported claims about who is hiding information.
