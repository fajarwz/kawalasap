import {
  createRootRoute,
  createRoute,
  createRouter,
  notFound,
  Outlet,
  redirect,
  stripSearchParams,
} from '@tanstack/react-router';
import { NotFound } from './components/NotFound.tsx';
import { ExplorePage } from './routes/ExplorePage.tsx';
import { GuideArticlePage } from './routes/GuideArticlePage.tsx';
import { GuidePage } from './routes/GuidePage.tsx';
import { HomePage } from './routes/HomePage.tsx';
import { MethodPage } from './routes/MethodPage.tsx';
import { NewsPage } from './routes/NewsPage.tsx';
import { RegionPage } from './routes/RegionPage.tsx';
import { RootLayout } from './routes/RootLayout.tsx';
import { coerceLang, DEFAULT_LANG } from './lib/i18n.ts';
import {
  coerceExplore,
  coerceHome,
  coerceRegion,
  EXPLORE_DEFAULTS,
  HOME_DEFAULTS,
  homeFrom,
  REGION_DEFAULTS,
} from './lib/viewState.ts';

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

/** `/` is not a page. It is the default language of the pages below it. */
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({
      to: '/$lang',
      params: { lang: DEFAULT_LANG },
      search: homeFrom({}),
      replace: true,
    });
  },
});

/**
 * The language is a path segment, so `/id/explore` and `/en/explore` are two
 * addresses for one page and an English view is a link you can send to someone.
 * Every page sits under this route, which is why no page has to carry `lang` in
 * its own search schema.
 *
 * A prefix we do not speak corrects itself to the default language and keeps the
 * rest of the address, so an old `/in/region/kalimantan` link still lands on the
 * page it named instead of a not-found.
 */
const langRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/$lang',
  component: () => <Outlet />,
  beforeLoad: ({ params, location }) => {
    if (params.lang === coerceLang(params.lang)) return;
    /**
     * A lone unknown segment is not a language in front of a page: it is a path
     * someone typed. There is nothing to correct, so it is a not-found rather
     * than a silent landing on the home page.
     */
    const rest = location.pathname.split('/').filter(Boolean).slice(1);
    if (rest.length === 0) throw notFound();
    throw redirect({
      href: location.pathname.replace(`/${params.lang}`, `/${DEFAULT_LANG}`) + location.searchStr,
      replace: true,
    });
  },
});

/** Home owns its two preview switches. `stripSearchParams` keeps them out of the URL when default. */
const homeRoute = createRoute({
  getParentRoute: () => langRoute,
  path: '/',
  validateSearch: coerceHome,
  search: { middlewares: [stripSearchParams(HOME_DEFAULTS)] },
  component: HomePage,
});

/** The map, and the only page that carries the whole filter set. */
const exploreRoute = createRoute({
  getParentRoute: () => langRoute,
  path: '/explore',
  validateSearch: coerceExplore,
  search: { middlewares: [stripSearchParams(EXPLORE_DEFAULTS)] },
  component: ExplorePage,
});

/**
 * A region box is a parent route, not a leaf, and its two pages are its children:
 * the box itself (index) and a city or regency inside it. Nesting is what makes
 * the route ids real: `useSearch({ from: '/$lang/region/$regionId' })` in the
 * shared `RegionPage` resolves for both paths, because the box is in the active
 * match chain either way. As flat siblings it resolved for the box and threw for
 * every city, which is a not-found page for the reader.
 */
const regionRoute = createRoute({
  getParentRoute: () => langRoute,
  path: '/region/$regionId',
  // A layout: it renders whichever of its two pages matched.
  component: () => <Outlet />,
  validateSearch: coerceRegion,
  search: { middlewares: [stripSearchParams(REGION_DEFAULTS)] },
});

const regionBoxRoute = createRoute({
  getParentRoute: () => regionRoute,
  path: '/',
  component: RegionPage,
});

/** One reusable template for every place: a region box, and a city inside it. */
const regionPlaceRoute = createRoute({
  getParentRoute: () => regionRoute,
  path: '$placeId',
  component: RegionPage,
});

/**
 * The reading pages carry no search params at all. No `validateSearch` means the
 * route has an empty schema, so a link to it cannot drag the map's filters along
 * and its URL stays clean.
 */
const newsRoute = createRoute({
  getParentRoute: () => langRoute,
  path: '/news',
  component: NewsPage,
});

const guideRoute = createRoute({
  getParentRoute: () => langRoute,
  path: '/guide',
  component: GuidePage,
});

const guideArticleRoute = createRoute({
  getParentRoute: () => langRoute,
  path: '/guide/$guideSlug',
  component: GuideArticlePage,
});

const methodRoute = createRoute({
  getParentRoute: () => langRoute,
  path: '/method',
  component: MethodPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  langRoute.addChildren([
    homeRoute,
    exploreRoute,
    regionRoute.addChildren([regionBoxRoute, regionPlaceRoute]),
    newsRoute,
    guideRoute,
    guideArticleRoute,
    methodRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
