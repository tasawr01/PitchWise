import { Star, Bookmark, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function FeaturedPitches() {
    const pitches = [
        {
            id: 1,
            name: 'EcoCharge',
            industry: 'CleanTech',
            description: 'Sustainable battery swapping network for electric 2-wheelers in urban areas.',
            ask: 'PKR 5M',
            raised: 'PKR 3.2M',
            progress: 64,
            rating: 4.8,
            trending: true,
            color: 'bg-green-100 text-green-700',
        },
        {
            id: 2,
            name: 'MediConnect',
            industry: 'HealthTech',
            description: 'Telemedicine platform connecting rural patients with specialist doctors.',
            ask: 'PKR 8M',
            raised: 'PKR 1.5M',
            progress: 18,
            rating: 4.5,
            trending: false,
            color: 'bg-blue-100 text-blue-700',
        },
        {
            id: 3,
            name: 'LearnLoop',
            industry: 'EdTech',
            description: 'AI-powered personalized learning assistant for high school students.',
            ask: 'PKR 3M',
            raised: 'PKR 2.8M',
            progress: 93,
            rating: 4.9,
            trending: true,
            color: 'bg-yellow-100 text-yellow-700',
        },
        {
            id: 4,
            name: 'AgriFlow',
            industry: 'AgriTech',
            description: 'Smart irrigation system using IoT sensors to optimize water usage.',
            ask: 'PKR 4.5M',
            raised: 'PKR 1.2M',
            progress: 26,
            rating: 4.6,
            trending: false,
            color: 'bg-green-100 text-green-700',
        },
        {
            id: 5,
            name: 'FinWise',
            industry: 'FinTech',
            description: 'Micro-investment app for students to start investing with as little as PKR 500.',
            ask: 'PKR 10M',
            raised: 'PKR 4.5M',
            progress: 45,
            rating: 4.7,
            trending: true,
            color: 'bg-purple-100 text-purple-700',
        },
        {
            id: 6,
            name: 'ShopLocal',
            industry: 'E-commerce',
            description: 'Hyper-local marketplace connecting neighborhood stores with digital buyers.',
            ask: 'PKR 2M',
            raised: 'PKR 0.5M',
            progress: 25,
            rating: 4.4,
            trending: false,
            color: 'bg-orange-100 text-orange-700',
        },
    ];

    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-heading">
                            Featured Pitches
                        </h2>
                        <p className="mt-2 text-lg text-muted-foreground">
                            Discover the most promising startups raising capital right now.
                        </p>
                    </div>
                    <Link
                        href="#"
                        className="mt-4 sm:mt-0 inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80"
                    >
                        View all pitches <span aria-hidden="true" className="ml-1">&rarr;</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {pitches.map((pitch) => (
                        <div
                            key={pitch.id}
                            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 duration-300"
                        >
                            <div className="p-6 flex-1">
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${pitch.color}`}>
                                        {pitch.industry}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {pitch.trending && (
                                            <TrendingUp className="h-4 w-4 text-accent-green" />
                                        )}
                                        <button className="text-muted-foreground hover:text-primary transition-colors">
                                            <Bookmark className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                    {pitch.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                    {pitch.description}
                                </p>

                                <div className="flex items-center gap-1 mb-6">
                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                    <span className="text-sm font-medium text-foreground">{pitch.rating}</span>
                                    <span className="text-sm text-muted-foreground">(12 reviews)</span>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Target: <span className="font-semibold text-foreground">{pitch.ask}</span></span>
                                        <span className="font-bold text-primary">{pitch.progress}%</span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out group-hover:bg-accent-blue"
                                            style={{ width: `${pitch.progress}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-muted-foreground text-right">
                                        Raised: {pitch.raised}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-secondary/50 px-6 py-4 border-t border-border/50 flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="h-6 w-6 rounded-full bg-gray-300 border-2 border-white" />
                                    ))}
                                </div>
                                <button className="text-sm font-semibold text-primary hover:underline">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
