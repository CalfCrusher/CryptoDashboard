import axios from 'axios';
import { CoinGeckoMarketData, BinanceKlineData, PriceData } from '@/types';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const BINANCE_API = 'https://api.binance.com/api/v3';

// Top 5 cryptocurrencies by market cap
export const TOP_ASSETS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' }
];

// Symbol mapping for Binance
const BINANCE_SYMBOLS: Record<string, string> = {
  'bitcoin': 'BTCUSDT',
  'ethereum': 'ETHUSDT',
  'binancecoin': 'BNBUSDT',
  'solana': 'SOLUSDT',
  'ripple': 'XRPUSDT'
};

/**
 * Fetch current market data from CoinGecko
 */
export async function fetchMarketData(): Promise<CoinGeckoMarketData[]> {
  try {
    const ids = TOP_ASSETS.map(a => a.id).join(',');
    const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        ids: ids,
        order: 'market_cap_desc',
        per_page: 5,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching market data from CoinGecko:', error);
    throw error;
  }
}

/**
 * Fetch top altcoin movers from CoinGecko across a broader universe (default top 250 by market cap)
 * Filters out BTC/ETH and common stablecoins; applies basic liquidity filters.
 */
export async function fetchTopAltcoinMovers(options?: {
  perPage?: number;          // how many coins to fetch from CG (max 250)
  limit?: number;            // how many movers to return
  minMarketCapUSD?: number;  // filter out micro-caps
  minVolume24hUSD?: number;  // filter out illiquid
  absoluteChange?: boolean;  // sort by absolute 24h % move
}): Promise<CoinGeckoMarketData[]> {
  const {
    perPage = 250,
    limit = 12,
    minMarketCapUSD = 150_000_000,
    minVolume24hUSD = 10_000_000,
    absoluteChange = true,
  } = options || {};

  const STABLE_IDS = new Set([
    'tether', 'usd-coin', 'binance-usd', 'dai', 'frax', 'true-usd', 'pax-dollar',
    'gemini-dollar', 'first-digital-usd', 'usdd', 'terrausd', 'neutrino', 'lusd', 'gusd'
  ]);

  try {
    const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: Math.min(Math.max(perPage, 1), 250),
        page: 1,
        sparkline: false,
        price_change_percentage: '24h',
      }
    });

    const rows: CoinGeckoMarketData[] = response.data;
    const filtered = rows.filter((c) => {
      const id = c.id.toLowerCase();
      if (id === 'bitcoin' || id === 'ethereum') return false; // exclude majors
      if (STABLE_IDS.has(id)) return false; // exclude stables
      if (!Number.isFinite(c.price_change_percentage_24h)) return false;
      if ((c.market_cap || 0) < minMarketCapUSD) return false;
      if ((c.total_volume || 0) < minVolume24hUSD) return false;
      return true;
    });

    const sorted = filtered.sort((a, b) => {
      const pa = a.price_change_percentage_24h || 0;
      const pb = b.price_change_percentage_24h || 0;
      if (absoluteChange) return Math.abs(pb) - Math.abs(pa);
      return pb - pa; // positive movers only
    });

    return sorted.slice(0, limit);
  } catch (error) {
    console.error('Error fetching top altcoin movers from CoinGecko:', error);
    return [];
  }
}

/**
 * Fetch OHLCV data from Binance
 * @param symbol - Trading pair (e.g., BTCUSDT)
 * @param interval - Timeframe (1h, 4h, 1d)
 * @param limit - Number of candles to fetch
 */
export async function fetchOHLCVData(
  coinId: string,
  interval: '5m' | '1h' | '4h' | '1d',
  limit: number = 100
): Promise<PriceData[]> {
  try {
    const symbol = BINANCE_SYMBOLS[coinId];
    if (!symbol) {
      throw new Error(`Unknown coin ID: ${coinId}`);
    }
    
    const response = await axios.get(`${BINANCE_API}/klines`, {
      params: {
        symbol: symbol,
        interval: interval,
        limit: limit
      }
    });
    
    return response.data.map((kline: unknown[]) => ({
      timestamp: kline[0],
      open: parseFloat(kline[1] as string),
      high: parseFloat(kline[2] as string),
      low: parseFloat(kline[3] as string),
      close: parseFloat(kline[4] as string),
      volume: parseFloat(kline[5] as string)
    }));
  } catch (error) {
    console.error(`Error fetching OHLCV data for ${coinId}:`, error);
    throw error;
  }
}

/**
 * Fetch historical data for 52-week high/low calculation
 */
export async function fetch52WeekData(coinId: string): Promise<{ high: number; low: number }> {
  try {
    const symbol = BINANCE_SYMBOLS[coinId];
    if (!symbol) {
      throw new Error(`Unknown coin ID: ${coinId}`);
    }
    
    // Fetch daily data for approximately 1 year
    const response = await axios.get(`${BINANCE_API}/klines`, {
      params: {
        symbol: symbol,
        interval: '1d',
        limit: 365
      }
    });
    
    const prices = response.data.map((kline: unknown[]) => ({
      high: parseFloat(kline[2] as string),
      low: parseFloat(kline[3] as string)
    }));
    
    const high = Math.max(...prices.map((p: { high: number; low: number }) => p.high));
    const low = Math.min(...prices.map((p: { high: number; low: number }) => p.low));
    
    return { high, low };
  } catch (error) {
    console.error(`Error fetching 52-week data for ${coinId}:`, error);
    // Fallback to current price
    return { high: 0, low: 0 };
  }
}

/**
 * Fetch BTC dominance from CoinGecko
 */
export async function fetchBTCDominance(): Promise<number> {
  try {
    const response = await axios.get(`${COINGECKO_API}/global`);
    return response.data.data.market_cap_percentage.btc || 0;
  } catch (error) {
    console.error('Error fetching BTC dominance:', error);
    return 0;
  }
}

/**
 * Robust BTC dominance with fallback:
 * 1. Try global endpoint (fast timeout)
 * 2. If fails, approximate using market caps from current marketData (BTC market cap / sum tracked caps * 100)
 * 3. If still impossible, return previous or neutral 50
 */
export async function getBTCDominanceWithFallback(marketData?: CoinGeckoMarketData[], prevValue?: number): Promise<number> {
  // Attempt primary source with short timeout
  try {
    const response = await axios.get(`${COINGECKO_API}/global`, { timeout: 7000 });
    const v = response.data?.data?.market_cap_percentage?.btc;
    if (typeof v === 'number' && Number.isFinite(v)) return v;
  } catch (e) {
    // Silent; we'll fallback
  }

  // Fallback using provided marketData
  if (marketData && marketData.length > 0) {
    const btc = marketData.find(m => m.id === 'bitcoin');
    const sumCaps = marketData.reduce((s, m) => s + (m.market_cap || 0), 0);
    if (btc && sumCaps > 0) {
      const approx = (btc.market_cap / sumCaps) * 100;
      return Number.isFinite(approx) ? approx : (prevValue ?? 50);
    }
  }

  return prevValue ?? 50; // neutral fallback
}

/**
 * Calculate correlation between two price series
 */
export function calculateCorrelation(prices1: number[], prices2: number[]): number {
  if (prices1.length !== prices2.length || prices1.length === 0) return 0;
  
  const n = prices1.length;
  const mean1 = prices1.reduce((sum, val) => sum + val, 0) / n;
  const mean2 = prices2.reduce((sum, val) => sum + val, 0) / n;
  
  let numerator = 0;
  let sum1Sq = 0;
  let sum2Sq = 0;
  
  for (let i = 0; i < n; i++) {
    const diff1 = prices1[i] - mean1;
    const diff2 = prices2[i] - mean2;
    numerator += diff1 * diff2;
    sum1Sq += diff1 * diff1;
    sum2Sq += diff2 * diff2;
  }
  
  const denominator = Math.sqrt(sum1Sq * sum2Sq);
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Build correlation matrix for all assets
 */
export async function buildCorrelationMatrix(): Promise<Record<string, Record<string, number>>> {
  try {
    const priceDataPromises = TOP_ASSETS.map(asset => 
      fetchOHLCVData(asset.id, '1d', 30)
    );
    
    const allPriceData = await Promise.all(priceDataPromises);
    const matrix: Record<string, Record<string, number>> = {};
    
    for (let i = 0; i < TOP_ASSETS.length; i++) {
      const symbol1 = TOP_ASSETS[i].symbol;
      matrix[symbol1] = {};
      
      for (let j = 0; j < TOP_ASSETS.length; j++) {
        const symbol2 = TOP_ASSETS[j].symbol;
        
        if (i === j) {
          matrix[symbol1][symbol2] = 1;
        } else {
          const prices1 = allPriceData[i].map(d => d.close);
          const prices2 = allPriceData[j].map(d => d.close);
          matrix[symbol1][symbol2] = calculateCorrelation(prices1, prices2);
        }
      }
    }
    
    return matrix;
  } catch (error) {
    console.error('Error building correlation matrix:', error);
    return {};
  }
}

/**
 * Calculate Altseason Indicator
 * High value (>75) indicates altseason (altcoins outperforming BTC)
 * Low value (<25) indicates BTC season
 */
export async function calculateAltseasonIndicator(): Promise<number> {
  try {
    // Fetch 30-day performance for BTC and top altcoins
    const btcData = await fetchOHLCVData('bitcoin', '1d', 30);
    const ethData = await fetchOHLCVData('ethereum', '1d', 30);
    const bnbData = await fetchOHLCVData('binancecoin', '1d', 30);
    
    if (btcData.length === 0 || ethData.length === 0 || bnbData.length === 0) {
      return 50;
    }
    
    const btcReturn = (btcData[btcData.length - 1].close - btcData[0].close) / btcData[0].close;
    const ethReturn = (ethData[ethData.length - 1].close - ethData[0].close) / ethData[0].close;
    const bnbReturn = (bnbData[bnbData.length - 1].close - bnbData[0].close) / bnbData[0].close;
    
    const altAvgReturn = (ethReturn + bnbReturn) / 2;
    
    // Normalize to 0-100 scale
    const relativePerformance = altAvgReturn - btcReturn;
    const indicator = 50 + (relativePerformance * 500); // Scale factor
    
    return Math.max(0, Math.min(100, indicator));
  } catch (error) {
    console.error('Error calculating altseason indicator:', error);
    return 50;
  }
}

/**
 * Fetch all data for a single asset
 */
export async function fetchAssetData(coinId: string, interval: '1h' | '4h' | '1d' = '1h') {
  try {
    const [marketData, ohlcvData, weekData] = await Promise.all([
      fetchMarketData(),
      fetchOHLCVData(coinId, interval, 200),
      fetch52WeekData(coinId)
    ]);
    
    const assetMarketData = marketData.find(m => m.id === coinId);
    
    return {
      marketData: assetMarketData,
      ohlcvData,
      weekData
    };
  } catch (error) {
    console.error(`Error fetching data for ${coinId}:`, error);
    throw error;
  }
}
