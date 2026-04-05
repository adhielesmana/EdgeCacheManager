#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$ROOT/.env"

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

if [ ! -f "$ENV_FILE" ] && [ -f "$ROOT/.env.example" ]; then
  cp "$ROOT/.env.example" "$ENV_FILE"
  echo "Copied .env.example to .env; review/fill any missing values."
fi

update_env() {
  local key=$1 value=$2
  node - "$ENV_FILE" "$key" "$value" <<'NODE'
const [file, key, value] = process.argv.slice(1);
const fs = require("fs");
const path = require("path");

const filePath = path.resolve(file);
let text = "";
if (fs.existsSync(filePath)) {
  text = fs.readFileSync(filePath, "utf8");
}

const regex = new RegExp(`^${key}=.*$`, "m");
if (regex.test(text)) {
  text = text.replace(regex, `${key}=${value}`);
} else {
  if (text && !text.endsWith("\n")) {
    text += "\n";
  }
  text += `${key}=${value}\n`;
}

fs.writeFileSync(filePath, text);
NODE
}
update_env DOMAIN "$DOMAIN"
update_env NODE_ENV production
update_env CERTBOT_EMAIL "$EMAIL"

APT_UPDATED=0
apt_install() {
  if [ $APT_UPDATED -eq 0 ]; then
    apt-get update
    APT_UPDATED=1
  fi
  DEBIAN_FRONTEND=noninteractive apt-get install -y "$@"
}

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

cd "$ROOT"

pnpm install
PORT=5173 BASE_PATH=/ pnpm run build

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker missing; installing docker.io + compose plugin from Debian repos..."
  apt_install docker.io docker-compose-plugin
fi

docker compose pull --quiet
docker compose up -d --build

echo "Deployment complete. Visit https://${DOMAIN} once DNS is pointed to this host."
