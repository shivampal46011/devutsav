import React from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';

const Blog = () => {
    return (
        <main className="px-4 md:px-0 max-w-5xl mx-auto relative pt-6 min-h-screen">
            <section className="px-6 mb-12">
                <div className="relative overflow-hidden rounded-[2.5rem] bg-surface-container-high aspect-[4/1] flex flex-col justify-center p-8">
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-container opacity-90"></div>
                    </div>
                    <div className="relative z-10 space-y-4">
                        <h1 className="font-headline text-4xl font-bold tracking-tight text-white leading-[1.1]">
                            DevUtsav Knowledge Hub
                        </h1>
                        <p className="text-white/80 max-w-2xl font-body text-lg">
                            Explore deep spiritual wisdom, the significance of pujas, and guides on sacred items.
                        </p>
                    </div>
                </div>
            </section>

            <section className="px-6 mb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogPosts.map((post) => (
                        <Link 
                            key={post.id} 
                            to={`/blog/${post.slug}`}
                            className="bg-surface-container-low rounded-3xl overflow-hidden hover:shadow-lg transition-all border border-outline-variant/20 flex flex-col hover:-translate-y-1"
                        >
                            <div className="aspect-[16/9] w-full relative">
                                <img 
                                    src={post.image} 
                                    alt={post.title} 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/90 backdrop-blur-sm text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                        {post.category}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="font-headline text-xl font-bold text-on-surface mb-3 line-clamp-2">
                                    {post.title}
                               </h3>
                                <p className="text-on-surface-variant text-sm mb-6 line-clamp-3 flex-grow">
                                    {post.excerpt}
                                </p>
                                <div className="text-primary font-bold text-sm uppercase tracking-widest flex items-center gap-2 mt-auto">
                                    Read Article <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    );
};

export default Blog;
