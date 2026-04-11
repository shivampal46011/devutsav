import React, { useState, useEffect } from 'react';

const Puja = () => {
    const [pujas, setPujas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMarketData = async () => {
            setIsLoading(true);
            try {
                const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5001';
                
                // Fetch Pujas
                const pujaRes = await fetch(`${apiBase}/api/market/pujas`);
                const pujaData = await pujaRes.json();
                
                // Safely extract from DevPunya typical node structures
                const pList = pujaData?.results?.data || pujaData?.results || pujaData || [];
                
                setPujas(Array.isArray(pList) ? pList : []);
            } catch (error) {
                console.error("Failed to load DevPunya market data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMarketData();
    }, []);

    const renderCard = (item, type) => {
        // DevPunya JSON Extractor Logic
        const id = item.id;
        const title = item.name || 'Sacred Ritual';
        const image = item.images?.[0] || item.png_default_image || item.image_url || 'https://images.unsplash.com/photo-1604068545831-7e8717a03009?auto=format&fit=crop&q=80&w=800';
        
        let price = item.price || null;
        if (item.packages && Array.isArray(item.packages) && item.packages.length > 0) {
            price = Math.min(...item.packages.map(p => p.price));
        }

        const location = item.location;
        const mandirName = item.mandir_name;
        const fullLocation = [mandirName, location].filter(Boolean).join(', ') || 'Remote / Online';

        const isVip = item.vip ? true : false;

        const startingAtDate = item.startingAt 
            ? new Date(item.startingAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
            }) : null;

        const benefits = item.benefits ? item.benefits.split(',').map(b => b.trim()).filter(Boolean) : [];

        return (
            <div 
                key={id} 
                className="bg-white rounded-2xl overflow-hidden shadow-lg shadow-primary/5 flex flex-col border border-outline-variant/20 hover:border-primary/40 hover:-translate-y-1 transition-all cursor-pointer group"
                onClick={() => window.open(`https://devpunya.com/pooja/v2/${id}?utm_content=devutsav&affiliate_id=34180`, '_blank')}
            >
                    {/* Image Section */}
                    <div className="h-56 relative bg-white flex items-center justify-center p-2 border-b border-outline-variant/20">
                        <img 
                            alt={title} 
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-xl" 
                            src={image} 
                        />
                        
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary shadow-sm border border-primary/10">
                            {type}
                        </div>

                        {isVip && (
                            <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-amber-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-md flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">workspace_premium</span>
                                VIP
                            </div>
                        )}
                    </div>

                {/* Content Section aligned exactly as requested */}
                <div className="p-5 flex flex-col flex-1 relative gap-2">
                    {/* 1. Name */}
                    <h3 className="font-headline text-lg font-bold text-on-surface leading-snug">{title}</h3>
                    
                    {/* 2. Tithi */}
                    {item.tithi && (
                        <div className="inline-block bg-primary/5 border border-primary/20 px-2 py-0.5 rounded text-[11px] uppercase font-bold tracking-wider text-primary self-start">
                            {item.tithi}
                        </div>
                    )}

                    {/* 3. startingAt Date */}
                    {startingAtDate && (
                        <div className="flex items-center gap-1.5 text-on-surface-variant mt-1">
                            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                            <span className="text-xs font-bold">{startingAtDate}</span>
                        </div>
                    )}

                    {/* 4. mandir_name, location */}
                    <div className="flex items-start gap-1.5 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px] mt-0.5">location_on</span>
                        <span className="text-xs font-semibold leading-relaxed">{fullLocation}</span>
                    </div>

                    {/* 5. benefits */}
                    {benefits.length > 0 && (
                        <div className="mt-2 text-xs text-on-surface-variant leading-relaxed">
                            <span className="font-bold text-on-surface">Benefits: </span>
                            <ul className="list-disc list-inside mt-1 space-y-0.5">
                                {benefits.slice(0, 3).map((benefit, idx) => (
                                    <li key={idx} className="line-clamp-1">{benefit}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Footer Action */}
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-outline-variant/30">
                        <div>
                            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-0.5">Packages From</span>
                            {price ? (
                                <span className="font-black text-[17px] text-primary">₹{price}</span>
                            ) : (
                                <span className="font-bold text-sm text-primary">Explore Options</span>
                            )}
                        </div>
                        <button className="bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors px-4 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center gap-1">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <main className="px-4 md:px-0 max-w-5xl mx-auto relative pt-8 pb-32 min-h-screen bg-[#FDF9F5]">
        <section className="w-full px-6 mb-8 bg-gradient-to-b from-primary/10 to-transparent pt-12 pb-8 border-b border-primary/10">
          <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tight text-on-surface leading-tight mb-4 text-left">
            Sacred <span className="text-primary italic font-serif tracking-normal">Pujas</span>
          </h1>
          <p className="text-on-surface-variant text-lg font-medium max-w-lg mb-8 text-left border-l-4 border-primary/30 pl-4">
            Book auspicious rituals across India's most prominent temples.
          </p>
          <div className="flex flex-col gap-4 text-base font-bold text-on-surface-variant max-w-md w-full">
            <div className="flex items-center justify-start gap-3">
              <span className="material-symbols-outlined text-primary text-2xl flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> 
              <span className="text-left leading-tight">Puja Performed by Vedic Pandits</span>
            </div>
            <div className="flex items-center justify-start gap-3">
              <span className="material-symbols-outlined text-primary text-2xl flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>assignment_ind</span> 
              <span className="text-left leading-tight">Puja Complete in Your Name-Gotra</span>
            </div>
            <div className="flex items-center justify-start gap-3">
              <span className="material-symbols-outlined text-primary text-2xl flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>featured_video</span> 
              <span className="text-left leading-tight">Video Proof Shared & Prasad Delivery</span>
            </div>
          </div>
        </section>

                <section className="px-4 md:px-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center py-20">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                            <p className="text-sm font-bold text-primary animate-pulse tracking-widest uppercase">Fetching Live Listings...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pujas.length === 0 && (
                                <div className="col-span-full py-16 text-center text-on-surface-variant bg-surface-container rounded-3xl border border-dashed border-outline-variant/50">
                                    <span className="material-symbols-outlined text-5xl mb-3 opacity-50">search_off</span>
                                    <p className="font-bold">No Pujas found at this moment.</p>
                                </div>
                            )}

                            {pujas.map(item => renderCard(item, 'Live Puja'))}
                        </div>
                    )}
                </section>
            </main>
        </>
    );
};

export default Puja;
