'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Spinner from '@/components/Spinner';

export default function EditBlogPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        imageUrl: '',
        author: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchBlog();
        }
    }, [params.id]);

    const fetchBlog = async () => {
        try {
            const res = await fetch(`/api/admin/blogs/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    title: data.blog.title,
                    excerpt: data.blog.excerpt,
                    content: data.blog.content,
                    imageUrl: data.blog.imageUrl,
                    author: data.blog.author
                });
            } else {
                alert('Failed to load blog');
                router.push('/admin/blogs');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('excerpt', formData.excerpt);
            submitData.append('content', formData.content);
            submitData.append('author', formData.author);
            if (formData.imageUrl) {
                submitData.append('imageUrl', formData.imageUrl);
            }
            if (imageFile) {
                submitData.append('imageFile', imageFile);
            }

            const res = await fetch(`/api/admin/blogs/${params.id}`, {
                method: 'PUT',
                body: submitData
            });

            if (res.ok) {
                alert('Blog updated successfully!');
                router.push('/admin/blogs');
            } else {
                const data = await res.json();
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Failed to update blog:', error);
            alert('Failed to submit form');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-12"><Spinner className="w-8 h-8 text-[#0B2C4A]" /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/blogs" className="text-gray-500 hover:text-[#0B2C4A]">
                    &larr; Back
                </Link>
                <h2 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">Edit Blog</h2>
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
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Update Image (Leave empty to keep current)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setImageFile(e.target.files[0]);
                                    }
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0B2C4A] outline-none bg-white mb-2"
                            />
                            {formData.imageUrl && !imageFile && (
                                <div className="text-xs text-gray-500">Current: <a href={formData.imageUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">View Image</a></div>
                            )}
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
                            disabled={saving}
                            className="px-6 py-2 bg-[#0B2C4A] text-white rounded-md font-bold hover:bg-[#0a233b] transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
