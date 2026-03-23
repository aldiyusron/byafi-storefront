# Repository Guidelines

## Project Structure & Module Organization
- `src/pages/` contains file-based routes; `src/pages/index.astro` is the current entry page.
- `src/layouts/` holds shared shells such as `Layout.astro`.
- `src/components/` contains reusable UI pieces such as `Welcome.astro`.
- `src/assets/` is for bundled assets imported from Astro files, while `public/` is for static files served as-is.
- Root config lives in `astro.config.mjs`, `tsconfig.json`, and `package.json`.

## Build, Test, and Development Commands
- `npm install` installs dependencies. The project expects Node `>=22.12.0`.
- `npm run dev` starts the local Astro dev server.
- `npm run build` creates the production build in `dist/`.
- `npm run preview` serves the built site locally for a final check.
- `npm run astro -- check` runs Astro and TypeScript validation; use it as the current static check.

## Coding Style & Naming Conventions
- Follow the existing Astro style: tabs for indentation, frontmatter imports at the top, and scoped CSS in `<style>` blocks when styles are component-specific.
- Use PascalCase for components and layouts, for example `Welcome.astro` and `Layout.astro`.
- Use route-oriented lowercase names in `src/pages/`, for example `index.astro`.
- Prefer composition: pages should assemble layouts and components instead of growing into large inline templates.
- TypeScript uses `astro/tsconfigs/strict`; avoid `any` unless there is a clear reason.

## Testing Guidelines
- There is no dedicated automated test suite or `tests/` directory yet.
- Before opening a PR, run `npm run astro -- check` and `npm run build`.
- For UI changes, verify the result in `npm run dev` or `npm run preview` and include screenshots in review materials.

## Commit & Pull Request Guidelines
- The repository currently has no commit history, so there is no established commit convention to copy.
- Use short, imperative commit subjects. Conventional Commit style is a good default, for example `feat: add hero section`.
- PRs should include a brief scope summary, linked issue or task when available, screenshots for visual changes, and the checks you ran locally.

## Configuration Notes
- `src/styles/global.css` is a hand-written stylesheet using CSS custom properties. No Tailwind. If you change styling setup, keep those files and `package.json` or `package-lock.json` in sync.
