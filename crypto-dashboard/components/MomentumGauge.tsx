'use client';

import React from 'react';

interface MomentumGaugeProps {
  value: number; // 0-100
  label?: string;
  size?: number; // px
  confluence?: string; // e.g., "7/8 indicators"
}

/**
 * SVG circular progress gauge with red→yellow→green gradient.
 * Accessible with aria and text fallback; minimal dependencies.
 */
export default function MomentumGauge({ value, label = 'Momentum', size = 96, confluence }: MomentumGaugeProps) {
  const radius = (size - 12) / 2; // padding for stroke width
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference * (1 - clamped / 100);

  // Level for subtle style accents
  const level: 'low' | 'mid' | 'high' = clamped < 33 ? 'low' : clamped < 66 ? 'mid' : 'high';

  return (
    <div className="flex items-center gap-3" aria-label={`${label} ${clamped} out of 100`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-hidden={false}
        className="block"
      >
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="50%" stopColor="#FFD60A" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={10}
          fill="none"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gaugeGradient)"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {/* Center text */}
        <g>
          <text
            x="50%"
            y="48%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize={14}
            fontWeight={700}
            fill="#F5F7FA"
          >
            {Math.round(clamped)}
          </text>
          <text
            x="50%"
            y="64%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize={10}
            fill="rgba(245,247,250,0.65)"
          >
            /100
          </text>
        </g>
      </svg>
      <div className="flex flex-col">
        <div className="text-xs text-(--text-low)">{label}</div>
        <div className="text-sm font-semibold text-(--text-high)">
          {clamped < 33 ? 'Weak' : clamped < 66 ? 'Moderate' : 'Strong'}
          <span className="ml-2 text-(--text-low) font-normal">{confluence}</span>
        </div>
      </div>
    </div>
  );
}
