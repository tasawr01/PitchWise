"use client";

import Image from 'next/image';
import { motion, Variants } from 'framer-motion';

export default function FeaturesGrid() {
    const features = [
        {
            name: 'Equity Investment',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing.',
            image: '/assets/FeaturesGrid/Equity.png',
        },
        {
            name: 'Startup Focus',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing.',
            image: '/assets/FeaturesGrid/Startup.png',
        },
        {
            name: 'High Reward',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing.',
            image: '/assets/FeaturesGrid/Reward.png',
        },
        {
            name: 'Access to Capital',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing.',
            image: '/assets/FeaturesGrid/Capital.png',
        },
    ];

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
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {features.map((feature) => (
                        <motion.div
                            key={feature.name}
                            className="bg-[#E8F1F8] p-8 rounded-none shadow-none text-center hover:shadow-md transition-shadow"
                            variants={itemVariants}
                        >
                            <div className="mx-auto flex h-16 w-16 items-center justify-center mb-6 relative">
                                <Image
                                    src={feature.image}
                                    alt={feature.name}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <h3 className="text-lg font-bold text-primary mb-3">{feature.name}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
