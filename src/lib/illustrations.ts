/**
 * The names of the site's non-guide drawings.
 *
 * An enum rather than a string union, like every other option here: a typo fails the
 * build, and the registry in `components/illustrations.tsx` is keyed by it, so adding a
 * member without drawing it fails the build too.
 *
 * A guide's drawing is keyed by `GuideSlug` instead — the guide slug is the option the
 * site already offers — so the two vocabularies stay separate and neither can drift.
 */
export enum SiteArt {
  /** Detections across an area: a raster of candidates, one of them ours. */
  Thermal = 'thermal',
  /** Air moving, and what it carries. */
  Air = 'air',
  /** Reporting: a page with lines on it, linked out rather than copied. */
  Report = 'report',
}
