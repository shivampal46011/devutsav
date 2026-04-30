import { invokeClaudeText } from './bedrockService.js';
import slugify from '../utils/slugify.js';

const SYS = `You are an SEO editor for DevUtsav (Vedic spiritual & astrology site).
Given a Markdown blog post, output ONLY a JSON object (no prose, no code fences) with these fields:
{
  "title": "compelling human title (<= 70 chars)",
  "slug": "url-safe-kebab-case-slug (<= 60 chars, lowercase, hyphens, no stopwords-only)",
  "excerpt": "1-2 sentence hook for blog cards (<= 200 chars)",
  "seo_title": "<= 60 chars, keyword-rich, includes brand only if it fits",
  "seo_description": "150-160 chars, natural sentence, includes primary keyword, ends with a soft CTA",
  "seo_keywords": "8-12 comma-separated keywords/phrases, mix of head + long-tail"
}
Rules:
- Output MUST be valid JSON, parsable by JSON.parse, no markdown fences.
- Keep mantras / Sanskrit terms intact in keywords if relevant.
- No clickbait, no emoji, no ALL CAPS, no quotes around the JSON itself.`;

function tryParseJson(s) {
  if (!s) return null;
  const cleaned = String(s).trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '');
  try { return JSON.parse(cleaned); } catch {}
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}

export async function generateBlogSeoMeta(markdown) {
  if (!markdown || !String(markdown).trim()) throw new Error('markdown is empty');
  const trimmed = String(markdown).slice(0, 12000);
  const out = await invokeClaudeText(`${SYS}\n\n---POST---\n${trimmed}\n---END---\n\nReturn the JSON now:`, {
    maxTokens: 600,
    temperature: 0.4,
  });
  const parsed = tryParseJson(out) || {};
  const clip = (s, n) => String(s || '').trim().slice(0, n);
  return {
    title: clip(parsed.title, 120),
    slug: slugify(clip(parsed.slug || parsed.title, 80)),
    excerpt: clip(parsed.excerpt, 240),
    seo_title: clip(parsed.seo_title || parsed.title, 80),
    seo_description: clip(parsed.seo_description, 200),
    seo_keywords: clip(parsed.seo_keywords, 400),
  };
}

export default generateBlogSeoMeta;
