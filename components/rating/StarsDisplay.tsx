import { Star } from 'lucide-react';

interface StarsDisplayProps {
    avg: number;
    count?: number;
    size?: number;
    showCount?: boolean;
}

export default function StarsDisplay({ avg, count = 0, size = 18, showCount = true }: StarsDisplayProps) {
    const rounded = Math.round(avg);
    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                        key={n}
                        width={size}
                        height={size}
                        className={n <= rounded ? 'fill-yellow-400 stroke-yellow-500' : 'fill-transparent stroke-gray-300'}
                    />
                ))}
            </div>
            {showCount && (
                <span className="text-sm text-gray-600 font-medium">
                    {avg ? avg.toFixed(1) : '0.0'}
                    <span className="text-gray-400">
                        {' '}
                        ({count} {count === 1 ? 'review' : 'reviews'})
                    </span>
                </span>
            )}
        </div>
    );
}
