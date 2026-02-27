// ==========================================
// Custom Events – page-view only (for Launch)
// Fires "page-view" when dataLayer is ready so Launch can trigger rules.
// ==========================================

function dispatchCustomEvent(eventName) {
  document.dispatchEvent(new CustomEvent(eventName, { bubbles: true }));
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
    firePageViewWhenReady();
  } catch (error) {
    console.error("Error initializing custom events:", error);
  }
}

initializeCustomEvents();
