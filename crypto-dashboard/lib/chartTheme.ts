// Unified chart theme constants for consistency across visualizations
// Colors align with tokens from app/globals.css

export const chartTheme = {
  candles: {
    bullish: '#10B981',
    bearish: '#EF4444',
    wickOpacity: 0.8,
  },
  movingAverages: {
    ema20: '#3B82F6',
    ema50: '#F59E0B',
    sma200: 'rgba(239,68,68,0.8)',
  },
  rsi: {
    line: '#06B6D4',
    overboughtFill: 'rgba(6,182,212,0.10)',
    oversoldFill: 'rgba(6,182,212,0.06)',
  },
  macd: {
    macd: '#06B6D4',
    signal: '#FBBF24',
    histogramPositive: 'rgba(16,185,129,0.6)',
    histogramNegative: 'rgba(239,68,68,0.6)'
  },
  grid: {
    axis: 'rgba(255,255,255,0.18)',
    grid: 'rgba(255,255,255,0.08)'
  },
  text: {
    label: 'rgba(245,247,250,0.7)',
    value: '#F5F7FA'
  },
  background: 'transparent',
};

// Small helper for lazy dynamic import wrappers
export const dynamicImportOptions = { ssr: false, loading: () => null } as const;
