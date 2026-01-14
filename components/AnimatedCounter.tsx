'use client';

import { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
    value: number;
    suffix?: string;
    prefix?: string;
    duration?: number;
}

export default function AnimatedCounter({ value, suffix = '', prefix = '', duration = 2000 }: AnimatedCounterProps) {
    const [count, setCount] = useState(0);
    const elementRef = useRef<HTMLSpanElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;

                    let startTime: number | null = null;
                    let animationFrameId: number;

                    const animate = (timestamp: number) => {
                        if (!startTime) startTime = timestamp;
                        const progress = timestamp - startTime;
                        const percentage = Math.min(progress / duration, 1);

                        // Ease out quart
                        const easeOutQuart = 1 - Math.pow(1 - percentage, 4);

                        setCount(Math.floor(easeOutQuart * value));

                        if (progress < duration) {
                            animationFrameId = requestAnimationFrame(animate);
                        } else {
                            setCount(value); // Ensure it lands exactly on the value
                        }
                    };

                    animationFrameId = requestAnimationFrame(animate);
                }
            },
            { threshold: 0.1 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current);
            }
        };
    }, [value, duration]);

    return (
        <span ref={elementRef}>
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    );
}
