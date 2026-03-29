# NexusCDN — Admin Dashboard

> A professional CDN proxy cache management platform. Point domains to origin servers, configure SSL and caching policies, monitor global traffic, and manage users — all from one unified dashboard.

[![Node.js](https://img.shields.io/badge/Node.js-24-green)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Role-Based Access Control](#role-based-access-control)
- [Prerequisites](#prerequisites)
- [Production Deployment](#production-deployment)
- [Manual Installation](#manual-installation)
- [Configuration](#configuration)
- [Default Credentials](#default-credentials)
- [API Reference](#api-reference)
- [Development](#development)
- [Project Structure](#project-structure)
- [Security](#security)

---

## Overview

NexusCDN is a full-stack CDN proxy and cache management platform built with:

- **Frontend**: React + Vite + TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Local username/password + optional Replit OIDC
- **Deployment**: Docker + Nginx (host) + Certbot SSL

---

## Architecture

```
                ┌─────────────────────────────────────┐
                │           Production Server          │
                │                                      │
  Internet ───► │  Nginx (host)                        │
                │    ├── Serves React SPA (/var/www)   │
                │    └── Proxies /api → Docker API     │
                │                                      │
                │  ┌────────────────────────────────┐  │
                │  │       Docker Network           │  │
                │  │                                │  │
                │  │  ┌──────────┐  ┌────────────┐ │  │
                │  │  │   API    │  │ PostgreSQL  │ │  │
                │  │  │ :8080    │◄─►│   :5432    │ │  │
                │  │  └──────────┘  └────────────┘ │  │
                │  └────────────────────────────────┘  │
                └─────────────────────────────────────┘
```

---

## Features

| Feature | Description |
|---|---|
| **Domain Management** | Add, configure, and manage multiple domains with origin servers |
| **Origin Servers** | Configure multiple origins per domain with health checks |
| **Cache Control** | Set TTL policies, purge cache by URL, path, or entire domain |
| **SSL/TLS** | Automatic Let's Encrypt certificate provisioning via Certbot |
| **Analytics** | Real-time traffic stats, cache hit ratios, bandwidth usage |
| **User Management** | Create and manage users with granular role-based access |
| **Local Auth** | Username/password login with bcrypt password hashing |
| **Replit Auth** | Optional OIDC PKCE login when running on Replit |

---

## Role-Based Access Control

| Permission | Superadmin | Admin | User |
|---|:---:|:---:|:---:|
| View dashboard & stats | ✅ | ✅ | ✅ |
| Manage domains & origins | ✅ | ✅ | ❌ |
| Purge cache | ✅ | ✅ | ❌ |
| Manage users | ✅ | ❌ | ❌ |
| Change user roles | ✅ | ❌ | ❌ |
| System configuration | ✅ | ❌ | ❌ |

---

## Prerequisites

- **OS**: Ubuntu 20.04+ or Debian 11+
- **Root / sudo access** on the server
- **Domain name** pointed to your server's IP (A record)
- A valid **email address** for SSL certificate registration

The deployment script handles all other dependencies automatically.

---

## Production Deployment

### One-Command Deploy

Clone the repository and run the deployment script as root:

```bash
git clone https://github.com/adhielesmana/EdgeCacheManager.git
cd EdgeCacheManager
sudo bash .deploy.sh <your-domain.com> <your-email@example.com>
```

**Example:**
```bash
sudo bash .deploy.sh cdn.mycompany.com admin@mycompany.com
```

### What the script does

1. **Installs Nginx** on the host (skips if already installed)
2. **Installs Certbot** on the host (skips if already installed)
3. **Installs Docker** and Docker Compose plugin (skips if already installed)
4. **Builds the React frontend** inside a temporary Docker container
5. **Copies static files** to `/var/www/nexuscdn`
6. **Generates secure credentials** (session secret, DB password) in `.env`
7. **Starts Docker containers**: API server + PostgreSQL
8. **Runs database migrations** automatically on first startup
9. **Seeds the default superadmin** account on first startup
10. **Configures Nginx** to serve the SPA and proxy `/api`
11. **Issues SSL certificate** via Let's Encrypt and enables HTTPS redirect
12. **Sets up auto-renewal** cron job for certificates

### After Deployment

Once complete, your dashboard will be available at:
```
https://your-domain.com
```

> **Security notice:** Change the default superadmin password immediately after first login.

---

## Manual Installation

If you prefer to set up components individually:

### 1. Clone the repository

```bash
git clone https://github.com/adhielesmana/EdgeCacheManager.git
cd EdgeCacheManager
```

### 2. Create the environment file

```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
POSTGRES_PASSWORD=your-secure-password
DATABASE_URL=postgresql://nexuscdn:your-secure-password@db:5432/nexuscdn
SESSION_SECRET=your-64-char-random-string
NODE_ENV=production
DOMAIN=your-domain.com
```

Generate a secure session secret:
```bash
openssl rand -hex 32
```

### 3. Start Docker services

```bash
docker compose up -d --build
```

### 4. Build and deploy the frontend

Install Node.js 24 and pnpm, then:
```bash
pnpm install --frozen-lockfile
pnpm --filter @workspace/cdn-dashboard run build
sudo cp -r artifacts/cdn-dashboard/dist/* /var/www/nexuscdn/
```

### 5. Configure Nginx

```bash
sudo cp nginx/nexuscdn.conf.template /etc/nginx/sites-available/nexuscdn
sudo sed -i 's/DOMAIN_PLACEHOLDER/your-domain.com/g' /etc/nginx/sites-available/nexuscdn
sudo ln -sf /etc/nginx/sites-available/nexuscdn /etc/nginx/sites-enabled/nexuscdn
sudo nginx -t && sudo systemctl reload nginx
```

### 6. Issue SSL certificate

```bash
sudo certbot --nginx -d your-domain.com -m your-email@example.com --agree-tos --redirect
```

---

## Configuration

### Environment Variables

| Variable | Required | Description |
|---|:---:|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SESSION_SECRET` | ✅ | Secret for signing session cookies (min 32 chars) |
| `POSTGRES_PASSWORD` | ✅ | PostgreSQL password (used by docker-compose) |
| `NODE_ENV` | ✅ | Set to `production` for production deployment |
| `PORT` | — | API server port (default: `8080`) |
| `DOMAIN` | — | Your domain name (informational) |

### Nginx Configuration

The Nginx template is located at `nginx/nexuscdn.conf.template`. The deploy script replaces `DOMAIN_PLACEHOLDER` with your actual domain.

Key configuration:
- Serves static React files from `/var/www/nexuscdn`
- Proxies all `/api/` requests to the Docker API container on `127.0.0.1:8080`
- Static assets are cached for 1 year with immutable headers

---

## Default Credentials

The following superadmin account is created automatically on first startup:

| Field | Value |
|---|---|
| **Username** | `adhielesmana` |
| **Password** | `Admin@2026!` |
| **Role** | `superadmin` |

> **⚠ IMPORTANT:** Change this password immediately after your first login. The default password is hardcoded as a bcrypt hash (cost factor 12) — it is never stored in plain text.

---

## API Reference

The API is documented via OpenAPI specification at `lib/api-spec/openapi.yaml`.

### Authentication Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Local username/password login |
| `GET` | `/api/auth/user` | Get current authenticated user |
| `GET` | `/api/auth/config` | Get auth configuration |
| `GET` | `/api/login` | Replit OIDC login (Replit only) |
| `GET` | `/api/logout` | Logout and clear session |

### Domain Management

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/domains` | List all domains |
| `POST` | `/api/domains` | Create a new domain |
| `GET` | `/api/domains/:id` | Get domain details |
| `PUT` | `/api/domains/:id` | Update domain configuration |
| `DELETE` | `/api/domains/:id` | Delete a domain |

### Origin Servers

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/domains/:id/origins` | List origins for a domain |
| `POST` | `/api/domains/:id/origins` | Add an origin server |
| `PUT` | `/api/origins/:id` | Update an origin |
| `DELETE` | `/api/origins/:id` | Remove an origin |

### Cache Management

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/cache/purge` | Purge cache (by URL, path, or domain) |

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stats` | Get traffic statistics |
| `GET` | `/api/stats/domains/:id` | Per-domain stats |

### User Management

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users` | List users (superadmin only) |
| `PUT` | `/api/users/:id/role` | Update user role (superadmin only) |
| `DELETE` | `/api/users/:id` | Delete a user (superadmin only) |

---

## Development

### Requirements

- Node.js 24+
- pnpm 10+
- PostgreSQL 16+ (or use Docker)

### Setup

```bash
# Clone and install dependencies
git clone https://github.com/adhielesmana/EdgeCacheManager.git
cd EdgeCacheManager
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your local DATABASE_URL

# Push database schema
pnpm --filter @workspace/db run push

# Start development servers
pnpm --filter @workspace/api-server run dev   # API on :8080
pnpm --filter @workspace/cdn-dashboard run dev # Frontend on :5173
```

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend | Node.js 24, Express 5, TypeScript, Pino logging |
| Database | PostgreSQL 16, Drizzle ORM, `connect-pg-simple` sessions |
| Auth | bcryptjs (local), openid-client (Replit OIDC) |
| Build | esbuild, pnpm workspaces, TypeScript project references |
| Deploy | Docker, docker-compose, Nginx, Certbot/Let's Encrypt |

### Available Scripts

```bash
# Install all dependencies
pnpm install

# Run all services in development
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/cdn-dashboard run dev

# Build for production
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/cdn-dashboard run build

# Push database schema
pnpm --filter @workspace/db run push

# Lint / Type-check
pnpm --filter @workspace/cdn-dashboard run typecheck
```

---

## Project Structure

```
EdgeCacheManager/
├── artifacts/
│   ├── api-server/         # Express API server
│   │   ├── src/
│   │   │   ├── app.ts      # Express app setup
│   │   │   ├── index.ts    # Entry point + seeding
│   │   │   ├── lib/
│   │   │   │   ├── auth.ts # Session management
│   │   │   │   └── seed.ts # Default superadmin seed
│   │   │   └── routes/     # API route handlers
│   │   └── build.mjs       # esbuild configuration
│   └── cdn-dashboard/      # React frontend
│       └── src/
│           ├── pages/      # Login, dashboard, domains, etc.
│           └── components/ # Shared UI components
├── lib/
│   ├── api-spec/           # OpenAPI specification + Zod schemas
│   ├── db/                 # Drizzle ORM schema and client
│   └── replit-auth-web/    # Auth hook for web client
├── nginx/
│   └── nexuscdn.conf.template  # Nginx site configuration template
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Docker service orchestration
├── entrypoint.sh           # Container startup (migrations + seed)
├── .deploy.sh              # One-command production deployment
├── .env.example            # Environment variable template
└── README.md               # This file
```

---

## Security

- **Passwords** are hashed using bcrypt with a cost factor of 12 — never stored in plain text
- **Sessions** are stored server-side in PostgreSQL with a cryptographically signed cookie
- **Cookies** are `HttpOnly`, `Secure`, and use `SameSite=Lax`
- **API server** is only exposed to `127.0.0.1` — all public traffic goes through Nginx
- **SSL/TLS** is enforced by Certbot with automatic renewal
- **RBAC** is enforced server-side on every protected route
- **Input validation** uses Zod schemas on all API endpoints

### Recommended Post-Deployment Steps

1. Change the default superadmin password immediately
2. Create individual admin accounts for each team member
3. Disable direct SSH password auth, use key-based auth
4. Set up regular database backups
5. Configure firewall to allow only ports 80, 443, and 22

---

## License

MIT © 2026 NexusCDN
