"use client";

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';

export default function FuelingAmbition() {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    return (
        <section className="py-24 bg-[#DCEAF5]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                    {/* Left Image Composition */}
                    <motion.div
                        className="relative mb-16 lg:mb-0"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="relative w-full max-w-lg mx-auto lg:mx-0">
                            {/* Main Image (People) */}
                            <motion.div
                                className="rounded-2xl overflow-hidden shadow-xl w-[85%]"
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                                    alt="Team Meeting"
                                    className="w-full h-auto object-cover aspect-[3/4]"
                                />
                            </motion.div>

                            {/* Secondary Image (Handshake) - Overlapping */}
                            <motion.div
                                className="absolute top-[20%] -right-4 w-[55%] rounded-2xl overflow-hidden shadow-2xl border-4 border-white"
                                initial={{ opacity: 0, x: 50, y: -20 }}
                                whileInView={{ opacity: 1, x: 0, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                    alt="Handshake"
                                    className="w-full h-auto object-cover aspect-square"
                                />
                            </motion.div>

                            {/* Experience Badge */}
                            <motion.div
                                className="absolute bottom-[10%] -right-4 bg-[#0B2C4A] text-white p-6 rounded-xl shadow-lg max-w-[200px]"
                                initial={{ opacity: 0, scale: 0, rotate: -10 }}
                                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.6, type: "spring", stiffness: 100 }}
                            >
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">25</span>
                                    <span className="text-xl font-medium">Th</span>
                                </div>
                                <div className="text-sm font-medium leading-tight mt-1">Years of Experience</div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Right Content */}
                    <motion.div
                        className="lg:pl-8"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <motion.div
                            className="text-sm font-bold text-[#0B2C4A] uppercase tracking-widest mb-3"
                            initial={{ opacity: 0, y: -10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            ABOUT PITCHWISE
                        </motion.div>

                        <motion.h2
                            className="text-4xl md:text-5xl font-bold text-black font-heading mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            Fueling Ambition
                        </motion.h2>

                        <motion.p
                            className="text-lg font-bold text-black/80 mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            "Connecting You to Opportunities"
                        </motion.p>

                        <motion.p
                            className="text-gray-500 mb-10 leading-relaxed text-sm"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                        >
                            Quisque augue velit, elementum vel ornare vitae, mollis vel mi. Nunc laoreet turpis vel quam pharetra, commodo auctor.
                        </motion.p>

                        <motion.div
                            className="space-y-0 mb-10"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                        >
                            {/* Item 01 */}
                            <motion.div
                                className="group"
                                variants={itemVariants}
                                whileHover={{ x: 10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="py-4 border-b border-gray-300">
                                    <h4 className="text-2xl font-bold text-[#0B2C4A] mb-1">
                                        <span className="mr-2">01.</span> Embracing and Supporting
                                    </h4>
                                </div>
                            </motion.div>

                            {/* Item 02 */}
                            <motion.div
                                className="group"
                                variants={itemVariants}
                                whileHover={{ x: 10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="py-4 border-b border-gray-300">
                                    <h4 className="text-2xl font-bold text-[#0B2C4A] mb-1">
                                        <span className="mr-2">02.</span> Long-Term Vision
                                    </h4>
                                </div>
                            </motion.div>

                            {/* Item 03 */}
                            <motion.div
                                className="group"
                                variants={itemVariants}
                                whileHover={{ x: 10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="py-4 border-b border-gray-300">
                                    <h4 className="text-2xl font-bold text-[#0B2C4A] mb-1">
                                        <span className="mr-2">03.</span> Diversity and Inclusion
                                    </h4>
                                </div>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                        >
                            <Link
                                href="/about"
                                className="inline-block bg-[#0B2C4A] text-white px-8 py-4 rounded-md font-bold text-sm hover:bg-[#0B2C4A]/90 transition-colors"
                            >
                                More About Us
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
