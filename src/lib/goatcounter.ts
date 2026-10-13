/**
 * Visit counts, and nothing else about the reader.
 *
 * GoatCounter records what a web server log would have: a page and a time, with no cookie
 * and nothing that identifies a visitor. Because this site is one page as far as a browser
 * is concerned, the loader in `index.html` counts nothing on its own (`no_onload`) and the
 * app asks for one count per route instead, so an internal navigation is a view and the
 * first load is not counted twice.
 *
 * The path is sent without the query string. Here the query string is view state, a window,
 * a filter, a pinned point, and a counter that split `/explore` into one row per filter
 * combination would answer a question about the filters, not about the visits.
 *
 * A counter is never allowed to matter: it does not render, it does not block, and if the
 * script never arrives nothing on the page changes.
 */
export const GOATCOUNTER_COUNT_URL = 'https://kawalasap.goatcounter.com/count';

/** How long to wait for the script before giving up, at 100 ms a look. */
const LOOKS = 20;

type GoatCounter = { count: (options: { path: string }) => void };

declare global {
  interface Window {
    goatcounter?: GoatCounter;
  }
}

/** The one entry point: give it a pathname, and it does the right thing if the script is late. */
export function countPageview(pathname: string, look = 0) {
  const counter = window.goatcounter;
  if (counter && typeof counter.count === 'function') {
    counter.count({ path: pathname === '' ? '/' : pathname });
    return;
  }
  if (look >= LOOKS) return;
  window.setTimeout(() => countPageview(pathname, look + 1), 100);
}
