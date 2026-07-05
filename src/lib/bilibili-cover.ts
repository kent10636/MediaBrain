// Dedicated module for Bilibili video info fetching (I/O boundary).
// Called from parseVideoLink for direct Bilibili paste links.
// Uses public Bilibili view API to obtain real title, cover (pic), and description.
// Note: Direct fetch from Tauri webview to api.bilibili.com may sometimes be blocked by CORS
// or anti-bot measures. On failure, we fall back gracefully (title stays as "Bilibili • BVxxx").
// For the most reliable Bilibili metadata, use the browser extension (content script uses DOM).

import { fetch as tauriHttpFetch } from '@tauri-apps/plugin-http';

export interface BilibiliVideoInfo {
  title: string | null;
  cover: string | null;
  description: string | null;
}

export async function fetchBilibiliVideoInfo(bvid: string): Promise<BilibiliVideoInfo> {
  if (!bvid) return { title: null, cover: null, description: null };

  const isBV = /^BV/i.test(bvid);
  const param = isBV ? `bvid=${bvid}` : `aid=${bvid.replace(/^av/i, '')}`;

  // Try the official API first (best data)
  // Use tauri http plugin (Rust side, bypasses webview CORS) if available, else window.fetch
  try {
    const apiUrl = `https://api.bilibili.com/x/web-interface/view?${param}`;
    // Prefer tauri http plugin (statically imported) which bypasses webview restrictions
    const fetchFn = tauriHttpFetch || fetch;
    const res = await fetchFn(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com/',
        'Origin': 'https://www.bilibili.com',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site'
      }
    } as any);
    if (res.ok) {
      const json = await res.json();
      if (json && json.code === 0 && json.data) {
        return {
          title: typeof json.data.title === 'string' ? json.data.title : null,
          cover: typeof json.data.pic === 'string' ? json.data.pic : null,
          description: typeof json.data.desc === 'string' ? json.data.desc : null,
        };
      } else {
        console.warn('Bilibili API returned code !=0 or no data:', json);
      }
    } else {
      console.warn('Bilibili API http status not ok:', res.status);
    }
  } catch (e) {
    console.error('Bilibili API fetch failed:', e);
    // fall through to HTML fallback
  }

  // Fallback: fetch the video page HTML and try to extract title from <title> tag
  // Use tauri http if available.
  try {
    const pageUrl = `https://www.bilibili.com/video/${bvid}`;
    const fetchFn = tauriHttpFetch || fetch;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(pageUrl)}`;
    const res = await fetchFn(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com/',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      }
    } as any);
    if (res.ok) {
      const html = await res.text();
      let extractedTitle = null;
      // Try og:title
      const ogMatch = html.match(/<meta property="og:title" content="([^"]*)"/i);
      if (ogMatch && ogMatch[1]) {
        extractedTitle = ogMatch[1].trim();
      }
      if (!extractedTitle) {
        // fallback to <title>
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          extractedTitle = titleMatch[1].replace(/_哔哩哔哩.*$/, '').trim();
        }
      }
      if (!extractedTitle) {
        // Try __INITIAL_STATE__ script for videoData.title (common in Bilibili pages)
        const stateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({.+?});/s);
        if (stateMatch) {
          try {
            const stateStr = stateMatch[1];
            const state = JSON.parse(stateStr.replace(/&quot;/g, '"'));
            if (state.videoData && state.videoData.title) {
              extractedTitle = state.videoData.title;
            } else if (state.aid && state.videoData && state.videoData.title) {
              extractedTitle = state.videoData.title;
            }
          } catch (e) {}
        }
      }
      if (extractedTitle && extractedTitle.length > 3 && !extractedTitle.includes('出错啦')) {
        let extractedCover = null;
        const ogImageMatch = html.match(/<meta property="og:image" content="([^"]*)"/i);
        if (ogImageMatch && ogImageMatch[1]) {
          extractedCover = ogImageMatch[1].trim();
        }
        return {
          title: extractedTitle,
          cover: extractedCover,
          description: null
        };
      }
    }
  } catch (e) {
    console.error('Bilibili HTML fallback fetch failed:', e);
    // ignore
  }

  return { title: null, cover: null, description: null };
}

// Backward compat for cover-only
export async function fetchBilibiliCover(bvid: string): Promise<string | null> {
  const info = await fetchBilibiliVideoInfo(bvid);
  return info.cover;
}
