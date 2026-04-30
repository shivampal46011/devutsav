import { invokeClaudeText } from './bedrockService.js';

const SYSTEM_INSTR = `You are a senior content editor for DevUtsav, a Vedic spiritual & astrology site.
You will be given a Markdown blog post that may have been copied from another source.
Your job: REWRITE it so it is original, plagiarism-free, and in DevUtsav's voice — while preserving:
- All factual claims, mantras, Sanskrit terms, deity names, ritual steps, dates, numbers
- Overall structure (headings, lists, tables) and approximate length
- Any frontmatter at the top (between --- markers) — keep keys, you may polish values
- Markdown formatting (do not output HTML)

Rewriting rules:
- Paraphrase every sentence; do NOT keep long verbatim phrases from the source
- Vary sentence structure and vocabulary; tone should be warm, reverent, modern
- Keep proper nouns, mantras (in Sanskrit/IAST/Devanagari), and quoted shlokas EXACTLY as-is
- Do not invent new facts, products, or claims that were not in the source
- Do not add disclaimers, author bios, or "as an AI" text
- Output ONLY the rewritten Markdown — no preface, no explanation, no code fences around the whole document

Image URL rewriting (IMPORTANT):
- For every image in the Markdown — both \`![alt](url)\` and \`<img src="url">\` and frontmatter \`image:\`/\`og_image:\` fields — REPLACE the URL with:
    https://devutsav.com/public/uploads/blogs/<filename>
  where <filename> is the bare filename of the original URL (the last path segment, including the extension; lowercase it; replace spaces with "-").
- Examples:
    "/wp-content/uploads/2024/Rudraksha-Mala.jpg"     → "https://devutsav.com/public/uploads/blogs/rudraksha-mala.jpg"
    "https://other-site.com/images/Panch%20Mala.png"  → "https://devutsav.com/public/uploads/blogs/panch-mala.png"
    "img/hero.webp"                                   → "https://devutsav.com/public/uploads/blogs/hero.webp"
- Do NOT change the alt text. Do NOT remove images. Keep the same number and order of images.`;

export async function sanitizeBlogMarkdown(sourceMd) {
  if (!sourceMd || !String(sourceMd).trim()) {
    throw new Error('source markdown is empty');
  }
  const prompt = `${SYSTEM_INSTR}\n\n---SOURCE MARKDOWN---\n${sourceMd}\n---END SOURCE---\n\nNow output the rewritten Markdown:`;
  const out = await invokeClaudeText(prompt, {
    maxTokens: 4000,
    temperature: 0.6,
  });
  return String(out || '').trim();
}

export default sanitizeBlogMarkdown;
