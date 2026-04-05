#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ "$EUID" -ne 0 ]; then
  echo "Updating the deployment requires privileges to restart Docker/Nginx; run as root or via sudo." >&2
  exit 1
fi

cd "$ROOT"

if ! command -v git >/dev/null 2>&1; then
  echo "git is required to pull the latest changes." >&2
  exit 1
fi

git pull --rebase origin main

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is required; install from https://pnpm.io" >&2
  exit 1
fi

pnpm install
PORT=5173 BASE_PATH=/ pnpm run build

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required to restart the services." >&2
  exit 1
fi

docker compose pull --quiet
docker compose up -d --build

echo "Update complete; services were rebuilt and restarted."
