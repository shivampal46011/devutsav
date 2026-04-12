import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';
import { getApiBase } from '../../../lib/apiBase';

export default component$(() => {
  const schedules = useSignal<Record<string, unknown>[]>([]);
  const newPrompt = useSignal('');
  const loading = useSignal(false);

  const fetchSchedules = $(async () => {
    const api = getApiBase();
    try {
      const res = await fetch(`${api}/api/admin/schedules`);
      schedules.value = await res.json();
    } catch (e) {
      console.error(e);
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    await fetchSchedules();
  });

  return (
    <main class="px-4 md:px-8 max-w-5xl mx-auto pt-6 pb-28 md:pb-16">
      <h1 class="font-headline text-2xl md:text-3xl font-bold text-primary mb-2">AI schedules</h1>
      <p class="text-sm text-on-surface-variant mb-8">Daily prompts and one-shot generation. Delete removes the schedule only (not existing posts).</p>

      <section class="mb-10 bg-surface-container-high rounded-3xl p-6 shadow-sm border border-outline-variant/10">
        <div class="space-y-4 mb-6">
          <textarea
            class="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 text-sm focus:border-primary outline-none"
            rows={3}
            value={newPrompt.value}
            onInput$={(e) => (newPrompt.value = (e.target as HTMLTextAreaElement).value)}
            placeholder="Daily prompt…"
          />
          <button
            type="button"
            onClick$={async () => {
              if (!newPrompt.value.trim()) return;
              const api = getApiBase();
              await fetch(`${api}/api/admin/schedules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt_text: newPrompt.value }),
              });
              newPrompt.value = '';
              await fetchSchedules();
            }}
            class="w-full bg-primary text-on-primary font-bold py-2 rounded-lg text-sm active:scale-95"
          >
            Add schedule
          </button>
        </div>
        <div class="space-y-3">
          {schedules.value.length === 0 ? (
            <p class="text-sm text-on-surface-variant italic">No schedules yet.</p>
          ) : (
            schedules.value.map((sched: any) => (
              <div key={sched._id} class="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 flex flex-col gap-3">
                <p class="text-sm font-medium">{sched.prompt_text}</p>
                <div class="flex flex-wrap gap-2 items-center">
                  <span class="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-1 rounded">Daily</span>
                  <button
                    type="button"
                    disabled={loading.value}
                    onClick$={async () => {
                      loading.value = true;
                      const api = getApiBase();
                      await fetch(`${api}/api/admin/blogs/generate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt: sched.prompt_text }),
                      });
                      await fetchSchedules();
                      loading.value = false;
                    }}
                    class={`text-xs px-3 py-1.5 rounded font-bold ml-auto sm:ml-0 ${loading.value ? 'opacity-50' : 'bg-primary text-on-primary'}`}
                  >
                    {loading.value ? '…' : 'Generate now'}
                  </button>
                  <button
                    type="button"
                    class="text-xs font-bold px-3 py-1.5 rounded-lg bg-error-container text-on-error-container border border-error/20 sm:ml-auto"
                    onClick$={async () => {
                      if (!confirm('Remove this schedule?')) return;
                      const api = getApiBase();
                      const res = await fetch(`${api}/api/admin/schedules/${sched._id}`, { method: 'DELETE' });
                      if (res.ok) await fetchSchedules();
                      else {
                        const err = await res.json().catch(() => ({}));
                        alert((err as { error?: string }).error || 'Delete failed');
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
});

export const head: DocumentHead = {
  title: 'AI schedules — Admin',
};
