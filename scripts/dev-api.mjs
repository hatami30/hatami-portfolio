// Serves POST /api/contact inside `astro dev`, so the contact form works locally without the
// Vercel CLI. In production the same handler runs as a Vercel Function (api/contact.ts).
// `astro preview` serves static files only; use `pnpm dev:vercel` for a production-like run
// that includes functions.
//
// Implemented with Astro's `injectRoute` (dev only), not Vite middleware: in Astro 7 the
// framework handles the request before custom middleware sees it.

/** @returns {import('astro').AstroIntegration} */
export function devApi() {
  return {
    name: 'dev-api',
    hooks: {
      'astro:config:setup': ({ command, injectRoute }) => {
        if (command !== 'dev') return;

        try {
          process.loadEnvFile('.env'); // does not override variables that are already set
        } catch {
          // No .env file: the endpoint answers 500 server_error until one exists.
        }

        injectRoute({
          pattern: '/api/contact',
          entrypoint: new URL('../src/dev/contact-route.ts', import.meta.url),
          prerender: false,
        });
      },
    },
  };
}
