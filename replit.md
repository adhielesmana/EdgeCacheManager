# NexusCDN

## Overview

A lightweight CDN/proxy cache admin dashboard (NexusCDN) — a Cloudflare-like system where you point domains to origin servers. The CDN admin dashboard lets you manage multiple domains, each with one or more origin servers, configure SSL, caching settings, view stats, and purge caches.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + Shadcn UI
- **Auth**: Replit Auth (OIDC PKCE)

## Architecture

### CDN Concepts
- **Domains**: A domain (e.g. `aaa.com`) maps to one or more origin servers
- **Origins**: IP/hostname + port + protocol + weight — used for load balancing
- **Cache**: Files are cached locally per domain with configurable TTL
- **SSL**: SSL termination toggle per domain
- **Stats**: Per-domain and global request/cache-hit/bandwidth tracking

### User Roles
- **superadmin**: Can manage users (change roles), manage all domains/origins, purge caches
- **admin**: Can manage domains and origins, purge caches  
- **user**: Read-only access to view domains and stats

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (CDN management API + auth)
│   └── cdn-dashboard/      # React/Vite admin dashboard (NexusCDN)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   └── replit-auth-web/    # Auth hook for web app
├── scripts/
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Schema

- `sessions` — Replit auth sessions (mandatory)
- `users` — Users with roles (superadmin/admin/user)
- `domains` — CDN domains with SSL/cache config
- `origins` — Origin servers per domain (address, port, protocol, weight)
- `request_stats` — Per-domain statistics (hits, misses, bandwidth, cache size)

## API Routes

All under `/api`:
- `GET /healthz` — Health check
- `GET /auth/user` — Current user info
- `GET /login`, `GET /callback`, `GET /logout` — Auth flow
- `GET /users`, `PATCH /users/:id` — User management (superadmin only)
- `GET/POST /domains` — List/create domains
- `GET/PATCH/DELETE /domains/:id` — Domain CRUD
- `GET/POST /domains/:id/origins` — Origin management
- `PATCH/DELETE /domains/:id/origins/:originId` — Origin CRUD
- `POST /domains/:id/cache/purge` — Purge cache
- `GET /stats` — Global CDN stats
- `GET /domains/:id/stats` — Per-domain stats

## Development

- `pnpm --filter @workspace/api-server run dev` — Run API server
- `pnpm --filter @workspace/cdn-dashboard run dev` — Run frontend
- `pnpm --filter @workspace/api-spec run codegen` — Regenerate API client
- `pnpm --filter @workspace/db run push` — Push DB schema changes
