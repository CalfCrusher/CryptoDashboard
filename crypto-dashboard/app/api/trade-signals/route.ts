import { NextResponse } from 'next/server';

const BINANCE_API = 'https://api.binance.com/api/v3';

// Symbols to analyze
const SYMBOLS = [
  'BTCUSDT', 'BNBUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT',
  'DOGEUSDT', 'ADAUSDT', 'LTCUSDT', 'AVAXUSDT', 'PUMPUSDT',
  'DOTUSDT', 'SHIBUSDT', 'TRXUSDT', 'UNIUSDT', 'ATOMUSDT',
  'LINKUSDT', 'XLMUSDT', 'SUSHIUSDT', 'TRUMPUSDT', 'RESOLVUSDT',
  'HBARUSDT', 'STRKUSDT', 'ASTERUSDT', 'ENAUSDT', 'ZECUSDT',
  'FILUSDT', 'ALGOUSDT', 'ICPUSDT', 'ZROUSDT', 'WLFIUSDT'
];

interface BollingerBands {
  upper: number;
  middle: number;
  lower: number;
}

interface TradeSetup {
  side: 'LONG' | 'SHORT';
  entry: number;
  tp: number;
  sl: number;
  tpPct: number;
  slPct: number;
  rr: number;
  isRetest?: boolean;
  currentPrice?: number;
}

interface TradeSignal {
  symbol: string;
  price: number;
  state: string;
  actionHint: string;
  tradeable: boolean;
  rsi: number | null;
  trend: 'UP' | 'DOWN';
  bb: BollingerBands;
  tradeSetup: TradeSetup | null;
  priceChange24h: number;
  volumeOk: boolean;
}

// Calculate Simple Moving Average
function calculateSMA(arr: number[], period: number): number | null {
  if (!arr || arr.length < period) return null;
  const sum = arr.slice(-period).reduce((acc, val) => acc + val, 0);
  return sum / period;
}

// Calculate Standard Deviation
function calculateStdDev(arr: number[], period: number, sma: number): number | null {
  if (!arr || arr.length < period) return null;
  const recentValues = arr.slice(-period);
  const variance = recentValues.reduce((acc, val) => acc + Math.pow(val - sma, 2), 0) / period;
  return Math.sqrt(variance);
}

// Calculate Bollinger Bands
function calculateBollingerBands(closes: number[], period = 20, multiplier = 2): BollingerBands | null {
  if (!closes || closes.length < period) return null;
  const sma = calculateSMA(closes, period);
  if (sma === null) return null;
  const stdDev = calculateStdDev(closes, period, sma);
  if (stdDev === null) return null;
  return {
    upper: sma + (stdDev * multiplier),
    middle: sma,
    lower: sma - (stdDev * multiplier)
  };
}

// Calculate RSI
function calculateRSI(closes: number[], period = 14): number | null {
  if (!closes || closes.length < period + 1) return null;
  
  const changes: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i] - closes[i - 1]);
  }
  
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i];
    } else {
      avgLoss += Math.abs(changes[i]);
    }
  }
  avgGain /= period;
  avgLoss /= period;
  
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    if (change > 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
    }
  }
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// Fetch klines from Binance
async function fetchKlines(symbol: string, limit = 30): Promise<any[]> {
  const response = await fetch(`${BINANCE_API}/klines?symbol=${symbol}&interval=1d&limit=${limit}`);
  if (!response.ok) throw new Error(`Failed to fetch klines for ${symbol}`);
  return response.json();
}

// Fetch 24hr ticker
async function fetch24hrTicker(symbol: string): Promise<any> {
  const response = await fetch(`${BINANCE_API}/ticker/24hr?symbol=${symbol}`);
  if (!response.ok) throw new Error(`Failed to fetch ticker for ${symbol}`);
  return response.json();
}

// Calculate trade setup
function calculateTradeSetup(
  state: string,
  price: number,
  bb: BollingerBands
): TradeSetup | null {
  if (state === 'NEAR_LONG') {
    const entry = bb.lower;
    const tp = bb.middle;
    const sl = bb.lower * 0.97;
    const tpPct = ((tp - entry) / entry * 100);
    const slPct = ((entry - sl) / entry * 100);
    const rr = ((tp - entry) / (entry - sl));
    
    return { side: 'LONG', entry, tp, sl, tpPct, slPct, rr };
  } else if (state === 'NEAR_SHORT') {
    const entry = bb.upper;
    const tp = bb.middle;
    const sl = bb.upper * 1.03;
    const tpPct = ((entry - tp) / entry * 100);
    const slPct = ((sl - entry) / entry * 100);
    const rr = ((entry - tp) / (sl - entry));
    
    return { side: 'SHORT', entry, tp, sl, tpPct, slPct, rr };
  } else if (state === 'CROSSED_SHORT') {
    const entry = bb.upper;
    const priceGainPct = ((price - entry) / entry) * 100;
    const tp = priceGainPct >= 5 ? price : entry * 1.05;
    const sl = entry * 0.97;
    const tpPct = ((tp - entry) / entry * 100);
    const slPct = ((entry - sl) / entry * 100);
    const rr = ((tp - entry) / (entry - sl));
    
    return { side: 'LONG', entry, tp, sl, tpPct, slPct, rr, currentPrice: price, isRetest: true };
  } else if (state === 'CROSSED_LONG') {
    const entry = bb.lower;
    const priceDropPct = ((entry - price) / entry) * 100;
    const tp = priceDropPct >= 5 ? price : entry * 0.95;
    const sl = entry * 1.03;
    const tpPct = ((entry - tp) / entry * 100);
    const slPct = ((sl - entry) / entry * 100);
    const rr = ((entry - tp) / (sl - entry));
    
    return { side: 'SHORT', entry, tp, sl, tpPct, slPct, rr, currentPrice: price, isRetest: true };
  }
  
  return null;
}

// Analyze a single symbol
async function analyzeSymbol(symbol: string, alertThreshold = 1.0, volumeMultiplier = 1.2): Promise<TradeSignal | null> {
  try {
    const [rawKlines, ticker24h] = await Promise.all([
      fetchKlines(symbol, 30),
      fetch24hrTicker(symbol)
    ]);

    const candles = rawKlines.map((k: any) => ({
      close: parseFloat(k[4]),
      volume: parseFloat(k[5])
    }));

    const closes = candles.map(c => c.close);
    const volumes = candles.map(c => c.volume);

    const bb = calculateBollingerBands(closes, 20, 2);
    if (!bb) return null;

    const rsi = calculateRSI(closes, 14);
    const volumeSMA = calculateSMA(volumes, 20);
    const currentPrice = parseFloat(ticker24h.lastPrice || ticker24h.price);

    // Volume check
    const latestVolume = volumes[volumes.length - 1];
    const volumeOk = volumeSMA !== null && latestVolume > volumeSMA * volumeMultiplier;

    // Trend determination
    const trend: 'UP' | 'DOWN' = currentPrice > bb.middle ? 'UP' : 'DOWN';

    // State determination
    const pctToLong = ((currentPrice - bb.lower) / bb.lower) * 100;
    const pctToShort = ((currentPrice - bb.upper) / bb.upper) * 100;
    const absPctToLong = Math.abs(pctToLong);
    const absPctToShort = Math.abs(pctToShort);

    const crossedLong = currentPrice <= bb.lower;
    const crossedShort = currentPrice >= bb.upper;
    const nearLong = !crossedLong && absPctToLong <= alertThreshold;
    const nearShort = !crossedShort && absPctToShort <= alertThreshold;

    let state = 'NONE';
    if (crossedLong) state = 'CROSSED_LONG';
    else if (crossedShort) state = 'CROSSED_SHORT';
    else if (nearLong) state = 'NEAR_LONG';
    else if (nearShort) state = 'NEAR_SHORT';

    // RSI flags
    const rsiOversold = rsi !== null && rsi < 30;
    const rsiOverbought = rsi !== null && rsi > 70;

    // Action hints
    let actionHint = 'none';

    if (state === 'NEAR_LONG') {
      if (trend === 'DOWN') {
        actionHint = 'avoid_long_downtrend';
      } else if (rsiOversold) {
        actionHint = volumeOk ? 'high_confidence_long' : 'watch_long_oversold_low_vol';
      } else {
        actionHint = volumeOk ? 'consider_limit_long_uptrend' : 'watch_near_long_low_vol';
      }
    } else if (state === 'NEAR_SHORT') {
      if (trend === 'UP') {
        actionHint = 'avoid_short_uptrend';
      } else if (rsiOverbought) {
        actionHint = volumeOk ? 'high_confidence_short' : 'watch_short_overbought_low_vol';
      } else {
        actionHint = volumeOk ? 'consider_limit_short_downtrend' : 'watch_near_short_low_vol';
      }
    }

    // Tradeable flag
    const trendOk = (state === 'NEAR_LONG' && trend === 'UP') || (state === 'NEAR_SHORT' && trend === 'DOWN');
    const tradeable = (state === 'NEAR_LONG' || state === 'NEAR_SHORT') && volumeOk && trendOk;

    const tradeSetup = calculateTradeSetup(state, currentPrice, bb);

    return {
      symbol,
      price: currentPrice,
      state,
      actionHint,
      tradeable,
      rsi,
      trend,
      bb,
      tradeSetup,
      priceChange24h: parseFloat(ticker24h.priceChangePercent),
      volumeOk
    };
  } catch (error) {
    console.error(`Error analyzing ${symbol}:`, error);
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const symbolsParam = url.searchParams.get('symbols');
    const symbols = symbolsParam ? symbolsParam.split(',') : SYMBOLS;

    const results = await Promise.all(
      symbols.map(symbol => analyzeSymbol(symbol.toUpperCase()))
    );

    const signals = results.filter((r): r is TradeSignal => r !== null);

    // Categorize signals
    const safeSignals = signals.filter(s => s.tradeable && s.tradeSetup && s.tradeSetup.rr >= 2);
    const retestSignals = signals.filter(s => s.tradeSetup?.isRetest);
    const watchSignals = signals.filter(s => !s.tradeable && (s.state === 'NEAR_LONG' || s.state === 'NEAR_SHORT'));

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      total: signals.length,
      safeSignals,
      retestSignals,
      watchSignals,
      allSignals: signals
    });
  } catch (error) {
    console.error('Error fetching trade signals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trade signals' },
      { status: 500 }
    );
  }
}
