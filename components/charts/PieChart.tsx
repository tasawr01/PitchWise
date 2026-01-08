'use client';

import React, { useState } from 'react';

interface DataPoint {
    label: string;
    value: number;
    color: string;
}

interface PieChartProps {
    data: DataPoint[];
    height?: number;
    showLegend?: boolean;
}

export default function PieChart({ data, height = 250, showLegend = true }: PieChartProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-gray-400">No Data</div>;

    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    const center = 100; // SVG center coordinates (100, 100) -> viewBox 0 0 200 200
    const radius = 80;

    // Calculate paths
    let startAngle = 0;
    const slices = data.map((d, i) => {
        const angle = (d.value / total) * 360;
        const endAngle = startAngle + angle;

        // Convert to radians matches
        const x1 = center + radius * Math.cos((Math.PI * startAngle) / 180);
        const y1 = center + radius * Math.sin((Math.PI * startAngle) / 180);
        const x2 = center + radius * Math.cos((Math.PI * endAngle) / 180);
        const y2 = center + radius * Math.sin((Math.PI * endAngle) / 180);

        const largeArcFlag = angle > 180 ? 1 : 0;

        // Donut hole path (inner arc) would be complex, doing filled pie for simplicity + circle overlay
        const pathData = `M ${center},${center} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`;

        const slice = { pathData, ...d };
        startAngle = endAngle;
        return slice;
    });

    return (
        <div className="flex items-center justify-center h-full w-full">
            <div className="relative" style={{ width: height, height: height }}>
                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                    {slices.map((slice, i) => (
                        <path
                            key={i}
                            d={slice.pathData}
                            fill={slice.color}
                            className={`transition-all duration-300 cursor-pointer hover:opacity-90 ${hoveredIndex === i ? 'scale-105 transform origin-center' : ''}`}
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            style={{ transformOrigin: 'center' }}
                        />
                    ))}
                    {/* Donut Hole */}
                    <circle cx="100" cy="100" r="50" fill="white" />

                    {/* Center Text (Total or Hovered) */}
                    <text x="100" y="100" dy="5" textAnchor="middle" transform="rotate(90 100 100)" className="text-[12px] font-bold fill-gray-700">
                        {hoveredIndex !== null ? data[hoveredIndex].value : total}
                    </text>
                    <text x="100" y="120" dy="5" textAnchor="middle" transform="rotate(90 100 100)" className="text-[8px] fill-gray-400 uppercase">
                        {hoveredIndex !== null ? 'Count' : 'Total'}
                    </text>
                </svg>
            </div>

            {showLegend && (
                <div className="ml-8 space-y-2">
                    {data.map((d, i) => (
                        <div
                            key={i}
                            className={`flex items-center space-x-2 text-sm transition-opacity ${hoveredIndex !== null && hoveredIndex !== i ? 'opacity-30' : 'opacity-100'}`}
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></span>
                            <span className="text-gray-600 font-medium">{d.label}</span>
                            <span className="text-gray-400 text-xs">({Math.round((d.value / total) * 100)}%)</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
