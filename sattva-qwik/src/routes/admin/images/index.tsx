import { component$, useSignal, useStore, useVisibleTask$, $, noSerialize, type NoSerialize } from '@builder.io/qwik';
import { getApiBase } from '~/lib/apiBase';
import { TOKEN_KEY } from '../shared';

interface Img { name: string; size: number; mtime?: string; url: string; }

const fmtSize = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

export default component$(() => {
  const tokenSig = useSignal('');
  const store = useStore<{
    images: Img[]; loading: boolean; uploading: boolean; err: string; msg: string;
    pending: NoSerialize<File[]> | undefined;
  }>({ images: [], loading: false, uploading: false, err: '', msg: '', pending: undefined });

  const fetchImages = $(async () => {
    if (!tokenSig.value) return;
    store.loading = true;
    try {
      const res = await fetch(`${getApiBase()}/api/admin/images`, {
        headers: { Authorization: `Bearer ${tokenSig.value}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      store.images = data.images || [];
    } catch (e: any) { store.err = String(e?.message || e); }
    finally { store.loading = false; }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    try { tokenSig.value = localStorage.getItem(TOKEN_KEY) || ''; } catch {}
    fetchImages();
  });

  const upload = $(async () => {
    const files = store.pending;
    if (!files || !files.length) { store.err = 'pick files first'; return; }
    store.err = ''; store.msg = ''; store.uploading = true;
    try {
      const fd = new FormData();
      for (const f of files) fd.append('files', f);
      const res = await fetch(`${getApiBase()}/api/admin/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenSig.value}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      store.msg = `Uploaded ${data.uploaded?.length || 0} image(s).`;
      store.pending = undefined;
      await fetchImages();
    } catch (e: any) { store.err = String(e?.message || e); }
    finally { store.uploading = false; }
  });

  const del = $(async (name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      const res = await fetch(`${getApiBase()}/api/admin/images/${encodeURIComponent(name)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokenSig.value}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchImages();
    } catch (e: any) { store.err = String(e?.message || e); }
  });

  const copyUrl = $(async (img: Img) => {
    const base = getApiBase();
    const full = base ? `${base}${img.url}` : img.url;
    try { await navigator.clipboard.writeText(full); store.msg = `Copied: ${full}`; }
    catch { store.err = 'Copy failed — select & copy manually'; }
  });

  return (
    <div class="p-3 space-y-3">
      <div class="flex items-center justify-between">
        <div class="term-amber font-bold tracking-widest">IMAGE LIBRARY // {store.images.length}</div>
        <button onClick$={fetchImages} class="term-cyan border border-[#1f2937] px-2 py-0.5 hover:term-amber">REFRESH</button>
      </div>

      {store.err && <div class="term-red border border-[#ff4d4d] px-2 py-1">{store.err}</div>}
      {store.msg && <div class="term-green border border-[#00ff7f] px-2 py-1">{store.msg}</div>}

      <div class="term-panel p-3">
        <div class="term-cyan uppercase tracking-widest mb-2">UPLOAD (multi-select)</div>
        <input
          type="file" multiple accept="image/*"
          onChange$={(_, el) => {
            const list = el.files ? Array.from(el.files) : [];
            store.pending = noSerialize(list);
          }}
          class="block text-xs"
        />
        <div class="flex items-center gap-2 mt-2">
          <button
            disabled={store.uploading}
            onClick$={upload}
            class="term-amber border border-[#ffb000] px-3 py-1 hover:bg-[#1a1300] disabled:opacity-50"
          >
            {store.uploading ? 'UPLOADING…' : 'UPLOAD'}
          </button>
          <span class="term-dim text-[10px]">max 8 MB each, up to 20 files; saved to /public/uploads/blogs/</span>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {store.images.map((img) => (
          <div key={img.name} class="term-panel p-2 flex flex-col gap-1">
            <img src={`${getApiBase()}${img.url}`} alt={img.name} class="w-full h-28 object-cover bg-black border border-[#1f2937]" />
            <div class="truncate text-[10px] term-dim" title={img.name}>{img.name}</div>
            <div class="text-[10px] term-dim">{fmtSize(img.size)}</div>
            <div class="flex gap-1">
              <button onClick$={() => copyUrl(img)} class="flex-1 term-cyan border border-[#1f2937] px-1 py-0.5 text-[10px] hover:term-amber">COPY URL</button>
              <button onClick$={() => del(img.name)} class="term-red border border-[#1f2937] px-1 py-0.5 text-[10px] hover:bg-[#1a0000]">DEL</button>
            </div>
          </div>
        ))}
        {!store.loading && store.images.length === 0 && <div class="term-dim col-span-full py-8 text-center">no images yet</div>}
      </div>
    </div>
  );
});
