'use client';

import { useState, useEffect, useCallback } from 'react';
import { AssetAnalysis, DashboardData, MarketOverview, CurrentPrice } from '@/types';
import { 
  fetchMarketData, 
  fetchOHLCVData, 
  fetch52WeekData, 
  fetchBTCDominance,
  buildCorrelationMatrix,
  calculateAltseasonIndicator,
  TOP_ASSETS 
} from '@/lib/api';
import { analyzeAsset } from '@/lib/analysis';

const REFRESH_INTERVAL = 60000; // 1 minute

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    assets: [],
    marketOverview: {
      btcDominance: 0,
      totalMarketCap: 0,
      altseasonIndicator: 50,
      correlationMatrix: {}
    },
    lastUpdate: 0,
    isLoading: true,
    error: undefined
  });

  const [missedUpdates, setMissedUpdates] = useState(0);

  const fetchAllData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: undefined }));

      // Fetch market data for all assets
      const marketData = await fetchMarketData();
      
      // Fetch OHLCV data (primary timeframe + 5m for spike detection) and analyze each asset
      const assetAnalysisPromises = TOP_ASSETS.map(async (asset) => {
        try {
          const [ohlcvData, weekData] = await Promise.all([
            fetchOHLCVData(asset.id, '1h', 200),
            fetch52WeekData(asset.id)
          ]);
          const recent5m = await fetchOHLCVData(asset.id, '5m', 3).catch(() => [] as any);

          const marketInfo = marketData.find(m => m.id === asset.id);
          
          if (!marketInfo) {
            throw new Error(`Market data not found for ${asset.id}`);
          }

          const currentPrice: CurrentPrice = {
            price: marketInfo.current_price,
            change24h: marketInfo.price_change_24h,
            changePercent24h: marketInfo.price_change_percentage_24h,
            high24h: marketInfo.high_24h,
            low24h: marketInfo.low_24h,
            high52w: weekData.high || marketInfo.ath,
            low52w: weekData.low || marketInfo.atl,
            marketCap: marketInfo.market_cap,
            volume24h: marketInfo.total_volume
          };

          const analysis = analyzeAsset(
            {
              id: asset.id,
              symbol: asset.symbol,
              name: asset.name,
              rank: marketInfo.market_cap_rank
            },
            currentPrice,
            ohlcvData
          );

          // Append recent 5m spike metric
          if (recent5m && (recent5m as any[]).length >= 2) {
            const prev = (recent5m as any[])[(recent5m as any[]).length - 2].close;
            const last = (recent5m as any[])[(recent5m as any[]).length - 1].close;
            if (prev > 0) {
              analysis.recent5mChangePct = ((last - prev) / prev) * 100;
            }
          }
          return analysis;
        } catch (error) {
          console.error(`Error analyzing ${asset.symbol}:`, error);
          return null;
        }
      });

      // Fetch market overview data
      const [assetAnalyses, correlationMatrix, altseasonIndicator] = await Promise.all([
        Promise.all(assetAnalysisPromises),
        buildCorrelationMatrix(),
        calculateAltseasonIndicator()
      ]);

      // BTC dominance with fallback using current marketData
      let btcDominance = 0;
      try {
        const { getBTCDominanceWithFallback } = await import('@/lib/api');
        btcDominance = await getBTCDominanceWithFallback(marketData, data.marketOverview?.btcDominance);
      } catch {
        btcDominance = data.marketOverview?.btcDominance || 50;
      }

      // Filter out failed analyses
      const validAnalyses = assetAnalyses.filter((a): a is AssetAnalysis => a !== null);

      const totalMarketCap = validAnalyses.reduce((sum, a) => sum + a.currentPrice.marketCap, 0);

      const marketOverview: MarketOverview = {
        btcDominance,
        totalMarketCap,
        altseasonIndicator,
        correlationMatrix
      };

      setData({
        assets: validAnalyses,
        marketOverview,
        lastUpdate: Date.now(),
        isLoading: false,
        error: undefined
      });

      setMissedUpdates(0);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data'
      }));
      setMissedUpdates(prev => prev + 1);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Auto-refresh every minute
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllData();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    ...data,
    missedUpdates,
    refresh
  };
}
