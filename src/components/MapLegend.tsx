import { AqiTone, TONE_COLOUR } from '../lib/aqi.ts';
import { useT } from '../lib/i18n.ts';
import { LayerMode, WindLevel } from '../lib/viewState.ts';
import { Dot, PlainBadge } from './ui/Badge.tsx';

const FRP_STEPS: {
  frp: number;
  key: 'map.frp.under10' | 'map.frp.10to30' | 'map.frp.30to60' | 'map.frp.60to120' | 'map.frp.above120';
}[] = [
  { frp: 5, key: 'map.frp.under10' },
  { frp: 20, key: 'map.frp.10to30' },
  { frp: 45, key: 'map.frp.30to60' },
  { frp: 90, key: 'map.frp.60to120' },
  { frp: 150, key: 'map.frp.above120' },
];

function stepColour(frp: number): string {
  if (frp >= 120) return '#b91c1c';
  if (frp >= 60) return '#ef4444';
  if (frp >= 30) return '#f97316';
  if (frp >= 10) return '#fbbf24';
  return '#fde68a';
}

export function MapLegend({ layer, windLevel }: { layer: LayerMode; windLevel: WindLevel }) {
  const t = useT();
  const density = layer === LayerMode.Density;

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-label-12 text-[var(--muted)]">
      <span className="flex items-center gap-2">
        <span className="font-medium text-[var(--text)]">
          {density ? t('map.density') : t('map.detections')}
        </span>
        {FRP_STEPS.map((step) => (
          <span key={step.key} className="flex items-center gap-1">
            <Dot colour={stepColour(step.frp)} size={density ? 9 : 7} />
            {t(step.key)}
          </span>
        ))}
        <span>{density ? t('map.circleSize') : t('map.colour')}</span>
      </span>
      <span className="flex items-center gap-2">
        <Dot colour={TONE_COLOUR[AqiTone.Sensitive]} />
        <Dot colour={TONE_COLOUR[AqiTone.Unhealthy]} />
        <Dot colour={TONE_COLOUR[AqiTone.VeryUnhealthy]} />
        {t('map.cityAir')}
      </span>
      <span className="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.5 L16.5 12.8 L12 10.4 L7.5 12.8 Z" fill="#38bdf8" />
        </svg>
        {t('map.wind', { level: windLevel })}
      </span>
      <span className="flex items-center gap-2">
        <Dot colour="#94a3b8" />
        {t('map.neighbour')}
      </span>
      <PlainBadge>{t('map.boxes')}</PlainBadge>
    </div>
  );
}
