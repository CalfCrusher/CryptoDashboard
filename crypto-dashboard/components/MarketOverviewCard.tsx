'use client';

import { MarketOverview } from '@/types';

interface MarketOverviewCardProps {
  overview: MarketOverview;
  lastUpdate: number;
  missedUpdates: number;
}

export default function MarketOverviewCard({ overview, lastUpdate, missedUpdates }: MarketOverviewCardProps) {
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

  const timeSinceUpdate = lastUpdate > 0 ? Math.floor((Date.now() - lastUpdate) / 1000) : 0;

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>

      {/* Correlation Matrix */}
      {Object.keys(overview.correlationMatrix).length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold text-white mb-3">Correlation Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left text-gray-400 p-2"></th>
                  {Object.keys(overview.correlationMatrix).map(symbol => (
                    <th key={symbol} className="text-center text-gray-400 p-2">{symbol}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(overview.correlationMatrix).map(([symbol1, correlations]) => (
                  <tr key={symbol1}>
                    <td className="text-white font-bold p-2">{symbol1}</td>
                    {Object.entries(correlations).map(([symbol2, correlation]) => {
                      const corrValue = correlation as number;
                      const color = 
                        corrValue > 0.7 ? 'bg-green-600' :
                        corrValue > 0.4 ? 'bg-green-700' :
                        corrValue > 0 ? 'bg-gray-700' :
                        corrValue > -0.4 ? 'bg-gray-700' :
                        corrValue > -0.7 ? 'bg-red-700' :
                        'bg-red-600';
                      
                      return (
                        <td key={symbol2} className={`text-center p-2 ${color} text-white`}>
                          {corrValue.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Correlation: 1.0 = perfect positive, -1.0 = perfect negative, 0 = no correlation
          </div>
        </div>
      )}
    </div>
  );
}
