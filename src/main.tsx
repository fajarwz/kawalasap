import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
// Self hosted Geist: the typeface is part of the design system, so it ships with
// the app instead of being fetched from a CDN.
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './index.css';
import { PERSIST_MAX_AGE, queryClient } from './lib/queryClient.ts';
import { router } from './router.tsx';

/** Bump when the cached shape or the rules applied to cached data change. */
const CACHE_BUSTER = '2026-10-12-place-search-indonesia-only';

/**
 * The persisted cache is what keeps the request count down: a reload or a
 * return visit within the freshness window is served from localStorage.
 *
 * `buster` invalidates every persisted entry when the shape of what we cache
 * changes. It is set to the date of the last such change: without it, an answer
 * stored under the old rules would keep being served under the new ones. This
 * drop costs one refetch of each source on the next load, nothing more.
 */
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'kawalasap-cache-v1',
  throttleTime: 1500,
});

const mount = document.getElementById('root');
if (!mount) throw new Error('Missing #root element');

createRoot(mount).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: PERSIST_MAX_AGE, buster: CACHE_BUSTER }}
    >
      <RouterProvider router={router} />
    </PersistQueryClientProvider>
  </StrictMode>,
);
