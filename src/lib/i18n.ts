// Bilingual i18n support (zh / en)
// Default to zh for Chinese version, with auto-detect and toggle.

export type Lang = 'zh' | 'en';

export const translations: Record<Lang, Record<string, string>> = {
  zh: {
    // Nav
    'nav.subtitle': '智能视频库',
    'nav.aiReady': 'AI 已就绪',
    'nav.newVideo': '新建视频',
    'nav.importFromExt': '从扩展导入',
    'nav.langToggle': '中 / EN',

    // Hero
    'hero.badge': 'TAURI + REACT 19 + AI',
    'hero.title': '您的视频。<br />更聪明。',
    'hero.subtitle': '粘贴任意视频链接。自动解析。AI 总结。精美整理。',
    'hero.placeholder': '在此粘贴 YouTube、Bilibili 或任意视频链接...',
    'hero.parsing': '解析中...',
    'hero.parseSave': '解析并保存',
    'hero.supports': '支持 YouTube • Bilibili • Vimeo 等 • 浏览器扩展一键保存',

    // Stats
    'stats.videosCollected': '已收藏视频',
    'stats.avgProgress': '平均进度',
    'stats.fullyWatched': '已看完',
    'stats.tagsUsed': '使用标签',

    // Insights
    'insights.thisWeek': '本周',
    'insights.videosSaved': '个视频已保存',
    'insights.topPlatform': '热门平台',
    'insights.topTag': '热门标签',
    'insights.viewReport': '查看周报',
    'insights.hideReport': '隐藏周报',
    'insights.recommendNext': '推荐下一个',

    // Weekly Report
    'report.title': '周报',
    'report.totalVideos': '总视频数',
    'report.avgProgress': '平均进度',
    'report.fullyWatched': '已看完',
    'report.withAISummary': '有 AI 总结',
    'report.tip': '提示：使用搜索或平台筛选探索。可以在 YouTube/Bilibili 页面使用浏览器扩展导入更多视频。',

    // Library
    'library.title': '库',
    'library.noMatches': '无匹配项。请尝试其他搜索。',
    'library.empty': '您的库是空的',
    'library.emptyHint': '在上方粘贴 YouTube 或 Bilibili 链接开始。包含 AI 总结 + 标签。',

    // Sidebar
    'sidebar.details': '详情',
    'sidebar.selectVideo': '选择一个视频',
    'sidebar.selectHint': '点击库中的任意卡片查看详情、编辑笔记并跟踪进度。',
    'sidebar.watchProgress': '观看进度',
    'sidebar.zero': '0%',
    'sidebar.fifty': '50%',
    'sidebar.watched': '已看完',
    'sidebar.notes': '笔记',
    'sidebar.notesPlaceholder': '写下您的想法、引用或提醒...',
    'sidebar.aiSummary': 'AI 总结',
    'sidebar.regenerate': '重新生成',
    'sidebar.keyPoints': '关键点 (AI)',
    'sidebar.tags': '标签 (AI)',
    'sidebar.noTags': '暂无标签',
    'sidebar.addTag': '+ 标签',
    'sidebar.deleteVideo': '删除视频',

    // Misc
    'misc.parsed': '已解析',
    'misc.loading': '正在从 SQLite 加载您的库…',
    'misc.bottomHint': '真实 SQLite 持久化 • Grok Imagine 资源 • 一键解析 + AI • 浏览器扩展支持 • 精美暗色 UI',
  },
  en: {
    // Nav
    'nav.subtitle': 'INTELLIGENT VIDEO LIBRARY',
    'nav.aiReady': 'AI Ready',
    'nav.newVideo': 'New Video',
    'nav.importFromExt': 'Import from Ext',
    'nav.langToggle': 'EN / 中',

    // Hero
    'hero.badge': 'TAURI + REACT 19 + AI',
    'hero.title': 'Your videos.<br />Smarter.',
    'hero.subtitle': 'Paste any video link. Auto-parse. AI summaries. Beautifully organized.',
    'hero.placeholder': 'Paste YouTube, Bilibili or any video link here...',
    'hero.parsing': 'Parsing...',
    'hero.parseSave': 'Parse & Save',
    'hero.supports': 'Supports YouTube • Bilibili • Vimeo and more • One-click from browser extension',

    // Stats
    'stats.videosCollected': 'Videos collected',
    'stats.avgProgress': 'Average progress',
    'stats.fullyWatched': 'Fully watched',
    'stats.tagsUsed': 'Tags used',

    // Insights
    'insights.thisWeek': 'THIS WEEK',
    'insights.videosSaved': 'videos saved',
    'insights.topPlatform': 'Top platform',
    'insights.topTag': 'Top tag',
    'insights.viewReport': 'View Weekly Report',
    'insights.hideReport': 'Hide',
    'insights.recommendNext': 'Recommend next',

    // Weekly Report
    'report.title': 'Weekly Report',
    'report.totalVideos': 'Total videos',
    'report.avgProgress': 'Avg progress',
    'report.fullyWatched': 'Fully watched',
    'report.withAISummary': 'With AI summary',
    'report.tip': 'Tip: Use search or platform filters to explore. Import more from the browser extension on YouTube/Bilibili pages.',

    // Library
    'library.title': 'Library',
    'library.noMatches': 'No matches. Try a different search.',
    'library.empty': 'Your library is empty',
    'library.emptyHint': 'Paste a YouTube or Bilibili link above to get started. AI summaries + tags included.',

    // Sidebar
    'sidebar.details': 'DETAILS',
    'sidebar.selectVideo': 'Select a video',
    'sidebar.selectHint': 'Click any card in the library to view details, edit notes, and track progress.',
    'sidebar.watchProgress': 'WATCH PROGRESS',
    'sidebar.zero': '0%',
    'sidebar.fifty': '50%',
    'sidebar.watched': 'WATCHED',
    'sidebar.notes': 'NOTES',
    'sidebar.notesPlaceholder': 'Write your own thoughts, quotes or reminders...',
    'sidebar.aiSummary': 'AI SUMMARY',
    'sidebar.regenerate': 'Regenerate',
    'sidebar.keyPoints': 'KEY POINTS (AI)',
    'sidebar.tags': 'TAGS (AI)',
    'sidebar.noTags': 'No tags yet',
    'sidebar.addTag': '+ tag',
    'sidebar.deleteVideo': 'Delete video',

    // Misc
    'misc.parsed': 'Parsed',
    'misc.loading': 'Loading your library from SQLite…',
    'misc.bottomHint': 'Real SQLite persistence • Grok Imagine assets • One-click parse + AI • Browser extension support • Beautiful dark UI',
  },
};

export type TranslationKey = keyof typeof translations.zh;

let currentLang: Lang = 'zh';

export function getLang(): Lang {
  return currentLang;
}

export function setLang(lang: Lang) {
  currentLang = lang;
  if (typeof window !== 'undefined') {
    localStorage.setItem('mb-lang', lang);
  }
}

export function t(key: TranslationKey): string {
  const lang = currentLang;
  return (translations[lang] as any)[key] || key;
}

// Initialize from localStorage (call early)
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('mb-lang') as Lang | null;
  if (saved === 'zh' || saved === 'en') {
    currentLang = saved;
  }
}
