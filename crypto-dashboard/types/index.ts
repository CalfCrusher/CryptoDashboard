// Core Data Types
export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  rank: number;
}

export interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CurrentPrice {
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  high52w: number;
  low52w: number;
  marketCap: number;
  volume24h: number;
}

// Technical Indicators
export interface MovingAverages {
  ema20: number;
  ema50: number;
  sma200: number;
}

export interface RSIData {
  rsi14: number;
  rsi21: number;
}

export interface MACDData {
  macd: number;
  signal: number;
  histogram: number;
}

export interface StochasticRSI {
  k: number;
  d: number;
}

export interface BollingerBands {
  upper: number;
  middle: number;
  lower: number;
}

export interface TechnicalIndicators {
  movingAverages: MovingAverages;
  rsi: RSIData;
  macd: MACDData;
  stochRsi: StochasticRSI;
  adx: number;
  atr: number;
  obv: number;
  roc: number;
  momentum: number;
  bollingerBands: BollingerBands;
}

// Volume Analysis
export interface VolumeMetrics {
  current: number;
  average20d: number;
  ratio: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  volumeRoc: number;
}

// Market Structure
export interface MarketStructure {
  trend: 'uptrend' | 'downtrend' | 'ranging';
  higherHighs: boolean;
  higherLows: boolean;
  lowerHighs: boolean;
  lowerLows: boolean;
  supportLevels: number[];
  resistanceLevels: number[];
  swingHigh: number;
  swingLow: number;
}

// Trading Signals
export type SignalStrength = 'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG SELL';
export type SignalDirection = 'LONG' | 'SHORT' | 'WAIT';

export interface TradingSignal {
  direction: SignalDirection;
  strength: SignalStrength;
  confluenceCount: number;
  confidenceScore: number; // 1-10
  momentum: number; // 1-100
  reasons: string[];
}

export interface RiskManagement {
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  riskRewardRatio: number;
  positionSize?: number;
  maxRisk: number;
}

// Complete Asset Analysis
export interface AssetAnalysis {
  asset: CryptoAsset;
  currentPrice: CurrentPrice;
  indicators: TechnicalIndicators;
  volumeMetrics: VolumeMetrics;
  marketStructure: MarketStructure;
  signal: TradingSignal;
  riskManagement: RiskManagement;
  sparkline?: number[]; // last 24h close prices for micro-chart
  recent5mChangePct?: number; // % change between last two 5m closes
  lastUpdate: number;
}

// Market Overview
export interface MarketOverview {
  btcDominance: number;
  totalMarketCap: number;
  altseasonIndicator: number; // 0-100
  correlationMatrix: Record<string, Record<string, number>>;
  fearGreed?: {
    value: number; // 0-100
    classification: string; // e.g., Extreme Fear, Fear, Neutral, Greed, Extreme Greed
    updatedAt?: number;
  };
}

// Multi-Timeframe Data
export type Timeframe = '5m' | '1h' | '4h' | '1d';

export interface MultiTimeframeAnalysis {
  '1h': AssetAnalysis;
  '4h': AssetAnalysis;
  '1d': AssetAnalysis;
  alignment: boolean; // All timeframes agree
}

// Dashboard State
export interface DashboardData {
  assets: AssetAnalysis[];
  marketOverview: MarketOverview;
  lastUpdate: number;
  isLoading: boolean;
  error?: string;
  debugOverride?: {
    active: boolean;
    mode?: 'strongBuy' | 'strongSell';
    affectedSymbol?: string;
  };
}

// API Response Types
export interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  ath: number;
  atl: number;
}

export interface BinanceKlineData {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  trades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
}
