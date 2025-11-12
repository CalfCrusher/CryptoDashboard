'use client';

import { AssetAnalysis } from '@/types';

interface MomentumHeatMapProps {
  analyses: AssetAnalysis[];
}

export default function MomentumHeatMap({ analyses }: MomentumHeatMapProps) {
  const getHeatColor = (momentum: number) => {
    // Green for high momentum, red for low momentum
    if (momentum >= 70) return 'bg-green-600';
    if (momentum >= 60) return 'bg-green-500';
    if (momentum >= 55) return 'bg-green-400';
    if (momentum >= 50) return 'bg-yellow-500';
    if (momentum >= 45) return 'bg-yellow-600';
    if (momentum >= 40) return 'bg-orange-500';
    if (momentum >= 30) return 'bg-red-400';
    return 'bg-red-600';
  };

  const getSize = (atr: number, price: number) => {
    // Size based on volatility (ATR as % of price)
    const volatilityPercent = (atr / price) * 100;
    if (volatilityPercent > 5) return 'w-32 h-32';
    if (volatilityPercent > 3) return 'w-28 h-28';
    if (volatilityPercent > 2) return 'w-24 h-24';
    return 'w-20 h-20';
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6">
  <h2 className="text-xl font-bold text-white mb-4">Momentum Heat Map</h2>
  <div className="flex flex-wrap gap-4 justify-center items-center">
        {analyses.map((analysis) => {
          const { asset, signal, indicators, currentPrice } = analysis;
          const heatColor = getHeatColor(signal.momentum);
          const size = getSize(indicators.atr, currentPrice.price);

          return (
            <div
              key={asset.id}
              className={`${size} ${heatColor} rounded-lg flex flex-col items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer`}
            >
              <div className="text-white font-bold text-2xl">{asset.symbol}</div>
              <div className="text-white text-sm mt-1">{signal.momentum}</div>
              <div className="text-white text-xs opacity-80">
                {signal.direction}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 rounded"></div>
          <span className="text-gray-400">Strong Bullish</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-gray-400">Neutral</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <span className="text-gray-400">Strong Bearish</span>
        </div>
      </div>
      
      <div className="mt-2 text-center text-xs text-gray-500">
        Size indicates volatility (ATR)
      </div>
    </div>
  );
}
