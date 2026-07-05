// Pure video link parser (Stage 1/2) — directly testable (now async for Bili cover fetch)
// Exports kept stable: parseVideoLink is the primary shipped function.

import { fetchBilibiliVideoInfo, fetchBilibiliCover } from './bilibili-cover';

export interface ParsedVideo {
  url: string;
  title: string;
  platform: string;
  cover: string | null;
  description?: string | null;  // real video description when available (for better AI summaries)
}

// Pure helpers (no I/O) — extracted per recommended layering
export function extractYoutubeId(url: string): string | null {
  const m = url.match(/[?&]v=([^&]{6,})/) || url.match(/youtu\.be\/([^?&/]{6,})/);
  return m ? m[1] : null;
}

export function extractBilibiliId(url: string): string | null {
  const m = url.match(/\/video\/(BV[0-9A-Za-z]+|av\d+)/i);
  return m ? m[1] : null;
}

export function buildYoutubeCover(vid: string | null): string | null {
  return vid ? `https://img.youtube.com/vi/${vid}/hqdefault.jpg` : null;
}

export async function parseVideoLink(input: string): Promise<ParsedVideo> {
  const url = input.trim();
  if (!url) {
    throw new Error("URL 不能为空");
  }

  let platform = "unknown";
  let title = "Untitled Video";
  let cover: string | null = null;

  // YouTube — fetch real title via oEmbed
  if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\b/i.test(url)) {
    platform = "youtube";
    const vid = extractYoutubeId(url);
    title = vid ? `YouTube • ${vid}` : "YouTube Video";
    cover = buildYoutubeCover(vid);
    if (vid) {
      try {
        let fetchFn: typeof fetch = fetch;
        try {
          const http = await import('@tauri-apps/plugin-http');
          if (http.fetch) fetchFn = http.fetch;
        } catch {}
        const res = await fetchFn(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${vid}&format=json`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.youtube.com/'
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.title) title = data.title;
        }
      } catch {}
    }
  }
  // Bilibili — use dedicated info fetch for real title + cover + description
  // This is more robust and centralizes the API call + headers.
  // Extension import is recommended for best reliability on Bilibili.
  else if (/bilibili\.com/i.test(url)) {
    platform = "bilibili";
    const biliId = extractBilibiliId(url);
    title = biliId ? `Bilibili • ${biliId}` : "Bilibili Video";
    cover = null;
    let description: string | null = null;

    if (biliId) {
      const info = await fetchBilibiliVideoInfo(biliId);
      if (info.title) title = info.title;
      if (info.cover) cover = info.cover;
      if (info.description) description = info.description;
    }

    // Final fallback for cover only
    if (!cover) {
      cover = await fetchBilibiliCover(biliId!);
    }

    return { url, title, platform, cover, description };
  }
  // Vimeo
  else if (/vimeo\.com/i.test(url)) {
    platform = "vimeo";
    title = "Vimeo Video";
  } else {
    // Generic
    try {
      const u = new URL(url);
      title = u.hostname.replace(/^www\./, '') + " Video";
    } catch {}
  }

  return { url, title, platform, cover };
}

export function detectPlatform(url: string): string {
  if (/youtube|youtu\.be/i.test(url)) return "youtube";
  if (/bilibili/i.test(url)) return "bilibili";
  if (/vimeo/i.test(url)) return "vimeo";
  return "unknown";
}
