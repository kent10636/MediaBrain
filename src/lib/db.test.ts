// Unit tests for DB schema definition + parse + persist mappers (Stage 2)
// Drives real shipped parseVideoLink + toDBVideo/fromDBVideo on actual YT and Bilibili URLs.
// Full DB ops (save/load) exercised at runtime in Tauri; here we test pure schema + roundtrips.
// Updated for async parseVideoLink (real fetch for Bili cover via mock).

import { describe, it, expect, vi } from 'vitest';
import { parseVideoLink } from './parser';
import {
  toDBVideo,
  fromDBVideo,
  VIDEOS_TABLE_SCHEMA,
  VIDEOS_INDEX_SCHEMA,
} from './db';

describe('Database schema definition (Stage 2)', () => {
  it('exports explicit videos table schema with all core fields', () => {
    expect(VIDEOS_TABLE_SCHEMA).toContain('CREATE TABLE IF NOT EXISTS videos');
    expect(VIDEOS_TABLE_SCHEMA).toContain('id TEXT PRIMARY KEY');
    expect(VIDEOS_TABLE_SCHEMA).toContain('url TEXT NOT NULL');
    expect(VIDEOS_TABLE_SCHEMA).toContain('title TEXT NOT NULL');
    expect(VIDEOS_TABLE_SCHEMA).toContain('platform TEXT NOT NULL');
    expect(VIDEOS_TABLE_SCHEMA).toContain('cover TEXT');
    expect(VIDEOS_TABLE_SCHEMA).toContain('saved_at TEXT NOT NULL');
    expect(VIDEOS_TABLE_SCHEMA).toContain('progress INTEGER DEFAULT 0');
    expect(VIDEOS_TABLE_SCHEMA).toContain('notes TEXT DEFAULT \'\'');
    expect(VIDEOS_TABLE_SCHEMA).toContain('summary TEXT');
    expect(VIDEOS_TABLE_SCHEMA).toContain('key_points TEXT');
    expect(VIDEOS_TABLE_SCHEMA).toContain('tags TEXT');
  });

  it('exports index schema for ordering by saved_at', () => {
    expect(VIDEOS_INDEX_SCHEMA).toContain('CREATE INDEX IF NOT EXISTS idx_videos_saved_at');
    expect(VIDEOS_INDEX_SCHEMA).toContain('saved_at DESC');
  });
});

describe('Parse + persist roundtrip using real parser on YT/Bili URLs (Stage 2)', () => {
  it('parses real YouTube URL then roundtrips through DB mappers for persistence', async () => {
    const realYtUrl = 'https://www.youtube.com/watch?v=dQw4w9wgccc';
    const parsed = await parseVideoLink(realYtUrl);  // drives real shipped async parseVideoLink
    expect(parsed.platform).toBe('youtube');
    expect(parsed.title.length).toBeGreaterThan(0);
    expect(parsed.cover).toContain('img.youtube.com');

    const videoForPersist = {
      ...parsed,
      id: 'persist-test-yt-001',
      savedAt: new Date().toISOString(),
      progress: 0,
      tags: ['test', 'persist'],
      notes: 'one-click parse test',
    };

    const dbRow = toDBVideo(videoForPersist);
    expect(dbRow.id).toBe('persist-test-yt-001');
    expect(dbRow.url).toBe(realYtUrl);
    expect(dbRow.platform).toBe('youtube');
    expect(dbRow.title.length).toBeGreaterThan(0);
    expect(dbRow.progress).toBe(0);
    expect(dbRow.key_points).toBeNull();
    expect(dbRow.tags).toContain('test');

    // roundtrip back
    const restored = fromDBVideo(dbRow);
    expect(restored.url).toBe(realYtUrl);
    expect(restored.platform).toBe('youtube');
    expect(restored.title).toBe(parsed.title);
    expect(restored.progress).toBe(0);
    expect(restored.tags).toEqual(['test', 'persist']);
  });

  it('parses real Bilibili URL then roundtrips through DB mappers for persistence (real cover via mock)', async () => {
    const realBiliUrl = 'https://www.bilibili.com/video/BV1xx411c7mu';
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: 0, data: { pic: 'https://i1.hdslb.com/bfs/archive/db-bili-cover.jpg' } })
    });
    vi.stubGlobal('fetch', mockFetch);

    const parsed = await parseVideoLink(realBiliUrl);  // drives real shipped async parseVideoLink
    expect(parsed.platform).toBe('bilibili');
    expect(parsed.title.length).toBeGreaterThan(0);
    expect(typeof parsed.cover).toBe('string');
    expect(parsed.cover).toContain('hdslb.com');

    const videoForPersist = {
      ...parsed,
      id: 'persist-test-bili-002',
      savedAt: '2026-07-03T12:00:00.000Z',
      progress: 42,
      tags: ['bili', 'parse'],
      notes: '',
    };

    const dbRow = toDBVideo(videoForPersist);
    expect(dbRow.url).toBe(realBiliUrl);
    expect(dbRow.platform).toBe('bilibili');
    expect(dbRow.progress).toBe(42);
    expect(typeof dbRow.cover).toBe('string');

    const restored = fromDBVideo(dbRow);
    expect(restored.platform).toBe('bilibili');
    expect(restored.progress).toBe(42);
    expect(restored.tags).toContain('parse');

    vi.unstubAllGlobals();
  });

  it('handles AI fields (summary, keyPoints, tags) in full parse-persist roundtrip', async () => {
    const parsed = await parseVideoLink('https://youtu.be/abc123xyz');
    const withAI = {
      ...parsed,
      id: 'ai-persist-003',
      savedAt: new Date().toISOString(),
      progress: 15,
      tags: [],
      notes: '',
      summary: 'This is a test summary from parse flow.',
      keyPoints: ['point one', 'point two'],
    };

    const dbv = toDBVideo(withAI);
    expect(dbv.summary).toContain('test summary');
    expect(dbv.key_points).toContain('point one');
    // tags: [] is truthy so becomes '[]'
    expect(dbv.tags).toBe('[]');

    const back = fromDBVideo(dbv);
    expect(back.summary).toBe('This is a test summary from parse flow.');
    expect(back.keyPoints).toEqual(['point one', 'point two']);
  });
});

// The one-click flow: parseVideoLink result is immediately turned into DBVideo and saved via saveVideo in App.tsx
// Schema + mapper correctness guarantees that pasted real YT/Bili links are persisted correctly.
