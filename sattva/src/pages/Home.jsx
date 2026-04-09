import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <main className="px-4 md:px-0 max-w-5xl mx-auto relative pt-6">
            {/* Hero Section */}
            <section className="px-6 mb-12">
                <div className="relative overflow-hidden rounded-[2.5rem] bg-surface-container-high aspect-[4/5] flex flex-col justify-end">
                    <div className="absolute inset-0">
                        {/* Prakul to provide the new first Image */}
                        <img alt="Sacred Background" className="w-full h-full object-cover" fetchPriority="high" loading="eager" decoding="async" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6m6CVg0u7pbLG3B1wW4Dm7l9CWT56CWaYpE9aPMNMmGvKlLV_KktgdRX0d4-7xN8CSetlqNez5myg0jSFrCgXFcl0_yaVs_WNysNviVa_qxLtAx8pVR4543-d5hagasUL-4bo2BOtcsTV5HC5KjipbcfksiYi_CAPQWkEan2mrbr54j7LgjdNp6zUso1haxVjABbBv3t4YO6HfJm1yxVuF4mdT9twx5dZ0IRcn4DflGdRlTysm1D-f89bStlRfrMnSJOfBEha_Ajj" />
                    </div>
                </div>
            </section>

            {/* Quick Tools Bento Grid */}
            <section className="px-6 mb-16">
                <div className="mb-6">
                    <h3 className="font-headline text-2xl font-bold text-on-surface">Sacred Tools</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Link to="/analyzer" className="col-span-2 bg-surface-container-low rounded-3xl p-6 relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col h-full justify-between min-h-[160px]">
                            <span className="material-symbols-outlined text-primary text-4xl mb-4" style={{fontVariationSettings: "'FILL' 1"}}>psychology_alt</span>
                            <div>
                                <h4 className="font-headline text-xl font-bold text-on-surface mb-1">Kundali Dosha Calculator</h4>
                                <p className="text-sm text-on-surface-variant leading-relaxed">Divine mapping of your current life challenges.</p>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 -translate-y-4 translate-x-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-[120px]">storm</span>
                        </div>
                    </Link>
                    <Link to="/horoscope" className="bg-surface-container-highest rounded-3xl p-5 aspect-square flex flex-col justify-between">
                        <span className="material-symbols-outlined text-secondary text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                        <h4 className="font-headline text-base font-bold text-on-surface">Daily Horoscope</h4>
                    </Link>
                    <Link to="/whisper" className="bg-tertiary-fixed rounded-3xl p-5 aspect-square flex flex-col justify-between">
                        <span className="material-symbols-outlined text-on-tertiary-fixed text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>record_voice_over</span>
                        <h4 className="font-headline text-base font-bold text-on-surface">Nandi Whisper</h4>
                    </Link>
                    <Link to="/blog" className="col-span-2 bg-primary/5 border border-primary/20 rounded-3xl p-6 relative overflow-hidden group mt-2">
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <h4 className="font-headline text-xl font-bold text-primary mb-1">Knowledge Hub</h4>
                                <p className="text-sm text-on-surface-variant leading-relaxed">Spiritual wisdom & sacred item guides</p>
                            </div>
                            <span className="material-symbols-outlined text-primary text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>menu_book</span>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Daily Guidance */}
            <section className="mb-16">
                <div className="px-6 mb-6">
                    <h3 className="font-headline text-2xl font-bold text-on-surface">Daily Guidance</h3>
                    <p className="text-on-surface-variant font-label text-xs uppercase tracking-widest">Auspicious Insights for Today</p>
                </div>
                <div className="flex overflow-x-auto gap-6 px-6 no-scrollbar snap-x">
                    <div className="snap-center min-w-[85%] bg-surface-container rounded-2xl p-8 border border-outline-variant/10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-8 h-[1px] bg-primary"></span>
                            <span className="text-xs font-bold uppercase tracking-widest text-primary">Today's Tip</span>
                        </div>
                        <p className="font-headline text-lg italic text-on-surface leading-relaxed">
                            "Offer water to the rising sun today to strengthen your inner resolve and clear professional obstacles."
                        </p>
                    </div>
                    <div className="snap-center min-w-[85%] bg-secondary-fixed rounded-2xl p-8 border border-outline-variant/10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-8 h-[1px] bg-secondary"></span>
                            <span className="text-xs font-bold uppercase tracking-widest text-secondary">Festival</span>
                        </div>
                        <h5 className="font-headline text-2xl font-bold mb-2">Pradosh Vrat</h5>
                        <p className="text-sm text-on-secondary-fixed-variant leading-relaxed">
                            A powerful time for seeking Lord Shiva's blessings to dissolve karmic debts.
                        </p>
                    </div>
                </div>
            </section>


        </main>
    );
};

export default Home;
