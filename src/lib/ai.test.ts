// Unit tests for AI summary generator (Stage 3) - drives real shipped implementation
// Uses real parseVideoLink on actual YT/Bili URLs, then feeds parsed result into generateAISummary.
// Updated for async parseVideoLink + real Bili cover fetch (mocked here).
import { describe, it, expect, vi } from 'vitest';
import { generateAISummary } from './ai';
import { parseVideoLink } from './parser';

describe('generateAISummary (real implementation driven by parser)', () => {
  it('generates rich structured AI output from real YouTube parsed video', async () => {
    const realYt = 'https://www.youtube.com/watch?v=dQw4w9wgccc';
    const parsed = await parseVideoLink(realYt);  // drives shipped async parser on real YT URL
    const res = await generateAISummary(parsed.title, parsed.platform, parsed.url);

    expect(res.summary.length).toBeGreaterThan(50);
    expect(Array.isArray(res.keyPoints)).toBe(true);
    expect(res.keyPoints.length).toBeGreaterThan(2);
    expect(res.tags.length).toBeGreaterThan(0);
    expect(res.tags).toContain('youtube');
  });

  it('generates localized-rich AI output from real Bilibili parsed video (via mocked real fetch)', async () => {
    const realBili = 'https://www.bilibili.com/video/BV1xx411c7mu';
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: 0, data: { pic: 'https://i1.hdslb.com/bfs/archive/ai-test-bili.jpg' } })
    });
    vi.stubGlobal('fetch', mockFetch);

    const parsed = await parseVideoLink(realBili);  // drives shipped async parser on real Bilibili URL
    const res = await generateAISummary(parsed.title, parsed.platform, parsed.url);

    expect(res.summary.length).toBeGreaterThan(30);
    expect(Array.isArray(res.keyPoints)).toBe(true);
    expect(res.keyPoints.length).toBeGreaterThan(0);
    expect(res.tags.some(t => ['教程', '技术', 'bilibili'].includes(t) || t === 'bilibili')).toBe(true);
    // Cover was fetched inside shipped parser
    expect(typeof parsed.cover).toBe('string');
    expect(parsed.cover).toContain('hdslb.com');

    vi.unstubAllGlobals();
  });

  it('produces usable output for additional real parsed URLs (end-to-end parse → AI path)', async () => {
    const ytShort = await parseVideoLink('https://youtu.be/abc123def');
    const res1 = await generateAISummary(ytShort.title, ytShort.platform, ytShort.url);
    expect(res1.summary.length).toBeGreaterThan(40);
    expect(res1.keyPoints.length).toBeGreaterThan(1);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: 0, data: { pic: 'https://i1.hdslb.com/bfs/archive/extra-bili.jpg' } })
    });
    vi.stubGlobal('fetch', mockFetch);

    const bili = await parseVideoLink('https://www.bilibili.com/video/BV1234567890');
    const res2 = await generateAISummary(bili.title, bili.platform, bili.url);
    expect(res2.tags.length).toBeGreaterThan(1);
    expect(typeof bili.cover).toBe('string');

    vi.unstubAllGlobals();
  });
});
