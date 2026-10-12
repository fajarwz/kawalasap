import react from '@vitejs/plugin-react';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import type { Connect } from 'vite';
import type { ServerResponse } from 'node:http';

type ApiResult = {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
};
type ApiModule = {
  handler: (event: unknown, context: unknown) => Promise<ApiResult>;
};

const CACHE_DIR = '.cache';
const CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * Serve the Netlify Function from the Vite dev server so `npm run dev` runs the
 * whole app, proxy included, with no `netlify dev` in the loop.
 *
 * It also keeps a copy on disk for 15 minutes. NASA sends its CSV files at about
 * 200 KB/s, so the first call takes a minute and every call after that is
 * instant. That disk copy is the local stand-in for the CDN cache the function
 * asks for in production.
 */
function devApi(): Plugin {
  return {
    name: 'kawal-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(
        '/api/fires',
        async (req: Connect.IncomingMessage, res: ServerResponse) => {
          const url = new URL(req.url ?? '/', 'http://localhost');
          const windowKey = url.searchParams.get('window') ?? '48h';
          const cachePath = join(process.cwd(), CACHE_DIR, `fires-${windowKey}.json`);
          try {
            const cached = await stat(cachePath);
            if (Date.now() - cached.mtimeMs < CACHE_TTL_MS) {
              res.statusCode = 200;
              res.setHeader('content-type', 'application/json; charset=utf-8');
              res.setHeader('x-kawal-cache', 'disk');
              res.end(await readFile(cachePath, 'utf8'));
              return;
            }
          } catch {
            // no cached copy yet, carry on
          }
          try {
            const mod = (await server.ssrLoadModule(
              '/netlify/functions/fires.ts',
            )) as ApiModule;
            const result = await mod.handler(
              {
                httpMethod: 'GET',
                queryStringParameters: Object.fromEntries(url.searchParams),
              },
              {},
            );
            res.statusCode = result.statusCode;
            for (const [key, value] of Object.entries(result.headers ?? {})) {
              res.setHeader(key, value);
            }
            if (result.statusCode === 200 && result.headers?.['x-kawal-partial'] === 'false') {
              await mkdir(join(process.cwd(), CACHE_DIR), { recursive: true });
              await writeFile(cachePath, result.body, 'utf8');
            }
            res.end(result.body);
          } catch (error) {
            res.statusCode = 500;
            res.setHeader('content-type', 'application/json');
            res.end(
              JSON.stringify({
                error: error instanceof Error ? error.message : String(error),
              }),
            );
          }
        },
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), devApi()],
});
