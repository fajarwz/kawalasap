import { useNow } from '../hooks/useNow.ts';
import { formatDateTimeWib, relativeTime } from '../lib/format.ts';
import { useLang, useT } from '../lib/i18n.ts';
import { linkClass } from './ui/styles.ts';

interface SourceTimestampProps {
  /** The source as it calls itself. A proper noun, so it is never translated. */
  name: string;
  href?: string;
  /** When the source published this value. Null means the source did not say. */
  time?: string | null;
  /** What kind of value it is, when that needs saying: "modelled", "detected". */
  kind?: string;
}

/**
 * Source and time on one quiet line, under the value they belong to. Every
 * number on the site carries one, and the pair is never hidden behind a tip:
 * where a number came from and how old it is changes how it should be read.
 */
export function SourceTimestamp({ name, href, time, kind }: SourceTimestampProps) {
  const t = useT();
  const lang = useLang();
  const now = useNow();

  return (
    <p className="flex flex-wrap items-center gap-x-1.5 text-micro leading-relaxed text-[var(--faint)]">
      <span>{kind ? `${kind} · ` : ''}</span>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className={linkClass}>
          {name}
        </a>
      ) : (
        <span>{name}</span>
      )}
      <span aria-hidden="true">·</span>
      <span className="num">
        {time
          ? t('source.stamp', {
              rel: relativeTime(time, now, lang),
              stamp: formatDateTimeWib(time, lang),
            })
          : t('source.noTime')}
      </span>
    </p>
  );
}
