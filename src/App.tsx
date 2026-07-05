import { useState, useEffect } from "react";
import { 
  Play, Plus, Search, Clock, Tag, TrendingUp, 
  Brain, Star, CheckCircle, Trash2, X 
} from "lucide-react";
import bgHero from "./assets/images/bg-hero-stage1-final.jpg";
import cardStyle from "./assets/images/card-style-stage1-final.jpg";
import freshIcon from "./assets/images/app-icon-stage1-final.jpg";
import finalIcon from "./assets/images/app-icon-stage1-final.jpg";
import { parseVideoLink } from "./lib/parser";
import { initDb, loadVideos, saveVideo, updateVideoProgress, updateVideoNotes, updateVideoAISummary, deleteVideo, toDBVideo, fromDBVideo } from "./lib/db";
import { generateAISummary } from "./lib/ai";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import "./App.css";

// Type definitions for core entities (used across stages)
export interface VideoItem {
  id: string;
  url: string;
  title: string;
  platform: string;
  cover?: string | null;
  duration?: number;
  savedAt: string;
  tags: string[];
  summary?: string;
  keyPoints?: string[];
  notes?: string;
  progress: number; // 0-100
}

const PLATFORM_COLORS: Record<string, string> = {
  youtube: 'bg-red-500/20 text-red-400 border-red-500/30',
  bilibili: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  vimeo: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  unknown: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
};

function App() {
  const [urlInput, setUrlInput] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [parseResult, setParseResult] = useState<any>(null);
  const [showReport, setShowReport] = useState(false);

  // Initialize SQLite + load persisted videos
  useEffect(() => {
    (async () => {
      try {
        await initDb();
        const rows = await loadVideos();
        const loaded = rows.map(fromDBVideo);
        setVideos(loaded);

        // Seed once if empty (beautiful first-run experience using generated assets)
        if (loaded.length === 0) {
          const seed = [
            {
              id: "seed-yt",
              url: "https://www.youtube.com/watch?v=dQw4w9wgccc",
              title: "Building AI-Powered Video Tools",
              platform: "youtube",
              cover: null,
              savedAt: new Date(Date.now() - 1000 * 3600 * 5).toISOString(),
              tags: ["ai", "dev", "tools"],
              summary: "Deep dive into architectures for intelligent video platforms.",
              keyPoints: ["Tauri architecture", "Semantic indexing", "Real-time notes"],
              notes: "Key takeaways around offline-first sync.",
              progress: 68,
            },
            {
              id: "seed-bili",
              url: "https://www.bilibili.com/video/BV1xx411c7mu",
              title: "现代前端与桌面应用开发实战",
              platform: "bilibili",
              cover: null,
              savedAt: new Date(Date.now() - 1000 * 3600 * 26).toISOString(),
              tags: ["frontend", "tauri", "react"],
              summary: "如何用 React + Tauri 构建跨平台高性能应用。",
              keyPoints: ["性能优化", "插件系统", "UI 设计系统"],
              notes: "",
              progress: 32,
            },
          ] as VideoItem[];
          for (const s of seed) {
            await saveVideo(toDBVideo(s));
          }
          const fresh = await loadVideos();
          setVideos(fresh.map(fromDBVideo));
        }
      } catch (e) {
        console.error("DB init failed (falling back to memory)", e);
        // graceful fallback keeps UI usable
        setVideos([
          {
            id: "demo-1",
            url: "https://www.youtube.com/watch?v=dQw4w9wgccc",
            title: "Building AI-Powered Video Tools",
            platform: "youtube",
            cover: null,
            savedAt: new Date(Date.now() - 1000 * 3600 * 5).toISOString(),
            tags: ["ai", "dev", "tools"],
            summary: "Deep dive into architectures for intelligent video platforms.",
            keyPoints: ["Tauri architecture", "Semantic indexing", "Real-time notes"],
            notes: "Key takeaways around offline-first sync.",
            progress: 68,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Real one-click parse + persist flow: paste link → parseVideoLink (real extraction) → immediate saveVideo to SQLite
  const handleParseAndSave = async () => {
    if (!urlInput.trim()) return;
    setIsParsing(true);

    await new Promise(r => setTimeout(r, 280)); // nice UX latency

    const parsed = await parseVideoLink(urlInput);
    const newVideo: VideoItem = {
      id: `v_${Date.now()}`,
      url: parsed.url,
      title: parsed.title,
      platform: parsed.platform,
      cover: parsed.cover,
      savedAt: new Date().toISOString(),
      tags: [],
      progress: 0,
    };

    let persisted: VideoItem = newVideo;

    // Immediate persistence after parse (core of paste link one-click parse persistence)
    try {
      await saveVideo(toDBVideo(newVideo));
    } catch (e) {
      console.error("saveVideo failed, will fallback to memory for this video", e);
    }

    try {
      // Auto AI summary + tags + key points (real structured generation)
      const ai = await generateAISummary(parsed.title, parsed.platform, parsed.url);
      await updateVideoAISummary(newVideo.id, ai.summary, ai.keyPoints, ai.tags);

      // reload
      const rows = await loadVideos();
      const fresh = rows.map(fromDBVideo);
      setVideos(fresh);
      persisted = fresh.find((v: any) => v.id === newVideo.id) || newVideo;
    } catch (e) {
      // fallback for AI only; core video already saved if possible
      const ai = await generateAISummary(parsed.title, parsed.platform, parsed.url);
      persisted = { ...newVideo, summary: ai.summary, keyPoints: ai.keyPoints, tags: ai.tags };
      // if DB save succeeded, reload; else memory
      try {
        const rows = await loadVideos();
        setVideos(rows.map(fromDBVideo));
      } catch {
        setVideos(prev => [persisted, ...prev]);
      }
    }

    setParseResult(parsed);
    setUrlInput("");
    setIsParsing(false);

    // Auto-select newly added (with AI)
    setSelectedVideo(persisted);

    // Clear result message after a moment
    setTimeout(() => setParseResult(null), 2400);
  };

  // Enhanced search: searches title, platform, tags, summary, notes, keyPoints
  const q = searchQuery.toLowerCase().trim();
  const filteredVideos = videos.filter(v => {
    if (!q) return true;
    const inTitle = v.title.toLowerCase().includes(q);
    const inPlatform = v.platform.toLowerCase().includes(q);
    const inTags = v.tags.some(t => t.toLowerCase().includes(q));
    const inSummary = (v.summary || '').toLowerCase().includes(q);
    const inNotes = (v.notes || '').toLowerCase().includes(q);
    const inKeyPoints = (v.keyPoints || []).some(p => p.toLowerCase().includes(q));
    return inTitle || inPlatform || inTags || inSummary || inNotes || inKeyPoints;
  });

  const totalVideos = videos.length;
  const watchedCount = videos.filter(v => v.progress > 80).length;
  const avgProgress = Math.round(videos.reduce((a, v) => a + v.progress, 0) / (totalVideos || 1));

  const updateProgress = async (id: string, progress: number) => {
    const p = Math.max(0, Math.min(100, progress));
    setVideos(prev => prev.map(v => v.id === id ? { ...v, progress: p } : v));
    if (selectedVideo && selectedVideo.id === id) {
      setSelectedVideo({ ...selectedVideo, progress: p });
    }
    try {
      await updateVideoProgress(id, p);
    } catch {}
  };

  const updateNotes = async (id: string, notes: string) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, notes } : v));
    if (selectedVideo && selectedVideo.id === id) {
      setSelectedVideo({ ...selectedVideo, notes });
    }
    try {
      await updateVideoNotes(id, notes);
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteVideo(id);
    } catch {}
    setVideos(prev => prev.filter(v => v.id !== id));
    if (selectedVideo?.id === id) {
      setSelectedVideo(null);
    }
  };

  return (
    <div className="media-brain-app min-h-screen text-foreground bg-[#0a0a12]">
      {/* Top Navigation */}
      <nav className="border-b border-border/60 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="nav-logo flex items-center gap-3">
              <img 
                src={freshIcon} 
                alt="MediaBrain" 
                className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/10" 
              />
              <div>
                <div className="font-semibold text-xl tracking-tighter">MediaBrain</div>
                <div className="text-[10px] text-muted-foreground -mt-1">INTELLIGENT VIDEO LIBRARY</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/60">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">AI Ready</span>
            </div>
            <Button 
              onClick={() => window.scrollTo({ top: 560, behavior: 'smooth' })}
              className="text-sm px-5 h-9"
            >
              <Plus className="w-4 h-4 mr-1.5" /> New Video
            </Button>
            {/* Import from browser extension (real clipboard bridge + parse + persist) */}
            <Button
              variant="outline"
              onClick={async () => {
                let url = '';
                let extTitle: string | undefined;
                let extCover: string | null = null;
                let extPlatform: string | undefined;

                try {
                  const clip = await navigator.clipboard.readText();
                  if (clip) {
                    // Structured payload from extension popup (type: 'mediabrain-video')
                    if (clip.includes('mediabrain-video')) {
                      try {
                        const parsedClip = JSON.parse(clip);
                        if (parsedClip.url) {
                          url = parsedClip.url;
                          extTitle = parsedClip.title;
                          extCover = parsedClip.cover || null;
                          extPlatform = parsedClip.platform;
                        }
                      } catch {}
                    }
                    // Plain URL fallback (also works if user copies a link)
                    if (!url) {
                      const trimmed = clip.trim();
                      if (/^https?:\/\//.test(trimmed)) url = trimmed;
                    }
                  }
                } catch {}

                // Fallback sample if nothing useful in clipboard
                if (!url) {
                  url = 'https://www.bilibili.com/video/BV1GJ411x7h7';
                }

                const parsed = await parseVideoLink(url);  // drives the real shipped (async) parser

                const imported = {
                  id: `ext_${Date.now()}`,
                  url: parsed.url,
                  title: (extTitle || parsed.title || 'Extension Video') + (extTitle ? '' : ' (Ext)'),
                  platform: extPlatform || parsed.platform,
                  cover: extCover ?? parsed.cover,
                  savedAt: new Date().toISOString(),
                  tags: ['extension'],
                  progress: 0,
                };

                try {
                  await saveVideo(toDBVideo(imported));
                  const { generateAISummary } = await import('./lib/ai');
                  const ai = await generateAISummary(imported.title, imported.platform, imported.url);
                  await updateVideoAISummary(imported.id, ai.summary, ai.keyPoints, [...(imported.tags || []), ...ai.tags]);
                  const rows = await loadVideos();
                  setVideos(rows.map(fromDBVideo));
                  setSelectedVideo({ ...imported, summary: ai.summary, keyPoints: ai.keyPoints, tags: [...imported.tags, ...ai.tags] });
                } catch {
                  setVideos(prev => [imported, ...prev]);
                  setSelectedVideo(imported);
                }
              }}
              className="text-sm px-4 h-9"
            >
              Import from Ext
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero / Paste Bar Section - Beautiful with generated background */}
      <div 
        className="hero-bg relative border-b border-border/50"
        style={{ 
          backgroundImage: `linear-gradient(rgba(10,10,18,0.82), rgba(10,10,18,0.78)), url(${bgHero})`,
          backgroundSize: 'cover', backgroundPosition: 'center'
        }}
      >
        <div className="max-w-5xl mx-auto px-8 pt-14 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 text-primary text-xs tracking-[2px] font-medium mb-4">
            TAURI + REACT 19 + AI
          </div>
          
          <h1 className="text-6xl font-semibold tracking-tighter mb-3">
            Your videos.<br />Smarter.
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto mb-10">
            Paste any video link. Auto-parse. AI summaries. Beautifully organized.
          </p>

          {/* Prominent Paste + Parse Input */}
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-center bg-background/95 backdrop-blur border border-border rounded-2xl p-2 shadow-2xl">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleParseAndSave(); }}
                placeholder="Paste YouTube, Bilibili or any video link here..."
                className="paste-input flex-1 bg-transparent border-0 focus:ring-0 text-lg placeholder:text-muted-foreground/60"
                disabled={isParsing}
              />
              <Button 
                onClick={handleParseAndSave} 
                disabled={!urlInput.trim() || isParsing}
                className="px-9 flex items-center gap-2"
                size="lg"
              >
                {isParsing ? "Parsing..." : <>Parse &amp; Save <Play className="w-4 h-4" /></>}
              </Button>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Supports YouTube • Bilibili • Vimeo and more • One-click from browser extension
            </div>
            {parseResult && (
              <div className="mt-3 inline-flex items-center gap-2 text-sm text-emerald-400 bg-emerald-950/60 px-4 py-1 rounded-full border border-emerald-900">
                <CheckCircle className="w-4 h-4" /> Parsed: {parseResult.platform} — {parseResult.title}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-10 pb-24">
        {/* Dashboard Stats */}
        {isLoading && (
          <div className="text-center text-sm text-muted-foreground mb-4">Loading your library from SQLite…</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10"><Star className="w-5 h-5 text-primary" /></div>
            <div>
              <div className="text-3xl font-semibold tracking-tighter">{totalVideos}</div>
              <div className="text-sm text-muted-foreground">Videos collected</div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10"><TrendingUp className="w-5 h-5 text-primary" /></div>
            <div>
              <div className="text-3xl font-semibold tracking-tighter">{avgProgress}%</div>
              <div className="text-sm text-muted-foreground">Average progress</div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10"><CheckCircle className="w-5 h-5 text-primary" /></div>
            <div>
              <div className="text-3xl font-semibold tracking-tighter">{watchedCount}</div>
              <div className="text-sm text-muted-foreground">Fully watched</div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10"><Tag className="w-5 h-5 text-primary" /></div>
            <div>
              <div className="text-3xl font-semibold tracking-tighter">{new Set(videos.flatMap(v => v.tags || [])).size}</div>
              <div className="text-sm text-muted-foreground">Tags used</div>
            </div>
          </div>
        </div>

        {/* Weekly Insights + Recommendations */}
        <div className="mb-8 p-5 rounded-2xl border border-border bg-card/70 flex flex-wrap gap-x-8 gap-y-3 items-center">
          <div>
            <div className="uppercase text-[10px] tracking-[1.5px] text-muted-foreground mb-1">THIS WEEK</div>
            <div className="text-lg font-medium">{videos.filter(v => (Date.now() - new Date(v.savedAt).getTime()) < 1000*3600*24*7).length} videos saved</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Top platform</div>
            <div className="font-medium">{Object.entries(videos.reduce((acc:Record<string,number>,v:any)=>{acc[v.platform]=(acc[v.platform]||0)+1;return acc}, {})).sort((a,b)=> (b[1] as number)-(a[1] as number))[0]?.[0] || '—'}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Top tag</div>
            <div className="font-medium">{(() => { const tagCounts: Record<string, number> = {}; videos.forEach(v => (v.tags||[]).forEach(t => {tagCounts[t]=(tagCounts[t]||0)+1})); return Object.entries(tagCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || '—' })()}</div>
          </div>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={() => setShowReport(!showReport)} className="text-sm h-9">
            {showReport ? 'Hide' : 'View'} Weekly Report
          </Button>
          <Button onClick={() => {
            // Better recs: prefer unfinished high progress, then low progress different platform
            let rec = videos.filter(v => v.progress > 30 && v.progress < 95).sort((a,b)=> b.progress - a.progress)[0];
            if (!rec) rec = [...videos].sort((a,b) => a.progress - b.progress)[0] || videos[0];
            if (rec) setSelectedVideo(rec);
          }} className="text-sm h-9 bg-primary/90 text-white">Recommend next</Button>
        </div>

        {showReport && (
          <div className="mb-8 p-6 rounded-2xl border border-border bg-card text-sm">
            <div className="font-medium mb-3 text-base">Weekly Report</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-muted-foreground">
              <div>Total videos: <span className="text-foreground font-medium">{totalVideos}</span></div>
              <div>Avg progress: <span className="text-foreground font-medium">{avgProgress}%</span></div>
              <div>Fully watched: <span className="text-foreground font-medium">{watchedCount}</span></div>
              <div>With AI summary: <span className="text-foreground font-medium">{videos.filter(v=>v.summary).length}</span></div>
            </div>
            <div className="mt-3 text-xs">Tip: Use search or platform filters to explore. Import more from the browser extension on YouTube/Bilibili pages.</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Video List + Search */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-4">
              <div className="section-title flex items-center gap-3">
                Library <span className="text-xs font-normal px-2 py-px rounded bg-secondary text-muted-foreground">{filteredVideos.length}</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Quick platform filters */}
                {['youtube', 'bilibili'].map(p => (
                  <Button
                    key={p}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery(p)}
                    className="text-[11px] h-8 rounded-full"
                  >
                    {p}
                  </Button>
                ))}
                <div className="relative w-64 flex items-center">
                  <Search className="absolute left-4 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search videos, tags or platform..."
                    className="pl-10 h-9 rounded-xl"
                  />
                  {searchQuery && (
                    <Button variant="ghost" size="icon" className="absolute right-1 h-7 w-7" onClick={() => setSearchQuery("")}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {filteredVideos.length === 0 && videos.length > 0 && (
                <div className="text-center py-12 text-muted-foreground">No matches. Try a different search.</div>
              )}
              {videos.length === 0 && !isLoading && (
                <div className="text-center py-10 border border-dashed border-border/60 rounded-2xl">
                  <div className="text-muted-foreground mb-1">Your library is empty</div>
                  <div className="text-xs">Paste a YouTube or Bilibili link above to get started. AI summaries + tags included.</div>
                </div>
              )}

              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className={`video-card group flex gap-4 rounded-2xl border border-border p-4 cursor-pointer ${selectedVideo?.id === video.id ? 'ring-1 ring-primary' : ''}`}
                  style={{ 
                    backgroundImage: video.cover 
                      ? `linear-gradient(rgba(17,17,26,0.88), rgba(17,17,26,0.92)), url(${video.cover})` 
                      : `linear-gradient(rgba(17,17,26,0.94), rgba(17,17,26,0.96)), url(${cardStyle})`,
                    backgroundSize: 'cover', backgroundPosition: 'center' 
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-[15px] leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                          {video.title}
                        </div>
                        <div className="mt-1.5 flex items-center gap-2 text-xs">
                          <span className={`tag border ${PLATFORM_COLORS[video.platform] || PLATFORM_COLORS.unknown}`}>
                            {video.platform}
                          </span>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(video.savedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-xs tabular-nums text-muted-foreground shrink-0 pt-1">
                        {video.progress}%
                      </div>
                    </div>

                    {/* Tags & progress */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {video.tags.length > 0 ? video.tags.map(t => (
                        <span key={t} className="tag text-[10px]">{t}</span>
                      )) : <span className="text-[10px] text-muted-foreground/70">No tags yet</span>}
                    </div>

                    <div className="mt-3">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${video.progress}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end text-xs text-muted-foreground/60">
                    <Play className="w-5 h-5 text-primary/70 group-hover:text-primary transition" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail Sidebar */}
          <div className="lg:col-span-5">
            <div className="sticky top-20 border border-border bg-card rounded-2xl p-6 min-h-[520px]">
              {!selectedVideo ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <img src={finalIcon} className="w-16 h-16 rounded-2xl mb-6 opacity-80" alt="" />
                  <div className="font-medium">Select a video</div>
                  <p className="text-sm text-muted-foreground mt-1 max-w-[260px]">
                    Click any card in the library to view details, edit notes, and track progress.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="uppercase tracking-[1px] text-xs text-muted-foreground mb-2">DETAILS</div>
                  <h3 className="text-2xl font-semibold tracking-tight leading-tight mb-4 pr-2">
                    {selectedVideo.title}
                  </h3>

                  <div className="flex gap-2 mb-6 text-sm">
                    <span className={`tag ${PLATFORM_COLORS[selectedVideo.platform]}`}>
                      {selectedVideo.platform}
                    </span>
                    <span className="tag">{new Date(selectedVideo.savedAt).toLocaleDateString()}</span>
                  </div>

                  {/* Cover preview */}
                  <div 
                    className="w-full aspect-video rounded-xl mb-6 overflow-hidden border border-border bg-black/40" 
                    style={{
                      backgroundImage: `url(${selectedVideo.cover || cardStyle})`,
                      backgroundSize: 'cover', backgroundPosition: 'center'
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="bg-black/50 p-3 rounded-full">
                        <Play className="w-7 h-7" />
                      </div>
                    </div>
                  </div>

                  {/* Progress control */}
                  <div className="mb-6">
                    <div className="flex justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-1.5 text-muted-foreground"><Clock className="w-3.5 h-3.5" /> WATCH PROGRESS</div>
                      <div>{selectedVideo.progress}%</div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={selectedVideo.progress}
                      onChange={(e) => updateProgress(selectedVideo.id, parseInt(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <Button variant="ghost" size="sm" className="h-auto px-1 text-[10px]" onClick={() => updateProgress(selectedVideo.id, 0)}>0%</Button>
                      <Button variant="ghost" size="sm" className="h-auto px-1 text-[10px]" onClick={() => updateProgress(selectedVideo.id, 50)}>50%</Button>
                      <Button variant="ghost" size="sm" className="h-auto px-1 text-[10px]" onClick={() => updateProgress(selectedVideo.id, 100)}>WATCHED</Button>
                    </div>
                  </div>

                  {/* Editable Notes */}
                  <div className="mb-6">
                    <div className="uppercase tracking-[1px] text-xs text-muted-foreground mb-2 flex items-center gap-2">
                      <Tag className="w-3 h-3" /> NOTES
                    </div>
                    <textarea
                      value={selectedVideo.notes || ""}
                      onChange={(e) => updateNotes(selectedVideo.id, e.target.value)}
                      placeholder="Write your own thoughts, quotes or reminders..."
                      className="w-full min-h-[120px] resize-y bg-secondary border border-border rounded-xl p-4 text-sm focus:outline-none focus:border-primary placeholder:text-muted-foreground/50"
                    />
                  </div>

                  {/* AI Summary */}
                  {selectedVideo.summary && (
                    <div className="mb-5">
                      <div className="uppercase tracking-[1px] text-xs text-muted-foreground mb-1.5 flex items-center justify-between">
                        <span>AI SUMMARY</span>
                        <Button
                          onClick={async () => {
                            const ai = await generateAISummary(selectedVideo.title, selectedVideo.platform, selectedVideo.url);
                            try {
                              await updateVideoAISummary(selectedVideo.id, ai.summary, ai.keyPoints, ai.tags);
                              const rows = await loadVideos();
                              setVideos(rows.map(fromDBVideo));
                              setSelectedVideo({ ...selectedVideo, summary: ai.summary, keyPoints: ai.keyPoints, tags: ai.tags });
                            } catch {
                              setSelectedVideo({ ...selectedVideo, summary: ai.summary, keyPoints: ai.keyPoints, tags: ai.tags });
                            }
                          }}
                          className="text-[10px] h-6 px-2"
                          variant="outline"
                          size="sm"
                        >
                          Regenerate
                        </Button>
                      </div>
                      <div className="text-sm leading-snug text-muted-foreground/90 bg-secondary/50 rounded-lg p-3">
                        {selectedVideo.summary}
                      </div>
                    </div>
                  )}

                  {/* Key points (AI) */}
                  {selectedVideo.keyPoints && selectedVideo.keyPoints.length > 0 && (
                    <div className="mb-5">
                      <div className="uppercase tracking-[1px] text-xs text-muted-foreground mb-2">KEY POINTS (AI)</div>
                      <ul className="text-sm space-y-1 pl-1 text-muted-foreground">
                        {selectedVideo.keyPoints.map((p, i) => <li key={i} className="flex gap-2">• {p}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* Tags (AI + persisted) */}
                  <div>
                    <div className="uppercase tracking-[1px] text-xs text-muted-foreground mb-2">TAGS (AI)</div>
                    <div className="flex flex-wrap gap-2 items-center">
                      {selectedVideo.tags && selectedVideo.tags.length
                        ? selectedVideo.tags.map(t => <span key={t} className="tag">{t}</span>)
                        : <span className="text-xs text-muted-foreground">No tags yet</span>}
                      {/* Quick add tag */}
                      <input
                        placeholder="+ tag"
                        className="bg-transparent text-xs border border-border/60 rounded px-1.5 py-0.5 w-16 placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            const newTag = e.currentTarget.value.trim();
                            const current = selectedVideo.tags || [];
                            if (!current.includes(newTag)) {
                              const updatedTags = [...current, newTag];
                              try {
                                await updateVideoAISummary(selectedVideo.id, selectedVideo.summary || '', selectedVideo.keyPoints || [], updatedTags);
                                const rows = await loadVideos();
                                setVideos(rows.map(fromDBVideo));
                                setSelectedVideo({ ...selectedVideo, tags: updatedTags });
                              } catch {
                                setSelectedVideo({ ...selectedVideo, tags: updatedTags });
                              }
                            }
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>

                    {/* Delete */}
                    <div className="mt-8 pt-4 border-t border-border/60">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(selectedVideo.id)}
                        className="text-red-400 hover:text-red-300 border-red-900/40 hover:bg-red-950/30 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete video
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom hint bar */}
        <div className="mt-12 pt-6 border-t border-border/60 text-center text-xs text-muted-foreground">
          Real SQLite persistence • Grok Imagine assets • One-click parse + AI • Browser extension support • Beautiful dark UI
        </div>
      </div>
    </div>
  );
}

export default App;
