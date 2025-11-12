'use client';

import { MarketOverview } from '@/types';
import { useEffect, useState } from 'react';

interface MarketOverviewCardProps {
  overview: MarketOverview;
  lastUpdate: number;
  missedUpdates: number;
}

export default function MarketOverviewCard({ overview, lastUpdate, missedUpdates }: MarketOverviewCardProps) {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(2)}`;
  };

  const getAltseasonColor = (value: number) => {
    if (value >= 75) return 'text-green-500';
    if (value >= 60) return 'text-green-400';
    if (value >= 40) return 'text-yellow-500';
    if (value >= 25) return 'text-orange-400';
    return 'text-red-500';
  };

  const getAltseasonLabel = (value: number) => {
    if (value >= 75) return 'Strong Altseason';
    if (value >= 60) return 'Altseason';
    if (value >= 40) return 'Mixed Market';
    if (value >= 25) return 'BTC Season';
    return 'Strong BTC Season';
  };

  const timeSinceUpdate = lastUpdate > 0 ? Math.floor((now - lastUpdate) / 1000) : 0;

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Market Overview</h2>
        <div className="text-right">
          <div className="text-xs text-gray-400">Last Update</div>
          <div className="text-sm text-gray-300">
            {timeSinceUpdate < 60 ? `${timeSinceUpdate}s ago` : `${Math.floor(timeSinceUpdate / 60)}m ago`}
          </div>
          {missedUpdates > 0 && (
            <div className="text-xs text-red-400">Missed: {missedUpdates}</div>
          )}
        </div>
      </div>

  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* BTC Dominance */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-2">BTC Dominance</div>
          <div className="text-3xl font-bold text-white mb-2">
            {overview.btcDominance.toFixed(2)}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all"
              style={{ width: `${overview.btcDominance}%` }}
            />
          </div>
        </div>

        {/* Total Market Cap */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-2">Total Market Cap (Top 5)</div>
          <div className="text-3xl font-bold text-white">
            {formatMarketCap(overview.totalMarketCap)}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Combined value of tracked assets
          </div>
        </div>

        {/* Altseason Indicator */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-2">Altseason Indicator</div>
          <div className={`text-3xl font-bold ${getAltseasonColor(overview.altseasonIndicator)} mb-2`}>
            {overview.altseasonIndicator.toFixed(0)}
          </div>
          <div className="text-sm text-gray-300">
            {getAltseasonLabel(overview.altseasonIndicator)}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full transition-all ${
                overview.altseasonIndicator >= 50 ? 'bg-green-500' : 'bg-orange-500'
              }`}
              style={{ width: `${overview.altseasonIndicator}%` }}
            />
          </div>
        </div>

        {/* Fear & Greed */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-2">Fear & Greed</div>
          {overview.fearGreed ? (
            <>
              <div className="flex items-baseline gap-2 mb-2">
                <div className="text-3xl font-bold text-white">{overview.fearGreed.value}</div>
                <div className="text-sm text-gray-300">{overview.fearGreed.classification}</div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${overview.fearGreed.value >= 60 ? 'bg-green-500' : overview.fearGreed.value >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(100, Math.max(0, overview.fearGreed.value))}%` }}
                />
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">—</div>
          )}
        </div>
      </div>

      {/* Correlation Matrix moved to Sidebar (collapsible) */}
    </div>
  );
}
