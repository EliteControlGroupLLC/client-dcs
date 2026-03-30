# Copilot Instructions for client-dcs

## Project Overview

This is a **Next.js 16** website for **Distinct Construction Solutions**, a San Diego-based design-build construction company specializing in ADUs (Accessory Dwelling Units), custom homes, remodeling, and renovations. The site is deployed on Vercel at `https://www.distinctcsolutions.com`.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **Backend/DB**: Supabase (auth + database via `@supabase/ssr`)
- **Maps**: Mapbox GL
- **Data fetching**: SWR
- **Package manager**: npm

## Project Structure

- `app/` — Next.js App Router pages and layouts
- `components/` — Reusable React components organized by feature/domain
- `lib/` — Utility functions, Supabase client, data helpers, types
- `hooks/` — Custom React hooks
- `public/` — Static assets
- `scripts/` — Build/utility scripts

## Code Conventions

- Use **TypeScript** with strict mode; avoid `any` types
- Use the `@/*` path alias for all internal imports (e.g., `import { Header } from "@/components/layout/header"`)
- Components use **named exports** (not default exports) except for Next.js page/layout files
- Use **Tailwind CSS** utility classes for styling; do not use inline styles or CSS modules
- Follow Next.js App Router conventions: `page.tsx`, `layout.tsx`, `route.ts` for API routes
- Keep components small and focused; extract reusable logic into `lib/` or `hooks/`

## Linting & Building

```bash
npm run lint    # ESLint (eslint-config-next with TypeScript rules)
npm run build   # Next.js production build
npm run dev     # Development server
```

- Run `npm run lint` after making code changes to ensure no lint errors
- Run `npm run build` to verify TypeScript types and build correctness

## Key Domain Context

- **ADU** = Accessory Dwelling Unit (a secondary housing unit on a residential property)
- The site targets homeowners in San Diego, CA interested in ADU construction, garage conversions, room additions, and home remodeling
- Phone: +1-858-833-0705
- Business hours: Monday–Friday, 08:00–18:00

## Important Notes

- Do not expose sensitive Supabase keys or environment variables in client-side code
- API routes live under `app/api/`; use Supabase server-side clients in server components and API routes
- Rate limiting is implemented in `lib/rate-limit.ts`; apply it to all public API routes
- The `proxy.ts` file handles external API proxying
