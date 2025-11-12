import {
  AssetAnalysis,
  CryptoAsset,
  CurrentPrice,
  PriceData,
  TechnicalIndicators,
  VolumeMetrics,
  MarketStructure,
  Timeframe
} from '@/types';
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateStochasticRSI,
  calculateADX,
  calculateATR,
  calculateBollingerBands,
  calculateOBV,
  calculateROC,
  calculateMomentum,
  detectMarketStructure,
  findSupportResistance
} from './indicators';
import { generateTradingSignal, calculateRiskManagement } from './signals';

/**
 * Perform complete technical analysis for an asset
 */
export function analyzeAsset(
  asset: CryptoAsset,
  currentPrice: CurrentPrice,
  priceData: PriceData[]
): AssetAnalysis {
  // Extract price arrays for indicator calculations
  const closePrices = priceData.map(d => d.close);
  const highPrices = priceData.map(d => d.high);
  const lowPrices = priceData.map(d => d.low);
  const volumes = priceData.map(d => d.volume);
  
  // Calculate Technical Indicators
  const indicators: TechnicalIndicators = {
    movingAverages: {
      ema20: calculateEMA(closePrices, 20),
      ema50: calculateEMA(closePrices, 50),
      sma200: calculateSMA(closePrices, 200)
    },
    rsi: {
      rsi14: calculateRSI(closePrices, 14),
      rsi21: calculateRSI(closePrices, 21)
    },
    macd: calculateMACD(closePrices, 12, 26, 9),
    stochRsi: calculateStochasticRSI(closePrices, 14, 14, 3, 3),
    adx: calculateADX(priceData, 14),
    atr: calculateATR(priceData, 14),
    obv: calculateOBV(priceData),
    roc: calculateROC(closePrices, 12),
    momentum: calculateMomentum(closePrices, 10),
    bollingerBands: calculateBollingerBands(closePrices, 20, 2)
  };
  
  // Calculate Volume Metrics
  const volumeMetrics: VolumeMetrics = calculateVolumeMetrics(priceData);
  
  // Analyze Market Structure
  const structureAnalysis = detectMarketStructure(priceData, 20);
  const supportResistance = findSupportResistance(priceData);
  
  const marketStructure: MarketStructure = {
    trend: determineTrend(structureAnalysis, indicators),
    higherHighs: structureAnalysis.higherHighs,
    higherLows: structureAnalysis.higherLows,
    lowerHighs: structureAnalysis.lowerHighs,
    lowerLows: structureAnalysis.lowerLows,
    supportLevels: supportResistance.support,
    resistanceLevels: supportResistance.resistance,
    swingHigh: Math.max(...highPrices.slice(-20)),
    swingLow: Math.min(...lowPrices.slice(-20))
  };
  
  // Generate Trading Signal
  const signal = generateTradingSignal(
    currentPrice.price,
    indicators,
    marketStructure,
    volumeMetrics,
    priceData
  );
  
  // Calculate Risk Management
  const riskManagement = calculateRiskManagement(
    currentPrice.price,
    signal,
    indicators.atr,
    marketStructure,
    priceData
  );
  
  return {
    asset,
    currentPrice,
    indicators,
    volumeMetrics,
    marketStructure,
    signal,
    riskManagement,
    sparkline: closePrices.slice(-24),
    lastUpdate: Date.now()
  };
}

/**
 * Calculate volume metrics
 */
function calculateVolumeMetrics(priceData: PriceData[]): VolumeMetrics {
  const volumes = priceData.map(d => d.volume);
  const current = volumes[volumes.length - 1];
  
  // 20-day average volume
  const recent20 = volumes.slice(-20);
  const average20d = recent20.reduce((sum, v) => sum + v, 0) / recent20.length;
  
  const ratio = average20d > 0 ? current / average20d : 1;
  
  // Determine volume trend
  const recent5 = volumes.slice(-5);
  const avg5 = recent5.reduce((sum, v) => sum + v, 0) / recent5.length;
  const prev5 = volumes.slice(-10, -5);
  const avgPrev5 = prev5.reduce((sum, v) => sum + v, 0) / prev5.length;
  
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (avg5 > avgPrev5 * 1.1) {
    trend = 'increasing';
  } else if (avg5 < avgPrev5 * 0.9) {
    trend = 'decreasing';
  }
  
  const volumeRoc = calculateROC(volumes, 10);
  
  return {
    current,
    average20d,
    ratio,
    trend,
    volumeRoc
  };
}

/**
 * Determine overall trend from structure and indicators
 */
function determineTrend(
  structure: { higherHighs: boolean; higherLows: boolean; lowerHighs: boolean; lowerLows: boolean },
  indicators: TechnicalIndicators
): 'uptrend' | 'downtrend' | 'ranging' {
  const { higherHighs, higherLows, lowerHighs, lowerLows } = structure;
  const { ema20, ema50, sma200 } = indicators.movingAverages;
  
  // Strong uptrend indicators
  if (higherHighs && higherLows && ema20 > ema50 && ema50 > sma200) {
    return 'uptrend';
  }
  
  // Strong downtrend indicators
  if (lowerHighs && lowerLows && ema20 < ema50 && ema50 < sma200) {
    return 'downtrend';
  }
  
  // Check ADX for trend strength
  if (indicators.adx < 20) {
    return 'ranging';
  }
  
  // Fallback to MA alignment
  if (ema20 > ema50 && ema50 > sma200) {
    return 'uptrend';
  } else if (ema20 < ema50 && ema50 < sma200) {
    return 'downtrend';
  }
  
  return 'ranging';
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toFixed(2);
  } else if (price >= 1) {
    return price.toFixed(4);
  } else if (price >= 0.01) {
    return price.toFixed(6);
  } else {
    return price.toFixed(8);
  }
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

/**
 * Get color for trend direction
 */
export function getTrendColor(trend: 'uptrend' | 'downtrend' | 'ranging'): string {
  switch (trend) {
    case 'uptrend':
      return 'text-green-500';
    case 'downtrend':
      return 'text-red-500';
    default:
      return 'text-yellow-500';
  }
}

/**
 * Get color for signal strength
 */
export function getSignalColor(strength: string): string {
  switch (strength) {
    case 'STRONG BUY':
      return 'bg-green-600 text-white';
    case 'BUY':
      return 'bg-green-500 text-white';
    case 'STRONG SELL':
      return 'bg-red-600 text-white';
    case 'SELL':
      return 'bg-red-500 text-white';
    default:
      return 'bg-gray-600 text-white';
  }
}

/**
 * Get signal icon
 */
export function getSignalIcon(direction: string): string {
  switch (direction) {
    case 'LONG':
      return '↑';
    case 'SHORT':
      return '↓';
    default:
      return '—';
  }
}
