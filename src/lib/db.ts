// SQLite persistence layer for MediaBrain (Tauri plugin-sql)
// All operations strictly local. Schema designed for videos + future AI notes/tags.
// Stage 2: explicit schema definition + one-click parse + persist.

import Database from '@tauri-apps/plugin-sql';

export interface DBVideo {
  id: string;
  url: string;
  title: string;
  platform: string;
  cover: string | null;
  saved_at: string;
  progress: number;
  notes: string;
  summary?: string | null;
  key_points?: string | null; // JSON string
  tags?: string | null;       // JSON string
  description?: string | null;
}

// Explicit schema definition for videos table (used in init + tests)
export const VIDEOS_TABLE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    platform TEXT NOT NULL,
    cover TEXT,
    saved_at TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    notes TEXT DEFAULT '',
    summary TEXT,
    key_points TEXT,
    tags TEXT,
    description TEXT
  )
`;

export const VIDEOS_INDEX_SCHEMA = `CREATE INDEX IF NOT EXISTS idx_videos_saved_at ON videos(saved_at DESC)`;


let db: Awaited<ReturnType<typeof Database.load>> | null = null;

export async function initDb(): Promise<void> {
  if (db) return;
  db = await Database.load('sqlite:mediabrain.db');

  // Core schema - videos table (explicit definition from Stage 2)
  await db.execute(VIDEOS_TABLE_SCHEMA);

  // Helpful index
  await db.execute(VIDEOS_INDEX_SCHEMA);

  // Add description column for real video content (for relevant AI summaries)
  // Safe to run even if column exists (will error but we ignore)
  try {
    await db.execute(`ALTER TABLE videos ADD COLUMN description TEXT`);
  } catch (e) {
    // column already exists or other harmless error
  }
}

export async function getDb() {
  if (!db) await initDb();
  return db!;
}

export async function loadVideos(): Promise<DBVideo[]> {
  const database = await getDb();
  const rows = await database.select<DBVideo[]>(
    `SELECT * FROM videos ORDER BY saved_at DESC`
  );
  return rows || [];
}

export async function saveVideo(video: Omit<DBVideo, 'saved_at'> & { saved_at?: string }): Promise<void> {
  const database = await getDb();
  const savedAt = video.saved_at || new Date().toISOString();

  await database.execute(
    `INSERT OR REPLACE INTO videos 
     (id, url, title, platform, cover, saved_at, progress, notes, summary, key_points, tags, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      video.id,
      video.url,
      video.title,
      video.platform,
      video.cover ?? null,
      savedAt,
      Math.max(0, Math.min(100, video.progress ?? 0)),
      video.notes ?? '',
      video.summary ?? null,
      video.key_points ?? null,
      video.tags ?? null,
      video.description ?? null,
    ]
  );
}

export async function updateVideoProgress(id: string, progress: number): Promise<void> {
  const database = await getDb();
  await database.execute(
    `UPDATE videos SET progress = ? WHERE id = ?`,
    [Math.max(0, Math.min(100, progress)), id]
  );
}

export async function updateVideoNotes(id: string, notes: string): Promise<void> {
  const database = await getDb();
  await database.execute(
    `UPDATE videos SET notes = ? WHERE id = ?`,
    [notes, id]
  );
}

export async function updateVideoAISummary(id: string, summary: string, keyPoints: string[], tags: string[]): Promise<void> {
  const database = await getDb();
  await database.execute(
    `UPDATE videos SET summary = ?, key_points = ?, tags = ? WHERE id = ?`,
    [summary, JSON.stringify(keyPoints), JSON.stringify(tags), id]
  );
}

export async function deleteVideo(id: string): Promise<void> {
  const database = await getDb();
  await database.execute(`DELETE FROM videos WHERE id = ?`, [id]);
}

// Helper to convert UI VideoItem <-> DB shape (used in App)
export function toDBVideo(v: any): DBVideo {
  return {
    id: v.id,
    url: v.url,
    title: v.title,
    platform: v.platform,
    cover: v.cover ?? null,
    saved_at: v.savedAt || new Date().toISOString(),
    progress: v.progress ?? 0,
    notes: v.notes ?? '',
    summary: v.summary ?? null,
    key_points: v.keyPoints ? JSON.stringify(v.keyPoints) : null,
    tags: v.tags ? JSON.stringify(v.tags) : null,
    description: v.description ?? null,
  };
}

export function fromDBVideo(row: DBVideo): any {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    platform: row.platform,
    cover: row.cover,
    savedAt: row.saved_at,
    progress: row.progress,
    notes: row.notes || '',
    summary: row.summary || undefined,
    keyPoints: row.key_points ? JSON.parse(row.key_points) : undefined,
    tags: row.tags ? JSON.parse(row.tags) : [],
    description: row.description || undefined,
  };
}
