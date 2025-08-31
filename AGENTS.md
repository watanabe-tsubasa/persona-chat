# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router pages, server actions, UI.
- `lib/`: Shared utilities, API/Supabase clients, types.
- `public/`: Static assets (images, icons, robots.txt).
- `app/__tests__/`: Component/page tests; `test/setup.ts` sets Testing Library.
- Config: `biome.json` (lint/format), `vitest.config.ts`, `.env.local` (not committed). Build output lives in `.next/`.

## Build, Test, and Development Commands
- `bun run dev` / `npm run dev`: Start dev server at `http://localhost:3000`.
- `bun run build` / `npm run build`: Production build (Turbopack).
- `bun run start` / `npm run start`: Serve the built app.
- `bun run lint`: Biome lint checks. `bun run format`: Auto-format.
- `bun run test`: Run Vitest. `bun run coverage`: Generate coverage report.

## Coding Style & Naming Conventions
- Indentation: 2 spaces (Biome enforces). Keep functions small and typed.
- Components: PascalCase files/components (e.g., `UserCard.tsx`).
- Utilities/types: camelCase for functions, `PascalCase` for types.
- Imports: Group external/internal; prefer path alias `@/*` where applicable. Unused imports removed by Biome.

## Testing Guidelines
- Stack: Vitest + jsdom + Testing Library. Example in `app/__tests__/page.test.tsx`.
- Name tests `*.test.ts[x]`; colocate near source or mirror under `__tests__/`.
- Focus: `lib/` utilities and server actions; avoid brittle DOM snapshots.
- Run: `bun run test` (watch: `npm run test:watch`). Coverage at `coverage/index.html`.
- CI: GitHub Actions runs lint and tests on PRs and pushes to `main`.

## Commit & Pull Request Guidelines
- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`...).
- PRs: Describe problem and approach, link issues, add screenshots for UI, note risks/rollout.
- Quality bar: Passing CI, no lint errors, updated docs/tests when behavior changes.

## Security & Configuration Tips
- Secrets live in `.env.local` (e.g., `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`). Prefix safe client vars with `NEXT_PUBLIC_`.
- Avoid logging secrets; validate inputs in server actions under `app/`.
