import { Outlet, useParams } from '@tanstack/react-router';
import { Footer } from '../components/site/Footer.tsx';
import { Header } from '../components/site/Header.tsx';
import { containerClass } from '../components/ui/styles.ts';
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
