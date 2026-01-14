'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AnimatedCounter from '@/components/AnimatedCounter';

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="p-10 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors"
                        >
                            <h3 className="text-3xl font-bold mb-6">Our Mission</h3>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                To empower every entrepreneur with the tools, guidance, and connections they need to turn a spark of an idea into a world-changing reality.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="p-10 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors"
                        >
                            <h3 className="text-3xl font-bold mb-6">Our Vision</h3>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                A world where innovation is limited only by imagination, not by geography, background, or network.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-24 bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/40 to-cyan-100/40 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-100/40 to-purple-100/40 rounded-full blur-3xl"></div>

                <div className="container mx-auto px-4 relative z-10">
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
                                gradient: "from-blue-500/10 to-cyan-500/10",
                                borderColor: "border-blue-500/20",
                                accentColor: "bg-blue-500",
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )
                            },
                            {
                                title: "Founder Focused",
                                desc: "We are in the corner of the dreamer. Every feature we build is designed to lessen the burden on the entrepreneur.",
                                gradient: "from-indigo-500/10 to-purple-500/10",
                                borderColor: "border-indigo-500/20",
                                accentColor: "bg-indigo-500",
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <circle cx="12" cy="12" r="6" />
                                        <circle cx="12" cy="12" r="2" />
                                    </svg>
                                )
                            },
                            {
                                title: "Quality Over Quantity",
                                desc: "We curate our community rigorously. We prefer 100 meaningful connections over 10,000 noise-filled ones.",
                                gradient: "from-purple-500/10 to-pink-500/10",
                                borderColor: "border-purple-500/20",
                                accentColor: "bg-purple-500",
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="8" r="6" />
                                        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                                    </svg>
                                )
                            }
                        ].map((value, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="group relative"
                            >
                                {/* Card */}
                                <div className={`relative h-full bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border-2 ${value.borderColor} overflow-hidden`}>
                                    {/* Gradient overlay */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                                    {/* Top accent line */}
                                    <div className={`absolute top-0 left-0 right-0 h-1 ${value.accentColor} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>

                                    {/* Content */}
                                    <div className="relative z-10">
                                        {/* Icon */}
                                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-6 ${value.accentColor.replace('bg-', 'text-')} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            {value.icon}
                                        </div>

                                        <h4 className="text-xl font-bold text-[#0B2C4A] mb-4 group-hover:text-[#0B2C4A] transition-colors">{value.title}</h4>
                                        <p className="text-gray-600 leading-relaxed">{value.desc}</p>
                                    </div>

                                    {/* Bottom decorative line */}
                                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                                </div>
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
                            { number: 50, prefix: "$", suffix: "M+", label: "Capital Raised" },
                            { number: 500, prefix: "", suffix: "+", label: "Success Stories" },
                            { number: 1200, prefix: "", suffix: "+", label: "Verified Investors" },
                            { number: 98, prefix: "", suffix: "%", label: "Satisfaction Rate" },
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="text-center p-4 pl-8" // pl-8 to offset divide-x
                            >
                                <div className="text-4xl md:text-5xl font-extrabold text-[#0B2C4A] mb-2">
                                    <AnimatedCounter
                                        value={stat.number}
                                        prefix={stat.prefix}
                                        suffix={stat.suffix}
                                    />
                                </div>
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
