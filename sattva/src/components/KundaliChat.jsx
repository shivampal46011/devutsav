import React, { useState, useRef, useEffect } from 'react';

const KundaliChat = ({ userSessionId }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Pranam. I have reviewed your Kundali. What guidance do you seek?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [paywallReached, setPaywallReached] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || paywallReached) return;

        const userMessage = { role: 'user', content: input };
        const updatedHistory = [...messages, userMessage];
        
        setMessages(updatedHistory);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/chat/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_session_id: userSessionId,
                    message: input,
                    history: messages
                })
            });

            const data = await response.json();

            if (data.error === 'paywall_reached') {
                setPaywallReached(true);
            } else {
                setMessages([...updatedHistory, { role: 'assistant', content: data.content }]);
            }
        } catch (error) {
            console.error('Chat API Error:', error);
            setMessages([...updatedHistory, { role: 'assistant', content: 'Connection issue. Please try again later.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 flex flex-col h-[500px] overflow-hidden shadow-lg shadow-primary/5 relative">
            <div className="bg-primary/5 p-4 border-b border-primary/10 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>psychology</span>
                <div>
                    <h3 className="font-headline text-lg font-bold text-on-surface">Cosmic Guide</h3>
                    <p className="text-xs text-on-surface-variant">Ask questions about your chart</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-surface-container text-on-surface rounded-tl-sm'}`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-surface-container rounded-2xl p-4 rounded-tl-sm flex items-center gap-1">
                            <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {paywallReached && (
                <div className="absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                    <span className="material-symbols-outlined text-5xl text-primary mb-4" style={{fontVariationSettings: "'FILL' 1"}}>lock</span>
                    <h4 className="font-headline text-2xl font-bold text-on-surface mb-2">Deep Insights Unlocked</h4>
                    <p className="text-sm text-on-surface-variant mb-6 max-w-sm">
                        You have reached the limit of free cosmic questions. Unlock premium access to dive deeper into your planetary alignments.
                    </p>
                    <button className="w-full max-w-xs py-4 bg-gradient-to-r from-secondary to-tertiary text-white font-bold rounded-xl shadow-lg shadow-secondary/20 active:scale-95 transition-transform">
                        Unlock Unlimited Chat
                    </button>
                </div>
            )}

            <div className="p-4 border-t border-outline-variant/10 bg-surface-container-lowest">
                <div className="flex items-center gap-2 bg-surface-container-low rounded-xl p-1 pr-2 border border-outline-variant/20 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="E.g., Why am I struggling with career?"
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 px-3 outline-none"
                        disabled={paywallReached || isLoading}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={paywallReached || isLoading || !input.trim()}
                        className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center disabled:opacity-50 transition-opacity"
                    >
                        <span className="material-symbols-outlined text-sm">send</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KundaliChat;
