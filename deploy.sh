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
  echo "Deploying requires root privileges because we manage Docker/Nginx." >&2
  echo "Run this script via sudo or as root." >&2
  exit 1
fi

if [ $# -lt 2 ]; then
  cat <<'EOF'
Usage: ./deploy.sh <domain> <contact-email>

Example: ./deploy.sh cdn.example.com ops@example.com
EOF
  exit 1
fi

DOMAIN="$1"
EMAIL="$2"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js missing; installing Node.js via NodeSource..."
  apt_install curl ca-certificates gnupg
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  APT_UPDATED=0
  apt_install nodejs
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm missing; installing globally via npm..."
  npm install -g pnpm
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker missing; installing docker.io + compose plugin from Debian repos..."
  apt_install docker.io docker-compose-plugin
fi

if [ ! -f "$ENV_FILE" ] && [ -f "$ROOT/.env.example" ]; then
  cp "$ROOT/.env.example" "$ENV_FILE"
  echo "Copied .env.example to .env; review/fill any missing values."
fi

touch "$ENV_FILE"

update_env() {
  local key=$1 value=$2
  local tmp
  tmp="$(mktemp)"

  awk -F= -v key="$key" -v value="$value" '
    BEGIN { updated = 0 }
    $1 == key {
      print key "=" value
      updated = 1
      next
    }
    { print }
    END {
      if (!updated) {
        print key "=" value
      }
    }
  ' "$ENV_FILE" > "$tmp"

  mv "$tmp" "$ENV_FILE"
}

get_env_value() {
  local key=$1
  if [ -f "$ENV_FILE" ]; then
    sed -n "s/^${key}=//p" "$ENV_FILE" | tail -n 1
  fi
}

generate_hex() {
  local bytes=$1
  head -c "$bytes" /dev/urandom | od -An -tx1 | tr -d ' \n'
}

ensure_env() {
  local key=$1 value=$2
  local current
  current="$(get_env_value "$key")"
  if [ -z "$current" ]; then
    update_env "$key" "$value"
  fi
}

update_env DOMAIN "$DOMAIN"
update_env NODE_ENV production
update_env CERTBOT_EMAIL "$EMAIL"

POSTGRES_PASSWORD="$(get_env_value POSTGRES_PASSWORD)"
if [ -z "$POSTGRES_PASSWORD" ]; then
  POSTGRES_PASSWORD="$(generate_hex 24)"
fi

SESSION_SECRET="$(get_env_value SESSION_SECRET)"
if [ -z "$SESSION_SECRET" ]; then
  SESSION_SECRET="$(generate_hex 32)"
fi

ensure_env POSTGRES_PASSWORD "$POSTGRES_PASSWORD"
ensure_env SESSION_SECRET "$SESSION_SECRET"
ensure_env DATABASE_URL "postgresql://nexuscdn:${POSTGRES_PASSWORD}@db:5432/nexuscdn"

cd "$ROOT"

pnpm install
PORT=5173 BASE_PATH=/ pnpm run build

export COMPOSE_PROJECT_NAME=nexuscdn
docker compose --env-file "$ENV_FILE" pull --quiet
docker compose --env-file "$ENV_FILE" up -d --build

echo "Deployment complete. Visit https://${DOMAIN} once DNS is pointed to this host."
