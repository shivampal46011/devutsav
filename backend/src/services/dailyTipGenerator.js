import { invokeClaudeText } from './bedrockService.js';
import DailyTip from '../models/DailyTip.js';

const PROMPT = `You are a Vedic spiritual guide writing a single short "tip of the day" for a Hindu spiritual app called DevUtsav.

Output MUST be valid JSON with two fields:
{
  "title": "<2-4 word evocative title in Title Case, e.g. 'Light a Lamp', 'Surya Namaskar', 'Sacred Silence'>",
  "body": "<one or two crisp sentences (max 220 chars) giving an actionable spiritual practice for today. Reference Hindu deities, mantras, offerings, or daily rituals. Specific and grounded — never generic.>"
}

Write only the JSON. No markdown fences, no preamble.`;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

const FALLBACKS = [
  { title: 'Surya Arghya', body: 'Offer water to the rising sun while chanting Om Suryaya Namah. It strengthens inner resolve and clears the day of professional obstacles.' },
  { title: 'Tulsi Pranam', body: 'Light a single ghee diya before the Tulsi plant at dusk. The auspicious flame purifies your home and invites Lakshmi.' },
  { title: 'Hanuman Chalisa', body: 'Recite the Hanuman Chalisa once today with hands folded, facing east. It dissolves fear and aligns courage with action.' },
  { title: 'Sacred Silence', body: 'Spend ten silent minutes after sunset, eyes closed, repeating Om Namah Shivay internally. It settles agitation and sharpens intuition.' },
];

function pickFallback() {
  const i = new Date().getDate() % FALLBACKS.length;
  return FALLBACKS[i];
}

function safeParse(raw) {
  try {
    let s = String(raw || '').trim();
    s = s.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    const obj = JSON.parse(s);
    if (typeof obj?.title === 'string' && typeof obj?.body === 'string') return obj;
  } catch {}
  return null;
}

/**
 * Generate (or return cached) DailyTip for today. Idempotent.
 */
export async function generateTodaysTip({ force = false } = {}) {
  const date = todayIso();
  const existing = await DailyTip.findOne({ date });
  if (existing && !force) return existing;

  let title, body, status = 'active', generated_by = 'bedrock';
  try {
    const raw = await invokeClaudeText(PROMPT, { maxTokens: 300, temperature: 0.85 });
    const parsed = safeParse(raw);
    if (parsed) {
      title = parsed.title.trim().slice(0, 60);
      body = parsed.body.trim().slice(0, 320);
    } else {
      throw new Error('parse_failed');
    }
  } catch (err) {
    const fb = pickFallback();
    title = fb.title;
    body = fb.body;
    status = 'fallback';
    generated_by = `fallback:${err?.message || 'error'}`.slice(0, 60);
  }

  if (existing) {
    existing.title = title;
    existing.body = body;
    existing.generated_by = generated_by;
    existing.status = status;
    await existing.save();
    return existing;
  }
  return DailyTip.create({ date, title, body, status, generated_by });
}
