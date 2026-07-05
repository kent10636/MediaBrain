// MediaBrain MV3 background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('MediaBrain extension installed');
});

// Future: native messaging / localhost bridge to Tauri for true one-click into desktop DB
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'MB_SAVE_REQUEST') {
    sendResponse({ ok: true });
  }
});
