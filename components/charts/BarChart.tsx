'use client';

import React, { useState } from 'react';

interface DataPoint {
    label: string;
    value: number;
    color?: string; // Optional override
}

interface BarChartProps {
    data: DataPoint[];
    color?: string;
    height?: number;
}

export default function BarChart({ data, color = '#10b981', height = 250 }: BarChartProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-gray-400">No Data</div>;

    const maxValue = Math.max(...data.map(d => d.value)) * 1.1 || 10;

    return (
        <div className="w-full h-full flex items-end justify-between space-x-2 pt-6 relative" style={{ height: `${height}px` }}>
            {/* Grid Line (Top) */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gray-100"></div>

            {data.map((d, i) => {
                const heightPercentage = (d.value / maxValue) * 100;
                const barColor = d.color || color;

                return (
                    <div
                        key={i}
                        className="flex-1 flex flex-col items-center group h-full justify-end relative"
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        {/* Bar */}
                        <div
                            className="w-full max-w-[40px] rounded-t-lg transition-all duration-300 relative"
                            style={{
                                height: `${heightPercentage}%`,
                                backgroundColor: barColor,
                                opacity: hoveredIndex === i ? 1 : 0.8
                            }}
                        >
                            {/* Hover Tooltip - Floating above bar */}
                            <div
                                className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 transition-opacity duration-200 ${hoveredIndex === i ? 'opacity-100' : 'opacity-0'}`}
                            >
                                <span className="font-bold">{d.value}</span>
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                            </div>
                        </div>

                        {/* Label */}
                        <div className="mt-2 text-[10px] text-gray-400 text-center font-medium truncate w-full px-1">
                            {d.label}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
