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

# ---------------------------------------------------------------------------
# SAFETY GUARDS — protect other projects sharing this hosting account.
# The publish step syncs files INTO $DOCROOT and may remove stale files there,
# so we refuse any target that isn't unmistakably this project's own folder.
# ---------------------------------------------------------------------------
DOCROOT="${DOCROOT%/}"                 # strip trailing slash
case "$DOCROOT" in
  "" | "/" | "/home" | "$HOME" | "$HOME/public_html")
    echo "REFUSING: '$DOCROOT' is a shared/home directory. Aborting to protect other sites."
    exit 1 ;;
esac
if [[ "$DOCROOT" != *caloriecounterbketo* && "${ALLOW_ANY_DOCROOT:-0}" != "1" ]]; then
  echo "SAFETY STOP: the target folder does not look like this project's subdomain."
  echo "  Expected the path to contain 'caloriecounterbketo'."
  echo "  Got: $DOCROOT"
  echo "Nothing was changed. Fix DOCROOT, or (only if you are certain) re-run with ALLOW_ANY_DOCROOT=1."
  exit 1
fi
echo "==> Target folder OK: $DOCROOT"

echo "==> Installing dependencies"
npm ci

echo "==> Building production site"
npm run build

echo "==> Publishing dist/ -> $DOCROOT"
mkdir -p "$DOCROOT"
# Keep cPanel/SSL scaffolding that lives in the document root.
KEEP=( ".well-known" "cgi-bin" )
if command -v rsync >/dev/null 2>&1; then
  EXC=()
  for k in "${KEEP[@]}"; do EXC+=( "--exclude=$k" ); done
  rsync -a --delete "${EXC[@]}" dist/ "$DOCROOT/"
else
  # rsync not available: remove old files but preserve the KEEP entries, then copy.
  find "$DOCROOT" -mindepth 1 -maxdepth 1 \
    ! -name ".well-known" ! -name "cgi-bin" -exec rm -rf {} +
  cp -a dist/. "$DOCROOT/"
fi

echo "==> Done. Visit https://caloriecounterbketo.bluekarmasecrets.com"
echo "    (If this is the first deploy, run AutoSSL in cPanel -> SSL/TLS Status.)"
