import { component$ } from '@builder.io/qwik';
import { Link, type DocumentHead } from '@builder.io/qwik-city';

const blogPosts = [
  { title: 'Maa Baglamukhi', slug: 'maa-baglamukhi', category: 'Deities' },
  { title: '5 Mukhi Rudraksha Mala', slug: '5-mukhi-rudraksha-mala', category: 'Sacred Items' },
  { title: 'Karungali Malai', slug: 'karungali-malai', category: 'Sacred Items' },
  { title: 'Karungali Rudraksha Hybrid Mala', slug: 'karungali-rudraksha-hybrid-mala', category: 'Sacred Items' },
  { title: 'Kaal Bhairav', slug: 'kaal-bhairav', category: 'Deities' },
  { title: 'Maa Varahi', slug: 'maa-varahi', category: 'Deities' },
  { title: 'Pitra Dosha', slug: 'pitra-dosha', category: 'Astrology' },
  { title: 'MahaMrityunjaya Jaap', slug: 'mahamrityunjaya-jaap', category: 'Rituals' },
  { title: 'Panchamrit Rudrabhishek', slug: 'panchamrit-rudrabhishek', category: 'Rituals' },
  { title: 'Tulasi Mala', slug: 'tulasi-mala', category: 'Sacred Items' },
];

export default component$(() => {
  return (
    <main class="px-4 md:px-0 max-w-5xl mx-auto relative pt-6 min-h-screen">
      <section class="px-6 mb-12">
        <div class="relative overflow-hidden rounded-[2.5rem] bg-surface-container-high aspect-[4/1] min-h-[200px] flex flex-col justify-center p-8">
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
          {blogPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} class="group bg-surface-container-low border border-outline-variant/30 rounded-3xl overflow-hidden hover:-translate-y-1 transition-transform hover:shadow-lg hover:shadow-primary/5 flex flex-col">
              <div class="p-6 flex-1 flex flex-col items-start">
                <span class="text-xs font-bold uppercase tracking-widest text-primary mb-4 bg-primary/10 px-3 py-1.5 rounded-full">{post.category}</span>
                <h3 class="font-headline text-2xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors leading-tight">{post.title}</h3>
                <p class="text-on-surface-variant text-sm line-clamp-3 mt-auto">Read our complete guide on the profound significance and cosmic benefits of {post.title.includes('Maa') || post.title.includes('Bhairav') ? '' : 'the '}{post.title}.</p>
              </div>
              <div class="bg-surface-container/30 px-6 py-4 flex items-center justify-between border-t border-outline-variant/10 text-primary">
                <span class="text-sm font-bold tracking-wider uppercase">Read Article</span>
                <span class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-2">arrow_forward</span>
              </div>
            </Link>
          ))}
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
