'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white font-sans selection:bg-[#0B2C4A] selection:text-white">
            <Header />

            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80"
                        alt="Background"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-[#0B2C4A]/90 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B2C4A] via-transparent to-transparent" />
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center text-white">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl font-bold font-heading mb-6 tracking-tight"
                    >
                        We Are PitchWise.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto font-light leading-relaxed"
                    >
                        Bridging the gap between ambitious visionaries and the capital that fuels them.
                    </motion.p>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-100 rounded-full opacity-50 blur-2xl" />
                            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-100 rounded-full opacity-50 blur-2xl" />
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <Image
                                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                                    alt="Team collaboration"
                                    width={700}
                                    height={500}
                                    className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-sm font-bold text-yellow-600 uppercase tracking-widest mb-2">Our Story</h2>
                            <h3 className="text-4xl font-bold text-[#0B2C4A] mb-6 font-heading">Born from a Simple Belief</h3>
                            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                                <p>
                                    In 2024, we noticed a persistent problem in the startup ecosystem: <strong>Brilliant ideas were dying not because they lacked potential, but because they lacked access.</strong>
                                </p>
                                <p>
                                    Founders spent more time chasing introductions than building their products. Investors were deluged with unqualified pitches, missing out on diamonds in the rough.
                                </p>
                                <p>
                                    We created <span className="font-bold text-[#0B2C4A]">PitchWise</span> to change that narrative. We built a platform that democratizes access to capital, ensures quality through rigorous verification, and uses data to make the perfect match.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision - Dark Strip */}
            <section className="py-24 bg-[#0B2C4A] text-white overflow-hidden relative">
                {/* Background Pattern */}
                <div className="absolute top-0 left-0 w-full h-full opacity-5">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-center md:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors"
                        >
                            <div className="w-16 h-16 bg-yellow-500 rounded-xl flex items-center justify-center text-3xl mb-6 mx-auto md:mx-0 shadow-lg">🚀</div>
                            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                            <p className="text-gray-300 text-lg">
                                To empower every entrepreneur with the tools, guidance, and connections they need to turn a spark of an idea into a world-changing reality.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors"
                        >
                            <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center text-3xl mb-6 mx-auto md:mx-0 shadow-lg">🌍</div>
                            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                            <p className="text-gray-300 text-lg">
                                A world where innovation is limited only by imagination, not by geography, background, or network.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Our DNA</h2>
                        <h3 className="text-4xl font-bold text-[#0B2C4A] font-heading">Values That Drive Us</h3>
                        <p className="mt-4 text-gray-500 text-lg">
                            We don't just build software; we build trust. These core principles guide every decision we make.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Transparency First",
                                desc: "No hidden fees, no opaque processes. We believe honest information is the bedrock of successful partnerships.",
                                icon: "💎"
                            },
                            {
                                title: "Founder Focused",
                                desc: "We are in the corner of the dreamer. Every feature we build is designed to lessen the burden on the entrepreneur.",
                                icon: "🎯"
                            },
                            {
                                title: "Quality Over Quantity",
                                desc: "We curate our community rigorously. We prefer 100 meaningful connections over 10,000 noise-filled ones.",
                                icon: "⭐"
                            }
                        ].map((value, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                            >
                                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">{value.icon}</div>
                                <h4 className="text-xl font-bold text-[#0B2C4A] mb-3">{value.title}</h4>
                                <p className="text-gray-500 leading-relaxed">{value.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100">
                        {[
                            { number: "$50M+", label: "Capital Raised" },
                            { number: "500+", label: "Success Stories" },
                            { number: "1,200+", label: "Verified Investors" },
                            { number: "98%", label: "Satisfaction Rate" },
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="text-center p-4 pl-8" // pl-8 to offset divide-x
                            >
                                <div className="text-4xl md:text-5xl font-extrabold text-[#0B2C4A] mb-2">{stat.number}</div>
                                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                        alt="CTA Background"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[#0B2C4A]/90" />
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-heading">Ready to Write Your Success Story?</h2>
                        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                            Join the fastest-growing community of visionaries and investors today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/signup?role=entrepreneur" className="px-8 py-4 bg-white text-[#0B2C4A] font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                Start Fundraising
                            </Link>
                            <Link href="/signup?role=investor" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                Invest in Startups
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
