// Runtime configuration injected by /config.js.
// See src/shared/config/runtime.js for resolution logic.

interface Window {
  __APP_CONFIG__?: {
    API_BASE_URL?: string;
  };
}
