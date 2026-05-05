'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarInputProps {
    value: number;
    onChange: (value: number) => void;
    size?: number;
    disabled?: boolean;
}

export default function StarInput({ value, onChange, size = 32, disabled = false }: StarInputProps) {
    const [hover, setHover] = useState<number | null>(null);
    const display = hover ?? value;

    return (
        <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => {
                const filled = n <= display;
                return (
                    <button
                        key={n}
                        type="button"
                        disabled={disabled}
                        onMouseEnter={() => !disabled && setHover(n)}
                        onMouseLeave={() => !disabled && setHover(null)}
                        onClick={() => !disabled && onChange(n)}
                        aria-label={`${n} star${n > 1 ? 's' : ''}`}
                        className={`transition-transform ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'} focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded`}
                    >
                        <Star
                            width={size}
                            height={size}
                            className={filled ? 'fill-yellow-400 stroke-yellow-500' : 'fill-transparent stroke-gray-300'}
                        />
                    </button>
                );
            })}
        </div>
    );
}
