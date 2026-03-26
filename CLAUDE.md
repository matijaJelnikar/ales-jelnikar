# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm run dev       # Start dev server at localhost:4321
npm run build     # Build to ./dist/
npm run preview   # Preview production build locally
npm run astro ... # Run Astro CLI commands (e.g. astro add, astro check)
```

## Architecture

This is an Astro 6 project (minimal template). Routing is file-based — every `.astro` or `.md` file in `src/pages/` becomes a route matching its filename.

- `src/pages/` — page routes
- `src/components/` — reusable Astro/framework components (not yet created)
- `public/` — static assets served at root

## Astro Documentation

For up-to-date Astro patterns and APIs, refer to:
- https://docs.astro.build/llms.txt — concise LLM-friendly Astro docs overview
- https://docs.astro.build/llms-full.txt — full Astro documentation for LLMs
