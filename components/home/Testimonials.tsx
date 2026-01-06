"use client";
import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Testimonials() {
    const testimonials = [
        {
            id: 1,
            content: "Aliquam sodales dapibus orcida, sedolar interdum augue dapibusinon vestibulo sed porttitor.",
            author: "Jason Rando",
            role: "Businessman",
            rating: "4,5",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        },
        {
            id: 2,
            content: "Aliquam sodales dapibus orcida, sedolar interdum augue dapibusinon vestibulo sed porttitor.",
            author: "Paolie Ranger",
            role: "Businesswoman",
            rating: "4,5",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        },
        {
            id: 3,
            content: "Aliquam sodales dapibus orcida, sedolar interdum augue dapibusinon vestibulo sed porttitor.",
            author: "Michael Kim",
            role: "Entrepreneur",
            rating: "4,5",
            avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        },
        {
            id: 4,
            content: "Aliquam sodales dapibus orcida, sedolar interdum augue dapibusinon vestibulo sed porttitor.",
            author: "Sarah Jenkins",
            role: "Investor",
            rating: "4,5",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isResetting, setIsResetting] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => {
                if (prev === testimonials.length) {
                    return prev;
                }
                return prev + 1;
            });
        }, 3000);
        return () => clearInterval(timer);
    }, [testimonials.length]);

    const handleAnimationComplete = () => {
        if (currentIndex === testimonials.length) {
            setIsResetting(true);
            setCurrentIndex(0);
        }
    };

    useEffect(() => {
        if (isResetting) {
            const timer = setTimeout(() => {
                setIsResetting(false);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isResetting]);

    // Calculate card width and offset based on screen size
    const cardsPerView = isMobile ? 1 : 3;
    const cardWidthPercentage = 100 / cardsPerView;
    const totalCards = testimonials.length * 2; // Duplicated for infinite loop

    return (
        <section className="py-24 bg-[#DCEAF5] overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="w-full md:w-auto order-2 md:order-1">
                        <div className="hidden md:block">
                            <p className="text-gray-500 text-sm mb-4 max-w-md">
                                Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy
                            </p>
                            <button className="bg-[#0B2C4A] text-white px-8 py-3 rounded-md font-bold text-sm hover:bg-[#0B2C4A]/90 transition-colors">
                                View All Testimonial
                            </button>
                        </div>
                    </div>
                    <div className="w-full md:w-auto text-left md:text-right order-1 md:order-2">
                        <div className="text-sm font-bold text-[#0B2C4A] uppercase tracking-widest mb-2">TESTIMONIAL</div>
                        <h2 className="text-4xl md:text-5xl font-bold text-black font-heading">What Our Clients Say</h2>
                    </div>
                </div>

                {/* Mobile View All (visible only on mobile) */}
                <div className="md:hidden mb-12">
                    <p className="text-gray-500 text-sm mb-4">
                        Lorem ipsum is simply dummy text of the printing and typesetting industry.
                    </p>
                    <button className="bg-[#0B2C4A] text-white px-8 py-3 rounded-md font-bold text-sm hover:bg-[#0B2C4A]/90 transition-colors w-full">
                        View All Testimonial
                    </button>
                </div>

                {/* Carousel Track */}
                <div className="relative w-full overflow-hidden">
                    <motion.div
                        className="flex"
                        animate={{ x: `-${currentIndex * cardWidthPercentage}%` }}
                        transition={{ duration: isResetting ? 0 : 0.8, ease: "easeInOut" }}
                        onAnimationComplete={handleAnimationComplete}
                    >
                        {/* Duplicate the array to allow for smooth looping transition */}
                        {[...testimonials, ...testimonials].map((testimonial, index) => (
                            <div
                                key={`${testimonial.id}-${index}`}
                                className="flex-shrink-0 px-2 md:px-4"
                                style={{ width: `${cardWidthPercentage}%` }}
                            >
                                <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border-b-4 border-transparent hover:border-[#0B2C4A] transition-all h-full">
                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="h-4 w-4 fill-[#0B2C4A] text-[#0B2C4A]" />
                                            ))}
                                        </div>
                                        <span className="text-lg font-bold text-black">{testimonial.rating}</span>
                                    </div>

                                    <p className="text-gray-500 mb-6 md:mb-8 italic text-sm leading-relaxed">
                                        "{testimonial.content}"
                                    </p>

                                    <div className="flex items-center gap-4">
                                        <img
                                            src={testimonial.avatar}
                                            alt={testimonial.author}
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                        <div>
                                            <div className="font-bold text-black text-lg">{testimonial.author}</div>
                                            <div className="text-xs text-gray-500 font-medium">{testimonial.role}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center mt-12 gap-2">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setIsResetting(false);
                                setCurrentIndex(index);
                            }}
                            className={`h-3 rounded-full transition-all duration-300 ${currentIndex === index || (currentIndex === testimonials.length && index === 0)
                                ? 'w-8 bg-[#0B2C4A]'
                                : 'w-3 bg-[#0B2C4A]/30 hover:bg-[#0B2C4A]/50'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
