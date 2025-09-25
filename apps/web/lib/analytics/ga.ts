// prefer public env var so it can be configured per-deploy
export const GA_MEASUREMENT_ID =
  typeof process !== "undefined" &&
  typeof process.env !== "undefined" &&
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    ? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    : "G-XXXXXX";

type DataLayerItem = { event?: string; [key: string]: unknown };

declare global {
  interface Window {
    dataLayer?: DataLayerItem[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function isEnabled(): boolean {
  return typeof GA_MEASUREMENT_ID === "string" && GA_MEASUREMENT_ID.length > 0;
}

function getDataLayer(): DataLayerItem[] {
  if (!window.dataLayer) window.dataLayer = [];
  return window.dataLayer as DataLayerItem[];
}

export function pageview(path: string): void {
  if (!isEnabled()) return;
  const dl = getDataLayer();
  dl.push({ event: "pageview", page_path: path });
  if (typeof window.gtag === "function") {
    try {
      window.gtag("event", "page_view", { page_path: path });
    } catch (e) {
      // ignore
    }
  }
}

export function event(name: string, params?: Record<string, unknown>): void {
  if (!isEnabled()) return;
  const dl = getDataLayer();
  const payload: DataLayerItem = { event: name };
  if (params) Object.assign(payload, params);
  dl.push(payload);
  if (typeof window.gtag === "function") {
    try {
      window.gtag("event", name, params || {});
    } catch (e) {
      // ignore
    }
  }
}

export default {
  GA_MEASUREMENT_ID,
  isEnabled,
  pageview,
  event,
};
