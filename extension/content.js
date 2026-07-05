// MediaBrain content script (MV3) - detects video metadata on supported platforms
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'MB_EXTRACT_VIDEO') {
    try {
      const data = extractVideoMetadata();
      sendResponse({ success: true, data });
    } catch (e) {
      sendResponse({ success: false, error: e.message });
    }
  }
  return true; // keep channel open
});

function extractVideoMetadata() {
  const url = window.location.href;
  let title = document.title || 'Untitled Video';
  let platform = 'unknown';
  let cover = '';

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    platform = 'youtube';
    // Try to get title from yt
    const ytTitle = document.querySelector('h1.ytd-watch-metadata yt-formatted-string')?.textContent?.trim()
      || document.querySelector('title')?.textContent?.replace(' - YouTube', '').trim();
    if (ytTitle) title = ytTitle;
    // thumbnail
    const vidIdMatch = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?&]+)/);
    if (vidIdMatch) {
      cover = `https://img.youtube.com/vi/${vidIdMatch[1]}/hqdefault.jpg`;
    }
  } else if (url.includes('bilibili.com')) {
    platform = 'bilibili';
    const biliTitle = document.querySelector('.video-title')?.textContent?.trim()
      || document.querySelector('h1.video-title')?.textContent?.trim()
      || document.title.replace(/_哔哩哔哩_bilibili/, '').trim();
    if (biliTitle) title = biliTitle;
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) cover = ogImage.getAttribute('content') || '';
  }

  return {
    url,
    title: title || document.title,
    platform,
    cover: cover || null,
    savedAt: new Date().toISOString()
  };
}
