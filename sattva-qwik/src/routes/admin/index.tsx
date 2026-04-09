import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  const blogs = useSignal<any[]>([]);
  const schedules = useSignal<any[]>([]);
  const newPrompt = useSignal('');
  const loading = useSignal(false);
  const timeLeft = useSignal('00:00:00');

  const fetchAdminData = $(async () => {
    try {
      const [blogsRes, schedulesRes] = await Promise.all([
        fetch('http://localhost:5001/api/admin/blogs'),
        fetch('http://localhost:5001/api/admin/schedules'),
      ]);
      blogs.value = await blogsRes.json();
      schedules.value = await schedulesRes.json();
    } catch (err) { console.error('Failed to fetch admin data:', err); }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    fetchAdminData();
    const timer = setInterval(() => {
      const now = new Date();
      const next = new Date(now);
      next.setHours(24, 0, 0, 0);
      const diff = next.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      timeLeft.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }, 1000);
    return () => clearInterval(timer);
  });

  return (
    <main class="px-4 md:px-8 max-w-7xl mx-auto pt-8 pb-16 min-h-screen">
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 class="font-headline text-4xl font-bold tracking-tight text-primary">Content Control Center</h1>
        <div class="bg-surface-container-high rounded-full px-6 py-2 border border-outline-variant/20 shadow-sm flex items-center gap-3">
          <span class="material-symbols-outlined text-secondary animate-pulse" style="font-variation-settings: 'FILL' 1">schedule</span>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Next Auto-Generation</p>
            <p class="font-headline font-bold text-secondary text-lg leading-none">{timeLeft.value}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Schedules */}
        <div class="lg:col-span-1 space-y-6">
          <section class="bg-surface-container-high rounded-3xl p-6 shadow-sm">
            <h2 class="font-headline text-2xl font-bold mb-4">Prompt Schedules</h2>
            <div class="space-y-4 mb-6">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">New Daily Prompt</label>
                <textarea
                  class="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 text-sm focus:border-primary outline-none"
                  rows={3}
                  value={newPrompt.value}
                  onInput$={(e) => (newPrompt.value = (e.target as HTMLTextAreaElement).value)}
                  placeholder="e.g. Write a daily astrology forecast for Aries..."
                />
              </div>
              <button
                onClick$={async () => {
                  if (!newPrompt.value.trim()) return;
                  await fetch('http://localhost:5001/api/admin/schedules', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt_text: newPrompt.value }),
                  });
                  newPrompt.value = '';
                  await fetchAdminData();
                }}
                class="w-full bg-primary text-on-primary font-bold py-2 rounded-lg text-sm transition-transform active:scale-95"
              >Add Schedule</button>
            </div>
            <div class="space-y-3">
              {schedules.value.length === 0 ? (
                <p class="text-sm text-on-surface-variant italic">No schedules active.</p>
              ) : (
                schedules.value.map((sched: any) => (
                  <div key={sched._id} class="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 flex flex-col gap-3">
                    <p class="text-sm font-medium">{sched.prompt_text}</p>
                    <div class="flex gap-2 items-center">
                      <span class="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-1 rounded">Daily</span>
                      <button
                        onClick$={async () => {
                          loading.value = true;
                          await fetch('http://localhost:5001/api/admin/blogs/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: sched.prompt_text }) });
                          await fetchAdminData();
                          loading.value = false;
                        }}
                        disabled={loading.value}
                        class={`text-[10px] px-3 py-1.5 rounded font-bold ml-auto transition-opacity ${loading.value ? 'bg-outline text-surface cursor-not-allowed opacity-50' : 'bg-primary text-on-primary hover:opacity-90'}`}
                      >
                        {loading.value ? 'Generating...' : 'Generate Now'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right: Generated Blogs */}
        <div class="lg:col-span-2 space-y-6">
          <section class="bg-surface-container rounded-3xl p-6 shadow-sm min-h-[500px]">
            <div class="flex items-center justify-between mb-6">
              <h2 class="font-headline text-2xl font-bold">Generated Blogs</h2>
              <button onClick$={() => fetchAdminData()} class="text-primary hover:underline font-bold text-sm flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">refresh</span> Refresh
              </button>
            </div>
            <div class="space-y-6">
              {blogs.value.length === 0 ? (
                <div class="text-center py-12 text-on-surface-variant">
                  <span class="material-symbols-outlined text-4xl mb-2 opacity-50">article</span>
                  <p>No generated blogs yet.</p>
                </div>
              ) : (
                blogs.value.map((blog: any) => (
                  <div key={blog._id} class="bg-surface-container-high rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
                    <div class="bg-inverse-surface text-inverse-on-surface p-4 flex justify-between items-center">
                      <h3 class="font-bold">{blog.title}</h3>
                      <span class={`px-2 py-1 rounded text-xs font-bold ${blog.status === 'PUBLISHED' ? 'bg-secondary text-white' : 'bg-surface text-on-surface'}`}>{blog.status}</span>
                    </div>
                    <div class="p-6 prose prose-sm max-w-none text-on-surface" dangerouslySetInnerHTML={blog.content_md} />
                    <div class="border-t border-outline-variant/10 p-4 bg-surface-container-low flex justify-end gap-3">
                      {blog.status === 'DRAFT' && (
                        <button class="bg-secondary text-white px-4 py-2 font-bold rounded-lg text-sm hover:opacity-90">Publish</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
});

export const head: DocumentHead = {
  title: 'Admin Panel — Devutsav',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
};
