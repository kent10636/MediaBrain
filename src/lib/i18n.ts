// Bilingual i18n support (zh / en)
// Default to zh for Chinese version, with auto-detect and toggle.

export type Lang = 'zh' | 'en';

export const translations: Record<Lang, Record<string, string>> = {
  zh: {
    // Nav
    'nav.subtitle': '智能视频库',
    'nav.aiReady': 'AI 已就绪',
    'nav.newVideo': '添加视频',
    'nav.importFromExt': '从浏览器导入',
    'nav.langToggle': '中 / EN',

    // Hero
    'hero.badge': 'TAURI + REACT 19 + AI',
    'hero.title': '让视频更聪明',
    'hero.subtitle': '粘贴链接，一键解析 + AI 总结。轻松管理你的视频库。',
    'hero.placeholder': '粘贴 YouTube、Bilibili 或其他视频链接...',
    'hero.parsing': '正在解析...',
    'hero.parseSave': '解析并保存',
    'hero.supports': '支持 YouTube、Bilibili、Vimeo 等平台 • 浏览器扩展一键保存',

    // Stats
    'stats.videosCollected': '已保存视频',
    'stats.avgProgress': '平均观看进度',
    'stats.fullyWatched': '已完整观看',
    'stats.tagsUsed': '使用过的标签',

    // Insights
    'insights.thisWeek': '本周',
    'insights.videosSaved': '个视频已保存',
    'insights.topPlatform': '热门平台',
    'insights.topTag': '热门标签',
    'insights.viewReport': '查看周报',
    'insights.hideReport': '隐藏周报',
    'insights.recommendNext': '推荐下一个',

    // Weekly Report
    'report.title': '本周报告',
    'report.totalVideos': '总视频数',
    'report.avgProgress': '平均进度',
    'report.fullyWatched': '已看完',
    'report.withAISummary': '已生成 AI 总结',
    'report.tip': '提示：使用搜索或平台筛选来浏览内容。你可以在 YouTube/Bilibili 页面使用浏览器扩展一键导入。',

    // Library
    'library.title': '视频库',
    'library.noMatches': '没有找到匹配的视频，换个关键词试试。',
    'library.empty': '视频库还是空的',
    'library.emptyHint': '在上方粘贴 YouTube 或 Bilibili 链接开始吧，系统会自动提取信息并生成 AI 总结和标签。',

    // Sidebar
    'sidebar.details': '详情',
    'sidebar.selectVideo': '请选择一个视频',
    'sidebar.selectHint': '在左侧视频库中点击任意卡片，即可查看详情、编辑笔记并更新观看进度。',
    'sidebar.watchProgress': '观看进度',
    'sidebar.zero': '0%',
    'sidebar.fifty': '50%',
    'sidebar.watched': '已看完',
    'sidebar.notes': '我的笔记',
    'sidebar.notesPlaceholder': '记录你的想法、精彩片段或后续计划...',
    'sidebar.aiSummary': 'AI 总结',
    'sidebar.regenerate': '重新生成',
    'sidebar.keyPoints': 'AI 关键点',
    'sidebar.tags': 'AI 标签',
    'sidebar.noTags': '暂无标签',
    'sidebar.addTag': '+ 添加标签',
    'sidebar.deleteVideo': '删除视频',
    'sidebar.playVideo': '打开视频播放',

    // Misc
    'misc.parsed': '解析成功',
    'misc.loading': '正在从本地数据库加载视频库…',
    'misc.bottomHint': '本地 SQLite 存储 • AI 智能总结 • 浏览器扩展支持 • 精美暗黑界面',
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
    'sidebar.playVideo': 'Open / Play Video',

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
