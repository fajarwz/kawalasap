import { Link } from '@tanstack/react-router';
import { WindowKey, WINDOW_LABEL_KEY } from '../lib/fires.ts';
import { formatInt, formatOne } from '../lib/format.ts';
import { useLang, useT } from '../lib/i18n.ts';
import { BAND_COLOUR, BAND_LABEL_KEY, countForWindow, type RegionRow } from '../lib/risk.ts';
import { coerceSearch } from '../lib/viewState.ts';
import { Badge } from './ui/Badge.tsx';
import { BandIcon } from './ui/icons.tsx';
import { InfoTip } from './ui/InfoTip.tsx';

interface RegionTableProps {
  rows: RegionRow[];
  window: WindowKey;
}

/**
 * Five columns, not seven. Rain and wind used to be columns of their own, but
 * both already appear in the driver sentence under each province, so the table
 * no longer repeats them.
 */
export function RegionTable({ rows, window }: RegionTableProps) {
  const t = useT();
  const lang = useLang();

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-label-13">
        <thead>
          <tr className="text-micro uppercase text-[var(--faint)]">
            <th className="pb-2 pr-3 font-medium">{t('table.region')}</th>
            <th className="pb-2 pr-3 font-medium">
              <span className="inline-flex items-center gap-1">
                {t('table.risk')}
                <InfoTip label={t('glossary.risk.label')}>{t('glossary.risk.body')}</InfoTip>
              </span>
            </th>
            <th className="pb-2 pr-3 text-right font-medium">{t(WINDOW_LABEL_KEY[window])}</th>
            <th className="pb-2 pr-3 text-right font-medium">
              <span className="inline-flex items-center gap-1">
                {t('table.worstPm25')}
                <InfoTip label={t('glossary.pm25.label')}>{t('glossary.pm25.body')}</InfoTip>
              </span>
            </th>
            <th className="pb-2 text-right font-medium">{t('table.meanFrp')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.regionId} className="border-t border-[var(--border)] align-top">
              <td className="py-3 pr-3">
                <Link
                  to="/region/$regionId"
                  params={{ regionId: row.regionId }}
                  search={(previous) => coerceSearch({ ...previous, region: row.regionId })}
                  className="font-medium text-[var(--text)] underline decoration-[var(--border-strong)] underline-offset-2 hover:decoration-[var(--accent)]"
                >
                  {row.name}
                </Link>
                <p className="mt-1 max-w-[22rem] text-label-12 text-[var(--faint)]">
                  {row.drivers[0]}
                </p>
              </td>
              <td className="py-3 pr-3">
                <Badge
                  colour={BAND_COLOUR[row.band]}
                  icon={<BandIcon band={row.band} />}
                  title={row.drivers.join('; ')}
                >
                  {t(BAND_LABEL_KEY[row.band])} {row.score}
                </Badge>
              </td>
              <td className="num py-3 pr-3 text-right">
                {formatInt(countForWindow(row, window), lang)}
              </td>
              <td className="num py-3 pr-3 text-right">
                {row.maxPm25 === null ? t('common.na') : `${formatOne(row.maxPm25, 0, lang)} µg/m³`}
                {row.worstCity ? (
                  <span className="block font-sans text-micro text-[var(--faint)]">
                    {row.worstCity}
                  </span>
                ) : null}
              </td>
              <td className="num py-3 text-right">
                {formatOne(row.counts.meanFrp24h, 0, lang)} MW
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
