// Local dev placeholder for /config.js.
// Docker entrypoint (docker/30-configjs.sh) overwrites this at runtime
// with values from $API_BASE_URL env.
//
// For local dev (pnpm dev), leave empty so the VITE_API_BASE_URL fallback
// in src/shared/config/runtime.js kicks in.
window.__APP_CONFIG__ = window.__APP_CONFIG__ || {};
