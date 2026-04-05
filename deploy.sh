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
  python - "$key" "$value" "$ENV_FILE" <<'PY'
from pathlib import Path
import re, sys

key, value, file_path = sys.argv[1], sys.argv[2], sys.argv[3]
path = Path(file_path)
text = path.read_text() if path.exists() else ""

if re.search(rf"^{key}=.*$", text, flags=re.M):
    text = re.sub(rf"^{key}=.*$", f"{key}={value}", text, flags=re.M)
else:
    if text and not text.endswith("\n"):
        text += "\n"
    text += f"{key}={value}\n"

path.write_text(text)
PY
}
update_env DOMAIN "$DOMAIN"
update_env NODE_ENV production
update_env CERTBOT_EMAIL "$EMAIL"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is required; install it from https://pnpm.io" >&2
  exit 1
fi

cd "$ROOT"

pnpm install
PORT=5173 BASE_PATH=/ pnpm run build

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required to bring up services." >&2
  exit 1
fi

docker compose pull --quiet
docker compose up -d --build

echo "Deployment complete. Visit https://${DOMAIN} once DNS is pointed to this host."
