'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Spinner from '@/components/Spinner';

export default function AdminBlogsPage() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/blogs');
            const data = await res.json();
            setBlogs(data.blogs || []);
        } catch (error) {
            console.error('Failed to fetch blogs', error);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this blog post?')) return;
        try {
            const res = await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Blog deleted successfully');
                fetchBlogs();
            } else {
                alert('Failed to delete blog');
            }
        } catch (error) {
            console.error(error);
            alert('Error deleting blog');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-extrabold text-[#0B2C4A] tracking-tight">Blog Management</h2>
                <Link
                    href="/admin/blogs/create"
                    className="bg-[#0B2C4A] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#0a233b] transition-colors"
                >
                    + Add New Blog
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center items-center p-12">
                    <Spinner className="w-8 h-8 text-[#0B2C4A]" />
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#0B2C4A] text-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Title</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Author</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {blogs.map((blog) => (
                                <tr key={blog._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-[#0B2C4A]">{blog.title}</div>
                                        <div className="text-sm text-gray-500 truncate max-w-sm">{blog.excerpt}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {blog.author}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(blog.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/admin/blogs/${blog._id}/edit`}
                                                className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(blog._id)}
                                                className="text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {blogs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No blogs found. Create your first one.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
