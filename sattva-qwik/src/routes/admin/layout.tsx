import { component$, Slot } from '@builder.io/qwik';
import { useLocation, type DocumentHead } from '@builder.io/qwik-city';

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/new-post', label: 'New post' },
  { href: '/admin/blogs', label: 'All blogs' },
  { href: '/admin/schedules', label: 'AI schedules' },
] as const;

function navActive(pathname: string, href: string) {
  const p = pathname.replace(/\/$/, '') || '/';
  const h = href.replace(/\/$/, '') || '/';
  if (h === '/admin') return p === '/admin';
  return p === h || p.startsWith(`${h}/`);
}

export default component$(() => {
  const loc = useLocation();
  const path = loc.url.pathname;

  return (
    <div class="min-h-screen bg-surface-container-lowest">
      <header class="sticky top-0 z-40 bg-surface-container/95 backdrop-blur-md border-b border-outline-variant/15 shadow-sm">
        <div class="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <a href="/admin" class="font-headline font-bold text-lg text-primary shrink-0 no-underline">
            Content admin
          </a>
          <nav class="flex flex-wrap gap-1.5">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                class={`text-xs font-bold px-3 py-2 rounded-xl transition-colors no-underline ${
                  navActive(path, item.href)
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-high text-on-surface border border-outline-variant/20 hover:border-primary/40'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <Slot />
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Admin — DevUtsav',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
};
