import { Link, useParams } from '@tanstack/react-router';
import { coerceLang, useT } from '../../lib/i18n.ts';
import { REPO } from '../../lib/site.ts';
import { containerClass, linkClass } from '../ui/styles.ts';

/**
 * The footer carries the note that has to be somewhere on the page, and the way
 * to the reference material: where the data comes from, how the risk score is
 * built, and where to report a problem with the site itself.
 */
export function Footer() {
  const t = useT();
  const params = useParams({ strict: false }) as { lang?: string };
  const lang = coerceLang(params.lang);
  return (
    <footer className="mt-12 border-t border-[var(--border)]">
      <div
        className={`${containerClass} flex flex-wrap items-start justify-between gap-x-10 gap-y-4 py-6`}
      >
        <div className="min-w-0 max-w-[70ch] space-y-2">
          <p className="text-label-13 font-semibold">Kawal Asap</p>
          <p className="text-label-12 leading-relaxed text-[var(--faint)]">{t('app.footer')}</p>
        </div>
        <nav className="flex flex-col gap-2 text-label-13">
          <Link to="/$lang/method" params={{ lang }} className={linkClass}>
            {t('footer.method')}
          </Link>
          <a href={REPO} target="_blank" rel="noreferrer" className={linkClass}>
            {t('footer.repo')}
          </a>
        </nav>
      </div>
    </footer>
  );
}
