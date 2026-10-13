import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { useEffect, useState, type ReactNode } from 'react';
import { usePlaceNav } from '../../hooks/usePlaceNav.ts';
import { Theme, useTheme } from '../../hooks/useTheme.ts';
import { LANG_LABEL, LANG_NAME_KEY, Lang, LANGS, coerceLang, useT, type StringKey } from '../../lib/i18n.ts';
import { REPO } from '../../lib/site.ts';
import { homeFrom } from '../../lib/viewState.ts';
import { LocationSearch } from '../LocationSearch.tsx';
import { GitHubIcon } from '../ui/icons.tsx';
import { containerClass, ghostButtonClass, outlineButtonClass } from '../ui/styles.ts';

/**
 * The four destinations, and nothing else.
 *
 * A nav link carries no search parameters. `/news` and `/guide` have none to
 * carry, and `/explore` opens on its own defaults instead of inheriting whatever
 * the last page happened to be showing: filters belong to the page that owns
 * them, not to the chrome.
 */
type NavTarget = '/$lang' | '/$lang/explore' | '/$lang/news' | '/$lang/guide';

const NAV: { to: NavTarget; labelKey: StringKey }[] = [
  { to: '/$lang', labelKey: 'nav.home' },
  { to: '/$lang/explore', labelKey: 'nav.explore' },
  { to: '/$lang/news', labelKey: 'nav.news' },
  { to: '/$lang/guide', labelKey: 'nav.guide' },
];

function NavLink({ to, lang, children }: { to: NavTarget; lang: Lang; children: ReactNode }) {
  return (
    <Link
      to={to}
      params={{ lang }}
      activeOptions={{ exact: to === '/$lang' }}
      className="rounded-md px-2.5 py-1.5 text-label-13 text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
      activeProps={{
        className: 'rounded-md px-2.5 py-1.5 text-label-13 bg-[var(--surface-2)] text-[var(--text)]',
      }}
    >
      {children}
    </Link>
  );
}

function SearchGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.4 10.4 14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * A compact header: the wordmark, four destinations, one search action, the
 * language, the theme, and the way to the source. Nothing else lives here, and the
 * search row opens under the bar rather than in a panel of its own, so opening it
 * never moves the page.
 */
export function Header() {
  const t = useT();
  const theme = useTheme();
  const [currentTheme, setTheme] = theme;
  const params = useParams({ strict: false }) as { lang?: string };
  const lang = coerceLang(params.lang);
  /**
   * `to: '.'` on a component that renders on every route, which is what this is.
   *
   * The header sits above every page, so there is no single route to bind `from`
   * to. `to: '.'` resolves against the current match, so switching the language
   * rewrites one path segment and leaves the reader on the page they were reading.
   * The search travels through unchanged for the same reason: the page must not
   * lose its filters or its pinned point on the way.
   */
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { goRegion, goCity, goPoint } = usePlaceNav();

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const changeLang = (next: Lang) => {
    if (next === lang) return;
    void navigate({
      to: '.',
      params: (previous) => ({ ...previous, lang: next }),
      search: (previous) => previous,
      resetScroll: false,
    });
  };

  return (
    <header className="border-b border-[var(--border)]">
      <div
        className={`${containerClass} flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3`}
      >
        <Link to="/$lang" params={{ lang }} search={homeFrom} className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="" width={28} height={28} className="rounded-lg" />
          <span className="text-label-14 font-semibold">Kawal Asap</span>
        </Link>

        <nav aria-label={t('nav.label')} className="hidden items-center gap-0.5 md:flex">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} lang={lang}>
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((value) => !value)}
            className={`${outlineButtonClass} flex items-center gap-1.5`}
          >
            <SearchGlyph />
            {t('nav.search')}
          </button>

          <div
            role="group"
            aria-label={t('lang.label')}
            className="flex overflow-hidden rounded-md border border-[var(--border-strong)]"
          >
            {LANGS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => changeLang(option)}
                aria-pressed={lang === option}
                aria-label={t(LANG_NAME_KEY[option])}
                className={`px-2.5 py-1.5 text-label-13 transition-colors ${
                  lang === option
                    ? 'bg-[var(--surface-2)] text-[var(--text)]'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {LANG_LABEL[option]}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setTheme(currentTheme === Theme.Dark ? Theme.Light : Theme.Dark)}
            className="rounded-md border border-[var(--border-strong)] px-2.5 py-1.5 text-label-13 text-[var(--muted)] hover:text-[var(--text)]"
          >
            {currentTheme === Theme.Dark ? t('theme.light') : t('theme.dark')}
          </button>

          {/*
            The source link. It is the only way out of the site from the chrome, so
            it opens in a new tab and carries its name for screen readers: the icon
            alone says "GitHub" to a sighted reader and nothing to anyone else.
          */}
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer"
            aria-label={t('nav.repo')}
            className="rounded-md border border-[var(--border-strong)] p-1.5 text-[var(--muted)] transition-colors hover:text-[var(--text)]"
          >
            <GitHubIcon />
          </a>

          <button
            type="button"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
            className={`${ghostButtonClass} md:hidden`}
          >
            {menuOpen ? t('nav.menuClose') : t('nav.menuOpen')}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          aria-label={t('nav.label')}
          className={`${containerClass} flex flex-col border-t border-[var(--border)] py-2 md:hidden`}
        >
          {NAV.map((item) => (
            <div key={item.to} onClick={() => setMenuOpen(false)}>
              <NavLink to={item.to} lang={lang}>
                {t(item.labelKey)}
              </NavLink>
            </div>
          ))}
        </nav>
      ) : null}

      {searchOpen ? (
        <div className={`${containerClass} border-t border-[var(--border)] py-3`}>
          <LocationSearch
            autoFocus
            className="max-w-xl"
            helper={t('place.helper')}
            onPickRegion={(regionId) => {
              setSearchOpen(false);
              goRegion(regionId);
            }}
            onPickCity={(cityId) => {
              setSearchOpen(false);
              goCity(cityId);
            }}
            onPickPoint={(point) => {
              setSearchOpen(false);
              goPoint(point);
            }}
          />
        </div>
      ) : null}
    </header>
  );
}
