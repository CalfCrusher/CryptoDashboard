'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import AssetCard from '@/components/AssetCard';
import SignalTable from '@/components/SignalTable';
import MomentumHeatMap from '@/components/MomentumHeatMap';
import MarketOverviewCard from '@/components/MarketOverviewCard';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import DetailedAnalysisModal from '@/components/DetailedAnalysisModal';
import { AssetAnalysis } from '@/types';
import MarketInsights from '@/components/MarketInsights';
import TopAltcoinMovers from '@/components/TopAltcoinMovers';
import DebugPanel from '@/components/DebugPanel';

export default function Home() {
  const { assets, marketOverview, lastUpdate, missedUpdates, isLoading, error, refresh } = useDashboardData();
  const [selectedAsset, setSelectedAsset] = useState<AssetAnalysis | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [focusIndex, setFocusIndex] = useState<number>(0);

  // Determine column count based on viewport to support arrow navigation
  const columns = useMemo(() => {
    if (typeof window === 'undefined') return 1;
    const w = window.innerWidth;
    if (w >= 1280) return 5; // xl
    if (w >= 1024) return 3; // lg
    if (w >= 768) return 2;  // md
    return 1;                // base
  }, []);

  // Keyboard shortcuts: r to refresh, arrows to move focus, Enter to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (isTyping) return;

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (!isLoading) refresh();
      }
      if (!assets || assets.length === 0) return;

      const cards = gridRef.current?.querySelectorAll<HTMLElement>('[data-asset-card="true"]');
      if (!cards || cards.length === 0) return;

      if (['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'].includes(e.key)) {
        e.preventDefault();
        let next = focusIndex;
        if (e.key === 'ArrowRight') next = Math.min(focusIndex + 1, assets.length - 1);
        if (e.key === 'ArrowLeft') next = Math.max(focusIndex - 1, 0);
        if (e.key === 'ArrowDown') next = Math.min(focusIndex + columns, assets.length - 1);
        if (e.key === 'ArrowUp') next = Math.max(focusIndex - columns, 0);
        setFocusIndex(next);
        cards[next]?.focus();
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const item = assets[focusIndex];
        if (item) setSelectedAsset(item);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [assets, columns, focusIndex, isLoading, refresh]);

  // Local 1s ticker so "Updated Xs ago" moves forward without waiting for data refresh
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--bg-base)' }}>
      <header className="mb-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-end gap-4">
            <h1 className="text-(--text-high) font-bold tracking-[-0.5px]" style={{ fontSize: 32 }}>
              Crypto Momentum Dashboard
            </h1>
            {marketOverview && (
              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="text-(--text-low)">BTC Dom</div>
                <div className="text-(--text-high) font-semibold" aria-label={`BTC dominance ${marketOverview.btcDominance.toFixed(1)} percent`}>{marketOverview.btcDominance.toFixed(2)}%</div>
                <div className="text-(--text-low)">Market</div>
                <div className="text-(--text-high) font-semibold" aria-label={`Market stance ${marketOverview.altseasonIndicator >= 66 ? 'Risk-On' : marketOverview.altseasonIndicator <= 33 ? 'Risk-Off' : 'Mixed'}`}>
                  {marketOverview.altseasonIndicator >= 66 ? 'Risk-On' : marketOverview.altseasonIndicator <= 33 ? 'Risk-Off' : 'Mixed'}
                </div>
                <div className="text-(--text-low)">Updated</div>
                <div className="text-(--text-high) font-semibold" aria-label={`Last updated ${lastUpdate ? Math.max(0, Math.floor((now - lastUpdate)/1000)) + ' seconds ago' : 'unknown'}`}>
                  {lastUpdate ? `${Math.max(0, Math.floor((now - lastUpdate)/1000))}s ago` : '—'}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {missedUpdates > 0 && (
              <div className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(255,214,10,0.12)', color: 'var(--accent-yellow)' }}>
                Missed: {missedUpdates}
              </div>
            )}
            <button
              onClick={refresh}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold"
              style={{ background: 'var(--bg-alt)', color: 'var(--text-high)', border: '1px solid var(--border-subtle)' }}
            >
              <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing' : 'Refresh Now'}
            </button>
          </div>
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

          <div className="space-y-8">
            <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
              {assets.map((analysis, idx) => (
                <div key={analysis.asset.id} data-asset-card="true" tabIndex={0} aria-label={`Select ${analysis.asset.symbol}`}>
                  <AssetCard
                    analysis={analysis}
                    onClick={() => setSelectedAsset(analysis)}
                  />
                </div>
              ))}
            </div>

            <MarketInsights
              assets={assets}
              marketOverview={marketOverview}
              missedUpdates={missedUpdates}
              onAlertClick={(assetId) => {
                const found = assets.find(a => a.asset.id === assetId);
                if (found) setSelectedAsset(found);
              }}
            />

            <TopAltcoinMovers lastUpdate={lastUpdate} />

            <SignalTable analyses={assets} />
            <MomentumHeatMap analyses={assets} />
          </div>
        </div>
      )}

      <DetailedAnalysisModal 
        analysis={selectedAsset}
        onClose={() => setSelectedAsset(null)}
      />

      {/* Sidebar removed — insights are full-width */}

      <footer className="mt-12 text-center text-(--text-low) text-sm pb-8 opacity-70">
        <p>Auto-refresh: Every 60 seconds • Data sources: CoinGecko & Binance</p>
      </footer>

      {/* Debug tools (visible when ?debug=1 or NEXT_PUBLIC_DEBUG_TOOLS=true or localStorage('debug:tools')==='1') */}
      <DebugPanel refresh={refresh} />
    </div>
  );
}
