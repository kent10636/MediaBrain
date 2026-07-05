// Dedicated module for Bilibili cover fetching (I/O boundary).
// Called only from the shipped async parseVideoLink for Bilibili paste links.
// Uses public Bilibili view API to obtain the real cover (data.pic).
// Note: Direct browser/Tauri-webview fetch to api.bilibili.com may be blocked by CORS
// in some environments. On failure cover remains null (UI falls back gracefully).
// For reliable Bilibili covers, use the browser extension import (content script uses DOM og:image).

export async function fetchBilibiliCover(bvid: string): Promise<string | null> {
  if (!bvid) return null;

  // Support BV id (primary) or av (legacy) — API accepts bvid primarily
  const isBV = /^BV/i.test(bvid);
  const param = isBV ? `bvid=${bvid}` : `aid=${bvid.replace(/^av/i, '')}`;

  try {
    const res = await fetch(`https://api.bilibili.com/x/web-interface/view?${param}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (json && json.code === 0 && json.data && typeof json.data.pic === 'string') {
      return json.data.pic; // e.g. https://i1.hdslb.com/bfs/...
    }
  } catch {
    // Network or parse failure → no cover
  }
  return null;
}
