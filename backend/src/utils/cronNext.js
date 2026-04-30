// Tiny cron next-run resolver for 5-field expressions: m h dom mon dow.
// Supports: number, *, comma list, and a-b ranges. No step (/) values.
// Iterates minute-by-minute up to 366 days ahead — fine for cron cadences we use.

function parseField(token, min, max) {
  if (token === '*') {
    const out = new Set();
    for (let i = min; i <= max; i++) out.add(i);
    return out;
  }
  const out = new Set();
  for (const part of token.split(',')) {
    if (part.includes('-')) {
      const [a, b] = part.split('-').map(Number);
      for (let i = a; i <= b; i++) out.add(i);
    } else {
      out.add(Number(part));
    }
  }
  return out;
}

export function nextCronRun(expr, from = new Date()) {
  const parts = String(expr).trim().split(/\s+/);
  if (parts.length !== 5) return null;
  const [mF, hF, domF, monF, dowF] = parts;
  let m, h, dom, mon, dow;
  try {
    m = parseField(mF, 0, 59);
    h = parseField(hF, 0, 23);
    dom = parseField(domF, 1, 31);
    mon = parseField(monF, 1, 12);
    dow = parseField(dowF, 0, 6);
  } catch {
    return null;
  }

  const cur = new Date(from.getTime() + 60_000);
  cur.setSeconds(0, 0);
  const limit = new Date(cur.getTime() + 366 * 24 * 60 * 60_000);
  while (cur < limit) {
    if (
      m.has(cur.getMinutes()) &&
      h.has(cur.getHours()) &&
      dom.has(cur.getDate()) &&
      mon.has(cur.getMonth() + 1) &&
      dow.has(cur.getDay())
    ) {
      return new Date(cur);
    }
    cur.setMinutes(cur.getMinutes() + 1);
  }
  return null;
}
