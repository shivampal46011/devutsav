import React, { useState, useEffect, useRef } from 'react';
import DoshaResults from '../components/DoshaResults';

const loadingMessages = [
    "Fetching Kundali...",
    "Aligning cosmic coordinates...",
    "Analyzing planetary positions...",
    "Finding deep-rooted Doshas...",
    "Compiling spiritual remedies..."
];

const Analyzer = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        isd_code: '+91',
        email: '',
        dob: '',
        tob: '',
        pob: '',
        pob_city: '',
        pob_state: '',
        pob_country: '',
        place_id: '',
        pob_lat: null,
        pob_lon: null
    });
    
    // UI States
    const [tobUnknown, setTobUnknown] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
    
    // Geocoding States
    const [pobSuggestions, setPobSuggestions] = useState([]);
    const [isSearchingPob, setIsSearchingPob] = useState(false);
    const [focusedSuggestionIdx, setFocusedSuggestionIdx] = useState(-1);
    const [sessionToken, setSessionToken] = useState(() => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2));
    const suggestionRef = useRef(null);
    
    // Result States
    const [userSessionId, setUserSessionId] = useState('');
    const [userId, setUserId] = useState(null);
    const [report, setReport] = useState(null);
    const [kundaliLink, setKundaliLink] = useState(null);

    // Click Outside listener for suggestions
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
                setPobSuggestions([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        let intervalId;
        if (step === 3) {
            setLoadingMessageIdx(0);
            intervalId = setInterval(() => {
                setLoadingMessageIdx(prev => (prev + 1) % loadingMessages.length);
            }, 800);
        }
        return () => clearInterval(intervalId);
    }, [step]);

    // Initialize session ID and ISD code
    useEffect(() => {
        let storedId = localStorage.getItem('user_session_id');
        if (!storedId) {
            storedId = 'session_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('user_session_id', storedId);
        }
        setUserSessionId(storedId);

        // Autofill ISD mapping via Timezone
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz.includes('America')) setFormData(prev => ({ ...prev, isd_code: '+1' }));
        else if (tz.includes('Europe/London')) setFormData(prev => ({ ...prev, isd_code: '+44' }));
        else setFormData(prev => ({ ...prev, isd_code: '+91' }));

        // Optional: Fire session tracked API
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/tracking/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_session_id: storedId,
                first_landing_url: window.location.pathname,
                browser_details: navigator.userAgent
            })
        }).catch(err => console.log('Session track soft fail', err));
    }, []);

    // Google Places Proxy Geocoding
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (formData.pob.length >= 3 && !formData.pob_lat) {
                setIsSearchingPob(true);
                setFocusedSuggestionIdx(-1);
                try {
                    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5001';
                    const res = await fetch(`${apiBase}/api/location/autocomplete?input=${encodeURIComponent(formData.pob)}&sessiontoken=${sessionToken}`);
                    const data = await res.json();
                    setPobSuggestions(Array.isArray(data) ? data : []);
                } catch (e) {
                    console.error("Geocoding error", e);
                } finally {
                    setIsSearchingPob(false);
                }
            } else {
                setPobSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [formData.pob, formData.pob_lat]);

    // Keyboard support for suggestion dropdown
    const handlePobKeyDown = (e) => {
        if (pobSuggestions.length === 0) return;
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setFocusedSuggestionIdx(prev => Math.min(prev + 1, pobSuggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setFocusedSuggestionIdx(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
            if (focusedSuggestionIdx >= 0 && focusedSuggestionIdx < pobSuggestions.length) {
                e.preventDefault();
                selectPob(pobSuggestions[focusedSuggestionIdx]);
            }
        }
    };

    // Helper: Track CTA Clicks
    const trackClick = (ctaName) => {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/tracking/click`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_session_id: userSessionId,
                url: window.location.pathname,
                cta: ctaName
            })
        }).catch(err => console.log('Click track soft fail', err));
    };

    const handleInputChange = (e) => {
        if (e.target.name === 'pob') {
            // Reset lat/lon and place specifics if user manually alters city text
            setFormData({ ...formData, pob: e.target.value, pob_lat: null, pob_lon: null, pob_city: '', pob_state: '', pob_country: '', place_id: '' });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const selectPob = async (place) => {
        setFormData(prev => ({
            ...prev,
            pob: String(place.description),
            place_id: place.place_id
        }));
        setPobSuggestions([]);
        setFocusedSuggestionIdx(-1);
        setIsSearchingPob(true);
        
        try {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const res = await fetch(`${apiBase}/api/location/details?place_id=${place.place_id}&sessiontoken=${sessionToken}`);
            const details = await res.json();
            
            if (details && details.lat) {
                setFormData(prev => ({
                    ...prev,
                    pob_lat: details.lat,
                    pob_lon: details.lng,
                    pob_city: details.city,
                    pob_state: details.state,
                    pob_country: details.country
                }));
            }
            // Reset token after successful selection as per Google Maps best practice
            setSessionToken(crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2));
        } catch (e) {
            console.error("Details mapping failed", e);
        } finally {
            setIsSearchingPob(false);
        }
    };

    const validateForm = () => {
        if (!formData.name.trim()) return "Name is required.";
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(formData.phone)) return "Invalid 10-digit phone number.";
        
        if (formData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) return "Invalid Email.";
        }

        if (step === 2) {
            if (!formData.dob) return "Date of Birth is required.";
            if (!tobUnknown && !formData.tob) return "Time of Birth is required. Or check 'I don't know my Birth Time'.";
            if (!formData.pob.trim() || !formData.pob_lat) return "Please select a valid Place of Birth from the dropdown suggestions.";
        }
        return "";
    };

    const handleNext = async () => {
        setValidationError('');
        if (step === 1) {
            const err = validateForm();
            if (err) return setValidationError(err);
            trackClick('Analyzer_Step_1_Next');
            
            // DevPunya Create User Integration (Silent on Continue)
            try {
                const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5001';
                await fetch(`${apiBase}/api/market/auth/devpunya`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        isdCode: formData.isd_code,
                        phone: formData.phone,
                        fullname: formData.name,
                        email: formData.email || undefined,
                        platform: 'web'
                    })
                });
            } catch (err) { console.error('DevPunya init fail on continue', err); }

            setStep(2);
        }
    };

    const handleGenerateKundali = async (e) => {
        e.preventDefault();
        setValidationError('');
        const err = validateForm();
        if (err) return setValidationError(err);

        trackClick('Analyze_My_Kundali_Dosha');
        setIsAnalyzing(true);
        setStep(3); // Moving to loading/analysis UI

        try {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5001';

            // 1. Create DevUtsav Application User
            const userRes = await fetch(`${apiBase}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_session_id: userSessionId,
                    ...formData
                })
            });
            const userData = await userRes.json();
            const uId = userData?.user?._id;
            if (uId) setUserId(uId);


            // 3. Generate Kundali & Dosha via New LLM API Endpoint with minimum fake wait
            const apiPromise = fetch(`${apiBase}/api/kundali/analyze-dosha`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: uId,
                    user_session_id: userSessionId,
                    dob: formData.dob,
                    tob: tobUnknown ? null : formData.tob,
                    tob_unknown: tobUnknown,
                    pob: formData.pob,
                    pob_lat: formData.pob_lat,
                    pob_lon: formData.pob_lon
                })
            });
            const waitPromise = new Promise(resolve => setTimeout(resolve, 3000));
            
            const [kundaliRes] = await Promise.all([apiPromise, waitPromise]);
            
            const kData = await kundaliRes.json();
            if (kData.report) setReport(kData.report);
            if (kData.kundali_link) setKundaliLink(kData.kundali_link);

            setStep(4); // Results Page
        } catch (err) {
            console.error(err);
            setValidationError('Connection issue with the cosmic oracle. Please try again.');
            setStep(2);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <main className="px-4 md:px-0 max-w-5xl mx-auto relative pt-12 pb-24">
            {step < 3 && (
                <section className="px-6 mb-10 text-center">
                    <h2 className="font-headline text-4xl md:text-5xl font-black text-on-surface leading-tight tracking-tight mb-4">
                        Kundali Dosha <span className="text-secondary italic">Calculator</span>
                    </h2>
                    <p className="text-on-surface-variant font-body text-lg max-w-xl mx-auto">
                        Enter your precise birth details. Our AI will analyze your planetary alignments and identify hidden life blockages.
                    </p>
                </section>
            )}

            {step === 1 && (
                <section className="px-6 max-w-md mx-auto">
                    <div className="bg-surface-container rounded-[2rem] p-8 shadow-sm border border-outline-variant/10">
                        <div className="flex items-center justify-between mb-8">
                            <span className="font-label text-xs uppercase tracking-widest text-primary font-bold">Step 1 of 2</span>
                            <span className="text-sm font-bold text-on-surface-variant">Personal Info</span>
                        </div>

                        {validationError && (
                            <div className="bg-error/10 text-error text-sm font-bold px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">error</span>
                                {validationError}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Full Name *</label>
                                <input name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. Rahul Sharma" />
                            </div>
                            <div className="flex gap-3">
                                <div className="w-[30%]">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">ISD</label>
                                    <input name="isd_code" value={formData.isd_code} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-center focus:outline-none focus:ring-2 focus:ring-primary/50" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Phone *</label>
                                    <input name="phone" type="tel" value={formData.phone} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="10 Digits" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Email (Optional)</label>
                                <input name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="rahul@example.com" />
                            </div>
                        </div>

                        <button onClick={handleNext} className="w-full mt-8 py-4 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all text-sm tracking-widest uppercase">
                            Continue <span className="material-symbols-outlined text-sm ml-2">arrow_forward</span>
                        </button>
                    </div>
                </section>
            )}

            {step === 2 && (
                <section className="px-6 max-w-md mx-auto">
                    <div className="bg-surface-container rounded-[2rem] p-8 shadow-sm border border-outline-variant/10">
                        <div className="flex items-center justify-between mb-8">
                            <button onClick={() => setStep(1)} className="text-on-surface-variant hover:text-primary transition-colors flex items-center text-sm font-bold uppercase tracking-widest">
                                <span className="material-symbols-outlined text-sm mr-1">arrow_back</span> Back
                            </button>
                            <span className="text-sm font-bold text-on-surface-variant">Birth Details</span>
                        </div>

                        {validationError && (
                            <div className="bg-error/10 text-error text-sm font-bold px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">error</span>
                                {validationError}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Date of Birth *</label>
                                <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Time of Birth (24Hr)</label>
                                    <label className="flex items-center gap-2 text-xs font-bold text-on-surface-variant cursor-pointer group">
                                        <input type="checkbox" checked={tobUnknown} onChange={() => setTobUnknown(!tobUnknown)} className="w-4 h-4 rounded text-primary focus:ring-primary/50 cursor-pointer" />
                                        <span className="group-hover:text-primary transition-colors">I don't know</span>
                                    </label>
                                </div>
                                <input disabled={tobUnknown} type="time" name="tob" value={formData.tob} onChange={handleInputChange} className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed" />
                            </div>

                            <div className="relative" ref={suggestionRef}>
                                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Place of Birth *</label>
                                <div className="relative">
                                    <input type="text" name="pob" placeholder="e.g. New Delhi, India" value={formData.pob} onChange={handleInputChange} onKeyDown={handlePobKeyDown} autoComplete="off" className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" />
                                    {isSearchingPob && (
                                        <div className="absolute right-4 top-3.5 w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                    )}
                                </div>
                                <span className="text-[10px] text-on-surface-variant/60 mt-2 block pl-1">Uses Google Places data. Make sure to select matched city!</span>

                                {/* Suggestion Dropdown */}
                                {formData.pob.length >= 3 && !isSearchingPob && pobSuggestions.length === 0 && !formData.pob_lat && (
                                    <div className="absolute top-[80px] w-full bg-white border border-outline-variant/30 rounded-xl shadow-2xl z-20 overflow-hidden px-4 py-3 text-sm font-medium text-on-surface-variant italic">
                                        No cities found...
                                    </div>
                                )}
                                {pobSuggestions.length > 0 && (
                                    <div className="absolute top-[80px] w-full bg-white border border-outline-variant/30 rounded-xl shadow-2xl z-20 overflow-hidden max-h-56 overflow-y-auto">
                                        {pobSuggestions.map((place, idx) => (
                                            <div 
                                                key={idx} 
                                                className={`px-4 py-3 hover:bg-surface-variant border-b border-outline-variant/10 cursor-pointer text-sm font-medium transition-colors ${focusedSuggestionIdx === idx ? 'bg-surface-variant text-primary' : 'text-on-surface'}`}
                                                onClick={() => selectPob(place)}
                                            >
                                                {place.description}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button onClick={handleGenerateKundali} className="w-full mt-8 py-4 bg-gradient-to-r from-secondary to-tertiary text-white font-bold rounded-xl shadow-lg shadow-secondary/20 active:scale-95 transition-all text-sm tracking-widest uppercase flex justify-center items-center gap-2">
                            <span className="material-symbols-outlined text-xl" style={{fontVariationSettings: "'FILL' 1"}}>auto_awesome</span>
                            Analyze My Kundali Dosha
                        </button>
                    </div>
                </section>
            )}

            {step === 3 && (
                <section className="px-6 flex flex-col items-center justify-center min-h-[40vh]">
                    <div className="relative w-32 h-32 mb-8">
                        <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                        <div className="absolute inset-[3px] rounded-full border-b-4 border-l-4 border-primary animate-[spin_2s_linear_infinite]"></div>
                        <div className="absolute inset-[8px] rounded-full border-t-4 border-r-4 border-secondary animate-[spin_3s_linear_infinite_reverse]"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="material-symbols-outlined text-5xl text-primary animate-pulse" style={{fontVariationSettings: "'FILL' 1"}}>stars</span>
                        </div>
                    </div>
                    <h3 className="font-headline text-2xl font-bold text-on-surface mb-3 min-h-[32px] transition-all">
                        {loadingMessages[loadingMessageIdx]}
                    </h3>
                    <div className="w-48 bg-surface-variant rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-secondary animate-pulse" style={{ width: `${((loadingMessageIdx + 1) / loadingMessages.length) * 100}%`, transition: 'width 0.8s ease' }}></div>
                    </div>
                </section>
            )}

            {step === 4 && (
                <section className="px-6 max-w-3xl mx-auto space-y-12">
                    <DoshaResults report={report} kundaliLink={kundaliLink} />
                </section>
            )}
        </main>
    );
};

export default Analyzer;
