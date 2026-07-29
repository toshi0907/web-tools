# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A collection of small, self-contained static web apps published together via GitHub Pages. There is no build step, no package manager, and no test suite — every app is a single static `index.html` (plus the shared `assets/style.css`) that runs directly in the browser.

## Commands

There is no build/lint/test tooling in this repo. To preview locally, serve the repo root as static files, e.g.:

```
python3 -m http.server 8000
```

then open `http://localhost:8000/` (top-level index) or `http://localhost:8000/apps/<app-name>/` (individual app) directly.

## Architecture

- `index.html` — the top-level landing page. It fetches `apps.json` at runtime and renders one card per entry into `#app-grid`; it does not know about individual apps at build time.
- `apps.json` — the single source of truth for which apps are listed on the landing page. Each entry is `{ "name": ..., "path": "apps/<app-name>/", "description": ... }`. An app's `index.html` existing under `apps/` does **not** make it appear on the landing page — it must also have an entry here.
- `apps/<app-name>/index.html` — each app is fully self-contained in one HTML file (markup + inline `<script>`), linking back to `../../assets/style.css` for shared styling and to `../../index.html` via a `.back-link`. Apps do not share JS code or have their own build process.
- `apps/_template/` — copy this directory to scaffold a new app; it already wires up the shared stylesheet and the back-link.
- `assets/style.css` — shared styling used by the landing page and every app (`.page`, `.page-header`, `.back-link`, `.app-grid`/`.app-card` for the landing page, etc.).
- `.github/workflows/deploy-pages.yml` — deploys the entire repo root as the Pages artifact on every push to `main`. GitHub Pages must be configured with Source = "GitHub Actions" in the repository settings (Settings > Pages) for this to succeed; this cannot be done from the workflow itself since it requires repo admin rights the workflow's `GITHUB_TOKEN` doesn't have.

## Adding a new app

1. Copy `apps/_template/` to `apps/<new-app-name>/`.
2. Implement the app in `apps/<new-app-name>/index.html` (reference shared styles via `../../assets/style.css`).
3. Add a corresponding entry to `apps.json` (`name`, `path`, `description`) so it shows up on the landing page.
4. Push to `main` — GitHub Actions deploys automatically.
