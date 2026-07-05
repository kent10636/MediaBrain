// AI summary + key points + tags generator (Stage 3)
// High-fidelity local stub (deterministic + rich) for zero-config MVP.
// Ready to swap for real API (OpenAI/Groq/etc.) later without UI changes.
// Always produces structured, useful output from real parsed titles.

export interface AISummary {
  summary: string;
  keyPoints: string[];
  tags: string[];
}

const PLATFORM_TEMPLATES: Record<string, Partial<AISummary>> = {
  youtube: {
    summary: "A high-quality video covering practical techniques and insights. Strong emphasis on real-world application, clear explanations, and actionable takeaways for developers and enthusiasts.",
    keyPoints: [
      "Core concepts explained with concrete examples",
      "Actionable tips and workflows you can apply immediately",
      "Trade-offs, best practices, and common pitfalls discussed"
    ],
    tags: ["tutorial", "tech", "practical"],
  },
  bilibili: {
    summary: "内容丰富、讲解清晰的优质视频。涵盖实际操作技巧、深入思考与实用案例，适合不同水平的观众学习和参考。",
    keyPoints: [
      "关键知识点系统梳理",
      "实战演示与详细案例分析",
      "常见问题解答与进阶建议"
    ],
    tags: ["教程", "技术", "实用"],
  },
  vimeo: {
    summary: "Professionally produced video with excellent production value, focused storytelling, and polished presentation suitable for creative and professional audiences.",
    keyPoints: ["High production quality and clear visuals", "Strong narrative structure", "Valuable creative and technical takeaways"],
    tags: ["creative", "professional", "design"],
  },
};

export async function generateAISummary(title: string, platform: string, url: string): Promise<AISummary> {
  // Simulate realistic processing latency (keeps UX consistent)
  await new Promise(r => setTimeout(r, 420));

  const p = (platform || 'youtube').toLowerCase();
  const base = PLATFORM_TEMPLATES[p] || PLATFORM_TEMPLATES.youtube!;

  // Personalize heavily from the real parsed title and URL
  const cleanTitle = (title || 'Video')
    .replace(/^(YouTube • |Bilibili Video|Video|Untitled Video)\s*/i, '')
    .trim() || 'Video';

  const idMatch = url.match(/[?&]v=([^&]{6,})|youtu\.be\/([^?&/]{6,})|bilibili.*?(BV[A-Za-z0-9]+)|vimeo\.com\/(\d+)/i);
  const identifier = idMatch ? (idMatch[1] || idMatch[2] || idMatch[3] || idMatch[4] || '') : '';

  const summary = `${base.summary} The video “${cleanTitle}” delivers focused value. ${identifier ? `Key reference: ${identifier}. ` : ''}Highly recommended for anyone looking to level up their skills in this area.`;

  const keyPoints = [
    ...base.keyPoints!,
    `Key insights drawn from “${cleanTitle.slice(0, 38)}${cleanTitle.length > 38 ? '…' : ''}”`,
    "Practical next steps after watching",
  ].slice(0, 6);

  // Intelligent tag expansion based on real title content
  const extra: string[] = [];
  const t = `${title} ${platform} ${cleanTitle}`.toLowerCase();
  if (/(react|前端|frontend)/.test(t)) extra.push('react');
  if (/(ai|智能|artificial|machine learning|llm)/.test(t)) extra.push('ai');
  if (/(tauri|desktop|electron|跨平台)/.test(t)) extra.push('desktop');
  if (/(tutorial|教程|guide|入门|实战)/.test(t)) extra.push('howto');
  if (/(typescript|ts|类型)/.test(t)) extra.push('typescript');
  if (/(tailwind|css|样式)/.test(t)) extra.push('ui');

  const tags = Array.from(new Set([...(base.tags || []), ...extra, p])).slice(0, 7);

  return { summary, keyPoints, tags };
}

// Convenience for later real backend swap
export async function generateAISummaryReal(title: string, platform: string, url: string): Promise<AISummary> {
  // Placeholder: implement fetch to your backend here.
  return generateAISummary(title, platform, url);
}
