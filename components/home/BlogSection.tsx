import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function BlogSection() {
    const posts = [
        {
            id: 1,
            title: "Navigating the Future of Student Entrepreneurship",
            excerpt: "Learn how student founders are reshaping the global startup landscape with innovative ideas.",
            image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
            date: "Mar 15, 2024",
        },
        {
            id: 2,
            title: "VC Funding Trends in 2024: What You Need to Know",
            excerpt: "Expert insights into what venture capitalists are looking for in early-stage startups this year.",
            image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
            date: "Mar 12, 2024",
        },
        {
            id: 3,
            title: "Building a Strong Team: The Key to Startup Success",
            excerpt: "Why your co-founders and early hires are the most important investment you'll make.",
            image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80",
            date: "Mar 10, 2024",
        },
    ];

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <div className="text-sm font-bold text-accent-blue uppercase tracking-wider mb-2">OUR BLOG</div>
                        <h2 className="text-3xl font-bold text-primary font-heading">Unveiling Our Latest Blog Content</h2>
                    </div>
                    <Link href="#" className="hidden sm:flex items-center gap-2 text-primary font-semibold hover:text-accent-blue transition-colors">
                        View All Posts <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <div key={post.id} className="group cursor-pointer">
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
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
