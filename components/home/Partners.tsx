export default function Partners() {
    return (
        <section className="bg-primary py-12 border-t border-white/10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <p className="text-sm font-medium text-white/60 uppercase tracking-wider">Trusted by 500+ Companies</p>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Placeholder Logos - Using text for now as SVGs are verbose */}
                    <div className="text-2xl font-bold text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                        METRODY
                    </div>
                    <div className="text-2xl font-bold text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                        ALPHAWAVE
                    </div>
                    <div className="text-2xl font-bold text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                        TECHTREE
                    </div>
                    <div className="text-2xl font-bold text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                        GLOBAL
                    </div>
                    <div className="text-2xl font-bold text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                        STRONG
                    </div>
                </div>
            </div>
        </section>
    );
}
