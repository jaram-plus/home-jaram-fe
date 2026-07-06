/**
 * Runtime config accessor.
 *
 * API base URL을 아래 우선순위로 읽는다:
 *   1. `window.__APP_CONFIG__.API_BASE_URL` — `/config.js`가 runtime에 주입 (Docker)
 *   2. `import.meta.env.VITE_API_BASE_URL` — Vite build-time fallback (local dev)
 *   3. `'http://localhost:8080'` — 마지막 기본값
 *
 * runtime 주입 방식 덕분에 동일한 Docker image를 dev/prod에서 재사용.
 * 컨테이너 시작 시 `/docker-entrypoint.d/30-configjs.sh` 가
 * `$API_BASE_URL` env로 `/usr/share/nginx/html/config.js` 를 생성한다.
 *
 * 로컬 개발(`pnpm dev`)에서는 `public/config.js` 가 placeholder 역할,
 * 결국 `import.meta.env.VITE_API_BASE_URL` → `'http://localhost:8080'` 로 떨어짐.
 */

const FALLBACK_API_BASE_URL = 'http://localhost:8080';

function readRuntimeConfig() {
  if (typeof window !== 'undefined' && window.__APP_CONFIG__) {
    return window.__APP_CONFIG__;
  }
  return {};
}

export function getApiBaseUrl() {
  const runtime = readRuntimeConfig();
  if (runtime.API_BASE_URL) return runtime.API_BASE_URL;
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  return FALLBACK_API_BASE_URL;
}

/** 앱 진입 시점에 한 번 평가되는 API base URL. */
export const API_BASE_URL = getApiBaseUrl();
