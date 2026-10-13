import { Card } from '../components/ui/Card.tsx';
import { PageLink } from '../components/ui/PageLink.tsx';
import { useT } from '../lib/i18n.ts';
import { RISK_WEIGHTS } from '../lib/risk.ts';

/** Names stay as they are: they are proper nouns, not UI copy. */
const SOURCES: {
  name: string;
  href: string;
  prefix: 'firms' | 'air' | 'forecast' | 'geo' | 'tiles' | 'mongabay';
}[] = [
  { name: 'NASA FIRMS', href: 'https://firms.modaps.eosdis.nasa.gov/active_fire/', prefix: 'firms' },
  {
    name: 'Open-Meteo air quality',
    href: 'https://open-meteo.com/en/docs/air-quality-api',
    prefix: 'air',
  },
  { name: 'Open-Meteo forecast', href: 'https://open-meteo.com/en/docs', prefix: 'forecast' },
  {
    name: 'Open-Meteo geocoding',
    href: 'https://open-meteo.com/en/docs/geocoding-api',
    prefix: 'geo',
  },
  { name: 'OpenStreetMap tiles', href: 'https://www.openstreetmap.org/copyright', prefix: 'tiles' },
  {
    name: 'Mongabay Indonesia',
    href: 'https://www.mongabay.co.id/',
    prefix: 'mongabay',
  },
];

const LIMIT_KEYS = [
  'method.limit1',
  'method.limit2',
  'method.limit3',
  'method.limit4',
  'method.limit5',
  'method.limit6',
] as const;

const STEP_KEYS = ['method.step1', 'method.step2', 'method.step3', 'method.step4'] as const;

const RISK_ROWS = [
  { title: 'method.riskFiresTitle', body: 'method.riskFiresBody', weight: RISK_WEIGHTS.fires },
  {
    title: 'method.riskIntensityTitle',
    body: 'method.riskIntensityBody',
    weight: RISK_WEIGHTS.intensity,
  },
  { title: 'method.riskAirTitle', body: 'method.riskAirBody', weight: RISK_WEIGHTS.airQuality },
  { title: 'method.riskDryTitle', body: 'method.riskDryBody', weight: RISK_WEIGHTS.dryness },
  {
    title: 'method.riskDispersionTitle',
    body: 'method.riskDispersionBody',
    weight: RISK_WEIGHTS.dispersion,
  },
] as const;

export function MethodPage() {
  const t = useT();

  return (
    <div className="space-y-4">
      <Card title={t('method.introTitle')} subtitle={t('method.introSubtitle')}>
        <div className="space-y-3 text-xs leading-relaxed text-[var(--muted)]">
          <p>{t('method.introP1')}</p>
          <p>{t('method.introP2')}</p>
        </div>
      </Card>

      <Card title={t('method.sourcesTitle')} subtitle={t('method.sourcesSubtitle')}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="text-micro uppercase text-[var(--faint)]">
                <th className="pb-2 pr-3 font-medium">{t('method.source')}</th>
                <th className="pb-2 pr-3 font-medium">{t('method.provides')}</th>
                <th className="pb-2 pr-3 font-medium">{t('method.rhythm')}</th>
                <th className="pb-2 pr-3 font-medium">{t('method.licence')}</th>
                <th className="pb-2 font-medium">{t('method.limit')}</th>
              </tr>
            </thead>
            <tbody>
              {SOURCES.map((source) => (
                <tr key={source.prefix} className="border-t border-[var(--border)] align-top">
                  <td className="py-2.5 pr-3">
                    <a
                      className="font-medium underline decoration-[var(--border-strong)] underline-offset-2 hover:decoration-[var(--accent)]"
                      href={source.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {source.name}
                    </a>
                  </td>
                  <td className="py-2.5 pr-3 text-[var(--muted)]">
                    {t(`method.${source.prefix}.gives`)}
                  </td>
                  <td className="py-2.5 pr-3 text-[var(--muted)]">
                    {t(`method.${source.prefix}.rhythm`)}
                  </td>
                  <td className="py-2.5 pr-3 text-[var(--muted)]">
                    {t(`method.${source.prefix}.licence`)}
                  </td>
                  <td className="py-2.5 text-[var(--muted)]">
                    {t(`method.${source.prefix}.limits`)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title={t('method.riskTitle')} subtitle={t('method.riskSubtitle')}>
        <div className="grid gap-4 text-xs md:grid-cols-2">
          <ul className="space-y-2 text-[var(--muted)]">
            {RISK_ROWS.map((row) => (
              <li key={row.title}>
                <b className="text-[var(--text)]">
                  {t(row.title, { weight: row.weight })}
                </b>
                {t(row.body)}
              </li>
            ))}
          </ul>
          <div className="space-y-2 text-[var(--muted)]">
            <p>{t('method.riskBands')}</p>
            <p>{t('method.riskNotForecast')}</p>
            <p>{t('method.riskInspectable')}</p>
          </div>
        </div>
      </Card>

      <Card title={t('method.limitsTitle')} subtitle={t('method.limitsSubtitle')}>
        <ul className="list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-[var(--muted)]">
          {LIMIT_KEYS.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
      </Card>

      <Card title={t('method.nextTitle')} subtitle={t('method.nextSubtitle')}>
        <ul className="list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-[var(--muted)]">
          {STEP_KEYS.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
      </Card>

      <Card title={t('method.costTitle')} subtitle={t('method.costSubtitle')}>
        <div className="space-y-3 text-xs leading-relaxed text-[var(--muted)]">
          <p>{t('method.costBody')}</p>
          <p>{t('method.counter')}</p>
        </div>
      </Card>

      <p className="text-label-12 text-[var(--faint)]">
        {t('method.back')}
        <PageLink
          to="/$lang"
          className="underline decoration-[var(--border-strong)] underline-offset-2 hover:decoration-[var(--accent)]"
        >
          {t('method.backLink')}
        </PageLink>
        .
      </p>
    </div>
  );
}
