import { Outlet, useParams, useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Footer } from '../components/site/Footer.tsx';
import { Header } from '../components/site/Header.tsx';
import { containerClass } from '../components/ui/styles.ts';
import { countPageview } from '../lib/goatcounter.ts';
import { coerceLang, LangContext } from '../lib/i18n.ts';

/**
 * The shell every page shares: one compact header, one centred column, one
 * footer. The language is the first path segment of the URL, so the layout reads
 * it from the route parameters and hands it down through the context rather than
 * keeping a copy of its own.
 */
export function RootLayout() {
  const params = useParams({ strict: false }) as { lang?: string };
  const lang = coerceLang(params.lang);
  /**
   * One view per route, not one per page load. This is a single page to a browser, so a
   * tap from the home page to the map would otherwise be invisible; the language switch
   * counts as one too, because it is a new address and a new reading.
   */
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    countPageview(pathname);
  }, [pathname]);

  return (
    <LangContext.Provider value={lang}>
      <div className="flex min-h-full flex-col">
        <Header />
        <main className={`${containerClass} flex-1 py-6`}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </LangContext.Provider>
  );
}
