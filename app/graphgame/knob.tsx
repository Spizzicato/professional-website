'use client';

import { useEffect, useRef, useState } from 'react';
import { ParameterOption } from './helpers';

interface KnobProps {
    options: ParameterOption[];
    value: number;
    onChange: (v: number) => void;
    size?: number;
}

export default function Knob({
    options,
    value,
    onChange,
    size = 160
}: KnobProps) {
    const [displayName, setDisplayName] = useState(() => options[value][0]);
    const displayTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (displayTimeout.current) {
            clearTimeout(displayTimeout.current);
        }

        displayTimeout.current = setTimeout(() => {
            setDisplayName(options[value]?.[0] ?? '');
        }, 60);

        return () => {
            if (displayTimeout.current) {
                clearTimeout(displayTimeout.current);
            }
        };
    }, [value, options]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const nextValue = Math.max(0, Math.min(value + (e.deltaY < 0 ? 1 : -1), options.length - 1));
            onChange(nextValue);
        };

        el.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            el.removeEventListener('wheel', handleWheel);
        };
    }, [options, value, onChange]);

    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const fraction = options.length > 1 ? value / (options.length - 1) : 0;
    const strokeDashoffset = circumference * (1 - fraction);  // offset decreases as the value increases

return (
	<div
		ref={containerRef}
		className="relative w-full aspect-square select-none touch-none"
		style={{ maxWidth: size }}
	>
		<svg
			viewBox="0 0 100 100"
			className="absolute inset-0 w-full h-full"
		>
			{/* background ring */}
			<circle
				cx="50"
				cy="50"
				r={radius}
				fill="none"
				stroke="currentColor"
				strokeWidth="6"
				className="text-gray-700"
			/>

			{/* progress ring */}
			<circle
				cx="50"
				cy="50"
				r={radius}
				fill="none"
				stroke="currentColor"
				strokeWidth="6"
				strokeLinecap="round"
				strokeDasharray={circumference}
				strokeDashoffset={strokeDashoffset}
				className="text-red-500 transition-[stroke-dashoffset] duration-75"
				transform="rotate(90 50 50)"
			/>
		</svg>

		{/* knob body */}
		<div
			className="
				absolute inset-[15%]
				rounded-full
				bg-zinc-900
				border border-zinc-700
				flex items-center justify-center
				shadow-lg
				pointer-events-none
			"
		>
			<span className="text-white text-xl font-medium">
				{displayName}
			</span>
		</div>
	</div>
);
}