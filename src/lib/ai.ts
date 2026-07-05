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
    summary: "高质量视频，涵盖实用技巧与洞见。强调实际应用、清晰讲解，以及对开发者和爱好者的可操作收获。",
    keyPoints: [
      "核心概念通过具体示例讲解",
      "可立即应用的实用技巧和工作流",
      "讨论权衡、最佳实践和常见陷阱"
    ],
    tags: ["教程", "技术", "实用"],
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
    summary: "专业制作的优质视频，注重叙事和精良呈现，适合创意和专业观众。",
    keyPoints: ["高制作质量与清晰画面", "强大的叙事结构", "宝贵的创意与技术收获"],
    tags: ["创意", "专业", "设计"],
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

  const summary = `${base.summary} 视频《${cleanTitle}》提供专注价值。${identifier ? `关键参考：${identifier}。` : ''}强烈推荐给任何希望在此领域提升技能的人。`;

  const keyPoints = [
    ...base.keyPoints!,
    `从《${cleanTitle.slice(0, 38)}${cleanTitle.length > 38 ? '…' : ''}》提炼的关键见解`,
    "观看后的实用下一步",
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
