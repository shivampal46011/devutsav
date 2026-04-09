import React, { useState } from 'react';

const MarketListingModal = ({ listing, onClose }) => {
    const [activeTab, setActiveTab] = useState('Benefits');

    if (!listing) return null;

    const {
        name, description, location, mandir_name,
        tabs, packages, images, tithi
    } = listing;

    const imageToUse = images?.[0] || listing.png_default_image || 'https://images.unsplash.com/photo-1604068545831-7e8717a03009?auto=format&fit=crop&q=80&w=800';
    const startingPrice = packages && packages.length > 0 ? Math.min(...packages.map(p => p.price)) : (listing.price || null);

    const availableTabs = tabs ? Object.keys(tabs) : [];

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4 sm:p-6 pb-20 sm:pb-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden flex flex-col relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header & Image */}
                <div className="relative h-64 sm:h-72 shrink-0">
                    <img src={imageToUse} alt={name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                    
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 backdrop-blur-md transition-all"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="flex gap-2 mb-2">
                            {tithi && <span className="bg-primary/90 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">{tithi}</span>}
                            <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">location_on</span>
                                {location || mandir_name}
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black font-headline leading-tight">{name}</h2>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-surface flex flex-col">
                    <div className="p-6 pb-4">
                        <p className="text-on-surface-variant leading-relaxed text-sm">{description}</p>
                        
                        {/* Tab Headers */}
                        <div className="flex gap-2 overflow-x-auto pb-2 mt-6 scrollbar-hide border-b border-outline-variant/30">
                            {availableTabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`whitespace-nowrap px-4 py-2 font-bold text-sm tracking-wide transition-all border-b-2 ${activeTab === tab ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-on-surface'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="px-6 pb-6 pt-2 flex-1">
                        {activeTab === 'Benefits' && tabs.Benefits && (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {tabs.Benefits.map((b, i) => (
                                    <div key={i} className="flex gap-4 items-start p-4 bg-surface-variant rounded-2xl">
                                        {b.image && <img src={b.image} alt={b.title} className="w-12 h-12 rounded-full object-cover shrink-0 border border-outline-variant" />}
                                        <div>
                                            <h4 className="font-bold text-on-surface mb-1 text-sm">{b.title}</h4>
                                            <p className="text-xs text-on-surface-variant leading-relaxed">{b.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'Packages' && packages && (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {packages.map((pkg) => (
                                    <div key={pkg.id} className="border border-outline-variant/40 rounded-2xl overflow-hidden hover:border-primary/50 transition-colors flex flex-col">
                                        {pkg.image && <img src={pkg.image} alt={pkg.name} className="w-full h-32 object-cover bg-surface-variant" />}
                                        <div className="p-4 flex flex-col flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-on-surface">{pkg.name}</h4>
                                                <span className="font-black text-primary">₹{pkg.price}</span>
                                            </div>
                                            <p className="text-xs text-on-surface-variant leading-relaxed flex-1">{pkg.description}</p>
                                            <button className="mt-4 w-full py-2 bg-on-surface text-surface rounded-xl text-sm font-bold shadow hover:bg-primary transition-colors">
                                                Select Package
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'FAQs' && tabs.FAQs && (
                            <div className="space-y-4">
                                {tabs.FAQs.map((faq, i) => (
                                    <div key={i} className="bg-surface-variant p-4 rounded-xl">
                                        <h4 className="font-bold text-on-surface text-sm mb-2">{faq.title || faq.question}</h4>
                                        <p className="text-xs text-on-surface-variant leading-relaxed">{faq.description || faq.answer}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'Reviews' && tabs.Reviews && (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {tabs.Reviews.map((r, i) => (
                                    <div key={i} className="bg-surface-variant p-4 rounded-xl flex gap-3">
                                        {r.image && <img src={r.image} alt={r.name} className="w-10 h-10 rounded-full object-cover shrink-0" />}
                                        <div>
                                            <h4 className="font-bold text-sm text-on-surface">{r.name}</h4>
                                            <p className="text-xs text-on-surface-variant leading-relaxed mt-1 italic">"{r.description}"</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'Importance' && tabs.Importance && (
                            <div className="space-y-4">
                                {tabs.Importance.map((imp, i) => (
                                    <div key={i} className="border-l-4 border-primary pl-4 py-1">
                                        <h4 className="font-bold text-sm text-on-surface mb-1">{imp.title}</h4>
                                        <p className="text-xs text-on-surface-variant leading-relaxed">{imp.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'Puja Process' && tabs['Puja Process'] && (
                            <div className="relative border-l border-outline-variant/50 ml-4 space-y-6">
                                {tabs['Puja Process'].map((step, i) => (
                                    <div key={i} className="relative pl-6">
                                        <div className="absolute w-3 h-3 bg-primary rounded-full left-[-6px] top-1.5 shadow-[0_0_0_4px_#FDF9F5]"></div>
                                        <h4 className="font-bold text-sm text-on-surface mb-1">{step.title}</h4>
                                        <p className="text-xs text-on-surface-variant">{step.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'Videos' && tabs.Videos && (
                            <div className="grid gap-4">
                                {tabs.Videos.map((v, i) => (
                                    <a key={i} href={v.media} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-surface-variant p-3 rounded-xl hover:bg-primary/5 transition-colors cursor-pointer group">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                            <span className="material-symbols-outlined">play_arrow</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-on-surface">{v.title}</h4>
                                            <p className="text-xs text-primary font-bold mt-0.5">Watch on YouTube</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-between shrink-0">
                    <div>
                        <span className="text-xs text-on-surface-variant font-bold block uppercase tracking-wider mb-0.5">Starting At</span>
                        {startingPrice ? (
                            <span className="font-black text-xl text-primary">₹{startingPrice}</span>
                        ) : (
                            <span className="font-bold text-sm text-primary">Explore Options</span>
                        )}
                    </div>
                    <button className="bg-primary hover:bg-black text-white px-8 py-3 rounded-xl shadow-lg shadow-primary/20 hover:shadow-black/20 font-bold transition-all disabled:opacity-50">
                        Proceed to Book
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarketListingModal;
