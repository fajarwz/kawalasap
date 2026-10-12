import type { FiresPayload } from '../lib/fires.ts';
import { formatDateTimeWib, formatInt, relativeTime } from '../lib/format.ts';
import { useLang, useT } from '../lib/i18n.ts';

interface SourcesPanelProps {
  payload: FiresPayload;
  climateTime: string | null;
  airTime: string | null;
  now: number;
}

export function SourcesPanel({ payload, climateTime, airTime, now }: SourcesPanelProps) {
  const t = useT();
  const lang = useLang();
  const failed = payload.sources.filter((source) => source.error);

  return (
    <div className="space-y-4 text-xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="text-micro uppercase text-[var(--faint)]">
              <th className="pb-2 pr-3 font-medium">{t('sources.source')}</th>
              <th className="pb-2 pr-3 font-medium">{t('sources.provides')}</th>
              <th className="pb-2 pr-3 font-medium">{t('sources.covers')}</th>
              <th className="pb-2 pr-3 text-right font-medium">{t('sources.rows')}</th>
              <th className="pb-2 font-medium">{t('sources.fetched')}</th>
            </tr>
          </thead>
          <tbody>
            {payload.sources.map((source) => (
              <tr key={source.id} className="border-t border-[var(--border)]">
                <td className="py-2 pr-3">
                  <a
                    className="font-medium underline decoration-[var(--border-strong)] underline-offset-2 hover:decoration-[var(--accent)]"
                    href={source.page}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {source.label}
                  </a>
                  <span className="block text-micro text-[var(--faint)]">{source.file}</span>
                </td>
                <td className="py-2 pr-3 text-[var(--muted)]">{t('sources.firesGives')}</td>
                <td className="num py-2 pr-3 text-[var(--muted)]">
                  {source.error
                    ? t('common.unavailable')
                    : `${source.coversFrom} to ${source.coversTo}`}
                </td>
                <td className="num py-2 pr-3 text-right text-[var(--muted)]">
                  {source.error ? t('common.na') : formatInt(source.rowsInBox, lang)}
                </td>
                <td className="num py-2 text-[var(--muted)]">
                  {relativeTime(source.fetchedAt, now, lang)}
                  {source.fetchedAt ? (
                    <span className="block font-sans text-micro text-[var(--faint)]">
                      {formatDateTimeWib(source.fetchedAt, lang)}
                    </span>
                  ) : null}
                </td>
              </tr>
            ))}
            <tr className="border-t border-[var(--border)]">
              <td className="py-2 pr-3">
                <a
                  className="font-medium underline decoration-[var(--border-strong)] underline-offset-2 hover:decoration-[var(--accent)]"
                  href="https://open-meteo.com/en/docs/air-quality-api"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('sources.airName')}
                </a>
                <span className="block text-micro text-[var(--faint)]">{t('sources.airSub')}</span>
              </td>
              <td className="py-2 pr-3 text-[var(--muted)]">{t('sources.airGives')}</td>
              <td className="py-2 pr-3 text-[var(--muted)]">{t('sources.airCovers')}</td>
              <td className="num py-2 pr-3 text-right text-[var(--muted)]">
                {t('sources.airRows')}
              </td>
              <td className="num py-2 text-[var(--muted)]">
                {airTime ? formatDateTimeWib(airTime, lang) : t('common.notLoaded')}
              </td>
            </tr>
            <tr className="border-t border-[var(--border)]">
              <td className="py-2 pr-3">
                <a
                  className="font-medium underline decoration-[var(--border-strong)] underline-offset-2 hover:decoration-[var(--accent)]"
                  href="https://open-meteo.com/en/docs"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('sources.forecastName')}
                </a>
                <span className="block text-micro text-[var(--faint)]">
                  {t('sources.forecastSub')}
                </span>
              </td>
              <td className="py-2 pr-3 text-[var(--muted)]">{t('sources.forecastGives')}</td>
              <td className="py-2 pr-3 text-[var(--muted)]">{t('sources.forecastCovers')}</td>
              <td className="num py-2 pr-3 text-right text-[var(--muted)]">
                {t('sources.forecastRows')}
              </td>
              <td className="num py-2 text-[var(--muted)]">
                {climateTime ? formatDateTimeWib(climateTime, lang) : t('common.notLoaded')}
              </td>
            </tr>
            <tr className="border-t border-[var(--border)]">
              <td className="py-2 pr-3">
                <a
                  className="font-medium underline decoration-[var(--border-strong)] underline-offset-2 hover:decoration-[var(--accent)]"
                  href="https://open-meteo.com/en/docs/geocoding-api"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('sources.geoName')}
                </a>
                <span className="block text-micro text-[var(--faint)]">{t('sources.geoSub')}</span>
              </td>
              <td className="py-2 pr-3 text-[var(--muted)]">{t('sources.geoGives')}</td>
              <td className="py-2 pr-3 text-[var(--muted)]">{t('sources.geoCovers')}</td>
              <td className="num py-2 pr-3 text-right text-[var(--muted)]">{t('sources.geoRows')}</td>
              {/* Nothing to timestamp: this one is only called when a place is searched. */}
              <td className="py-2 text-[var(--faint)]">—</td>
            </tr>
          </tbody>
        </table>
      </div>

      {failed.length ? (
        <p className="rounded-md border border-[var(--warn)]/40 bg-[var(--warn)]/10 px-3 py-2 text-label-12 leading-relaxed text-[var(--warn)]">
          {t('sources.failedSuffix', {
            list: failed.map((source) => `${source.label}: ${source.error}`).join('. '),
          })}
        </p>
      ) : null}

      <ul className="list-disc space-y-1 pl-4 text-label-12 leading-relaxed text-[var(--faint)]">
        <li>
          {t('sources.bulletFreshest', {
            stamp: formatDateTimeWib(payload.dataEnd, lang),
            rel: relativeTime(payload.dataEnd, now, lang),
          })}
        </li>
        <li>{t('sources.bulletDetections')}</li>
        <li>{t('sources.bulletLicence')}</li>
        <li>{t('sources.bulletMissing')}</li>
      </ul>
    </div>
  );
}
