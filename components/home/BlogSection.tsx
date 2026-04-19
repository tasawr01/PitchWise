import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';

export default async function BlogSection() {
    await dbConnect();
    
    // Fetch latest 3 blogs
    const rawBlogs = await Blog.find({}).sort({ publishedAt: -1 }).limit(3);
    
    // Transform to plain objects for the component
    const posts = rawBlogs.map(blog => ({
        id: blog._id.toString(),
        title: blog.title,
        excerpt: blog.excerpt,
        image: blog.imageUrl || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        date: new Date(blog.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }));

    if (posts.length === 0) return null;

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <div className="text-sm font-bold text-accent-blue uppercase tracking-wider mb-2">OUR BLOG</div>
                        <h2 className="text-3xl font-bold text-primary font-heading">Unveiling Our Latest Blog Content</h2>
                    </div>
                    <Link href="/blogs" className="hidden sm:flex items-center gap-2 text-primary font-semibold hover:text-accent-blue transition-colors">
                        View All Posts <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <div key={post.id} className="group cursor-pointer">
                            <Link href={`/blogs/${post.id}`}>
                                <div className="aspect-video rounded-xl overflow-hidden mb-4">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="text-xs text-muted-foreground mb-2">{post.date}</div>
                                <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-accent-blue transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center gap-1 text-sm font-semibold text-primary group-hover:text-accent-blue transition-colors">
                                    Read More <ArrowRight className="h-4 w-4" />
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
