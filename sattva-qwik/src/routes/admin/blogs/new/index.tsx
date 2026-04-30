import { component$, useSignal, useStore, useVisibleTask$, $ } from '@builder.io/qwik';
import { getApiBase } from '~/lib/apiBase';
import { TOKEN_KEY } from '../../shared';

interface Series { _id: string; name: string; slug: string; }

export default component$(() => {
  const tokenSig = useSignal('');
  const seriesList = useSignal<Series[]>([]);
  const form = useStore({
    title: '',
    slug: '',
    series_id: '',
    excerpt: '',
    image: '',
    seo_title: '',
    seo_description: '',
    og_image: '',
    source_md: '',   // pasted/original
    content_md: '',  // sanitized output (or hand-written)
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
    coming_soon: false,
  });
  const ui = useStore({
    sanitizing: false,
    saving: false,
    seoing: false,
    err: '',
    msg: '',
  });

  const headers = $(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${tokenSig.value}`,
  }));

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try { tokenSig.value = localStorage.getItem(TOKEN_KEY) || ''; } catch {}
    try {
      const res = await fetch(`${getApiBase()}/api/admin/blog-series`);
      if (res.ok) seriesList.value = await res.json();
    } catch {}
  });

  const sanitize = $(async () => {
    if (!form.source_md.trim()) { ui.err = 'Paste source markdown first'; return; }
    ui.err = ''; ui.msg = ''; ui.sanitizing = true;
    try {
      const res = await fetch(`${getApiBase()}/api/admin/blogs/sanitize`, {
        method: 'POST',
        headers: await headers(),
        body: JSON.stringify({ content_md: form.source_md }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      form.content_md = data.content_md || '';
      ui.msg = 'Rewritten. Review the output below before saving.';
    } catch (e: any) {
      ui.err = String(e?.message || e);
    } finally {
      ui.sanitizing = false;
    }
  });

  const autoSeo = $(async () => {
    if (!form.content_md.trim()) { ui.err = 'No content to analyze'; return; }
    ui.err = ''; ui.msg = ''; ui.seoing = true;
    try {
      const res = await fetch(`${getApiBase()}/api/admin/blogs/seo-meta`, {
        method: 'POST',
        headers: await headers(),
        body: JSON.stringify({ content_md: form.content_md }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      if (data.title) form.title = data.title;
      if (data.slug) form.slug = data.slug;
      if (data.excerpt) form.excerpt = data.excerpt;
      if (data.seo_title) form.seo_title = data.seo_title;
      if (data.seo_description) form.seo_description = data.seo_description;
      ui.msg = 'AI filled title, slug, excerpt and SEO meta. Edit if needed.';
    } catch (e: any) {
      ui.err = String(e?.message || e);
    } finally {
      ui.seoing = false;
    }
  });

  const save = $(async (publish: boolean) => {
    if (!form.content_md.trim()) { ui.err = 'No content to save'; return; }
    if (!form.title.trim()) { ui.err = 'Title is required'; return; }
    ui.err = ''; ui.msg = ''; ui.saving = true;
    try {
      const body = {
        title: form.title,
        slug: form.slug || undefined,
        series_id: form.series_id || undefined,
        excerpt: form.excerpt,
        image: form.image,
        seo_title: form.seo_title,
        seo_description: form.seo_description,
        og_image: form.og_image,
        coming_soon: form.coming_soon,
        content_md: form.content_md,
        status: publish ? 'PUBLISHED' : 'DRAFT',
      };
      const res = await fetch(`${getApiBase()}/api/admin/blogs`, {
        method: 'POST',
        headers: await headers(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      ui.msg = `Saved as ${publish ? 'PUBLISHED' : 'DRAFT'} (slug: ${data.slug || data._id}).`;
    } catch (e: any) {
      ui.err = String(e?.message || e);
    } finally {
      ui.saving = false;
    }
  });

  return (
    <div class="p-3 space-y-3">
      <div class="flex items-center justify-between">
        <div class="term-amber font-bold tracking-widest">NEW BLOG // SANITIZE & PUBLISH</div>
        <a href="/admin/blogs" class="term-dim hover:term-amber border border-[#1f2937] px-2 py-0.5 no-underline">← BACK</a>
      </div>

      {ui.err && <div class="term-red border border-[#ff4d4d] px-2 py-1">{ui.err}</div>}
      {ui.msg && <div class="term-green border border-[#00ff7f] px-2 py-1">{ui.msg}</div>}

      <div class="term-panel p-3">
        <div class="term-cyan uppercase tracking-widest mb-2">1. SOURCE MARKDOWN (paste original)</div>
        <textarea
          rows={10}
          value={form.source_md}
          onInput$={(_, el) => (form.source_md = el.value)}
          placeholder="Paste the source .md content here. The sanitizer will rewrite it in DevUtsav's voice while preserving facts, mantras and structure."
          class="w-full bg-black border border-[#1f2937] focus:border-[#ffb000] p-2 outline-none text-[#e6e6e6] font-mono text-xs"
        />
        <div class="flex items-center gap-2 mt-2">
          <button
            disabled={ui.sanitizing}
            onClick$={sanitize}
            class="term-amber border border-[#ffb000] px-3 py-1 hover:bg-[#1a1300] disabled:opacity-50"
          >
            {ui.sanitizing ? 'REWRITING…' : 'SANITIZE / REWRITE →'}
          </button>
          <span class="term-dim text-[10px]">uses Claude (Bedrock) — rewrites for originality, keeps facts/mantras intact</span>
        </div>
      </div>

      <div class="term-panel p-3">
        <div class="term-cyan uppercase tracking-widest mb-2">2. REWRITTEN MARKDOWN (review & edit)</div>
        <textarea
          rows={16}
          value={form.content_md}
          onInput$={(_, el) => (form.content_md = el.value)}
          placeholder="Sanitized output appears here. You can also write/paste a fresh post directly."
          class="w-full bg-black border border-[#1f2937] focus:border-[#ffb000] p-2 outline-none text-[#e6e6e6] font-mono text-xs"
        />
      </div>

      <div class="term-panel p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
        <div class="md:col-span-2 flex items-center justify-between mb-1">
          <div class="term-cyan uppercase tracking-widest">3. METADATA</div>
          <button
            disabled={ui.seoing}
            onClick$={autoSeo}
            class="term-amber border border-[#ffb000] px-2 py-0.5 hover:bg-[#1a1300] disabled:opacity-50 text-[10px]"
          >
            {ui.seoing ? 'GENERATING…' : '✨ AUTO-SEO (AI)'}
          </button>
        </div>
        <Field label="Title *" value={form.title} onInput$={(v) => (form.title = v)} />
        <Field label="Slug (optional)" value={form.slug} onInput$={(v) => (form.slug = v)} />
        <div>
          <label class="term-dim text-[10px] uppercase block mb-1">Series</label>
          <select
            value={form.series_id}
            onChange$={(_, el) => (form.series_id = el.value)}
            class="w-full bg-black border border-[#1f2937] px-2 py-1 text-[#e6e6e6]"
          >
            <option value="">— none —</option>
            {seriesList.value.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
        <Field label="Image URL" value={form.image} onInput$={(v) => (form.image = v)} />
        <Field label="Excerpt" value={form.excerpt} onInput$={(v) => (form.excerpt = v)} />
        <Field label="OG image URL" value={form.og_image} onInput$={(v) => (form.og_image = v)} />
        <Field label="SEO title" value={form.seo_title} onInput$={(v) => (form.seo_title = v)} />
        <Field label="SEO description" value={form.seo_description} onInput$={(v) => (form.seo_description = v)} />
        <label class="flex items-center gap-2 term-dim text-[10px] uppercase">
          <input type="checkbox" checked={form.coming_soon} onChange$={(_, el) => (form.coming_soon = el.checked)} />
          Coming soon
        </label>
      </div>

      <div class="flex items-center gap-2">
        <button
          disabled={ui.saving}
          onClick$={() => save(false)}
          class="term-cyan border border-[#1f2937] hover:term-amber px-3 py-1 disabled:opacity-50"
        >
          {ui.saving ? 'SAVING…' : 'SAVE AS DRAFT'}
        </button>
        <button
          disabled={ui.saving}
          onClick$={() => save(true)}
          class="term-green border border-[#00ff7f] hover:bg-[#001a0d] px-3 py-1 disabled:opacity-50"
        >
          {ui.saving ? 'SAVING…' : 'PUBLISH'}
        </button>
      </div>
    </div>
  );
});

const Field = component$<{ label: string; value: string; onInput$: (v: string) => void }>(({ label, value, onInput$ }) => (
  <div>
    <label class="term-dim text-[10px] uppercase block mb-1">{label}</label>
    <input
      value={value}
      onInput$={(_, el) => onInput$(el.value)}
      class="w-full bg-black border border-[#1f2937] focus:border-[#ffb000] px-2 py-1 outline-none text-[#e6e6e6]"
    />
  </div>
));
