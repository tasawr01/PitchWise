import Link from 'next/link';

export default function JoinSection() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold text-primary font-heading mb-8 uppercase tracking-wider">BECOME A PART OF</h2>
                <div className="flex justify-center mb-16">
                    {/* Logo Icon */}
                    <div className="flex flex-col items-center">
                        <div className="relative w-16 h-16 text-primary mb-2">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-primary tracking-widest font-heading">PITCHWISE</span>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto relative">
                    {/* Connecting Lines (Simplified) */}
                    <div className="hidden md:block absolute -top-8 left-1/4 right-1/4 h-8 border-t-2 border-l-2 border-r-2 border-gray-300 rounded-t-3xl"></div>
                    <div className="hidden md:block absolute -top-8 left-1/2 h-4 w-0 border-l-2 border-gray-300 -translate-x-1/2"></div>

                    <div className="flex flex-col items-center">
                        <h3 className="text-lg font-bold text-primary mb-6 uppercase tracking-wide">INVEST IN TOMORROW</h3>
                        <Link href="#" className="bg-primary text-white px-10 py-4 rounded-md font-semibold hover:bg-primary/90 transition-colors w-full max-w-xs shadow-lg">
                            Join As Investor
                        </Link>
                    </div>
                    <div className="flex flex-col items-center">
                        <h3 className="text-lg font-bold text-primary mb-6 uppercase tracking-wide">LET'S FUEL YOUR VISION</h3>
                        <Link href="#" className="bg-primary text-white px-10 py-4 rounded-md font-semibold hover:bg-primary/90 transition-colors w-full max-w-xs shadow-lg">
                            Join As Founder
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
