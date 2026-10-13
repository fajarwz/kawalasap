import type { StringKey } from './i18n.ts';

/**
 * The guide library. A guide is a slug, the keys its copy lives under, and the
 * reference material it points at.
 *
 * Two rules hold the content honest:
 *
 * 1. The practical steps reuse the wording the site already shows beside each
 *    index band (`aqi.*.do*`), so a guide cannot quietly contradict the number
 *    the reader just looked at.
 * 2. Sources are real pages, checked by hand, and the site never claims a
 *    medical review that has not happened.
 */
export enum GuideSlug {
  Outdoor = 'outdoor-activities',
  Masks = 'masks',
  Indoor = 'indoor-air',
  Children = 'children',
  Symptoms = 'health-symptoms',
  Data = 'understanding-air-quality',
}

export const GUIDE_SLUGS: GuideSlug[] = [
  GuideSlug.Outdoor,
  GuideSlug.Masks,
  GuideSlug.Indoor,
  GuideSlug.Children,
  GuideSlug.Symptoms,
  GuideSlug.Data,
];

/** The four guides Home links to, in the order Home shows them. */
export const HOME_GUIDE_SLUGS: GuideSlug[] = [
  GuideSlug.Outdoor,
  GuideSlug.Masks,
  GuideSlug.Indoor,
  GuideSlug.Children,
];

export interface GuideSource {
  label: string;
  href: string;
  /** A page on this site rather than an outside one. */
  internal?: boolean;
}

const WHO_AIR = {
  label: 'WHO — Air pollution',
  href: 'https://www.who.int/health-topics/air-pollution',
};
const WHO_GUIDELINES = {
  label: 'WHO — Global air quality guidelines (2021)',
  href: 'https://www.who.int/publications/i/item/9789240034228',
};
const BMKG = { label: 'BMKG — Indonesian meteorological service', href: 'https://www.bmkg.go.id/' };
const ASMC = { label: 'ASMC — ASEAN haze monitoring', href: 'https://asmc.asean.org/' };
const METHOD: GuideSource = {
  label: 'Kawal Asap — method and data sources',
  href: '/method',
  internal: true,
};

export interface Guide {
  slug: GuideSlug;
  /** The bare verb phrase for a link: "Choosing a mask". */
  titleKey: StringKey;
  /** One line for a card. */
  summaryKey: StringKey;
  introKey: StringKey;
  quickKey: StringKey;
  know: { titleKey: StringKey; bodyKey: StringKey }[];
  stepKeys: StringKey[];
  sources: GuideSource[];
}

export const GUIDES: Guide[] = [
  {
    slug: GuideSlug.Outdoor,
    titleKey: 'guide.outdoor.title',
    summaryKey: 'guide.outdoor.summary',
    introKey: 'guide.outdoor.intro',
    quickKey: 'guide.outdoor.quick',
    know: [
      { titleKey: 'guide.outdoor.know1Title', bodyKey: 'guide.outdoor.know1Body' },
      { titleKey: 'guide.outdoor.know2Title', bodyKey: 'guide.outdoor.know2Body' },
    ],
    stepKeys: ['aqi.sensitive.do3', 'aqi.moderate.do1', 'aqi.unhealthy.do3'],
    sources: [WHO_AIR, WHO_GUIDELINES, BMKG],
  },
  {
    slug: GuideSlug.Masks,
    titleKey: 'guide.masks.title',
    summaryKey: 'guide.masks.summary',
    introKey: 'guide.masks.intro',
    quickKey: 'guide.masks.quick',
    know: [
      { titleKey: 'guide.masks.know1Title', bodyKey: 'guide.masks.know1Body' },
      { titleKey: 'guide.masks.know2Title', bodyKey: 'guide.masks.know2Body' },
    ],
    stepKeys: ['aqi.sensitive.do1', 'aqi.unhealthy.do1', 'aqi.veryUnhealthy.do2'],
    sources: [WHO_AIR, WHO_GUIDELINES],
  },
  {
    slug: GuideSlug.Indoor,
    titleKey: 'guide.indoor.title',
    summaryKey: 'guide.indoor.summary',
    introKey: 'guide.indoor.intro',
    quickKey: 'guide.indoor.quick',
    know: [
      { titleKey: 'guide.indoor.know1Title', bodyKey: 'guide.indoor.know1Body' },
      { titleKey: 'guide.indoor.know2Title', bodyKey: 'guide.indoor.know2Body' },
    ],
    stepKeys: ['aqi.moderate.do2', 'aqi.unhealthy.do2', 'aqi.hazardous.do2'],
    sources: [WHO_AIR, WHO_GUIDELINES],
  },
  {
    slug: GuideSlug.Children,
    titleKey: 'guide.children.title',
    summaryKey: 'guide.children.summary',
    introKey: 'guide.children.intro',
    quickKey: 'guide.children.quick',
    know: [
      { titleKey: 'guide.children.know1Title', bodyKey: 'guide.children.know1Body' },
      { titleKey: 'guide.children.know2Title', bodyKey: 'guide.children.know2Body' },
    ],
    stepKeys: ['aqi.sensitive.do2', 'aqi.sensitive.do1', 'aqi.good.do3'],
    sources: [WHO_AIR, WHO_GUIDELINES, BMKG],
  },
  {
    slug: GuideSlug.Symptoms,
    titleKey: 'guide.symptoms.title',
    summaryKey: 'guide.symptoms.summary',
    introKey: 'guide.symptoms.intro',
    quickKey: 'guide.symptoms.quick',
    know: [
      { titleKey: 'guide.symptoms.know1Title', bodyKey: 'guide.symptoms.know1Body' },
      { titleKey: 'guide.symptoms.know2Title', bodyKey: 'guide.symptoms.know2Body' },
    ],
    stepKeys: ['aqi.hazardous.do1', 'aqi.veryUnhealthy.do3', 'aqi.hazardous.do3'],
    sources: [WHO_AIR, BMKG, ASMC],
  },
  {
    slug: GuideSlug.Data,
    titleKey: 'guide.data.title',
    summaryKey: 'guide.data.summary',
    introKey: 'guide.data.intro',
    quickKey: 'guide.data.quick',
    know: [
      { titleKey: 'guide.data.know1Title', bodyKey: 'guide.data.know1Body' },
      { titleKey: 'guide.data.know2Title', bodyKey: 'guide.data.know2Body' },
    ],
    stepKeys: ['guide.data.step1', 'guide.data.step2', 'guide.data.step3'],
    sources: [METHOD, ASMC],
  },
];

export function guideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}
