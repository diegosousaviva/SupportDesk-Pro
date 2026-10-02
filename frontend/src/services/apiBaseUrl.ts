const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "");

const localDevelopmentApiUrl = "http://127.0.0.1:3000";

const productionApiUrl = typeof window === "undefined"
  ? ""
  : window.location.origin;

export const API_BASE_URL = configuredApiUrl
  || (import.meta.env.DEV ? localDevelopmentApiUrl : productionApiUrl);
