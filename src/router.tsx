import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { NotFound } from './components/NotFound.tsx';
import { RootLayout } from './routes/RootLayout.tsx';
import { DashboardPage } from './routes/DashboardPage.tsx';
import { MethodPage } from './routes/MethodPage.tsx';
import { RegionPage } from './routes/RegionPage.tsx';
import { coerceSearch } from './lib/viewState.ts';

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
  // The root carries the same schema so the header can update the language from
  // any route, including /method which has no schema of its own.
  validateSearch: coerceSearch,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: coerceSearch,
  component: DashboardPage,
});

const regionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/region/$regionId',
  validateSearch: coerceSearch,
  component: RegionPage,
});

const methodRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/method',
  component: MethodPage,
});

const routeTree = rootRoute.addChildren([dashboardRoute, regionRoute, methodRoute]);

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
