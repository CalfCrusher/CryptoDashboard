import { 
  PriceData, 
  TechnicalIndicators, 
  MarketStructure, 
  VolumeMetrics,
  TradingSignal,
  SignalDirection,
  SignalStrength,
  RiskManagement
} from '@/types';

/**
 * Generate trading signal based on confluence of indicators
 */
export function generateTradingSignal(
  currentPrice: number,
  indicators: TechnicalIndicators,
  marketStructure: MarketStructure,
  volumeMetrics: VolumeMetrics,
  priceData: PriceData[]
): TradingSignal {
  const confluenceFactors: { [key: string]: boolean } = {};
  const reasons: string[] = [];
  let bullishCount = 0;
  let bearishCount = 0;
  
  // 1. MOVING AVERAGE ALIGNMENT
  const { ema20, ema50, sma200 } = indicators.movingAverages;
  const maAlignmentBullish = currentPrice > ema20 && ema20 > ema50 && ema50 > sma200;
  const maAlignmentBearish = currentPrice < ema20 && ema20 < ema50 && ema50 < sma200;
  
  if (maAlignmentBullish) {
    confluenceFactors['MA_BULLISH'] = true;
    bullishCount++;
    reasons.push('Price above all major MAs (bullish alignment)');
  } else if (maAlignmentBearish) {
    confluenceFactors['MA_BEARISH'] = true;
    bearishCount++;
    reasons.push('Price below all major MAs (bearish alignment)');
  }
  
  // 2. RSI MOMENTUM
  const { rsi14 } = indicators.rsi;
  if (rsi14 > 50 && rsi14 < 70) {
    confluenceFactors['RSI_BULLISH'] = true;
    bullishCount++;
    reasons.push(`RSI ${rsi14.toFixed(1)} shows bullish momentum`);
  } else if (rsi14 < 50 && rsi14 > 30) {
    confluenceFactors['RSI_BEARISH'] = true;
    bearishCount++;
    reasons.push(`RSI ${rsi14.toFixed(1)} shows bearish momentum`);
  } else if (rsi14 >= 70) {
    reasons.push(`RSI ${rsi14.toFixed(1)} overbought - caution`);
  } else if (rsi14 <= 30) {
    reasons.push(`RSI ${rsi14.toFixed(1)} oversold - caution`);
  }
  
  // 3. MACD SIGNAL
  const { macd, signal, histogram } = indicators.macd;
  if (macd > signal && histogram > 0) {
    confluenceFactors['MACD_BULLISH'] = true;
    bullishCount++;
    reasons.push('MACD above signal line (bullish)');
  } else if (macd < signal && histogram < 0) {
    confluenceFactors['MACD_BEARISH'] = true;
    bearishCount++;
    reasons.push('MACD below signal line (bearish)');
  }
  
  // 4. ADX TREND STRENGTH
  const strongTrend = indicators.adx > 25;
  if (strongTrend) {
    confluenceFactors['STRONG_TREND'] = true;
    if (bullishCount > bearishCount) {
      bullishCount++;
      reasons.push(`ADX ${indicators.adx.toFixed(1)} confirms strong uptrend`);
    } else if (bearishCount > bullishCount) {
      bearishCount++;
      reasons.push(`ADX ${indicators.adx.toFixed(1)} confirms strong downtrend`);
    }
  } else {
    reasons.push(`ADX ${indicators.adx.toFixed(1)} - weak trend, ranging market`);
  }
  
  // 5. VOLUME CONFIRMATION
  if (volumeMetrics.ratio > 1.2 && volumeMetrics.trend === 'increasing') {
    confluenceFactors['VOLUME_CONFIRM'] = true;
    if (bullishCount > bearishCount) {
      bullishCount++;
      reasons.push('Volume increasing confirms uptrend');
    } else if (bearishCount > bullishCount) {
      bearishCount++;
      reasons.push('Volume increasing confirms downtrend');
    }
  }
  
  // 6. MARKET STRUCTURE
  if (marketStructure.higherHighs && marketStructure.higherLows) {
    confluenceFactors['STRUCTURE_BULLISH'] = true;
    bullishCount++;
    reasons.push('Higher highs & higher lows (bullish structure)');
  } else if (marketStructure.lowerHighs && marketStructure.lowerLows) {
    confluenceFactors['STRUCTURE_BEARISH'] = true;
    bearishCount++;
    reasons.push('Lower highs & lower lows (bearish structure)');
  }
  
  // 7. STOCHASTIC RSI
  const { k, d } = indicators.stochRsi;
  if (k > 50 && k < 80) {
    confluenceFactors['STOCH_BULLISH'] = true;
    bullishCount++;
    reasons.push('Stochastic RSI bullish');
  } else if (k < 50 && k > 20) {
    confluenceFactors['STOCH_BEARISH'] = true;
    bearishCount++;
    reasons.push('Stochastic RSI bearish');
  }
  
  // 8. BOLLINGER BANDS POSITION
  const { upper, lower } = indicators.bollingerBands;
  const bbPosition = (currentPrice - lower) / (upper - lower);
  if (bbPosition > 0.7) {
    reasons.push('Price near upper Bollinger Band');
  } else if (bbPosition < 0.3) {
    reasons.push('Price near lower Bollinger Band');
  }
  
  // 9. RATE OF CHANGE
  if (indicators.roc > 5) {
    confluenceFactors['ROC_BULLISH'] = true;
    bullishCount++;
    reasons.push(`Strong positive momentum (ROC: ${indicators.roc.toFixed(2)}%)`);
  } else if (indicators.roc < -5) {
    confluenceFactors['ROC_BEARISH'] = true;
    bearishCount++;
    reasons.push(`Strong negative momentum (ROC: ${indicators.roc.toFixed(2)}%)`);
  }
  
  // DETERMINE SIGNAL
  const confluenceCount = bullishCount > bearishCount ? bullishCount : bearishCount;
  const totalFactors = Object.keys(confluenceFactors).length;
  
  let direction: SignalDirection = 'WAIT';
  let strength: SignalStrength = 'NEUTRAL';
  let confidenceScore = 5;
  
  // LONG SIGNAL
  if (bullishCount >= 5 && bullishCount > bearishCount * 2) {
    direction = 'LONG';
    
    if (bullishCount >= 7) {
      strength = 'STRONG BUY';
      confidenceScore = Math.min(10, 7 + bullishCount - 7);
    } else if (bullishCount >= 5) {
      strength = 'BUY';
      confidenceScore = 6 + bullishCount - 5;
    }
  }
  // SHORT SIGNAL
  else if (bearishCount >= 5 && bearishCount > bullishCount * 2) {
    direction = 'SHORT';
    
    if (bearishCount >= 7) {
      strength = 'STRONG SELL';
      confidenceScore = Math.min(10, 7 + bearishCount - 7);
    } else if (bearishCount >= 5) {
      strength = 'SELL';
      confidenceScore = 6 + bearishCount - 5;
    }
  }
  // NEUTRAL - conflicting signals or weak trend
  else {
    reasons.push('Insufficient confluence or conflicting signals - WAIT for clarity');
  }
  
  // Calculate momentum score (1-100)
  const momentumScore = calculateMomentumScore(indicators, marketStructure, volumeMetrics);
  
  return {
    direction,
    strength,
    confluenceCount,
    confidenceScore,
    momentum: momentumScore,
    reasons
  };
}

/**
 * Calculate overall momentum score (1-100)
 */
function calculateMomentumScore(
  indicators: TechnicalIndicators,
  marketStructure: MarketStructure,
  volumeMetrics: VolumeMetrics
): number {
  let score = 50; // Start neutral
  
  // RSI contribution (±15 points)
  const rsiDeviation = indicators.rsi.rsi14 - 50;
  score += (rsiDeviation / 50) * 15;
  
  // MACD contribution (±10 points)
  if (indicators.macd.histogram > 0) {
    score += 10;
  } else if (indicators.macd.histogram < 0) {
    score -= 10;
  }
  
  // ADX contribution (±10 points)
  const adxStrength = Math.min(indicators.adx / 50, 1);
  const trendDirection = indicators.rsi.rsi14 > 50 ? 1 : -1;
  score += adxStrength * 10 * trendDirection;
  
  // ROC contribution (±10 points)
  score += Math.max(-10, Math.min(10, indicators.roc / 2));
  
  // Volume contribution (±5 points)
  if (volumeMetrics.trend === 'increasing' && volumeMetrics.ratio > 1) {
    score += 5 * (indicators.rsi.rsi14 > 50 ? 1 : -1);
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Calculate risk management levels
 */
export function calculateRiskManagement(
  currentPrice: number,
  signal: TradingSignal,
  atr: number,
  marketStructure: MarketStructure,
  priceData: PriceData[]
): RiskManagement {
  const entryPrice = currentPrice;
  let stopLoss: number;
  let takeProfit1: number;
  let takeProfit2: number;
  let takeProfit3: number;
  
  if (signal.direction === 'LONG') {
    // Stop loss: below recent swing low with ATR buffer
    const recentLows = priceData.slice(-20).map(d => d.low);
    const swingLow = Math.min(...recentLows);
    stopLoss = swingLow - (atr * 0.5);
    
    // Take profits at 1x, 2x, 3x ATR
    takeProfit1 = entryPrice + (atr * 1.5);
    takeProfit2 = entryPrice + (atr * 2.5);
    takeProfit3 = entryPrice + (atr * 4);
    
  } else if (signal.direction === 'SHORT') {
    // Stop loss: above recent swing high with ATR buffer
    const recentHighs = priceData.slice(-20).map(d => d.high);
    const swingHigh = Math.max(...recentHighs);
    stopLoss = swingHigh + (atr * 0.5);
    
    // Take profits at 1x, 2x, 3x ATR
    takeProfit1 = entryPrice - (atr * 1.5);
    takeProfit2 = entryPrice - (atr * 2.5);
    takeProfit3 = entryPrice - (atr * 4);
    
  } else {
    // WAIT signal - no trade
    stopLoss = currentPrice;
    takeProfit1 = currentPrice;
    takeProfit2 = currentPrice;
    takeProfit3 = currentPrice;
  }
  
  // Calculate risk/reward ratio
  const risk = Math.abs(entryPrice - stopLoss);
  const reward = Math.abs(takeProfit1 - entryPrice);
  const riskRewardRatio = risk > 0 ? reward / risk : 0;
  
  return {
    entryPrice,
    stopLoss,
    takeProfit1,
    takeProfit2,
    takeProfit3,
    riskRewardRatio,
    maxRisk: (risk / entryPrice) * 100 // Risk as percentage
  };
}

/**
 * Detect divergences between price and indicators
 */
export function detectDivergences(
  priceData: PriceData[],
  rsiValues: number[]
): { bullish: boolean; bearish: boolean; description: string } {
  if (priceData.length < 20 || rsiValues.length < 20) {
    return { bullish: false, bearish: false, description: 'Insufficient data' };
  }
  
  const recentPrices = priceData.slice(-10);
  const recentRSI = rsiValues.slice(-10);
  
  // Simple divergence detection
  const priceHigher = recentPrices[recentPrices.length - 1].close > recentPrices[0].close;
  const rsiHigher = recentRSI[recentRSI.length - 1] > recentRSI[0];
  
  let bullish = false;
  let bearish = false;
  let description = 'No divergence detected';
  
  // Bullish divergence: price making lower lows, RSI making higher lows
  if (!priceHigher && rsiHigher) {
    bullish = true;
    description = 'Bullish divergence: Price lower, RSI higher';
  }
  
  // Bearish divergence: price making higher highs, RSI making lower highs
  if (priceHigher && !rsiHigher) {
    bearish = true;
    description = 'Bearish divergence: Price higher, RSI lower';
  }
  
  return { bullish, bearish, description };
}

/**
 * Determine market regime (trending vs ranging)
 */
export function detectMarketRegime(
  adx: number,
  bollingerBands: { upper: number; middle: number; lower: number },
  currentPrice: number
): 'trending' | 'ranging' {
  const bbWidth = (bollingerBands.upper - bollingerBands.lower) / bollingerBands.middle;
  
  // Strong ADX and wide Bollinger Bands = trending
  // Weak ADX and narrow Bollinger Bands = ranging
  if (adx > 25 && bbWidth > 0.1) {
    return 'trending';
  }
  
  return 'ranging';
}
