'use client';

import { useState } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import AssetCard from '@/components/AssetCard';
import SignalTable from '@/components/SignalTable';
import MomentumHeatMap from '@/components/MomentumHeatMap';
import MarketOverviewCard from '@/components/MarketOverviewCard';
import DetailedAnalysisModal from '@/components/DetailedAnalysisModal';
import { AssetAnalysis } from '@/types';

export default function Home() {
  const { assets, marketOverview, lastUpdate, missedUpdates, isLoading, error, refresh } = useDashboardData();
  const [selectedAsset, setSelectedAsset] = useState<AssetAnalysis | null>(null);

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Crypto Momentum Dashboard
            </h1>
            <p className="text-gray-400">
              Professional-grade perpetual futures trading analysis
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
          >
            {isLoading ? 'Refreshing...' : 'Refresh Now'}
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
          <p className="text-red-200">Error: {error}</p>
        </div>
      )}

      {isLoading && assets.length === 0 && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Loading market data...</p>
          </div>
        </div>
      )}

      {assets.length > 0 && (
        <div className="space-y-8">
          <MarketOverviewCard 
            overview={marketOverview} 
            lastUpdate={lastUpdate}
            missedUpdates={missedUpdates}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {assets.map((analysis) => (
              <AssetCard
                key={analysis.asset.id}
                analysis={analysis}
                onClick={() => setSelectedAsset(analysis)}
              />
            ))}
          </div>

          <SignalTable analyses={assets} />
          <MomentumHeatMap analyses={assets} />
        </div>
      )}

      <DetailedAnalysisModal 
        analysis={selectedAsset}
        onClose={() => setSelectedAsset(null)}
      />

      <footer className="mt-12 text-center text-gray-500 text-sm pb-8">
        <p>Auto-refresh: Every 60 seconds | Data sources: CoinGecko & Binance</p>
      </footer>
    </div>
  );
}
