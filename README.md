# 🚀 Crypto Momentum Dashboard

Professional cryptocurrency momentum analysis dashboard for perpetual futures trading. Real-time analysis of top 5 cryptocurrencies with advanced technical indicators and signal generation.

## Features

- **Real-time Analysis** - Auto-refresh every 60 seconds
- **Multi-Indicator Confluence** - RSI, MACD, ADX, Volume, Market Structure
- **Professional Signals** - STRONG BUY, BUY, NEUTRAL, SELL, STRONG SELL
- **Risk Management** - Automatic stop-loss and take-profit calculations
- **Momentum Scoring** - 1-100 trend strength indicator
- **Market Overview** - BTC Dominance, Altseason Indicator, Correlation Matrix
- **Dark Mode UI** - Professional trading interface

## Quick Start

```bash
cd crypto-dashboard
npm install
npm run dev
```

Open http://localhost:3000

## Tracked Assets

Top 5 cryptocurrencies by market cap:
- BTC (Bitcoin)
- ETH (Ethereum)
- BNB (Binance Coin)
- SOL (Solana)
- XRP (Ripple)

## Technical Indicators

15+ indicators including:
RSI, MACD, ADX, ATR, Stochastic RSI, ROC, EMA/SMA, Bollinger Bands, OBV, Volume Analysis, Market Structure, Support/Resistance

## Architecture & Data Flow

### Overview
The dashboard uses a **confluence-based signal generation system** that analyzes 8-9 technical factors to produce high-confidence trading signals. All data processing happens client-side in React hooks with automatic refresh every 60 seconds.

### Core Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. DATA FETCHING (lib/api.ts)                                   │
├─────────────────────────────────────────────────────────────────┤
│ useDashboardData Hook (60s interval)                            │
│   ↓                                                              │
│ fetchMarketData() → CoinGecko API                               │
│   • Current prices, 24h stats, market cap, volume               │
│   • Rate limit: 10-30 calls/minute (free tier)                  │
│   ↓                                                              │
│ fetchOHLCVData() → Binance Public API                           │
│   • 200 candles of 1-hour OHLCV data per asset                  │
│   • Rate limit: 1200 requests/minute                            │
│   ↓                                                              │
│ fetch52WeekData() → CoinGecko Market Chart                      │
│   • 52-week high/low for context                                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. TECHNICAL ANALYSIS (lib/indicators.ts)                       │
├─────────────────────────────────────────────────────────────────┤
│ For each asset, calculate 15+ indicators from 200 candles:      │
│                                                                  │
│ • Moving Averages: EMA(20), EMA(50), SMA(200)                   │
│ • RSI: 14-period and 21-period                                  │
│ • MACD: 12/26/9 with signal and histogram                       │
│ • Stochastic RSI: K and D lines                                 │
│ • ADX: Trend strength (0-100)                                   │
│ • ATR: Volatility measure for stop-loss sizing                  │
│ • Bollinger Bands: Upper/middle/lower (20, 2.0 std)             │
│ • OBV: On-Balance Volume for volume confirmation                │
│ • ROC: Rate of Change momentum                                  │
│ • Market Structure: Detect swing highs/lows, S/R levels         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. SIGNAL GENERATION (lib/signals.ts)                           │
├─────────────────────────────────────────────────────────────────┤
│ generateTradingSignal() analyzes confluence factors:             │
│                                                                  │
│ Factor 1: MA Alignment (EMA20 > EMA50 > SMA200 = bullish)       │
│ Factor 2: RSI Levels (30-70 range, divergence detection)        │
│ Factor 3: MACD Histogram (positive/negative, crossovers)        │
│ Factor 4: ADX Strength (>25 = trending, >40 = strong)           │
│ Factor 5: Volume Confirmation (current vs 20-day avg)           │
│ Factor 6: Market Structure (higher highs/lows pattern)          │
│ Factor 7: Stochastic RSI (oversold <20, overbought >80)         │
│ Factor 8: ROC Momentum (positive/negative trend)                │
│ Factor 9: Price vs Bollinger Bands (breakout detection)         │
│                                                                  │
│ Signal Logic:                                                    │
│ • LONG: ≥5 bullish factors + uptrend structure                  │
│ • SHORT: ≥5 bearish factors + downtrend structure               │
│ • WAIT: <5 factors or conflicting signals                       │
│                                                                  │
│ Strength Determination:                                          │
│ • STRONG BUY/SELL: ≥7 confluence + momentum ≥70/≤30            │
│ • BUY/SELL: 5-6 confluence + momentum ≥55/≤45                   │
│ • NEUTRAL: <5 confluence or ranging market                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. RISK MANAGEMENT (lib/signals.ts)                             │
├─────────────────────────────────────────────────────────────────┤
│ calculateRiskManagement() for each LONG/SHORT signal:            │
│                                                                  │
│ LONG Position:                                                   │
│   • Entry: Current price                                        │
│   • Stop-Loss: swingLow - (0.5 × ATR)                          │
│   • Take-Profit 1: Entry + (1.5 × ATR) [R:R = 1:1.5]           │
│   • Take-Profit 2: Entry + (2.5 × ATR) [R:R = 1:2.5]           │
│   • Take-Profit 3: Entry + (4.0 × ATR) [R:R = 1:4.0]           │
│                                                                  │
│ SHORT Position:                                                  │
│   • Entry: Current price                                        │
│   • Stop-Loss: swingHigh + (0.5 × ATR)                         │
│   • Take-Profit 1: Entry - (1.5 × ATR)                         │
│   • Take-Profit 2: Entry - (2.5 × ATR)                         │
│   • Take-Profit 3: Entry - (4.0 × ATR)                         │
│                                                                  │
│ Position Size: Risk 1-2% of capital per trade                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. UI RENDERING (components/)                                   │
├─────────────────────────────────────────────────────────────────┤
│ • MarketOverviewCard: BTC dominance, altseason, correlation     │
│ • AssetCard (×5): Individual crypto cards with gauges           │
│ • SignalTable: All signals with entry/exit levels               │
│ • MomentumHeatMap: Visual momentum strength grid                │
│ • DetailedAnalysisModal: Full technical breakdown (on click)    │
└─────────────────────────────────────────────────────────────────┘
```

### Key Files & Responsibilities

| File | Purpose | Key Functions |
|------|---------|---------------|
| `hooks/useDashboardData.ts` | Main orchestrator, auto-refresh | `fetchAllData()` - Coordinates all API calls |
| `lib/api.ts` | External data fetching | `fetchMarketData()`, `fetchOHLCVData()` |
| `lib/indicators.ts` | Technical indicator math | `calculateRSI()`, `calculateMACD()`, `calculateADX()` |
| `lib/signals.ts` | Signal generation logic | `generateTradingSignal()`, `calculateRiskManagement()` |
| `lib/analysis.ts` | Analysis coordinator | `analyzeAsset()` - Combines all indicators |
| `types/index.ts` | TypeScript definitions | All interfaces for type safety |

### Confluence System Explained

The dashboard requires **minimum 5 out of 8-9 factors** to align before generating a LONG or SHORT signal. This reduces false signals and increases win rate.

**Example LONG Signal (BTC):**
```
✓ Factor 1: EMA20 > EMA50 > SMA200 (MA alignment)
✓ Factor 2: RSI = 58 (bullish but not overbought)
✓ Factor 3: MACD histogram positive and rising
✓ Factor 4: ADX = 32 (trending market)
✓ Factor 5: Volume 1.4× above 20-day average
✓ Factor 6: Higher highs + higher lows pattern
✗ Factor 7: Stoch RSI = 85 (overbought - caution)
✓ Factor 8: ROC positive (upward momentum)
✓ Factor 9: Price above upper Bollinger Band (breakout)

Result: 7/9 confluence = STRONG BUY signal
Confidence: 88% | Momentum: 72
```

### Market Structure Detection

The system detects three market phases:

1. **Uptrend**: Higher highs + higher lows pattern
   - Last high > previous high
   - Last low > previous low
   - Favors LONG signals

2. **Downtrend**: Lower highs + lower lows pattern
   - Last high < previous high
   - Last low < previous low
   - Favors SHORT signals

3. **Ranging**: No clear pattern
   - Conflicting swing points
   - Signals often WAIT
   - Looks for breakout setups

### Performance Optimization

- **Parallel API Calls**: All 5 assets fetched simultaneously using `Promise.all()`
- **Memoization**: React `useMemo` for expensive calculations
- **Efficient Updates**: Only re-renders affected components
- **Error Handling**: Graceful degradation if API fails for one asset
- **Rate Limit Management**: Respects CoinGecko free tier limits

### Auto-Refresh Mechanism

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    fetchAllData(); // Refresh every 60 seconds
  }, REFRESH_INTERVAL);
  
  return () => clearInterval(interval);
}, []);
```

Tracks `missedUpdates` if fetch fails, displays warning to user.

### Extending the Dashboard

**Adding New Indicators:**
1. Add calculation function to `lib/indicators.ts`
2. Update `TechnicalIndicators` interface in `types/index.ts`
3. Call new function in `lib/analysis.ts`
4. Use in `lib/signals.ts` for confluence logic
5. Display in `components/DetailedAnalysisModal.tsx`

**Adding New Assets:**
1. Update `TOP_ASSETS` array in `lib/api.ts`
2. Add Binance symbol mapping in `BINANCE_SYMBOLS`
3. Ensure CoinGecko ID is correct
4. UI automatically adapts (responsive grid)

**Modifying Signal Logic:**
1. Edit `generateTradingSignal()` in `lib/signals.ts`
2. Adjust confluence threshold (currently ≥5)
3. Add/remove factors from analysis
4. Update documentation in comments

### API Rate Limits & Caching

**CoinGecko (Free Tier):**
- 10-30 calls/minute
- Current usage: ~6 calls per refresh (1× market data, 5× weekly data)
- Safe refresh rate: 60 seconds minimum

**Binance Public API:**
- 1200 requests/minute
- Current usage: 5 calls per refresh (5× OHLCV data)
- No authentication required

**Future Enhancement:** Add Redis/localStorage caching to reduce API calls.

### Testing Locally

```bash
# Development mode with hot reload
npm run dev

# Production build (optimized)
npm run build
npm start

# Type checking
npx tsc --noEmit

# Check for errors
npm run lint
```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Loading forever" | API rate limit hit | Wait 60s, check console for errors |
| "No data for asset" | CoinGecko ID mismatch | Verify asset ID in `TOP_ASSETS` |
| "WAIT signals only" | Low market volatility | Normal during ranging markets |
| "Missed updates" warning | Network issue or API down | Check internet, verify APIs are up |

## Documentation

- [TRADING_GUIDE.md](TRADING_GUIDE.md) - Comprehensive usage and trading strategies
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Technical implementation details
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick decision reference

## Tech Stack

**Frontend:** Next.js 16 (App Router) • React 19 • TypeScript 5 • Tailwind CSS 4

**Data Sources:** CoinGecko API (market data) • Binance Public API (OHLCV)

**Charts:** Recharts • Lightweight Charts

**Utilities:** Axios • date-fns • SWR

## License

MIT License
