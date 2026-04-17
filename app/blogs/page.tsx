'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function BlogsPage() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const res = await fetch('/api/blogs');
            const data = await res.json();
            setBlogs(data.blogs || []);
        } catch (error) {
            console.error('Failed to fetch blogs', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            
            <div className="flex-grow pt-24 pb-12 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#0B2C4A] tracking-tight mb-4">
                        PitchWise <span className="text-blue-600">Insights</span>
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Discover the latest news, success stories, and expert advice for startups and investors.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B2C4A]"></div>
                    </div>
                ) : blogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map((blog) => (
                            <Link href={`/blogs/${blog._id}`} key={blog._id} className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden transform hover:-translate-y-1">
                                <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                                    <Image
                                        src={blog.imageUrl || '/assets/sample-blog.jpg'}
                                        alt={blog.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                        <span className="font-medium text-blue-600">{blog.author}</span>
                                        <span>•</span>
                                        <span>{new Date(blog.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric'})}</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                        {blog.title}
                                    </h2>
                                    <p className="text-gray-600 line-clamp-3 mb-4 flex-grow">
                                        {blog.excerpt}
                                    </p>
                                    <div className="mt-auto inline-flex items-center text-sm font-semibold text-blue-600">
                                        Read Article 
                                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15M9 11l3 3L22 4" />
                        </svg>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Articles Yet</h3>
                        <p className="text-gray-500">Check back soon for insights and updates!</p>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
