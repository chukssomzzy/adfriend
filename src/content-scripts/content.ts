import { AdReplacer } from "@/content-scripts/adReplacer";

declare global {
  interface Window {
    adFriendInitialized?: boolean;
  }
}

/**
 * IIFE to initialize the AdReplacer on page load.
 * This is the main entry point for the content script.
 */
(function initializeAdFriend(): void {
  if (window.adFriendInitialized) {
    console.log("AdFriend: Already initialized.");
    return;
  }
  window.adFriendInitialized = true;

  console.log("AdFriend: Content script loading...");

  const adReplacer = new AdReplacer();
  adReplacer.init().catch((error: unknown) => {
    console.error("AdFriend: Failed to initialize AdReplacer", error);
  });
})();
