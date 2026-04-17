'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateBlogPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        author: 'Admin'
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('excerpt', formData.excerpt);
            submitData.append('content', formData.content);
            submitData.append('author', formData.author);
            if (imageFile) {
                submitData.append('imageFile', imageFile);
            }

            const res = await fetch('/api/admin/blogs', {
                method: 'POST',
                body: submitData
            });

            if (res.ok) {
                alert('Blog created successfully!');
                router.push('/admin/blogs');
            } else {
                const data = await res.json();
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Failed to create blog:', error);
            alert('Failed to submit form');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/blogs" className="text-gray-500 hover:text-[#0B2C4A]">
                    &larr; Back
                </Link>
                <h2 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">Create New Blog</h2>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0B2C4A] outline-none"
                            placeholder="Blog Post Title"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Excerpt</label>
                        <textarea
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleChange}
                            required
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0B2C4A] outline-none"
                            placeholder="A short summary of the blog post"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Content</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            required
                            rows={15}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0B2C4A] outline-none"
                            placeholder="Write your blog content here... (Standard text)"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Image PC</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setImageFile(e.target.files[0]);
                                    }
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0B2C4A] outline-none bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Author Name</label>
                            <input
                                type="text"
                                name="author"
                                value={formData.author}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0B2C4A] outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-[#0B2C4A] text-white rounded-md font-bold hover:bg-[#0a233b] transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Publishing...' : 'Publish Blog'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
