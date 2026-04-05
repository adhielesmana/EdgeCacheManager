#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$ROOT/.env"
APT_UPDATED=0

apt_install() {
  if [ $APT_UPDATED -eq 0 ]; then
    apt-get update
    APT_UPDATED=1
  fi
  DEBIAN_FRONTEND=noninteractive apt-get install -y "$@"
}

if [ "$EUID" -ne 0 ]; then
  echo "Updating the deployment requires privileges to restart Docker/Nginx; run as root or via sudo." >&2
  exit 1
fi

cd "$ROOT"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js missing; installing Node.js via NodeSource..."
  apt_install curl ca-certificates gnupg
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  APT_UPDATED=0
  apt_install nodejs
fi

if ! command -v git >/dev/null 2>&1; then
  echo "git is required to pull the latest changes." >&2
  exit 1
fi

git pull --rebase origin main

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm missing; installing globally via npm..."
  npm install -g pnpm
fi

pnpm install
PORT=5173 BASE_PATH=/ pnpm run build

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker missing; installing docker.io + compose plugin from Debian repos..."
  apt_install docker.io docker-compose-plugin
fi

if [ ! -f "$ENV_FILE" ]; then
  echo ".env is missing. Run ./deploy.sh first so deployment secrets and domain settings are created." >&2
  exit 1
fi

export COMPOSE_PROJECT_NAME=nexuscdn
docker compose --env-file "$ENV_FILE" pull --quiet
docker compose --env-file "$ENV_FILE" up -d --build

echo "Update complete; services were rebuilt and restarted."
