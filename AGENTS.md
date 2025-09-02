# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router pages, server actions, and UI components.
- `lib/`: Shared utilities, API/Supabase clients, and TypeScript types.
- `public/`: Static assets (images, icons, `robots.txt`).
- `app/__tests__/`: Component/page tests; `test/setup.ts` configures Testing Library.
- Config: `biome.json` (lint/format), `vitest.config.ts`, `.env.local` (ignored). Build output: `.next/`.

## Build, Test, and Development Commands
- `bun run dev` / `npm run dev`: Start dev server at `http://localhost:3000`.
- `bun run build` / `npm run build`: Production build (Turbopack).
- `bun run start` / `npm run start`: Serve the built app.
- `bun run lint`: Run Biome lint checks. `bun run format`: Auto‑format.
- `bun run test`: Run Vitest. `bun run coverage`: Generate coverage report.

## Coding Style & Naming Conventions
- **Indentation**: 2 spaces (enforced by Biome). Keep functions small and typed.
- **Components**: PascalCase files/components (e.g., `UserCard.tsx`).
- **Utilities/Types**: camelCase for functions; `PascalCase` for types.
- **Imports**: Group external/internal; prefer `@/*` alias. Unused imports removed by Biome.

## Testing Guidelines
- **Stack**: Vitest + jsdom + Testing Library.
- **Naming**: `*.test.ts[x]`; colocate near source or mirror under `app/__tests__/`.
- **Focus**: Test `lib/` utilities and server actions; avoid brittle DOM snapshots.
- **Run**: `bun run test` (watch: `npm run test:watch`). Coverage at `coverage/index.html`.

## Commit & Pull Request Guidelines
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`…).
- **PRs**: Describe problem and approach, link issues, add screenshots for UI, and note risks/rollout.
- **Quality bar**: CI runs lint and tests on PRs and `main`; changes should pass with no lint errors and updated docs/tests when behavior changes.

## Security & Configuration Tips
- **Secrets**: Store in `.env.local` (e.g., `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`). Prefix safe client vars with `NEXT_PUBLIC_`.
- **Safety**: Avoid logging secrets; validate inputs in server actions under `app/`.

