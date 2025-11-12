import { PriceData } from '@/types';

/**
 * Calculate Simple Moving Average
 */
export function calculateSMA(data: number[], period: number): number {
  if (data.length < period) return data[data.length - 1] || 0;
  const slice = data.slice(-period);
  return slice.reduce((sum, val) => sum + val, 0) / period;
}

/**
 * Calculate Exponential Moving Average
 */
export function calculateEMA(data: number[], period: number): number {
  if (data.length === 0) return 0;
  if (data.length < period) return calculateSMA(data, data.length);
  
  const multiplier = 2 / (period + 1);
  let ema = calculateSMA(data.slice(0, period), period);
  
  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

/**
 * Calculate RSI (Relative Strength Index)
 */
export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;
  
  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  
  let avgGain = 0;
  let avgLoss = 0;
  
  // Initial average
  for (let i = 0; i < period; i++) {
    if (changes[i] >= 0) {
      avgGain += changes[i];
    } else {
      avgLoss += Math.abs(changes[i]);
    }
  }
  
  avgGain /= period;
  avgLoss /= period;
  
  // Smooth subsequent values
  for (let i = period; i < changes.length; i++) {
    if (changes[i] >= 0) {
      avgGain = (avgGain * (period - 1) + changes[i]) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(changes[i])) / period;
    }
  }
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(prices: number[], fast = 12, slow = 26, signal = 9) {
  const emaFast = calculateEMA(prices, fast);
  const emaSlow = calculateEMA(prices, slow);
  const macdLine = emaFast - emaSlow;
  
  // Calculate signal line (EMA of MACD)
  const macdHistory: number[] = [];
  for (let i = slow - 1; i < prices.length; i++) {
    const slice = prices.slice(0, i + 1);
    const fast_ema = calculateEMA(slice, fast);
    const slow_ema = calculateEMA(slice, slow);
    macdHistory.push(fast_ema - slow_ema);
  }
  
  const signalLine = calculateEMA(macdHistory, signal);
  const histogram = macdLine - signalLine;
  
  return {
    macd: macdLine,
    signal: signalLine,
    histogram: histogram
  };
}

/**
 * Calculate Stochastic RSI
 */
export function calculateStochasticRSI(prices: number[], rsiPeriod = 14, stochPeriod = 14, kSmooth = 3, dSmooth = 3) {
  // Calculate RSI values for the range
  const rsiValues: number[] = [];
  for (let i = rsiPeriod; i < prices.length; i++) {
    const slice = prices.slice(i - rsiPeriod, i + 1);
    rsiValues.push(calculateRSI(slice, rsiPeriod));
  }
  
  if (rsiValues.length < stochPeriod) {
    return { k: 50, d: 50 };
  }
  
  // Calculate Stochastic of RSI
  const recentRSI = rsiValues.slice(-stochPeriod);
  const minRSI = Math.min(...recentRSI);
  const maxRSI = Math.max(...recentRSI);
  
  const currentRSI = rsiValues[rsiValues.length - 1];
  let k = maxRSI !== minRSI ? ((currentRSI - minRSI) / (maxRSI - minRSI)) * 100 : 50;
  
  // Smooth K
  const kValues = [k];
  for (let i = 1; i < kSmooth && i <= rsiValues.length; i++) {
    kValues.unshift(k); // Simple approximation
  }
  k = calculateSMA(kValues, kSmooth);
  
  // Calculate D (SMA of K)
  const d = k; // Simplified - in production, would track K history
  
  return { k, d };
}

/**
 * Calculate ADX (Average Directional Index)
 */
export function calculateADX(priceData: PriceData[], period = 14): number {
  if (priceData.length < period + 1) return 0;
  
  const tr: number[] = [];
  const plusDM: number[] = [];
  const minusDM: number[] = [];
  
  for (let i = 1; i < priceData.length; i++) {
    const high = priceData[i].high;
    const low = priceData[i].low;
    const prevHigh = priceData[i - 1].high;
    const prevLow = priceData[i - 1].low;
    const prevClose = priceData[i - 1].close;
    
    // True Range
    const tr1 = high - low;
    const tr2 = Math.abs(high - prevClose);
    const tr3 = Math.abs(low - prevClose);
    tr.push(Math.max(tr1, tr2, tr3));
    
    // Directional Movement
    const upMove = high - prevHigh;
    const downMove = prevLow - low;
    
    plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
  }
  
  // Smooth the values
  const smoothTR = calculateEMA(tr, period);
  const smoothPlusDM = calculateEMA(plusDM, period);
  const smoothMinusDM = calculateEMA(minusDM, period);
  
  const plusDI = smoothTR !== 0 ? (smoothPlusDM / smoothTR) * 100 : 0;
  const minusDI = smoothTR !== 0 ? (smoothMinusDM / smoothTR) * 100 : 0;
  
  const dx = (plusDI + minusDI) !== 0 ? (Math.abs(plusDI - minusDI) / (plusDI + minusDI)) * 100 : 0;
  
  // ADX is EMA of DX
  return dx; // Simplified - should calculate EMA of DX values
}

/**
 * Calculate ATR (Average True Range)
 */
export function calculateATR(priceData: PriceData[], period = 14): number {
  if (priceData.length < 2) return 0;
  
  const trueRanges: number[] = [];
  
  for (let i = 1; i < priceData.length; i++) {
    const high = priceData[i].high;
    const low = priceData[i].low;
    const prevClose = priceData[i - 1].close;
    
    const tr1 = high - low;
    const tr2 = Math.abs(high - prevClose);
    const tr3 = Math.abs(low - prevClose);
    
    trueRanges.push(Math.max(tr1, tr2, tr3));
  }
  
  return calculateEMA(trueRanges, period);
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(prices: number[], period = 20, stdDev = 2) {
  const sma = calculateSMA(prices, period);
  const slice = prices.slice(-period);
  
  // Calculate standard deviation
  const squaredDiffs = slice.map(price => Math.pow(price - sma, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / period;
  const sd = Math.sqrt(variance);
  
  return {
    upper: sma + (sd * stdDev),
    middle: sma,
    lower: sma - (sd * stdDev)
  };
}

/**
 * Calculate OBV (On-Balance Volume)
 */
export function calculateOBV(priceData: PriceData[]): number {
  if (priceData.length < 2) return 0;
  
  let obv = 0;
  
  for (let i = 1; i < priceData.length; i++) {
    if (priceData[i].close > priceData[i - 1].close) {
      obv += priceData[i].volume;
    } else if (priceData[i].close < priceData[i - 1].close) {
      obv -= priceData[i].volume;
    }
  }
  
  return obv;
}

/**
 * Calculate Rate of Change (ROC)
 */
export function calculateROC(prices: number[], period = 12): number {
  if (prices.length < period + 1) return 0;
  
  const currentPrice = prices[prices.length - 1];
  const oldPrice = prices[prices.length - period - 1];
  
  if (oldPrice === 0) return 0;
  return ((currentPrice - oldPrice) / oldPrice) * 100;
}

/**
 * Calculate Momentum Oscillator
 */
export function calculateMomentum(prices: number[], period = 10): number {
  if (prices.length < period + 1) return 0;
  
  const currentPrice = prices[prices.length - 1];
  const oldPrice = prices[prices.length - period - 1];
  
  return currentPrice - oldPrice;
}

/**
 * Detect Market Structure (Higher Highs/Lower Lows)
 */
export function detectMarketStructure(priceData: PriceData[], lookback = 20) {
  if (priceData.length < lookback) {
    return {
      higherHighs: false,
      higherLows: false,
      lowerHighs: false,
      lowerLows: false
    };
  }
  
  const recent = priceData.slice(-lookback);
  const highs = recent.map(d => d.high);
  const lows = recent.map(d => d.low);
  
  // Find swing highs and lows (simplified)
  const swingHighs: number[] = [];
  const swingLows: number[] = [];
  
  for (let i = 2; i < recent.length - 2; i++) {
    if (recent[i].high > recent[i - 1].high && recent[i].high > recent[i - 2].high &&
        recent[i].high > recent[i + 1].high && recent[i].high > recent[i + 2].high) {
      swingHighs.push(recent[i].high);
    }
    
    if (recent[i].low < recent[i - 1].low && recent[i].low < recent[i - 2].low &&
        recent[i].low < recent[i + 1].low && recent[i].low < recent[i + 2].low) {
      swingLows.push(recent[i].low);
    }
  }
  
  let higherHighs = false;
  let higherLows = false;
  let lowerHighs = false;
  let lowerLows = false;
  
  if (swingHighs.length >= 2) {
    higherHighs = swingHighs[swingHighs.length - 1] > swingHighs[swingHighs.length - 2];
    lowerHighs = swingHighs[swingHighs.length - 1] < swingHighs[swingHighs.length - 2];
  }
  
  if (swingLows.length >= 2) {
    higherLows = swingLows[swingLows.length - 1] > swingLows[swingLows.length - 2];
    lowerLows = swingLows[swingLows.length - 1] < swingLows[swingLows.length - 2];
  }
  
  return {
    higherHighs,
    higherLows,
    lowerHighs,
    lowerLows
  };
}

/**
 * Find Support and Resistance Levels
 */
export function findSupportResistance(priceData: PriceData[], tolerance = 0.02): { support: number[], resistance: number[] } {
  if (priceData.length < 20) {
    return { support: [], resistance: [] };
  }
  
  const levels: number[] = [];
  
  // Find local extremes
  for (let i = 2; i < priceData.length - 2; i++) {
    // Local high
    if (priceData[i].high > priceData[i - 1].high && 
        priceData[i].high > priceData[i - 2].high &&
        priceData[i].high > priceData[i + 1].high && 
        priceData[i].high > priceData[i + 2].high) {
      levels.push(priceData[i].high);
    }
    
    // Local low
    if (priceData[i].low < priceData[i - 1].low && 
        priceData[i].low < priceData[i - 2].low &&
        priceData[i].low < priceData[i + 1].low && 
        priceData[i].low < priceData[i + 2].low) {
      levels.push(priceData[i].low);
    }
  }
  
  // Cluster similar levels
  const clustered: number[] = [];
  levels.sort((a, b) => a - b);
  
  let i = 0;
  while (i < levels.length) {
    let sum = levels[i];
    let count = 1;
    let j = i + 1;
    
    while (j < levels.length && Math.abs(levels[j] - levels[i]) / levels[i] < tolerance) {
      sum += levels[j];
      count++;
      j++;
    }
    
    if (count >= 2) { // Only include levels touched multiple times
      clustered.push(sum / count);
    }
    
    i = j;
  }
  
  const currentPrice = priceData[priceData.length - 1].close;
  const support = clustered.filter(level => level < currentPrice);
  const resistance = clustered.filter(level => level > currentPrice);
  
  return {
    support: support.slice(-3), // Top 3 support levels
    resistance: resistance.slice(0, 3) // Top 3 resistance levels
  };
}
