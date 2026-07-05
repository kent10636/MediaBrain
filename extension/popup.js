// MediaBrain Extension Popup (MV3) - one-click save + clipboard bridge to Tauri app
const saveBtn = document.getElementById('save-btn');
const statusEl = document.getElementById('status');
const previewEl = document.getElementById('preview');

function showPreview(data) {
  if (!data || !previewEl) return;
  previewEl.innerHTML = `
    <div class="title">${(data.title || 'Video').slice(0, 80)}</div>
    <div class="meta">${data.platform || 'unknown'} • ${data.url ? data.url.slice(0,60) : ''}</div>
  `;
  previewEl.classList.add('show');
}

async function saveCurrentVideo() {
  saveBtn.disabled = true;
  statusEl.textContent = 'Detecting video page...';
  previewEl.classList.remove('show');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
      statusEl.textContent = 'No active tab.';
      saveBtn.disabled = false;
      return;
    }

    chrome.tabs.sendMessage(tab.id, { type: 'MB_EXTRACT_VIDEO' }, async (resp) => {
      let videoData;
      if (chrome.runtime.lastError || !resp || !resp.success) {
        videoData = {
          url: tab.url,
          title: tab.title || 'Untitled Video',
          platform: detectPlatform(tab.url),
          cover: null,
          savedAt: new Date().toISOString()
        };
      } else {
        videoData = resp.data;
      }

      showPreview(videoData);
      await saveToMediaBrain(videoData);
      saveBtn.disabled = false;
    });
  } catch (e) {
    statusEl.textContent = 'Error: ' + (e.message || e);
    saveBtn.disabled = false;
  }
}

function detectPlatform(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('bilibili.com')) return 'bilibili';
  if (url.includes('vimeo.com')) return 'vimeo';
  return 'unknown';
}

async function saveToMediaBrain(videoData) {
  statusEl.textContent = 'Saving...';

  // 1. Persist locally in extension storage (for history)
  const existing = await chrome.storage.local.get(['savedVideos']);
  const list = existing.savedVideos || [];
  const entry = { ...videoData, fromExtension: true, savedAt: videoData.savedAt || new Date().toISOString() };
  list.unshift(entry);
  await chrome.storage.local.set({ savedVideos: list.slice(0, 30) });

  // 2. Communication bridge: copy structured JSON payload to clipboard
  //    The Tauri app can read clipboard and import using real parse + persist
  try {
    const payload = JSON.stringify({ type: 'mediabrain-video', ...entry });
    await navigator.clipboard.writeText(payload);
  } catch (_) {
    // clipboard may fail in some contexts; fallback to just the URL
    try { await navigator.clipboard.writeText(entry.url); } catch {}
  }

  statusEl.textContent = '✓ Saved! Open MediaBrain and click "Import from Ext"';
  setTimeout(() => {
    statusEl.textContent = 'Data copied to clipboard for MediaBrain.';
  }, 2400);
}

saveBtn.addEventListener('click', saveCurrentVideo);

// Initial status
chrome.storage.local.get(['savedVideos'], (res) => {
  if (res.savedVideos && res.savedVideos.length) {
    statusEl.textContent = `${res.savedVideos.length} videos saved via extension.`;
  } else {
    statusEl.textContent = 'Visit a YouTube or Bilibili video page, then click Save.';
  }
});
