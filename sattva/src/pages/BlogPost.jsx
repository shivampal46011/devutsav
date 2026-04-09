import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';

const BlogPost = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    
    // Compute post during render
    const post = blogPosts.find(p => p.slug === slug);

    useEffect(() => {
        if (!post) {
            navigate('/blog', { replace: true });
        } else {
            document.title = `${post.title} | DevUtsav`;
        }
    }, [post, navigate]);

    if (!post) return null;

    return (
        <article className="px-4 md:px-0 max-w-4xl mx-auto relative pt-6 pb-20">
            {/* Header / Hero */}
            <header className="mb-10 px-6 mt-4">
                <Link to="/blog" className="inline-flex items-center text-primary text-sm font-bold uppercase tracking-widest hover:underline mb-8">
                    <span className="material-symbols-outlined text-sm mr-2">arrow_back</span>
                    Back to Hub
                </Link>
                <div className="flex items-center gap-3 mb-6">
                    <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {post.category}
                    </span>
                    <span className="text-on-surface-variant text-sm font-label">
                        5 min read
                    </span>
                </div>
                <h1 className="font-headline text-3xl md:text-5xl font-bold text-on-surface leading-tight mb-6">
                    {post.title}
                </h1>
                <p className="text-on-surface-variant text-lg md:text-xl font-body leading-relaxed max-w-2xl mb-8">
                    {post.excerpt}
                </p>
                
                <div className="w-full aspect-[16/9] md:aspect-[21/9] rounded-[2rem] overflow-hidden shadow-xl shadow-surface-container-high relative">
                    <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
            </header>

            {/* Content Body */}
            <main className="px-6 relative">
                <div className="prose prose-lg md:prose-xl prose-headings:font-headline prose-headings:font-bold prose-headings:text-on-surface prose-p:text-on-surface-variant prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-li:text-on-surface-variant prose-strong:text-on-surface max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>
                
                {/* CTA Section */}
                <div className="mt-16 bg-surface-container-lowest border border-primary/20 rounded-3xl p-8 md:p-12 text-center shadow-lg shadow-primary/5">
                    <h3 className="font-headline text-2xl md:text-3xl font-bold text-on-surface mb-4">
                        Take the Next Step
                    </h3>
                    <p className="text-on-surface-variant mb-8 max-w-xl mx-auto">
                        Experience the transformative power firsthand. Whether you are looking for divine intervention or scared objects to protect your aura, we have you covered.
                    </p>
                    
                    {post.ctaLink.startsWith('http') ? (
                        <a 
                            href={post.ctaLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform"
                        >
                            {post.ctaText}
                            <span className="material-symbols-outlined text-lg">open_in_new</span>
                        </a>
                    ) : (
                        <Link 
                            to={post.ctaLink}
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform"
                        >
                            {post.ctaText}
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </Link>
                    )}
                </div>
            </main>
        </article>
    );
};

export default BlogPost;
