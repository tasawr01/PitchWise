"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmpoweringSuccess() {
    const [activeTab, setActiveTab] = useState('vision');

    const tabs = [
        {
            id: 'vision',
            label: 'Our Vision',
            content: 'To create a future powered by innovation, where bold ideas transform industries and improve lives.'
        },
        {
            id: 'mission',
            label: 'Our Mission',
            content: 'Our mission is to democratize access to capital and opportunity for student entrepreneurs worldwide.'
        },
        {
            id: 'value',
            label: 'Our Value',
            content: 'We value integrity, transparency, and community above all else.'
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-20 items-center">
                    {/* Left Content */}
                    <motion.div
                        className="mb-16 lg:mb-0"
                        initial={{ opacity: 0, x: -50 }}
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
                            WHY CHOOSE US
                        </motion.div>

                        <motion.h2
                            className="text-4xl md:text-5xl font-bold text-black font-heading mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            Empowering Success
                        </motion.h2>

                        <motion.p
                            className="text-gray-500 mb-10 leading-relaxed text-sm max-w-md"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            At Pitchwise, we fuel growth by empowering visionary founders with the capital, strategy, and connections to turn bold ideas into lasting success.
                        </motion.p>

                        <motion.div
                            className="space-y-4 max-w-md"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                        >
                            {tabs.map((tab, index) => (
                                <motion.div
                                    key={tab.id}
                                    className="overflow-hidden"
                                    variants={itemVariants}
                                >
                                    <motion.button
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full text-left px-6 py-4 text-lg font-bold transition-all ${activeTab === tab.id
                                            ? 'bg-[#0B2C4A] text-white shadow-lg'
                                            : 'bg-[#0B2C4A] text-white hover:shadow-md'
                                            }`}
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {tab.label}
                                    </motion.button>

                                    <AnimatePresence initial={false} mode="wait">
                                        {activeTab === tab.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                            >
                                                <motion.div
                                                    className="bg-[#DCEAF5] px-6 py-6"
                                                    initial={{ y: -10 }}
                                                    animate={{ y: 0 }}
                                                    transition={{ duration: 0.3, delay: 0.1 }}
                                                >
                                                    <p className="text-gray-600 text-sm leading-relaxed">
                                                        {tab.content}
                                                    </p>
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Right Image Composition */}
                    <motion.div
                        className="relative h-[600px] w-full"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        {/* Decorative Background Shape */}
                        <motion.div
                            className="absolute top-[10%] left-[20%] w-[60%] h-[60%] bg-[#FFF5F0] -z-10"
                            initial={{ scale: 0, rotate: -10 }}
                            whileInView={{ scale: 1, rotate: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        />

                        {/* Top Right Image (Meeting) */}
                        <motion.div
                            className="absolute top-0 right-0 w-[65%] h-[55%] rounded-3xl overflow-hidden shadow-xl z-10"
                            initial={{ opacity: 0, y: -30, x: 30 }}
                            whileInView={{ opacity: 1, y: 0, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            whileHover={{ scale: 1.05, zIndex: 30 }}
                        >
                            <img
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                                alt="Team Meeting"
                                className="w-full h-full object-cover"
                            />
                        </motion.div>

                        {/* Bottom Left Image (Vision/Compass) */}
                        <motion.div
                            className="absolute bottom-0 left-0 w-[55%] h-[55%] rounded-3xl overflow-hidden shadow-xl z-20"
                            initial={{ opacity: 0, y: 30, x: -30 }}
                            whileInView={{ opacity: 1, y: 0, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            whileHover={{ scale: 1.05, zIndex: 30 }}
                        >
                            <img
                                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                                alt="Vision Compass"
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
