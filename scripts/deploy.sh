#!/usr/bin/env bash
#
# Build the site and publish it into the subdomain's document root.
#
# Usage:
#   DOCROOT="/home/<cpanel-user>/caloriecounterbketo.bluekarmasecrets.com" ./scripts/deploy.sh
#
# Run it from the repo root on the server (Method B in DEPLOY.md).

set -euo pipefail

if [[ -z "${DOCROOT:-}" ]]; then
  echo "ERROR: set DOCROOT to your subdomain's document root, e.g.:"
  echo '  DOCROOT="/home/USER/caloriecounterbketo.bluekarmasecrets.com" ./scripts/deploy.sh'
  exit 1
fi

echo "==> Installing dependencies"
npm ci

echo "==> Building production site"
npm run build

echo "==> Publishing dist/ -> $DOCROOT"
mkdir -p "$DOCROOT"
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete dist/ "$DOCROOT/"
else
  # rsync not available: clear and copy (keeps dotfiles like .htaccess)
  find "$DOCROOT" -mindepth 1 -delete
  cp -a dist/. "$DOCROOT/"
fi

echo "==> Done. Visit https://caloriecounterbketo.bluekarmasecrets.com"
echo "    (If this is the first deploy, run AutoSSL in cPanel -> SSL/TLS Status.)"
