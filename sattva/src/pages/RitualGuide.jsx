import React from 'react';

const RitualGuide = () => {
    return (
        <main className="px-4 md:px-0 max-w-5xl mx-auto relative pt-6">
            <section className="flex flex-col md:flex-row gap-12 mb-20 items-end">
                <div className="w-full md:w-1/2 order-2 md:order-1">
                    <div className="flex gap-2 mb-4">
                        <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold uppercase tracking-widest rounded-full">Daily Ritual</span>
                        <span className="px-3 py-1 bg-surface-container-highest text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">12 Min Read</span>
                    </div>
                    <h1 className="font-headline text-5xl md:text-7xl leading-tight text-on-background font-bold tracking-tight mb-6">
                        The Sacred <span className="text-secondary">Ganesh</span> Vandana
                    </h1>
                    <p className="text-lg text-on-surface-variant leading-relaxed max-w-md">
                        Invoking the Lord of Obstacles to clear your path toward spiritual clarity and material prosperity. A guide for your daily morning practice.
                    </p>
                </div>
                <div className="w-full md:w-1/2 order-1 md:order-2">
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-primary/5 rounded-3xl -rotate-2 group-hover:rotate-0 transition-transform duration-500"></div>
                        <img alt="Ganesh Vandana ritual" className="w-full h-[300px] md:h-[500px] object-cover rounded-2xl relative z-10 asymmetric-image shadow-xl" loading="lazy" decoding="async" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFN-2QJr8sQWVkIYuAsASJHC48a0aFcc5q6vY31MPeG4i3zYvYIMR5G0ci6U12kFVvZV8iDvBsjaJ97tZG4Eabe8dXj6BJuPgJzeXBGMBOqR-YyAPzzNHZqIIxEyNuIYApwY74XL51nGYVlTUv2IKvXqgHyXevtIyKv6ibpoQReZdYH_oBjZBIDdpmyFT5F3J4ZXUmRTY4gRBRDPMivszaPp2g8ASDXXFJ-l944epo-TrEmgSiCjd2iae61RBeUmB92JxPyJ_wPEoi" />
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20">
                <article className="md:col-span-8 space-y-12">
                    <section className="bg-surface-container-low p-8 md:p-12 rounded-3xl relative overflow-hidden">
                        <h3 className="font-headline text-2xl font-bold mb-6 flex items-center gap-3">
                            <span className="w-8 h-[2px] bg-primary"></span> Step 1: Purification
                        </h3>
                        <p className="text-on-surface-variant text-lg leading-relaxed mb-6">
                            Before beginning, wash your hands and face. Sit in a comfortable cross-legged position facing East or North. Light a single <span className="text-primary font-bold">Pure Ghee Diya</span> to represent the inner light of consciousness.
                        </p>
                        <div className="bg-surface-container p-6 rounded-2xl border-l-4 border-primary">
                            <p className="italic font-headline text-on-surface">"Om Gan Ganapataye Namo Namah. Shri Siddhivinayak Namo Namah..."</p>
                        </div>
                    </section>
                </article>

                <aside className="md:col-span-4 space-y-8">
                    <div className="sticky top-24 bg-surface-container-high p-8 rounded-[2.5rem] shadow-sm">
                        <h4 className="font-headline text-xl font-bold mb-2">Shop this Ritual</h4>
                        <div className="space-y-6 mt-6">
                            <div className="flex gap-4 group cursor-pointer">
                                <div className="w-20 h-20 flex-shrink-0 bg-surface rounded-2xl overflow-hidden relative">
                                    <img alt="Brass Ganesha Idol" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" decoding="async" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdc6ZmGOaJaN3aiGvuzoqKPAq5ks81YxESd4-E4jaXB-6Eja4C34M_peWesImeKxvUD_eQpdrGso3Dzj_wE8OJyDeKT4g4oKsu4od9q2R7vI9kSu6mpsYhYlY1EebP5fiy9Vf8dgsd_zMsBEWp3IfSoLVQ3AW-Ga2caqZzHwVUC0kaaSyOoI2LT5SuoTLJN7ii-ShoIXdCtTFxNqx8r8EN9dccYeJ6_pS4tAJzisrkT5aIYFraLzh92-VP4VinsfwNRa1NPcnuO-mz"/>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <h5 className="font-bold text-sm text-on-surface leading-tight">Brass Ganesha Idol</h5>
                                    <p className="text-secondary font-bold text-lg mt-1">$45.00</p>
                                </div>
                            </div>
                        </div>
                        <button className="w-full mt-10 py-4 bg-gradient-to-br from-[#8f4e00] to-[#ff9933] text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-opacity active:scale-[0.98]">
                            Buy Entire Kit ($65.50)
                        </button>
                    </div>
                </aside>
            </div>
        </main>
    );
};

export default RitualGuide;
