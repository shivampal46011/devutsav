import { component$, useContext, useSignal, useStore, useVisibleTask$, $, noSerialize, type NoSerialize } from '@builder.io/qwik';
import { getApiBase } from '~/lib/apiBase';
import { TOKEN_KEY, BulkJobCtx } from '../../shared';

interface Series { _id: string; name: string; slug: string; }

export default component$(() => {
  const tokenSig = useSignal('');
  const seriesList = useSignal<Series[]>([]);
  const form = useStore({ series_id: '', sanitize: true, ai_seo: true, status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' });
  const newCat = useStore({ name: '', slug: '', description: '', creating: false });
  const queue = useSignal<NoSerialize<File[]> | undefined>(undefined);
  const ui = useStore<{ err: string; msg: string }>({ err: '', msg: '' });
  const bulk = useContext(BulkJobCtx);

  const fetchSeries = $(async () => {
    try {
      const res = await fetch(`${getApiBase()}/api/admin/blog-series`);
      if (res.ok) seriesList.value = await res.json();
    } catch {}
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    try { tokenSig.value = localStorage.getItem(TOKEN_KEY) || ''; } catch {}
    await fetchSeries();
  });

  const createCategory = $(async () => {
    if (!newCat.name.trim()) { ui.err = 'category name required'; return; }
    newCat.creating = true; ui.err = ''; ui.msg = '';
    try {
      const res = await fetch(`${getApiBase()}/api/admin/blog-series`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenSig.value}` },
        body: JSON.stringify({ name: newCat.name, slug: newCat.slug, description: newCat.description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      ui.msg = `Category created: ${data.name}`;
      newCat.name = ''; newCat.slug = ''; newCat.description = '';
      await fetchSeries();
      form.series_id = data._id;
    } catch (e: any) { ui.err = String(e?.message || e); }
    finally { newCat.creating = false; }
  });

  const deleteCategory = $(async (id: string) => {
    if (!confirm('Delete this category? Blogs in it will be uncategorised.')) return;
    try {
      const res = await fetch(`${getApiBase()}/api/admin/blog-series/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokenSig.value}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (form.series_id === id) form.series_id = '';
      await fetchSeries();
    } catch (e: any) { ui.err = String(e?.message || e); }
  });

  const process = $(async () => {
    const files = queue.value;
    if (!files || !files.length) { ui.err = 'pick .md files first'; return; }
    if (bulk.active) { ui.err = 'Another bulk job is still running'; return; }
    ui.err = ''; ui.msg = '';

    bulk.active = true;
    bulk.results = [];
    bulk.totalCount = files.length;
    bulk.doneCount = 0;
    bulk.queueNames = files.map((f) => f.name);
    bulk.startedAt = new Date().toISOString();
    bulk.label = `${files.length} file${files.length > 1 ? 's' : ''}`;
    bulk.collapsed = false;

    for (const f of files) {
      bulk.current = f.name;
      try {
        const fd = new FormData();
        fd.append('files', f);
        if (form.series_id) fd.append('series_id', form.series_id);
        fd.append('sanitize', String(form.sanitize));
        fd.append('ai_seo', String(form.ai_seo));
        fd.append('status', form.status);
        const res = await fetch(`${getApiBase()}/api/admin/blogs/bulk`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${tokenSig.value}` },
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) {
          bulk.results = [...bulk.results, { file: f.name, ok: false, error: data.error || `HTTP ${res.status}` }];
        } else {
          bulk.results = [...bulk.results, ...(data.results || [])];
        }
      } catch (e: any) {
        bulk.results = [...bulk.results, { file: f.name, ok: false, error: String(e?.message || e) }];
      }
      bulk.doneCount += 1;
    }
    bulk.current = '';
    bulk.active = false;
    ui.msg = `Done. ${bulk.results.filter((r) => r.ok).length}/${bulk.results.length} succeeded.`;
    queue.value = undefined;
  });

  return (
    <div class="p-3 space-y-3">
      <div class="flex items-center justify-between">
        <div class="term-amber font-bold tracking-widest">BULK MD INGEST // PER-FILE</div>
        <a href="/admin/blogs" class="term-dim hover:term-amber border border-[#1f2937] px-2 py-0.5 no-underline">← BACK</a>
      </div>

      {ui.err && <div class="term-red border border-[#ff4d4d] px-2 py-1">{ui.err}</div>}
      {ui.msg && <div class="term-green border border-[#00ff7f] px-2 py-1">{ui.msg}</div>}

      <div class="term-panel p-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="term-dim text-[10px] uppercase block mb-1">Category / Series</label>
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
        <div>
          <label class="term-dim text-[10px] uppercase block mb-1">Status</label>
          <select
            value={form.status}
            onChange$={(_, el) => (form.status = el.value as 'DRAFT' | 'PUBLISHED')}
            class="w-full bg-black border border-[#1f2937] px-2 py-1 text-[#e6e6e6]"
          >
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="flex items-center gap-2 term-dim text-[10px] uppercase">
            <input type="checkbox" checked={form.sanitize} onChange$={(_, el) => (form.sanitize = el.checked)} />
            Sanitize / rewrite (plagiarism-safe)
          </label>
          <label class="flex items-center gap-2 term-dim text-[10px] uppercase">
            <input type="checkbox" checked={form.ai_seo} onChange$={(_, el) => (form.ai_seo = el.checked)} />
            AI auto-SEO (title, slug, description, keywords)
          </label>
        </div>
      </div>

      <div class="term-panel p-3">
        <div class="term-cyan uppercase tracking-widest mb-2">MANAGE CATEGORIES</div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
          <input
            placeholder="Category name *"
            value={newCat.name}
            onInput$={(_, el) => (newCat.name = el.value)}
            class="bg-black border border-[#1f2937] focus:border-[#ffb000] px-2 py-1 outline-none text-[#e6e6e6]"
          />
          <input
            placeholder="slug (optional)"
            value={newCat.slug}
            onInput$={(_, el) => (newCat.slug = el.value)}
            class="bg-black border border-[#1f2937] focus:border-[#ffb000] px-2 py-1 outline-none text-[#e6e6e6]"
          />
          <input
            placeholder="description (optional)"
            value={newCat.description}
            onInput$={(_, el) => (newCat.description = el.value)}
            class="bg-black border border-[#1f2937] focus:border-[#ffb000] px-2 py-1 outline-none text-[#e6e6e6]"
          />
          <button
            disabled={newCat.creating}
            onClick$={createCategory}
            class="term-amber border border-[#ffb000] px-3 py-1 hover:bg-[#1a1300] disabled:opacity-50"
          >
            {newCat.creating ? 'CREATING…' : '+ ADD CATEGORY'}
          </button>
        </div>
        {seriesList.value.length > 0 && (
          <ul class="text-[11px] flex flex-wrap gap-2">
            {seriesList.value.map((s) => (
              <li key={s._id} class="border border-[#1f2937] px-2 py-0.5 flex items-center gap-2">
                <span class="term-amber">{s.name}</span>
                <span class="term-dim">/{s.slug}</span>
                <button onClick$={() => deleteCategory(s._id)} class="term-red text-[10px] hover:underline">×</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div class="term-panel p-3">
        <div class="term-cyan uppercase tracking-widest mb-2">DROP / SELECT .md FILES</div>
        <input
          type="file" multiple accept=".md,.markdown,text/markdown"
          onChange$={(_, el) => {
            const list = el.files ? Array.from(el.files) : [];
            queue.value = noSerialize(list);
          }}
          class="block text-xs"
        />
        {queue.value && queue.value.length > 0 && (
          <ul class="mt-2 text-[11px] term-dim list-disc pl-5">
            {queue.value.map((f) => (<li key={f.name}>{f.name} <span class="term-dim">({Math.round(f.size / 1024)} KB)</span></li>))}
          </ul>
        )}
        <div class="flex items-center gap-2 mt-2">
          <button
            disabled={bulk.active}
            onClick$={process}
            class="term-amber border border-[#ffb000] px-3 py-1 hover:bg-[#1a1300] disabled:opacity-50"
          >
            {bulk.active ? `PROCESSING ${bulk.current}…` : 'START INGEST'}
          </button>
          <span class="term-dim text-[10px]">files are processed one-by-one. Sanitize uses Claude (slower, ~10s/file).</span>
        </div>
      </div>

      {bulk.results.length > 0 && (
        <div class="term-panel p-3">
          <div class="term-cyan uppercase tracking-widest mb-2">RESULTS</div>
          <table class="w-full text-xs">
            <thead>
              <tr class="term-dim text-[10px] uppercase">
                <th class="text-left py-1">FILE</th>
                <th class="text-left">STATUS</th>
                <th class="text-left">SLUG / ERROR</th>
              </tr>
            </thead>
            <tbody>
              {bulk.results.map((r, i) => (
                <tr key={i} class="border-t border-[#111827]">
                  <td class="py-1.5">{r.file}</td>
                  <td class={r.ok ? 'term-green' : 'term-red'}>{r.ok ? 'OK' : 'FAIL'}</td>
                  <td class="term-dim">{r.ok ? `${r.slug} — ${r.title}` : r.error}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});
