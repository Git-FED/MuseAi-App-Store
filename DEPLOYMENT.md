# Deployment

The storefront is a static site. Cloudflare Workers serves the files from `storefront/` as static assets; there is no application Worker code or build step.

## Cloudflare Workers (Wrangler)

The repository root contains `wrangler.jsonc`. Keep Cloudflare's project root at the repository root and use `npx wrangler deploy` as the deploy command (or run `npm run deploy` locally). The config fixes the Worker name to `museai-app-store`, uploads only `storefront/`, and uses its `404.html` for missing paths. Do not run the command from inside `storefront/`; Wrangler must read the root config.

For local preview, run `npm install` followed by `npm run preview`, then open the local URL printed by Wrangler. To validate the project, run `npm run validate`.

This deploy config does not add routes, custom domains, DNS records, or change Cloudflare account routing. Attach a domain or route separately only if you explicitly intend to change where traffic goes.

## Other static hosts

Deploy only the `storefront/` directory to another static host. No server-side runtime or generated build output is required.
