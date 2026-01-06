"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
    return (
        <section className="relative pt-0 pb-20 lg:pt-8 lg:pb-28 bg-white overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        className="max-w-2xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <motion.h1
                            className="text-4xl font-bold tracking-tight text-primary sm:text-6xl mb-6 font-heading leading-tight"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                        >
                            Empowering Visionaries to Build the Future.
                        </motion.h1>
                        <motion.p
                            className="text-lg text-foreground/80 mb-8 leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                        >
                            PitchWise connects ambitious entrepreneurs with verified investors to fuel innovation. Join a thriving ecosystem where ideas turn into reality.
                        </motion.p>
                        <motion.div
                            className="flex flex-wrap gap-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                        >
                            <Link
                                href="#"
                                className="inline-flex items-center justify-center rounded-md bg-secondary px-8 py-3 text-sm font-semibold text-primary hover:bg-secondary/80 transition-all"
                            >
                                Start Fundraising
                            </Link>
                            <Link
                                href="#"
                                className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-all"
                            >
                                Find Startups
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Right Content - Image Collage */}
                    <motion.div
                        className="mt-16 lg:mt-0 relative hidden lg:block"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    >
                        <div className="relative h-[600px] w-full">
                            {/* Main Image */}
                            <motion.div
                                className="absolute top-0 right-0 w-3/4 h-3/4 bg-gray-200 rounded-lg overflow-hidden shadow-xl z-10"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                            >
                                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80)' }}></div>
                            </motion.div>
                            {/* Secondary Image Top Left */}
                            <motion.div
                                className="absolute top-10 left-0 w-1/2 h-1/2 bg-gray-300 rounded-lg overflow-hidden shadow-lg z-0"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.8 }}
                            >
                                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80)' }}></div>
                            </motion.div>
                            {/* Secondary Image Bottom */}
                            <motion.div
                                className="absolute bottom-0 left-10 w-2/3 h-1/2 bg-gray-400 rounded-lg overflow-hidden shadow-lg z-20 border-4 border-white"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 1.0 }}
                            >
                                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80)' }}></div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
