import { marked } from 'marked';

marked.setOptions({
  gfm: true,
  breaks: true,
});

export function mdToHtml(md) {
  if (!md || typeof md !== 'string') return '';
  return marked.parse(md);
}
