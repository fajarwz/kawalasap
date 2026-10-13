/**
 * News is read from a publisher's own feed, and never republished.
 *
 * The site is a reader of sources, not a publisher. An item shows the original
 * headline, the publisher, the publication date and a link that leaves the site:
 * there is deliberately no article page here, because a copy of someone else's story
 * is not something this project can stand behind, and the publisher's own page is the
 * only complete version of it.
 *
 * One feed is read today. Mongabay Indonesia was chosen after checking the
 * alternatives: it is environmental journalism rather than general news, so a fifth of
 * its current feed is fire, haze or air quality rather than a handful of items in a
 * national feed of fifty, and its feed sends `Access-Control-Allow-Origin: *`, which is
 * what lets a browser read it at all. Tempo's feed exists at `rss.tempo.co` but sends
 * no CORS header, and most of its section feeds answer 403, so it is not usable here.
 *
 * The feed is fetched in the browser with the same fifteen minute cache as every other
 * source. The brief asks for a scheduled job rather than per-visitor fetching; that is
 * the follow-up, and it needs somewhere durable to put the items, which this repository
 * does not have yet. Nothing in this file may invent a headline, a publisher or a date.
 */
import { NEIGHBOUR, REGIONS } from './regions.ts';

export interface NewsSource {
  id: string;
  /** The publisher, in their own name. */
  publisher: string;
  /** Their site, for the source note and the method page. */
  homepage: string;
  feedUrl: string;
}

/**
 * One source, and it is the only one: see the note at the top of this file for why.
 * Configuration lives here rather than in a component, so adding or dropping a
 * publisher is not a redesign of the page.
 */
export const NEWS_SOURCES: NewsSource[] = [
  {
    id: 'mongabay',
    publisher: 'Mongabay Indonesia',
    homepage: 'https://www.mongabay.co.id/',
    /**
     * The canonical host, and it has to be: `www.mongabay.co.id/feed/` answers 301 to
     * this one, and a cross-origin redirect makes the browser reject the whole request
     * with `TypeError: Failed to fetch`. curl and Node follow the redirect and see
     * nothing wrong, so the only way to catch this is to read the feed in a browser.
     */
    feedUrl: 'https://mongabay.co.id/feed/',
  },
];

/**
 * How many items a page keeps after filtering and sorting.
 *
 * A short list is the feed rather than the filter, and this was measured against the live
 * feed rather than assumed. Mongabay's carries its last twenty posts, `?paged=2..4` returns
 * the identical twenty, and `/category/hutan/feed/` is a mirror of the main feed, so there
 * is no archive to page into. Four of those twenty name fire, haze or air, and judging
 * relevance on the whole item instead of the headline finds the same four, so nothing on
 * subject is being dropped. The two other feeds that send CORS were measured as well,
 * Antara 3 of 50 and CNN Indonesia 7 of 100: a general news feed adds noise far faster than
 * it adds reporting, and the items it would add are often the same story told twice.
 *
 * Volume can only come from keeping items as they appear, never from loosening the terms:
 * nothing accumulates them today, so a report leaves the list when it rolls out of the feed.
 * That is the scheduled ingestion job the brief asks for, and it needs durable storage this
 * repository does not have yet. Until then a short list is the honest one.
 */
export const NEWS_LIMIT = 30;

/**
 * A story counts as relevant when the publisher's own headline names fire, haze or
 * air. The list is deliberately narrow: `hutan` and `iklim` on their own pulled in
 * wildlife and climate-policy stories, and a list that is mostly off topic is worse
 * than a short one.
 */
const RELEVANT_TERMS = [
  'karhutla',
  'kebakaran hutan',
  'kebakaran lahan',
  'kebakaran',
  'terbakar',
  'kabut asap',
  'asap',
  'polusi',
  'polutan',
  'kualitas udara',
  'pencemaran udara',
  'ispu',
  'pm2.5',
  'pm2,5',
  'partikel',
  'titik panas',
  'gambut',
];

/**
 * Publishers write a free-text `<locations>` per item: "Sumatera Selatan",
 * "kalimantan dan Kalimantan Selatan", "papua". We map only wording that names one of
 * our boxes unambiguously, and everything else stays unassigned rather than guessed: a
 * story tagged "Aceh" is not evidence about our Sumatera box in general, and our boxes
 * are approximations of a region, not administrative boundaries.
 */
const REGION_ALIASES: Record<string, string> = {
  aceh: 'sumatera',
  'sumatera utara': 'sumatera',
  'sumatera barat': 'sumatera',
  riau: 'sumatera',
  'kepulauan riau': 'sumatera',
  jambi: 'sumatera',
  bengkulu: 'sumatera',
  lampung: 'sumatera',
  'bangka belitung': 'sumatera',
  banten: 'jawa',
  jakarta: 'jawa',
  'jawa barat': 'jawa',
  'jawa tengah': 'jawa',
  'jawa timur': 'jawa',
  yogyakarta: 'jawa',
  bali: 'bali_nusa',
  'nusa tenggara': 'bali_nusa',
  lombok: 'bali_nusa',
  sumbawa: 'bali_nusa',
  flores: 'bali_nusa',
  sumba: 'bali_nusa',
  'timor barat': 'bali_nusa',
};

export interface NewsItem {
  /** The publisher's own guid when the feed has one, otherwise the URL. Dedupes. */
  id: string;
  headline: string;
  publisher: string;
  /**
   * The publisher's publication time, never our fetch time. Null when the feed dates
   * the item in a format we cannot read; the list says `tidak tersedia` rather than
   * guessing, and the item still shows.
   */
  publishedAt: string | null;
  /** The original report. Every item links out, and nothing is copied back in. */
  url: string;
  /** Our region box, mapped from the publisher's own location metadata. */
  region: string | null;
  /** Which configured feed this came from, for the source note. */
  sourceId: string;
}

const MONTHS: Record<string, string> = {
  jan: '01',
  feb: '02',
  peb: '02',
  mar: '03',
  apr: '04',
  mei: '05',
  may: '05',
  jun: '06',
  jul: '07',
  agu: '08',
  aug: '08',
  agt: '08',
  sep: '09',
  okt: '10',
  oct: '10',
  nov: '11',
  des: '12',
  dec: '12',
};

/**
 * Feeds date their items in more than one format, and Indonesian publishers use
 * Indonesian month abbreviations: Mongabay publishes `12 Okt 2026 23:12:42 +0700`,
 * which `new Date(...)` reads as invalid. So parse the shapes we know, and return null
 * for anything else: a date we cannot read is not a date we may invent.
 */
export function parsePublishedAt(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  // ISO 8601, which Atom feeds use and which `new Date` handles natively.
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  // `12 Okt 2026 23:12:42 +0700`, with or without a leading weekday.
  const match =
    /(\d{1,2})\s+([A-Za-z]{3})[a-z]*\s+(\d{4})\s+(\d{2}):(\d{2}):(\d{2})\s*(?:GMT)?\s*([+-]\d{4})?/.exec(
      value,
    );
  if (!match) return null;
  const [, day, monthName, year, hour, minute, second, offset] = match;
  const month = MONTHS[monthName.toLowerCase()];
  if (!month) return null;
  const zone = offset ? `${offset.slice(0, 3)}:${offset.slice(3)}` : '+00:00';
  const parsed = new Date(
    `${year}-${month}-${day.padStart(2, '0')}T${hour}:${minute}:${second}${zone}`,
  );
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/** The publisher's own location metadata, mapped to one of our boxes when it names one. */
export function regionFromPublisher(text: string, regions = REGIONS): string | null {
  const haystack = text.toLowerCase();
  if (!haystack.trim()) return null;
  for (const region of regions) {
    if (haystack.includes(region.name.toLowerCase())) return region.id;
  }
  for (const [alias, regionId] of Object.entries(REGION_ALIASES)) {
    if (haystack.includes(alias)) return regionId;
  }
  return null;
}

/** A story is relevant when the publisher's own headline says fire, haze or air. */
export function isRelevant(item: NewsItem): boolean {
  const headline = item.headline.toLowerCase();
  return RELEVANT_TERMS.some((term) => headline.includes(term));
}

function field(node: Element, tag: string): string {
  const found = node.getElementsByTagName(tag)[0];
  return found?.textContent?.trim() ?? '';
}

/**
 * Read one feed into items. Tolerant of RSS and Atom and of the extra namespace
 * elements a publisher adds, because the only fields this product needs are the
 * headline, the link, the date and their own location metadata. The article body the
 * feed also carries in `content:encoded` is deliberately never read.
 */
export function parseNewsFeed(xml: string, source: NewsSource): NewsItem[] {
  if (typeof DOMParser === 'undefined') {
    throw new Error('Reading a feed needs a browser: there is no DOMParser here.');
  }
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) {
    throw new Error(`${source.publisher} sent a feed this reader cannot parse.`);
  }

  const nodes = [...doc.getElementsByTagName('item'), ...doc.getElementsByTagName('entry')];
  const items: NewsItem[] = [];
  for (const node of nodes) {
    const headline = field(node, 'title');
    // RSS puts the URL in the element text; Atom puts it in an href attribute.
    const linkNode = node.getElementsByTagName('link')[0];
    const url = (linkNode?.getAttribute('href') ?? linkNode?.textContent ?? '').trim();
    if (!headline || !url) continue;
    items.push({
      id: field(node, 'guid') || field(node, 'id') || url,
      headline,
      publisher: source.publisher,
      publishedAt: parsePublishedAt(
        field(node, 'pubDate') ||
          field(node, 'published') ||
          field(node, 'updated') ||
          field(node, 'date'),
      ),
      url,
      region: regionFromPublisher(field(node, 'locations')),
      sourceId: source.id,
    });
  }
  return items;
}

/**
 * Filter, dedupe, newest first, capped. An item whose date we could not read is kept
 * and sorted last, because dropping a real report over a date format would be its own
 * kind of dishonesty.
 */
export function selectNews(items: NewsItem[], limit = NEWS_LIMIT): NewsItem[] {
  const seen = new Set<string>();
  const fresh: NewsItem[] = [];
  for (const item of items) {
    if (!isRelevant(item)) continue;
    const key = item.url.split('#')[0] ?? item.url;
    if (seen.has(key)) continue;
    seen.add(key);
    fresh.push(item);
  }
  return fresh
    .sort((a, b) => {
      if (!a.publishedAt) return 1;
      if (!b.publishedAt) return -1;
      return b.publishedAt.localeCompare(a.publishedAt);
    })
    .slice(0, limit);
}

/** Every box a story can be tagged with, the neighbouring areas bucket included. */
export const NEWS_REGION_IDS: string[] = [...REGIONS.map((region) => region.id), NEIGHBOUR.id];

/**
 * The stories the publisher tagged with this box, and nothing else. A region page that
 * widened this to the whole island would be labelling a story local on our own guess,
 * which is the one thing the brief forbids outright.
 */
export function newsForRegion(items: NewsItem[], regionId: string): NewsItem[] {
  return items.filter((item) => item.region === regionId);
}
