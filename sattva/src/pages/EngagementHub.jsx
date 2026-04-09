import React from 'react';

const EngagementHub = () => {
    return (
        <main className="px-4 md:px-8 max-w-7xl mx-auto pt-6">
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-center">
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center gap-2">
                        <span className="bg-tertiary-fixed text-on-tertiary-fixed px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Community Hub</span>
                        <div className="h-px flex-grow bg-outline-variant/30"></div>
                    </div>
                    <h2 className="font-headline text-5xl md:text-7xl font-bold text-primary tracking-tight leading-tight">
                        Share your <span className="italic text-secondary">Sacred</span> Space.
                    </h2>
                    <p className="text-on-surface-variant text-lg max-w-xl leading-relaxed">
                        Connect with fellow seekers, showcase your festive marigold arrangements, and earn blessing points for spreading light.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-4 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>add_a_photo</span>
                            Post Your Setup
                        </button>
                        <button className="bg-surface-container-highest text-primary px-8 py-4 rounded-xl font-bold hover:bg-surface-container-high transition-all">
                            Ask a Question
                        </button>
                    </div>
                </div>

                {/* Gamification Card */}
                <div className="lg:col-span-5 bg-surface-container rounded-[2.5rem] p-8 shadow-sm border border-outline-variant/10 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <div>
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <p className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Your Rewards</p>
                                <h3 className="font-headline text-3xl font-bold text-primary">Blessing Points</h3>
                            </div>
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md border border-outline-variant/20">
                                <span className="material-symbols-outlined text-primary text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>stars</span>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2 mb-8">
                            <span className="text-6xl font-headline font-bold text-secondary tracking-tighter">2,480</span>
                            <span className="text-on-surface-variant font-bold">BP</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bento Grid Feed */}
            <section className="mb-16">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="font-headline text-3xl font-bold text-primary">Sacred Setups</h2>
                        <p className="text-on-surface-variant">Handpicked moments from our global community.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="sm:col-span-2 sm:row-span-2 group relative rounded-[2rem] overflow-hidden bg-surface-container-high border border-outline-variant/10 shadow-lg min-h-[400px]">
                        <img alt="Diwali Corner with Marigolds and Brass" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOsslIa_Aua-PYIwb565Y_x_TrdxMxlWkI5YUJYcAGLaA_oyZWNmiFldVd1tWWMXYjuG89Op_iXPcyFyLDDdhj6LafLu8FstFNTyl5PD1yliRubvtqCgI_Zb3pFjQelydl2XntBSvEgLiyLAIYniQmmqyOJ-g2-NO4PC6yhObXDIOqC6ZKAD4OVqM1p4pnJsJWrgjOXDDUMPWFKqyiidVQ1ijmbEMR70ClHzcChy6mQr9MyyVX_T6jADRBNbaJbJNBCA6xKyvC5u5u" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 transition-opacity"></div>
                        <div className="absolute bottom-0 left-0 p-8 w-full">
                            <h3 className="text-2xl font-headline font-bold text-white mb-2 leading-tight">My Diwali Corner: Marigolds &amp; Brass</h3>
                        </div>
                    </div>
                    
                    <div className="group relative aspect-square rounded-[2rem] overflow-hidden bg-surface-container-high shadow-md">
                        <img alt="Sacred community setup" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" decoding="async" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOKSda1B9HtA2wJGmGv7dZeSTF2IRoWckTZcTwDV9U64tQlwpxpXAI4yyd_mBvbPXQ8XWVvL8HQXY_txyhuQvzB_QSgZ0t-gWgDPrVgNx5jRD3zGDFk5EUW0ZYrV4DaZyu4L7EEXiEoQuN5LCzWGr1b73wFGi_5e59jA5b0KlxPLo1Du24ehnFpJJ13MSYuGuye_gDJbPHGNBKeQElv8eglzDgXPqhk18ST93hmCYcd04vpnmoaMeoTUaGqN92jP0k6wgumtHtsiRW" />
                    </div>

                    <div className="group relative aspect-square rounded-[2rem] overflow-hidden bg-surface-container-high shadow-md">
                        <img alt="Festival decorations" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" decoding="async" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuv_VEPxMnh8BySAe_2Z7uTc5OpOgrgCwUIAYq1q_g1AlAnkQXNJjLgra1pxdONpFMnCsobIVTOGIfU4aGyp_qTUGTiWRt_XRGCScna0a40faoX4YGjHjRe1AKKmBhXHVLlxW8cVWU-_KRPBK9IO2TVMhk6RUj4LNU1CmK2T_hODXTmOO4KM9RDdyHnTLbjDkozAU8fSGkCWmIrimB3SaHKQLAfJAeb2NDwjBB6TSnZTu8T3uHFKhLjuVH3HRYle25x7whc6XtdIwS" />
                    </div>
                </div>
            </section>
        </main>
    );
};

export default EngagementHub;
