import { component$, useSignal, useStore, useVisibleTask$, $ } from '@builder.io/qwik';
import { getApiBase } from '~/lib/apiBase';
import { fmtDate, TOKEN_KEY } from '../shared';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  series_id?: { _id: string; name: string; slug: string } | null;
  excerpt?: string;
  seo_title?: string;
  seo_description?: string;
  createdAt: string;
  updatedAt: string;
  coming_soon?: boolean;
}

export default component$(() => {
  const tokenSig = useSignal('');
  const filter = useStore({ q: '', status: 'ALL' as 'ALL' | 'DRAFT' | 'PUBLISHED', series: '' });
  const store = useStore<{ blogs: Blog[]; loading: boolean; err: string; msg: string; selected: Record<string, boolean> }>({
    blogs: [], loading: false, err: '', msg: '', selected: {},
  });

  const fetchBlogs = $(async () => {
    if (!tokenSig.value) return;
    store.loading = true;
    try {
      const res = await fetch(`${getApiBase()}/api/admin/blogs`, {
        headers: { Authorization: `Bearer ${tokenSig.value}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      store.blogs = await res.json();
      store.err = '';
    } catch (e: any) { store.err = String(e?.message || e); }
    finally { store.loading = false; }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    try { tokenSig.value = localStorage.getItem(TOKEN_KEY) || ''; } catch {}
    fetchBlogs();
  });

  const del = $(async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      const res = await fetch(`${getApiBase()}/api/admin/blogs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokenSig.value}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      store.msg = `Deleted ${title}`;
      await fetchBlogs();
    } catch (e: any) { store.err = String(e?.message || e); }
  });

  const bulkDelete = $(async () => {
    const ids = Object.keys(store.selected).filter((k) => store.selected[k]);
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} selected blog(s)? This cannot be undone.`)) return;
    let ok = 0, fail = 0;
    for (const id of ids) {
      try {
        const res = await fetch(`${getApiBase()}/api/admin/blogs/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${tokenSig.value}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        ok++;
      } catch { fail++; }
    }
    store.selected = {};
    store.msg = `Deleted ${ok} blog(s)${fail ? `, ${fail} failed` : ''}`;
    await fetchBlogs();
  });

  const togglePublish = $(async (b: Blog) => {
    try {
      const next = b.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      const res = await fetch(`${getApiBase()}/api/admin/blogs/${b._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenSig.value}` },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchBlogs();
    } catch (e: any) { store.err = String(e?.message || e); }
  });

  const seriesOptions = (() => {
    const map = new Map<string, string>();
    for (const b of store.blogs) {
      if (b.series_id?._id) map.set(b.series_id._id, b.series_id.name);
    }
    return [...map.entries()];
  });

  const filtered = (() => {
    const q = filter.q.trim().toLowerCase();
    return store.blogs.filter((b) => {
      if (filter.status !== 'ALL' && b.status !== filter.status) return false;
      if (filter.series && b.series_id?._id !== filter.series) return false;
      if (q && !`${b.title} ${b.slug} ${b.excerpt || ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
  });

  return (
    <div class="p-3 space-y-3">
      <div class="flex items-center justify-between">
        <div class="term-amber font-bold tracking-widest">BLOGS // ALL</div>
        <div class="flex gap-2">
          {Object.values(store.selected).some(Boolean) && (
            <button onClick$={bulkDelete} class="term-red border border-[#ff4d4d] px-2 py-0.5 hover:bg-[#1a0000]">
              DEL SELECTED ({Object.values(store.selected).filter(Boolean).length})
            </button>
          )}
          <a href="/admin/blogs/bulk" class="term-cyan hover:term-amber border border-[#1f2937] px-2 py-0.5 no-underline">⇪ BULK MD</a>
          <a href="/admin/blogs/new" class="term-cyan hover:term-amber border border-[#1f2937] px-2 py-0.5 no-underline">+ NEW BLOG</a>
          <button onClick$={fetchBlogs} class="term-cyan hover:term-amber border border-[#1f2937] px-2 py-0.5">REFRESH</button>
        </div>
      </div>

      {store.err && <div class="term-red border border-[#ff4d4d] px-2 py-1">{store.err}</div>}
      {store.msg && <div class="term-green border border-[#00ff7f] px-2 py-1">{store.msg}</div>}

      <div class="term-panel p-2 grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          placeholder="search title/slug/excerpt"
          value={filter.q}
          onInput$={(_, el) => (filter.q = el.value)}
          class="bg-black border border-[#1f2937] focus:border-[#ffb000] px-2 py-1 outline-none text-[#e6e6e6]"
        />
        <select
          value={filter.status}
          onChange$={(_, el) => (filter.status = el.value as typeof filter.status)}
          class="bg-black border border-[#1f2937] px-2 py-1 text-[#e6e6e6]"
        >
          <option value="ALL">All statuses</option>
          <option value="DRAFT">Draft only</option>
          <option value="PUBLISHED">Published only</option>
        </select>
        <select
          value={filter.series}
          onChange$={(_, el) => (filter.series = el.value)}
          class="bg-black border border-[#1f2937] px-2 py-1 text-[#e6e6e6]"
        >
          <option value="">All categories</option>
          {seriesOptions().map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="term-dim text-[10px] uppercase">
              <th class="text-left py-1 w-6">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={filtered().length > 0 && filtered().every((b) => store.selected[b._id])}
                  onChange$={(_, el) => {
                    const list = filtered();
                    if (el.checked) {
                      const next = { ...store.selected };
                      for (const b of list) next[b._id] = true;
                      store.selected = next;
                    } else {
                      const next = { ...store.selected };
                      for (const b of list) delete next[b._id];
                      store.selected = next;
                    }
                  }}
                />
              </th>
              <th class="text-left py-1">TITLE</th>
              <th class="text-left">SLUG</th>
              <th class="text-left">CATEGORY</th>
              <th class="text-left">STATUS</th>
              <th class="text-left">UPDATED</th>
              <th class="text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {!store.loading && filtered().length === 0 && (
              <tr><td colSpan={7} class="term-dim py-4">no blogs match</td></tr>
            )}
            {filtered().map((b) => (
              <tr key={b._id} class="term-row border-t border-[#111827]">
                <td class="py-1.5">
                  <input
                    type="checkbox"
                    aria-label={`Select ${b.title}`}
                    checked={!!store.selected[b._id]}
                    onChange$={(_, el) => {
                      const next = { ...store.selected };
                      if (el.checked) next[b._id] = true; else delete next[b._id];
                      store.selected = next;
                    }}
                  />
                </td>
                <td class="py-1.5 term-amber">{b.title}</td>
                <td class="term-cyan">{b.slug}</td>
                <td class="term-dim">{b.series_id?.name || '—'}</td>
                <td class={b.status === 'PUBLISHED' ? 'term-green' : 'term-dim'}>{b.status}</td>
                <td class="term-dim">{fmtDate(b.updatedAt)}</td>
                <td class="text-right">
                  <div class="inline-flex gap-1">
                    <a href={`/blog/${b.slug}`} target="_blank" class="term-cyan border border-[#1f2937] px-2 py-0.5 no-underline text-[10px] hover:term-amber">VIEW</a>
                    <button onClick$={() => togglePublish(b)} class="term-amber border border-[#1f2937] px-2 py-0.5 text-[10px] hover:bg-[#1a1300]">
                      {b.status === 'PUBLISHED' ? 'UNPUBLISH' : 'PUBLISH'}
                    </button>
                    <button onClick$={() => del(b._id, b.title)} class="term-red border border-[#1f2937] px-2 py-0.5 text-[10px] hover:bg-[#1a0000]">DEL</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p class="term-dim text-[10px]">
        Showing {filtered().length} of {store.blogs.length} blogs. Top-performing blogs (7d analytics) live on the OVERVIEW tab.
      </p>
    </div>
  );
});
