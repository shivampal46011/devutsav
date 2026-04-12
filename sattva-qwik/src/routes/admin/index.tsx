import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  const timeLeft = useSignal('00:00:00');

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    const tick = () => {
      const now = new Date();
      const next = new Date(now);
      next.setHours(24, 0, 0, 0);
      const diff = next.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      timeLeft.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  });

  const cards = [
    {
      href: '/admin/categories',
      title: 'Categories',
      desc: 'Create or remove blog series (e.g. Baglamukhi) shown on the hub.',
      icon: 'folder_special',
    },
    {
      href: '/admin/new-post',
      title: 'New post',
      desc: 'Upload or paste Markdown, preview HTML, publish drafts.',
      icon: 'post_add',
    },
    {
      href: '/admin/blogs',
      title: 'All blogs',
      desc: 'Publish, unpublish, or delete posts.',
      icon: 'library_books',
    },
    {
      href: '/admin/schedules',
      title: 'AI schedules',
      desc: 'Daily prompts and one-click generation.',
      icon: 'smart_toy',
    },
  ] as const;

  return (
    <main class="px-4 md:px-8 max-w-5xl mx-auto pt-6 pb-28 md:pb-16">
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-10">
        <div>
          <h1 class="font-headline text-2xl md:text-4xl font-bold tracking-tight text-primary">Overview</h1>
          <p class="text-sm text-on-surface-variant mt-2 max-w-xl">
            Pick a section below. Each area has its own page so the console stays easy to scan.
          </p>
        </div>
        <div class="bg-surface-container-high rounded-2xl px-5 py-3 border border-outline-variant/20 shadow-sm flex items-center gap-3 w-fit shrink-0">
          <span class="material-symbols-outlined text-secondary animate-pulse" style="font-variation-settings: 'FILL' 1">
            schedule
          </span>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Next calendar day</p>
            <p class="font-headline font-bold text-secondary text-lg leading-none">{timeLeft.value}</p>
          </div>
        </div>
      </div>

      <ul class="grid sm:grid-cols-2 gap-4">
        {cards.map((c) => (
          <li key={c.href}>
            <a
              href={c.href}
              class="flex gap-4 p-5 rounded-3xl bg-surface-container border border-outline-variant/10 shadow-sm hover:border-primary/30 hover:shadow-md transition-all h-full no-underline text-inherit"
            >
              <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container">
                <span class="material-symbols-outlined text-2xl">{c.icon}</span>
              </span>
              <div>
                <h2 class="font-headline font-bold text-on-surface text-lg">{c.title}</h2>
                <p class="text-sm text-on-surface-variant mt-1 leading-relaxed">{c.desc}</p>
                <span class="inline-flex items-center gap-1 text-primary text-xs font-bold mt-3">
                  Open
                  <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
});

export const head: DocumentHead = {
  title: 'Admin overview — DevUtsav',
};
