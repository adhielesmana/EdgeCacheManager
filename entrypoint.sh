#!/bin/sh
set -e

echo "[NexusCDN] Running database schema push..."
cd /app
pnpm --filter @workspace/db run push

echo "[NexusCDN] Starting API server..."
exec node --enable-source-maps /app/artifacts/api-server/dist/index.mjs
