import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const AdminPanel = () => {
    const [blogs, setBlogs] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [newPrompt, setNewPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState("");
    
    const fetchAdminData = async () => {
        try {
            const [blogsRes, schedulesRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/admin/blogs`),
                fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/admin/schedules`)
            ]);
            setBlogs(await blogsRes.json());
            setSchedules(await schedulesRes.json());
        } catch (err) {
            console.error("Failed to fetch admin data:", err);
        }
    };

    useEffect(() => {
        fetchAdminData();
        
        // Countdown to next trigger (Midnight local time)
        const timer = setInterval(() => {
            const now = new Date();
            const nextMidnight = new Date(now);
            nextMidnight.setHours(24, 0, 0, 0);
            
            const diff = nextMidnight - now;
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            
            setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        }, 1000);
        
        return () => clearInterval(timer);
    }, []);

    const handleCreateSchedule = async (e) => {
        e.preventDefault();
        try {
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/admin/schedules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt_text: newPrompt })
            });
            fetchAdminData();
            setNewPrompt("");
            alert("Schedule created successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to create schedule.");
        }
    };

    const handleGenerateManual = async (prompt) => {
        setLoading(true);
        try {
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/admin/blogs/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            fetchAdminData();
            alert(`Generated a blog based on prompt: ${prompt}`);
        } catch (err) {
            console.error(err);
            alert("Failed to generate blog manually.");
        }
        setLoading(false);
    };

    return (
        <main className="px-4 md:px-8 max-w-7xl mx-auto pt-8 pb-16 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">
                    Content Control Center
                </h1>
                
                {/* Countdown Display */}
                <div className="bg-surface-container-high rounded-full px-6 py-2 border border-outline-variant/20 shadow-sm flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary animate-pulse" style={{fontVariationSettings: "'FILL' 1"}}>schedule</span>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Next Auto-Generation</p>
                        <p className="font-headline font-bold text-secondary text-lg leading-none">{timeLeft || "00:00:00"}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Schedules */}
                <div className="lg:col-span-1 space-y-6">
                    <section className="bg-surface-container-high rounded-3xl p-6 shadow-sm">
                        <h2 className="font-headline text-2xl font-bold mb-4">Prompt Schedules</h2>
                        <form onSubmit={handleCreateSchedule} className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">New Daily Prompt</label>
                                <textarea 
                                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    rows="3"
                                    value={newPrompt}
                                    onChange={(e) => setNewPrompt(e.target.value)}
                                    placeholder="e.g. Write a daily astrology forecast for Aries..."
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full bg-primary text-on-primary font-bold py-2 rounded-lg text-sm transition-transform active:scale-95">
                                Add Schedule
                            </button>
                        </form>

                        <div className="space-y-3">
                            {schedules.length === 0 ? (
                                <p className="text-sm text-on-surface-variant italic">No schedules active.</p>
                            ) : (
                                schedules.map(sched => (
                                    <div key={sched._id} className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 flex flex-col gap-3">
                                        <p className="text-sm font-medium">{sched.prompt_text}</p>
                                        <div className="flex gap-2 items-center">
                                            <span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-1 rounded">Daily</span>
                                            <button 
                                                onClick={() => handleGenerateManual(sched.prompt_text)}
                                                disabled={loading}
                                                className={`text-[10px] px-3 py-1.5 rounded font-bold ml-auto transition-opacity ${loading ? 'bg-outline text-surface cursor-not-allowed opacity-50' : 'bg-primary text-on-primary hover:opacity-90'}`}
                                            >
                                                {loading ? "Generating..." : "Generate Now"}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column: Generated Blogs */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-surface-container rounded-3xl p-6 shadow-sm min-h-[500px]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-headline text-2xl font-bold">Generated Blogs</h2>
                            <button onClick={fetchAdminData} className="text-primary hover:underline font-bold text-sm flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">refresh</span> Refresh
                            </button>
                        </div>

                        <div className="space-y-6">
                            {blogs.length === 0 ? (
                                <div className="text-center py-12 text-on-surface-variant">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">article</span>
                                    <p>No generated blogs yet.</p>
                                </div>
                            ) : (
                                blogs.map(blog => (
                                    <div key={blog._id} className="bg-surface-container-high rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
                                        <div className="bg-inverse-surface text-inverse-on-surface p-4 flex justify-between items-center">
                                            <h3 className="font-bold">{blog.title}</h3>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${blog.status === 'PUBLISHED' ? 'bg-secondary text-white' : 'bg-surface text-on-surface'}`}>
                                                {blog.status}
                                            </span>
                                        </div>
                                        <div className="p-6 prose prose-sm max-w-none text-on-surface">
                                            <ReactMarkdown>{blog.content_md}</ReactMarkdown>
                                        </div>
                                        <div className="border-t border-outline-variant/10 p-4 bg-surface-container-low flex justify-end gap-3">
                                            {blog.status === 'DRAFT' && (
                                                <button className="bg-secondary text-white px-4 py-2 font-bold rounded-lg text-sm hover:opacity-90">
                                                    Publish
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default AdminPanel;
