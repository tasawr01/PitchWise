export default function CategoryStrip() {
    const categories = [
        "FinTech",
        "EdTech",
        "AI & ML",
        "HealthTech",
        "AgriTech",
        "Retail",
        "E-commerce",
        "SaaS",
        "CleanTech",
        "Logistics",
        "Social Impact",
        "Blockchain"
    ];

    return (
        <div className="w-full border-y border-border/50 bg-secondary/30 py-6">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 sm:pb-0 mask-linear-fade">
                    <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap mr-2">
                        Trending Industries:
                    </span>
                    {categories.map((category) => (
                        <button
                            key={category}
                            className="inline-flex items-center rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary whitespace-nowrap"
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
