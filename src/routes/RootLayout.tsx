import { Link, Outlet, useNavigate, useSearch } from '@tanstack/react-router';
import { useEffect, type ReactNode } from 'react';
import { useTheme, Theme } from '../hooks/useTheme.ts';
import { coerceLang, LANGS, LANG_LABEL, Lang, LangContext, translator } from '../lib/i18n.ts';
import { coerceSearch, type DashboardSearch } from '../lib/viewState.ts';

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      // Carry the current view, so switching page keeps the language and filters.
      search={(previous) => coerceSearch(previous)}
      activeOptions={{ exact: to === '/' }}
      className="rounded-md px-2.5 py-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
      activeProps={{ className: 'rounded-md px-2.5 py-1.5 bg-[var(--surface-2)] text-[var(--text)]' }}
    >
      {children}
    </Link>
  );
}

export function RootLayout() {
  const [theme, setTheme] = useTheme();
  // Every route shares the same search schema, so the header can be typed
  // against any of them and still update the language wherever you are.
  const navigate = useNavigate({ from: '/' });
  const search = useSearch({ strict: false }) as Partial<DashboardSearch>;
  const lang = coerceLang(search.lang);
  // The layout is the one that provides the context, so it translates directly.
  const t = translator(lang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const changeLang = (next: Lang) => {
    // Change only the language. Everything else in the address bar stays put,
    // and the page must not jump back to the top.
    void navigate({
      search: (previous) => coerceSearch({ ...previous, lang: next }),
      resetScroll: false,
    });
  };

  return (
    <LangContext.Provider value={lang}>
      <div className="mx-auto flex min-h-full w-full max-w-[1560px] flex-col px-4 py-4 sm:px-6">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            search={(previous) => coerceSearch(previous)}
            className="flex items-center gap-2.5"
          >
            <img src="/favicon.svg" alt="" width={30} height={30} className="rounded-lg" />
            <span>
              <span className="block text-label-14 font-semibold leading-tight">Kawal Asap</span>
              <span className="block text-micro text-[var(--faint)]">{t('app.tagline')}</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-label-13">
            <NavLink to="/">{t('nav.dashboard')}</NavLink>
            <NavLink to="/method">{t('nav.method')}</NavLink>
            <div
              role="group"
              aria-label={t('lang.label')}
              className="ml-1 flex overflow-hidden rounded-lg border border-[var(--border-strong)]"
            >
              {LANGS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => changeLang(option)}
                  aria-pressed={lang === option}
                  title={option === Lang.Id ? 'Bahasa Indonesia' : 'English'}
                  className={`px-2.5 py-1.5 transition-colors ${
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
              onClick={() => setTheme(theme === Theme.Dark ? Theme.Light : Theme.Dark)}
              className="rounded-md border border-[var(--border-strong)] px-2.5 py-1.5 text-[var(--muted)] hover:text-[var(--text)]"
            >
              {theme === Theme.Dark ? t('theme.light') : t('theme.dark')}
            </button>
          </nav>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="mt-6 border-t border-[var(--border)] pt-4 text-label-12 leading-relaxed text-[var(--faint)]">
          <p>{t('app.footer')}</p>
        </footer>
      </div>
    </LangContext.Provider>
  );
}
