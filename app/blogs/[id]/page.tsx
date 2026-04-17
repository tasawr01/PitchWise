'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function BlogDetailsPage() {
    const params = useParams();
    const [blog, setBlog] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchBlog();
        }
    }, [params.id]);

    const fetchBlog = async () => {
        try {
            const res = await fetch(`/api/blogs/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setBlog(data.blog);
            }
        } catch (error) {
            console.error('Failed to fetch blog', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-white flex flex-col">
            <Header />
            
            <div className="flex-grow pt-24 pb-16 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link href="/blogs" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 mb-8 transition-colors">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to all articles
                </Link>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : blog ? (
                    <article>
                        <header className="mb-10 text-center">
                            <div className="flex justify-center items-center gap-3 text-sm text-gray-500 mb-4 font-medium uppercase tracking-wider">
                                <span className="text-blue-600">{blog.author}</span>
                                <span>•</span>
                                <span>{new Date(blog.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'})}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
                                {blog.title}
                            </h1>
                            <p className="text-xl text-gray-500 max-w-2xl mx-auto italic">
                                "{blog.excerpt}"
                            </p>
                        </header>

                        <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 shadow-lg">
                            <Image
                                src={blog.imageUrl || '/assets/sample-blog.jpg'}
                                alt={blog.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>

                        <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap">
                            {blog.content}
                        </div>
                    </article>
                ) : (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-bold text-gray-900">Article Not Found</h2>
                        <p className="text-gray-500 mt-2">The article you're looking for might have been removed or is temporarily unavailable.</p>
                        <Link href="/blogs" className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                            Return to Blogs
                        </Link>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
