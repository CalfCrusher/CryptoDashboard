'use client';

import { AssetAnalysis } from '@/types';
import { formatPrice, formatPercentage, getSignalIcon } from '@/lib/analysis';
import { useMemo, useRef, useEffect, useState } from 'react';
import MomentumGauge from './MomentumGauge';
import Sparkline from './Sparkline';
import { BTCIcon, ETHTempIcon, BNBIcon, SOLIcon, XRPIcon, GenericCoinIcon } from '@/lib/iconMap';

interface AssetCardProps {
  analysis: AssetAnalysis;
  onClick?: () => void;
}

export default function AssetCard({ analysis, onClick }: AssetCardProps) {
  const { asset, currentPrice, signal, riskManagement, indicators, marketStructure, sparkline } = analysis;

  const prevPriceRef = useRef<number>(currentPrice.price);
  const [flashClass, setFlashClass] = useState<string>('');

  useEffect(() => {
    const prev = prevPriceRef.current;
    if (prev !== currentPrice.price) {
      const cls = currentPrice.price > prev ? 'flash-up scale-up' : 'flash-down scale-down';
  const t1 = window.setTimeout(() => setFlashClass(cls), 0);
  const t2 = window.setTimeout(() => setFlashClass(''), 2000);
      prevPriceRef.current = currentPrice.price;
      return () => {
        if (t1) clearTimeout(t1);
        if (t2) clearTimeout(t2);
      };
    }
  }, [currentPrice.price]);

  // Determine card border color based on trend
  const borderColor = useMemo(() => {
    if (marketStructure.trend === 'uptrend') return 'shadow-[0_0_0_1px_rgba(16,185,129,0.35)]';
    if (marketStructure.trend === 'downtrend') return 'shadow-[0_0_0_1px_rgba(239,68,68,0.35)]';
    return 'shadow-[0_0_0_1px_rgba(100,116,139,0.35)]';
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

  // Pre-create icon element using static components to satisfy lint rule
  const IconEl = useMemo(() => {
    const sym = (asset.symbol || '').toUpperCase();
    switch (sym) {
      case 'BTC':
        return <BTCIcon aria-label={`${asset.symbol} icon`} />;
      case 'ETH':
        return <ETHTempIcon aria-label={`${asset.symbol} icon`} />;
      case 'BNB':
        return <BNBIcon aria-label={`${asset.symbol} icon`} />;
      case 'SOL':
        return <SOLIcon aria-label={`${asset.symbol} icon`} />;
      case 'XRP':
        return <XRPIcon aria-label={`${asset.symbol} icon`} />;
      default:
        return <GenericCoinIcon aria-label={`${asset.symbol} icon`} />;
    }
  }, [asset.symbol]);

  return (
    <div
      onClick={onClick}
      className={`glass-card cursor-pointer p-6 relative overflow-hidden ${borderColor}`}
      tabIndex={0}
      aria-label={`Asset ${asset.symbol} ${signal.strength} signal ${signal.direction} price ${formatPrice(currentPrice.price)}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 opacity-70">{IconEl}</div>
          <div>
            <h2 className="text-2xl font-bold text-(--text-high) tracking-[-0.5px]">{asset.symbol}</h2>
            <p className="text-sm text-(--text-low)">{asset.name}</p>
          </div>
        </div>
        <div
          className={`signal-badge ${signal.confluenceCount > 6 ? 'signal-pulse' : ''}`}
          data-signal={signal.strength}
        >
          {signal.strength}
        </div>
      </div>

      {/* Current Price */}
      <div className="mb-4">
        <div
          className={`leading-none font-bold text-(--text-high) mb-2 smooth-number price-anim ${flashClass}`}
          style={{ fontSize: 'var(--font-price)' }}
        >
          ${formatPrice(currentPrice.price)}
        </div>
        <div className={`text-sm font-semibold ${priceChangeColor} flex items-center gap-2`}>
          {formatPercentage(currentPrice.changePercent24h)}
          <span className="text-gray-400 ml-2">
            ${currentPrice.change24h >= 0 ? '+' : ''}{currentPrice.change24h.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Momentum Gauge + Sparkline */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <MomentumGauge value={signal.momentum} confluence={`${signal.confluenceCount}/8`} />
        <div className="flex-1">
          {sparkline ? <Sparkline data={sparkline} /> : <div className="sparkline skeleton" />}
        </div>
      </div>

      {/* Signal Direction */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs text-gray-400">Direction</span>
        <div className="flex items-center gap-2">
          <span className="text-2xl mr-1">{getSignalIcon(signal.direction)}</span>
          {signal.direction === 'WAIT' ? (
            <span
              className="signal-badge"
              style={{ background: 'var(--neutral)' }}
              title="Waiting for conditions — informational only"
            >
              NO SETUP
            </span>
          ) : (
            <span
              className={`text-lg font-bold ${
                signal.direction === 'LONG' ? 'text-green-500' :
                signal.direction === 'SHORT' ? 'text-red-500' :
                'text-gray-400'
              }`}
            >
              {signal.direction}
            </span>
          )}
        </div>
      </div>

      {/* Confluence & Confidence & Risk/Reward */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-xs text-(--text-low) mb-1">Confluence</div>
          <div className="text-xl font-bold text-(--text-high)">{signal.confluenceCount}</div>
        </div>
        <div>
          <div className="text-xs text-(--text-low) mb-1">Confidence</div>
          <div className="text-xl font-bold text-(--text-high)">{signal.confidenceScore}/10</div>
        </div>
        {signal.direction !== 'WAIT' && (
          <div>
            <div className="text-xs text-(--text-low) mb-1">Risk/Reward</div>
            <div className={`text-xl font-bold ${
              riskManagement.riskRewardRatio >= 2 ? 'text-green-500' : 
              riskManagement.riskRewardRatio >= 1.5 ? 'text-yellow-500' : 
              'text-red-500'
            }`}>
              1:{riskManagement.riskRewardRatio.toFixed(2)}
            </div>
          </div>
        )}
      </div>

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
      <div className="text-center text-xs text-(--text-low) mt-4 opacity-60">
        Click / Enter for detailed analysis
      </div>
    </div>
  );
}
