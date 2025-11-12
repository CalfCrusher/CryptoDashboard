'use client';

import { AssetAnalysis } from '@/types';
import { formatPrice, formatPercentage, getSignalColor, getSignalIcon } from '@/lib/analysis';
import { useMemo } from 'react';

interface AssetCardProps {
  analysis: AssetAnalysis;
  onClick?: () => void;
}

export default function AssetCard({ analysis, onClick }: AssetCardProps) {
  const { asset, currentPrice, signal, riskManagement, indicators, marketStructure } = analysis;

  // Determine card border color based on trend
  const borderColor = useMemo(() => {
    if (marketStructure.trend === 'uptrend') return 'border-green-500';
    if (marketStructure.trend === 'downtrend') return 'border-red-500';
    return 'border-yellow-500';
  }, [marketStructure.trend]);

  // Momentum gauge color
  const getMomentumColor = (momentum: number) => {
    if (momentum >= 70) return 'text-green-500';
    if (momentum >= 55) return 'text-green-400';
    if (momentum >= 45) return 'text-yellow-500';
    if (momentum >= 30) return 'text-red-400';
    return 'text-red-500';
  };

  const priceChangeColor = currentPrice.changePercent24h >= 0 ? 'text-green-500' : 'text-red-500';

  return (
    <div
      onClick={onClick}
      className={`bg-gray-900 border-2 ${borderColor} rounded-lg p-6 hover:bg-gray-800 transition-all cursor-pointer shadow-lg hover:shadow-xl`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{asset.symbol}</h2>
          <p className="text-sm text-gray-400">{asset.name}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${getSignalColor(signal.strength)}`}>
          {signal.strength}
        </div>
      </div>

      {/* Current Price */}
      <div className="mb-4">
        <div className="text-3xl font-bold text-white mb-1">
          ${formatPrice(currentPrice.price)}
        </div>
        <div className={`text-sm font-semibold ${priceChangeColor}`}>
          {formatPercentage(currentPrice.changePercent24h)}
          <span className="text-gray-400 ml-2">
            ${currentPrice.change24h >= 0 ? '+' : ''}{currentPrice.change24h.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Momentum Gauge */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">Momentum Score</span>
          <span className={`text-sm font-bold ${getMomentumColor(signal.momentum)}`}>
            {signal.momentum}/100
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              signal.momentum >= 50 ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ width: `${signal.momentum}%` }}
          />
        </div>
      </div>

      {/* Signal Direction */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs text-gray-400">Direction</span>
        <div className="flex items-center">
          <span className="text-2xl mr-2">{getSignalIcon(signal.direction)}</span>
          <span className={`text-lg font-bold ${
            signal.direction === 'LONG' ? 'text-green-500' : 
            signal.direction === 'SHORT' ? 'text-red-500' : 
            'text-gray-400'
          }`}>
            {signal.direction}
          </span>
        </div>
      </div>

      {/* Confluence & Confidence */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-400 mb-1">Confluence</div>
          <div className="text-xl font-bold text-white">{signal.confluenceCount}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Confidence</div>
          <div className="text-xl font-bold text-white">{signal.confidenceScore}/10</div>
        </div>
      </div>

      {/* Risk/Reward */}
      {signal.direction !== 'WAIT' && (
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-1">Risk/Reward Ratio</div>
          <div className={`text-lg font-bold ${
            riskManagement.riskRewardRatio >= 2 ? 'text-green-500' : 
            riskManagement.riskRewardRatio >= 1.5 ? 'text-yellow-500' : 
            'text-red-500'
          }`}>
            1:{riskManagement.riskRewardRatio.toFixed(2)}
          </div>
        </div>
      )}

      {/* Key Indicators */}
      <div className="border-t border-gray-700 pt-3 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">RSI (14)</span>
          <span className={`font-semibold ${
            indicators.rsi.rsi14 > 70 ? 'text-red-400' :
            indicators.rsi.rsi14 < 30 ? 'text-green-400' :
            'text-gray-300'
          }`}>
            {indicators.rsi.rsi14.toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">ADX (Trend Strength)</span>
          <span className={`font-semibold ${
            indicators.adx > 25 ? 'text-green-400' : 'text-gray-400'
          }`}>
            {indicators.adx.toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Market Structure</span>
          <span className={`font-semibold ${
            marketStructure.trend === 'uptrend' ? 'text-green-400' :
            marketStructure.trend === 'downtrend' ? 'text-red-400' :
            'text-yellow-400'
          }`}>
            {marketStructure.trend.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Click indicator */}
      <div className="text-center text-xs text-gray-500 mt-3">
        Click for detailed analysis
      </div>
    </div>
  );
}
