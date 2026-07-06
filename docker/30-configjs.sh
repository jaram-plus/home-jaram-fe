#!/bin/sh
# nginx docker-entrypoint script — generates /usr/share/nginx/html/config.js
# from $API_BASE_URL (or $VITE_API_BASE_URL fallback) before nginx starts.
#
# Lets the same Docker image be reused across dev/prod by injecting the API
# URL at container start, without rebuild.
#
# Resolution order: API_BASE_URL → VITE_API_BASE_URL → http://localhost:8080
set -eu

API_URL="${API_BASE_URL:-${VITE_API_BASE_URL:-http://localhost:8080}}"

echo "[30-configjs] writing /usr/share/nginx/html/config.js with API_BASE_URL=${API_URL}"

cat > /usr/share/nginx/html/config.js <<EOF
window.__APP_CONFIG__ = window.__APP_CONFIG__ || {};
window.__APP_CONFIG__.API_BASE_URL = "${API_URL}";
EOF
