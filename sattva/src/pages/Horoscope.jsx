import React, { useState, useEffect } from 'react';
import { getZodiacSign, ZODIAC_SIGNS } from '../utils/zodiac';

const Horoscope = () => {
    // Session State
    const [userSessionId, setUserSessionId] = useState('');
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', dob: '' });
    const [validationError, setValidationError] = useState('');

    // Horoscope State
    const [activeSign, setActiveSign] = useState('Aries');
    const [timeframe, setTimeframe] = useState('daily'); // daily, weekly, monthly
    const [readings, setReadings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let storedId = localStorage.getItem('user_session_id');
        if (!storedId) {
            storedId = 'session_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('user_session_id', storedId);
        }
        setUserSessionId(storedId);

        trackClick('Horoscope_Page_View');

        // Check if we already captured profile this session
        const hasCompletedProfile = localStorage.getItem('horo_profile_done');
        const defaultSign = localStorage.getItem('horo_zodiac_sign') || 'Aries';
        setActiveSign(defaultSign);

        if (!hasCompletedProfile) {
            setShowModal(true);
        } else {
            fetchHoroscope(defaultSign, 'daily');
        }
    }, []);

    const trackClick = (ctaName) => {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/tracking/click`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_session_id: userSessionId, url: window.location.pathname, cta: ctaName })
        }).catch(() => {});
    };

    const fetchHoroscope = async (sign, time) => {
        setIsLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/horoscope?zodiac=${sign}&timeframe=${time}`);
            const data = await res.json();
            if (data.readings) {
                setReadings(data.readings);
            }
        } catch (err) {
            console.error('Failed to fetch predictions', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Modal Handlers
    const handleSkip = () => {
        trackClick('Horoscope_Modal_Skip');
        localStorage.setItem('horo_profile_done', 'true');
        setShowModal(false);
        fetchHoroscope('Aries', timeframe);
    };

    const handleSubmitProfile = async (e) => {
        e.preventDefault();
        setValidationError('');
        if (!formData.name || !formData.phone || !formData.dob) {
            return setValidationError('All fields are required.');
        }

        trackClick('Horoscope_Modal_Submit');
        
        // Calculate Sign
        const userSign = getZodiacSign(formData.dob);
        setActiveSign(userSign);
        localStorage.setItem('horo_zodiac_sign', userSign);
        localStorage.setItem('horo_profile_done', 'true');

        // Upsert User
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_session_id: userSessionId,
                name: formData.name,
                phone: formData.phone,
                dob: formData.dob
            })
        }).catch(err => console.log('User Upsert failed', err));

        setShowModal(false);
        fetchHoroscope(userSign, timeframe);
    };

    // UI Handlers
    const handleSignChange = (sign) => {
        trackClick(`Horoscope_Sign_${sign}`);
        setActiveSign(sign);
        fetchHoroscope(sign, timeframe);
    };

    const handleTimeframeChange = (time) => {
        trackClick(`Horoscope_Timeframe_${time}`);
        setTimeframe(time);
        fetchHoroscope(activeSign, time);
    };

    // Category Icons Map
    const getCategoryIcon = (category) => {
        const cat = category.toLowerCase();
        if (cat.includes('love') || cat.includes('relation')) return 'favorite';
        if (cat.includes('job') || cat.includes('career')) return 'work';
        if (cat.includes('money') || cat.includes('finance')) return 'monetization_on';
        if (cat.includes('health') || cat.includes('vitality')) return 'health_and_safety';
        if (cat.includes('business')) return 'storefront';
        return 'auto_awesome';
    };

    return (
        <main className="pb-32 relative bg-[#FDF9F5] min-h-screen">
            {/* Header / Config Bar */}
            <div className="bg-surface-container sticky top-0 z-40 shadow-sm border-b border-outline-variant/20 pt-16 pb-4">
                <div className="max-w-4xl mx-auto">
                    {/* Timeframe Toggles */}
                    <div className="flex justify-center mb-6 px-4">
                        <div className="flex bg-surface-container-highest rounded-2xl p-1 max-w-sm w-full shadow-inner">
                            {['daily', 'weekly', 'monthly'].map(t => (
                                <button 
                                    key={t}
                                    onClick={() => handleTimeframeChange(t)}
                                    className={`flex-1 py-2 text-sm font-bold capitalize rounded-xl transition-all ${timeframe === t ? 'bg-white text-primary shadow shadow-primary/10' : 'text-on-surface-variant hover:text-on-surface'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Zodiac Strip */}
                    <div className="flex overflow-x-auto no-scrollbar gap-3 px-6 pb-2 snap-x">
                        {ZODIAC_SIGNS.map(sign => (
                            <button 
                                key={sign.name}
                                onClick={() => handleSignChange(sign.name)}
                                className={`snap-center shrink-0 flex flex-col items-center justify-center w-[72px] h-[80px] rounded-2xl border-2 transition-all ${activeSign === sign.name ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40'}`}
                            >
                                <span className="text-2xl mb-1">{sign.emoji}</span>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${activeSign === sign.name ? 'text-primary' : 'text-on-surface-variant'}`}>{sign.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <section className="px-6 py-10 max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-10 border-b border-outline-variant/30 pb-6">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-4xl shadow-inner">
                        {ZODIAC_SIGNS.find(s => s.name === activeSign)?.emoji || '♈️'}
                    </div>
                    <div>
                        <h2 className="font-headline text-3xl font-black text-on-surface uppercase tracking-tight">{activeSign}</h2>
                        <p className="text-sm font-bold text-primary tracking-widest uppercase">{timeframe} Forecast</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-on-surface-variant font-medium animate-pulse">Reading the cosmic alignments...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {readings.map((reading, idx) => (
                            <div key={idx} className="bg-white rounded-3xl p-6 shadow-xl shadow-primary/5 border border-primary/10 relative overflow-hidden group">
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
                                        <span className="material-symbols-outlined text-xl" style={{fontVariationSettings: "'FILL' 1"}}>{getCategoryIcon(reading.category)}</span>
                                    </div>
                                    <h3 className="font-headline text-xl font-bold text-on-surface">{reading.category}</h3>
                                </div>
                                <p className="font-body text-base text-on-surface-variant leading-relaxed">
                                    {reading.prediction}
                                </p>
                            </div>
                        ))}
                        {readings.length === 0 && !isLoading && (
                            <div className="col-span-full text-center py-10 text-on-surface-variant">
                                No predictions available at this moment.
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Skippable Profile Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-container-highest/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary"></div>
                        <h3 className="font-headline text-2xl font-black text-on-surface mb-2">Personalize Your Stars</h3>
                        <p className="text-sm text-on-surface-variant mb-6">Connect your cosmic blueprint permanently to your profile.</p>
                        
                        {validationError && (
                            <p className="text-xs font-bold text-error bg-error/10 p-2 rounded-lg mb-4">{validationError}</p>
                        )}

                        <form onSubmit={handleSubmitProfile} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Name</label>
                                <input name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-2.5 outline-none text-sm" placeholder="e.g. Rahul" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Phone</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-2.5 outline-none text-sm" placeholder="10 Digits" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Date of Birth</label>
                                <input type="date" name="dob" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl px-4 py-2.5 outline-none text-sm text-on-surface-variant" />
                            </div>
                            
                            <div className="pt-4 flex flex-col gap-3">
                                <button type="submit" className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-xl active:scale-95 transition-transform text-sm shadow-lg shadow-primary/20">
                                    Reveal My Horoscope
                                </button>
                                <button type="button" onClick={handleSkip} className="w-full py-3 text-on-surface-variant font-bold text-sm hover:text-primary transition-colors">
                                    Skip for Now
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Horoscope;
