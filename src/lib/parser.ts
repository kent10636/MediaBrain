// Pure video link parser (Stage 1/2) — directly testable (now async for Bili cover fetch)
// Exports kept stable: parseVideoLink is the primary shipped function.

import { fetchBilibiliCover } from './bilibili-cover';

export interface ParsedVideo {
  url: string;
  title: string;
  platform: string;
  cover: string | null;
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
    throw new Error("Empty URL");
  }

  let platform = "unknown";
  let title = "Untitled Video";
  let cover: string | null = null;

  // YouTube — pure, instant
  if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\b/i.test(url)) {
    platform = "youtube";
    const vid = extractYoutubeId(url);
    title = vid ? `YouTube • ${vid}` : "YouTube Video";
    cover = buildYoutubeCover(vid);
  }
  // Bilibili — real cover via public API (no placeholder, no hard-code)
  // See bilibili-cover.ts for CORS note: may be null on direct paste; extension import provides reliable cover.
  else if (/bilibili\.com/i.test(url)) {
    platform = "bilibili";
    const biliId = extractBilibiliId(url);
    title = biliId ? `Bilibili • ${biliId}` : "Bilibili Video";
    cover = biliId ? await fetchBilibiliCover(biliId) : null;
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
