// ==========================================
// Custom Events for Launch
// Fires "page-view" when dataLayer is ready; dispatchCustomEvent(eventName) used by blocks (registration, sign-in, join-us, flight-search).
// ==========================================

export function dispatchCustomEvent(eventName) {
  const name = eventName && String(eventName).trim();
  if (!name) return;
  const dataLayerSnapshot = typeof window.dataLayer !== 'undefined'
    ? JSON.parse(JSON.stringify(window.dataLayer))
    : null;
  console.debug('[Launch custom event] Firing:', name, '| dataLayer at fire time:', dataLayerSnapshot);
  document.dispatchEvent(new CustomEvent(name, { bubbles: true }));
}

/**
 * Waits for dataLayer to be ready, then fires page-view on every page.
 */
function firePageViewWhenReady() {
  if (!window.dataLayer || !window._dataLayerReady) {
    setTimeout(firePageViewWhenReady, 50);
    return;
  }
  if (window._dataLayerQueue && window._dataLayerQueue.length > 0) {
    setTimeout(firePageViewWhenReady, 50);
    return;
  }
  if (window._dataLayerUpdating) {
    document.addEventListener("dataLayerUpdated", () => firePageViewWhenReady(), { once: true });
    return;
  }
  dispatchCustomEvent("page-view");
}

export async function initializeCustomEvents() {
  try {
    setTimeout(firePageViewWhenReady, 5000);
  } catch (error) {
    console.error("Error initializing custom events:", error);
  }
}

initializeCustomEvents();
