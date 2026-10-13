import { useQuery } from '@tanstack/react-query';
import { NEWS_SOURCES, parseNewsFeed, selectNews, type NewsItem } from '../lib/news.ts';
import { queryKeys, STALE_MS } from '../lib/queryClient.ts';

/**
 * Read every configured publisher feed, then filter, dedupe and sort.
 *
 * The fetch happens in the browser because the feeds we read send
 * `Access-Control-Allow-Origin: *`. A source that fails throws, so the page shows a
 * failed state instead of an empty list: an empty news page would read as "nothing is
 * happening", which is a claim we have no right to make from a timeout.
 */
async function requestNews(): Promise<NewsItem[]> {
  const batches = await Promise.all(
    NEWS_SOURCES.map(async (source) => {
      const response = await fetch(source.feedUrl, {
        headers: { accept: 'application/xml, text/xml, */*' },
      });
      if (!response.ok) {
        throw new Error(`${source.publisher} answered with HTTP ${response.status}.`);
      }
      return parseNewsFeed(await response.text(), source);
    }),
  );
  return selectNews(batches.flat());
}

export function useNews() {
  return useQuery({
    queryKey: queryKeys.news,
    queryFn: requestNews,
    staleTime: STALE_MS,
  });
}
