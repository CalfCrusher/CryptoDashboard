'use client';

import React, { useMemo } from 'react';

interface SparklineProps {
  data: number[]; // ordered from oldest -> newest
  width?: number;
  height?: number;
  strokeWidth?: number;
}

export default function Sparkline({ data, width = 160, height = 36, strokeWidth = 2 }: SparklineProps) {
  const { path, up } = useMemo(() => {
    if (!data || data.length === 0) {
      return { path: '', up: true };
    }
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);

    const points = data.map((d, i) => {
      const x = i * stepX;
      const y = height - ((d - min) / range) * height;
      return [x, y] as const;
    });

    const d = points
      .map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`))
      .join(' ');

    const up = data[data.length - 1] >= data[0];
    return { path: d, up };
  }, [data, width, height]);

  if (!data || data.length < 2) {
    return <div className="sparkline skeleton" style={{ height, width }} />;
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="sparkline">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={up ? '#10B981' : '#EF4444'} stopOpacity={0.35} />
          <stop offset="100%" stopColor="transparent" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Fill under line */}
      <path
        d={`${path} L ${width},${height} L 0,${height} Z`}
        fill="url(#sparkGrad)"
        stroke="none"
      />
      {/* Line */}
      <path d={path} fill="none" stroke={up ? '#10B981' : '#EF4444'} strokeWidth={strokeWidth} />
    </svg>
  );
}
