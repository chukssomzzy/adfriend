/**
 * This is a classic content script that acts as a loader.
 * It dynamically imports the main content script module.
 * This allows the main content script to use ES module features
 * even when the initial injection is done via manifest.json's content_scripts.
 */
(async () => {
  const mainContentScriptModulePath = 'content-scripts/content.js'; // Path relative to the extension's root
  try {
    const moduleURL = chrome.runtime.getURL(mainContentScriptModulePath);
    await import(moduleURL);
    console.log('AdFriend: Main content script module loaded dynamically via loader.js');
  } catch (error) {
    console.error('AdFriend: Failed to load main content script module from loader.js:', mainContentScriptModulePath, error);
  }
})();
