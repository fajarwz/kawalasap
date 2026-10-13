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

/**
 * A destination. In the bar it is a pill and in the drawer a full width row, which is why
 * the classes move rather than the link.
 */
function NavLink({
  to,
  lang,
  block = false,
  onNavigate,
  children,
}: {
  to: NavTarget;
  lang: Lang;
  block?: boolean;
  onNavigate?: () => void;
  children: ReactNode;
}) {
  const base = block ? 'rounded-md px-3 py-2.5 text-label-14' : 'rounded-md px-2.5 py-1.5 text-label-13';
  return (
    <Link
      to={to}
      params={{ lang }}
      activeOptions={{ exact: to === '/$lang' }}
      onClick={onNavigate}
      className={`${base} text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]`}
      activeProps={{
        className: `${base} bg-[var(--surface-2)] text-[var(--text)]`,
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

/** Three rules, the shape everyone already reads as a menu. */
function MenuGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** The two languages: one control, in the bar and in the drawer. */
function LangSwitch({ lang, onChange }: { lang: Lang; onChange: (next: Lang) => void }) {
  const t = useT();
  return (
    <div
      role="group"
      aria-label={t('lang.label')}
      className="flex overflow-hidden rounded-md border border-[var(--border-strong)]"
    >
      {LANGS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
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
  );
}

/** The theme switch, a bordered control in the bar and a row in the drawer. */
function ThemeButton({
  label,
  onClick,
  block = false,
}: {
  label: string;
  onClick: () => void;
  block?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        block
          ? 'rounded-md px-3 py-2.5 text-left text-label-14 text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
          : 'rounded-md border border-[var(--border-strong)] px-2.5 py-1.5 text-label-13 text-[var(--muted)] transition-colors hover:text-[var(--text)]'
      }
    >
      {label}
    </button>
  );
}

/**
 * A compact header: the wordmark, four destinations, one search action, the language, the
 * theme, and the way to the source. Nothing else lives here, and the search row opens under
 * the bar rather than in a panel of its own, so opening it never moves the page.
 *
 * On a phone the bar is the wordmark and one hamburger, and everything else is behind it in
 * a drawer: six controls wrapping onto two lines was a crowd pretending to be a menu.
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

  /**
   * The drawer owns the screen while it is open: Escape closes it, and the page behind it
   * stops scrolling, because a panel sliding over a page you can still scroll underneath
   * feels broken. The previous overflow is restored rather than assumed.
   */
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  const changeLang = (next: Lang) => {
    if (next === lang) return;
    void navigate({
      to: '.',
      params: (previous) => ({ ...previous, lang: next }),
      search: (previous) => previous,
      resetScroll: false,
    });
  };

  /** Picking a place from the drawer closes it first: the menu is done once it has answered. */
  const fromDrawer = {
    onPickRegion: (regionId: string) => {
      setMenuOpen(false);
      goRegion(regionId);
    },
    onPickCity: (cityId: string) => {
      setMenuOpen(false);
      goCity(cityId);
    },
    onPickPoint: (point: Parameters<typeof goPoint>[0]) => {
      setMenuOpen(false);
      goPoint(point);
    },
  };

  const themeLabel = currentTheme === Theme.Dark ? t('theme.light') : t('theme.dark');
  const flipTheme = () => setTheme(currentTheme === Theme.Dark ? Theme.Light : Theme.Dark);

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

        {/* Everything the drawer holds, on a screen with room for it. */}
        <div className="hidden items-center gap-1 md:flex">
          <button
            type="button"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((value) => !value)}
            className={`${outlineButtonClass} flex items-center gap-1.5`}
          >
            <SearchGlyph />
            {t('nav.search')}
          </button>

          <LangSwitch lang={lang} onChange={changeLang} />

          <ThemeButton label={themeLabel} onClick={flipTheme} />

          {/*
            The source link. It is the only way out of the site from the chrome, so it opens
            in a new tab and carries its name for screen readers: the icon alone says
            "GitHub" to a sighted reader and nothing to anyone else.
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
        </div>

        {/* One control on a phone, and it opens the rest. */}
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          aria-label={menuOpen ? t('nav.menuClose') : t('nav.menuOpen')}
          onClick={() => setMenuOpen((value) => !value)}
          className="rounded-md border border-[var(--border-strong)] p-1.5 text-[var(--muted)] transition-colors hover:text-[var(--text)] md:hidden"
        >
          <MenuGlyph />
        </button>
      </div>

      {searchOpen ? (
        <div className={`${containerClass} hidden border-t border-[var(--border)] py-3 md:block`}>
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

      {/*
        The drawer. It stays in the tree and slides, so the movement reads as one panel
        arriving rather than a panel appearing, and while it is closed it is inert, so
        nothing inside it can be tabbed into. There is no scrim over the page: dimming the
        page means a translucent layer, and this design has no alpha outside a badge, so a
        transparent catcher takes the tap instead.
      */}
      <div
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        className={`fixed inset-0 z-[1300] md:hidden ${menuOpen ? '' : 'pointer-events-none'}`}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label={t('nav.menuClose')}
          onClick={() => setMenuOpen(false)}
          className="absolute inset-0 h-full w-full cursor-default"
        />
        <nav
          id="site-menu"
          aria-label={t('nav.label')}
          className={`absolute right-0 top-0 flex h-full w-[82%] max-w-xs flex-col overflow-y-auto border-l border-[var(--border-strong)] bg-[var(--surface-solid)] pb-6 shadow-[var(--shadow-overlay)] transition-transform duration-200 ease-out ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2.5">
            <span className="text-micro uppercase text-[var(--faint)]">{t('nav.menuTitle')}</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={t('nav.menuClose')}
              className="rounded-md p-1.5 text-[var(--faint)] transition-colors hover:text-[var(--text)]"
            >
              <CloseGlyph />
            </button>
          </div>

          <div className="flex flex-col gap-0.5 p-2">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                lang={lang}
                block
                onNavigate={() => setMenuOpen(false)}
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </div>

          {/* The same search the bar has, in the place a thumb can reach it. */}
          <div className="border-t border-[var(--border)] px-3 py-3">
            <LocationSearch className="w-full" helper={t('place.helper')} {...fromDrawer} />
          </div>

          <div className="border-t border-[var(--border)] px-3 py-3">
            <span className="text-micro uppercase text-[var(--faint)]">{t('lang.label')}</span>
            <div className="mt-2">
              <LangSwitch lang={lang} onChange={changeLang} />
            </div>
          </div>

          <div className="flex flex-col gap-1 border-t border-[var(--border)] p-2">
            <ThemeButton label={themeLabel} onClick={flipTheme} block />
            <a
              href={REPO}
              target="_blank"
              rel="noreferrer"
              className={`${ghostButtonClass} flex items-center gap-2`}
            >
              <GitHubIcon />
              {t('nav.repoShort')}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
