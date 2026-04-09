import { component$ } from '@builder.io/qwik';
import { Link, type DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <main class="px-4 md:px-0 max-w-5xl mx-auto relative pt-6 min-h-screen">
      <section class="px-6 mb-12">
        <div class="relative overflow-hidden rounded-[2.5rem] bg-surface-container-high aspect-[4/1] flex flex-col justify-center p-8">
          <div class="absolute inset-0">
            <div class="absolute inset-0 bg-gradient-to-r from-primary to-primary-container opacity-90" />
          </div>
          <div class="relative z-10 space-y-4">
            <h1 class="font-headline text-4xl font-bold tracking-tight text-white leading-[1.1]">DevUtsav Knowledge Hub</h1>
            <p class="text-white/80 max-w-2xl font-body text-lg">Explore deep spiritual wisdom, the significance of pujas, and guides on sacred items.</p>
          </div>
        </div>
      </section>

      <section class="px-6 mb-16">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Blog posts are statically imported from data layer */}
          <div class="col-span-full py-16 text-center text-on-surface-variant bg-surface-container rounded-3xl border border-dashed border-outline-variant/50">
            <span class="material-symbols-outlined text-5xl mb-3 opacity-50">auto_stories</span>
            <p class="font-bold">Articles loading...</p>
            <p class="text-sm mt-2">Blog posts render dynamically via the slug pages.</p>
          </div>
        </div>
      </section>
    </main>
  );
});

export const head: DocumentHead = {
  title: 'Knowledge Hub — Devutsav',
  meta: [
    { name: 'description', content: 'Explore spiritual wisdom, the significance of pujas, Dosha remedies, and guides on sacred items on the Devutsav Knowledge Hub.' },
  ],
};
