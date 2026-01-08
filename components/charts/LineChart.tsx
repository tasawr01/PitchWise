'use client';

import React, { useState } from 'react';

interface DataPoint {
    label: string;
    value: number;
}

interface LineChartProps {
    data: DataPoint[];
    color?: string;
    height?: number;
}

export default function LineChart({ data, color = '#3b82f6', height = 250 }: LineChartProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-gray-400">No Data</div>;

    const padding = 40;
    const width = 600; // Internal SVG width
    const chartHeight = height;
    const innerWidth = width - padding * 2;
    const innerHeight = chartHeight - padding * 2;

    const maxValue = Math.max(...data.map(d => d.value)) * 1.1 || 10;

    // Calculate points
    const points = data.map((d, i) => {
        const x = padding + (i / (data.length - 1)) * innerWidth;
        const y = chartHeight - padding - (d.value / maxValue) * innerHeight;
        return { x, y, ...d };
    });

    // Generate SVG path (smooth curve)
    const pathData = points.reduce((acc, point, i, arr) => {
        if (i === 0) return `M ${point.x},${point.y}`;
        const prev = arr[i - 1];
        const cp1x = prev.x + (point.x - prev.x) / 2;
        const cp1y = prev.y;
        const cp2x = prev.x + (point.x - prev.x) / 2;
        const cp2y = point.y;
        return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${point.x},${point.y}`;
    }, '');

    // Area gradient path
    const areaPath = `${pathData} L ${points[points.length - 1].x},${chartHeight - padding} L ${points[0].x},${chartHeight - padding} Z`;

    return (
        <div className="w-full h-full relative group">
            <svg viewBox={`0 0 ${width} ${chartHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                {/* Defs for Gradient */}
                <defs>
                    <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Grid Lines (Horizontal) */}
                {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
                    const y = chartHeight - padding - tick * innerHeight;
                    return (
                        <g key={tick}>
                            <line
                                x1={padding}
                                y1={y}
                                x2={width - padding}
                                y2={y}
                                stroke="#f3f4f6"
                                strokeWidth="1"
                            />
                            <text x={padding - 10} y={y + 4} textAnchor="end" className="text-[10px] fill-gray-400">
                                {Math.round(tick * maxValue)}
                            </text>
                        </g>
                    );
                })}

                {/* Area Fill */}
                <path d={areaPath} fill={`url(#gradient-${color})`} />

                {/* Line Path */}
                <path d={pathData} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />

                {/* Data Points & Interactions */}
                {points.map((point, i) => (
                    <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r={hoveredIndex === i ? 6 : 4}
                            fill="white"
                            stroke={color}
                            strokeWidth="2"
                            className="transition-all duration-200 cursor-pointer"
                        />
                        {/* X-Axis Labels */}
                        <text x={point.x} y={chartHeight - padding + 20} textAnchor="middle" className="text-[10px] fill-gray-400">
                            {point.label}
                        </text>
                    </g>
                ))}
            </svg>

            {/* Tooltip */}
            {hoveredIndex !== null && (
                <div
                    className="absolute bg-gray-900 text-white text-xs rounded py-1 px-2 pointer-events-none transform -translate-x-1/2 -translate-y-full shadow-lg z-10"
                    style={{
                        left: `${(points[hoveredIndex].x / width) * 100}%`,
                        top: `${(points[hoveredIndex].y / chartHeight) * 100}%`,
                        marginTop: '-10px'
                    }}
                >
                    <div className="font-bold">{points[hoveredIndex].value}</div>
                    <div className="text-gray-300 text-[10px]">{points[hoveredIndex].label}</div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
            )}
        </div>
    );
}
