import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function apiDevPlugin(): Plugin {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/pins/info')) {
          const urlObj = new URL(req.url, 'http://localhost');
          const pinUrl = urlObj.searchParams.get('url');

          if (!pinUrl) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 'error', message: 'URL is required' }));
            return;
          }

          try {
            // @ts-expect-error import JS handler dynamically
            const { scrapePinterest } = await import('./api/pins/info.js');
            const data = await scrapePinterest(pinUrl);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 'success', data }));
          } catch (err: unknown) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            const message = err instanceof Error ? err.message : 'Internal Server Error';
            res.end(JSON.stringify({ status: 'error', message }));
          }
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiDevPlugin()]
})
