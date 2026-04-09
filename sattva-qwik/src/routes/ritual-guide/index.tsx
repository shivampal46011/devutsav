import { component$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  return (
    <main class="px-4 md:px-0 max-w-5xl mx-auto relative pt-6">
      <section class="flex flex-col md:flex-row gap-12 mb-20 items-end">
        <div class="w-full md:w-1/2 order-2 md:order-1">
          <div class="flex gap-2 mb-4">
            <span class="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold uppercase tracking-widest rounded-full">Daily Ritual</span>
            <span class="px-3 py-1 bg-surface-container-highest text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">12 Min Read</span>
          </div>
          <h1 class="font-headline text-5xl md:text-7xl leading-tight text-on-background font-bold tracking-tight mb-6">
            The Sacred <span class="text-secondary">Ganesh</span> Vandana
          </h1>
          <p class="text-lg text-on-surface-variant leading-relaxed max-w-md">
            Invoking the Lord of Obstacles to clear your path toward spiritual clarity and material prosperity. A guide for your daily morning practice.
          </p>
        </div>
        <div class="w-full md:w-1/2 order-1 md:order-2">
          <div class="relative group">
            <div class="absolute -inset-4 bg-primary/5 rounded-3xl -rotate-2 group-hover:rotate-0 transition-transform duration-500" />
            <img
              class="w-full h-[300px] md:h-[500px] object-cover rounded-2xl relative z-10 asymmetric-image shadow-xl"
              alt="Ganesh Ritual"
              width={800}
              height={500}
              loading="lazy"
              decoding="async"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFN-2QJr8sQWVkIYuAsASJHC48a0aFcc5q6vY31MPeG4i3zYvYIMR5G0ci6U12kFVvZV8iDvBsjaJ97tZG4Eabe8dXj6BJuPgJzeXBGMBOqR-YyAPzzNHZqIIxEyNuIYApwY74XL51nGYVlTUv2IKvXqgHyXevtIyKv6ibpoQReZdYH_oBjZBIDdpmyFT5F3J4ZXUmRTY4gRBRDPMivszaPp2g8ASDXXFJ-l944epo-TrEmgSiCjd2iae61RBeUmB92JxPyJ_wPEoi"
            />
          </div>
        </div>
      </section>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20">
        <article class="md:col-span-8 space-y-12">
          <section class="bg-surface-container-low p-8 md:p-12 rounded-3xl relative overflow-hidden">
            <h2 class="font-headline text-2xl font-bold mb-6 flex items-center gap-3">
              <span class="w-8 h-[2px] bg-primary" /> Step 1: Purification
            </h2>
            <p class="text-on-surface-variant text-lg leading-relaxed mb-6">
              Before beginning, wash your hands and face. Sit in a comfortable cross-legged position facing East or North. Light a single <span class="text-primary font-bold">Pure Ghee Diya</span> to represent the inner light of consciousness.
            </p>
            <div class="bg-surface-container p-6 rounded-2xl border-l-4 border-primary">
              <p class="italic font-headline text-on-surface">"Om Gan Ganapataye Namo Namah. Shri Siddhivinayak Namo Namah..."</p>
            </div>
          </section>
        </article>

        <aside class="md:col-span-4 space-y-8">
          <div class="sticky top-24 bg-surface-container-high p-8 rounded-[2.5rem] shadow-sm">
            <h3 class="font-headline text-xl font-bold mb-2">Shop this Ritual</h3>
            <div class="space-y-6 mt-6">
              <div class="flex gap-4 group cursor-pointer">
                <div class="w-20 h-20 flex-shrink-0 bg-surface rounded-2xl overflow-hidden relative">
                  <img
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt="Brass Ganesha Idol"
                    width={80}
                    height={80}
                    loading="lazy"
                    decoding="async"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdc6ZmGOaJaN3aiGvuzoqKPAq5ks81YxESd4-E4jaXB-6Eja4C34M_peWesImeKxvUD_eQpdrGso3Dzj_wE8OJyDeKT4g4oKsu4od9q2R7vI9kSu6mpsYhYlY1EebP5fiy9Vf8dgsd_zMsBEWp3IfSoLVQ3AW-Ga2caqZzHwVUC0kaaSyOoI2LT5SuoTLJN7ii-ShoIXdCtTFxNqx8r8EN9dccYeJ6_pS4tAJzisrkT5aIYFraLzh92-VP4VinsfwNRa1NPcnuO-mz"
                  />
                </div>
                <div class="flex flex-col justify-center">
                  <h4 class="font-bold text-sm text-on-surface leading-tight">Brass Ganesha Idol</h4>
                  <p class="text-secondary font-bold text-lg mt-1">$45.00</p>
                </div>
              </div>
            </div>
            <button class="w-full mt-10 py-4 bg-gradient-to-br from-[#8f4e00] to-[#ff9933] text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity active:scale-[0.98]">
              Buy Entire Kit ($65.50)
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
});

export const head: DocumentHead = {
  title: 'Sacred Ganesh Vandana Ritual Guide — Devutsav',
  meta: [
    { name: 'description', content: 'A step-by-step guide to performing the Sacred Ganesh Vandana ritual for spiritual clarity and prosperity.' },
    { property: 'og:title', content: 'Sacred Ganesh Vandana — Devutsav Ritual Guide' },
  ],
};
