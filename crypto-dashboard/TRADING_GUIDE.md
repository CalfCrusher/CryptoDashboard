# Crypto Momentum Dashboard - Trading Guide

## Overview
Professional-grade cryptocurrency momentum analysis dashboard for perpetual futures trading. This tool identifies trending opportunities for LONG/SHORT positions in the top 5 cryptocurrencies by market cap.

## Quick Start

### Running the Dashboard
```bash
cd crypto-dashboard
npm install
npm run dev
```

Visit `http://localhost:3000` to view the dashboard.

### Auto-Refresh
- Data refreshes automatically every 60 seconds
- Manual refresh available via "Refresh Now" button
- Timestamp shows time since last update
- Missed update counter tracks API failures

## Understanding the Dashboard

### 1. Asset Cards (Main View)
Each cryptocurrency displays:
- **Current Price** with 24h change
- **Momentum Score** (1-100): Overall trend strength
- **Signal Direction**: LONG, SHORT, or WAIT
- **Signal Strength**: STRONG BUY, BUY, NEUTRAL, SELL, STRONG SELL
- **Confluence Count**: Number of indicators agreeing
- **Confidence Score** (1-10): Signal reliability
- **Risk/Reward Ratio**: Expected profit vs loss ratio
- **Key Indicators**: RSI, ADX, Market Structure

**Color Coding:**
- **Green Border**: Uptrend confirmed
- **Red Border**: Downtrend confirmed
- **Yellow Border**: Ranging/unclear market

### 2. Market Overview Panel
- **BTC Dominance**: Bitcoin's market share (high = BTC season)
- **Total Market Cap**: Combined value of top 5 assets
- **Altseason Indicator** (0-100):
  - 75-100: Strong Altseason (altcoins outperforming BTC)
  - 40-75: Mixed market
  - 0-40: BTC Season (Bitcoin outperforming)
- **Correlation Matrix**: Shows how assets move together
  - 1.0 = Perfect positive correlation
  - -1.0 = Perfect negative correlation
  - >0.7 = Highly correlated (avoid trading both simultaneously)

### 3. Signal Table
Comprehensive trading signals with:
- Entry price (current price)
- Stop loss level
- Three take-profit targets (TP1, TP2, TP3)
- Risk/Reward ratio
- Confluence count
- Confidence score

**Signal Interpretation:**
- **STRONG BUY/SELL**: 7+ confluence factors, confidence 8-10
- **BUY/SELL**: 5-6 confluence factors, confidence 6-7
- **WAIT**: <5 confluence or conflicting signals

### 4. Momentum Heat Map
Visual representation of momentum strength:
- **Color**: Green (bullish) to Red (bearish)
- **Size**: Larger = higher volatility (ATR)
- Click any box for detailed analysis

### 5. Detailed Analysis Modal
Click any asset card for in-depth analysis:
- Full price statistics (24h, 52-week ranges)
- Complete technical indicator values
- Market structure breakdown
- Volume analysis
- Support/resistance levels
- Signal reasoning (why the signal was generated)

## Trading Signals Explained

### LONG Signal (Buy/Uptrend)
Generated when **5+ of these factors** align:
1. ✓ Price above 20 EMA > 50 EMA > 200 SMA
2. ✓ RSI above 50 and rising
3. ✓ MACD above signal line (positive histogram)
4. ✓ ADX > 25 (strong trend)
5. ✓ Volume increasing
6. ✓ Higher highs + higher lows pattern
7. ✓ Stochastic RSI > 50
8. ✓ Rate of Change > 5%
9. ✓ Positive momentum

### SHORT Signal (Sell/Downtrend)
Generated when **5+ of these factors** align:
1. ✓ Price below 20 EMA < 50 EMA < 200 SMA
2. ✓ RSI below 50 and falling
3. ✓ MACD below signal line (negative histogram)
4. ✓ ADX > 25 (strong trend)
5. ✓ Volume increasing
6. ✓ Lower highs + lower lows pattern
7. ✓ Stochastic RSI < 50
8. ✓ Rate of Change < -5%
9. ✓ Negative momentum

### WAIT Signal (No Trade)
Issued when:
- Fewer than 5 indicators agree
- Conflicting signals (some bullish, some bearish)
- ADX < 20 (weak trend, ranging market)
- Low confidence score

## Technical Indicators Reference

### Momentum Indicators

**RSI (Relative Strength Index)**
- Range: 0-100
- >70: Overbought (potential reversal)
- 50-70: Bullish momentum
- 30-50: Bearish momentum
- <30: Oversold (potential reversal)

**MACD (Moving Average Convergence Divergence)**
- MACD Line above Signal Line = Bullish
- MACD Line below Signal Line = Bearish
- Histogram increasing = Momentum strengthening
- Histogram decreasing = Momentum weakening

**Stochastic RSI**
- Combines Stochastic oscillator with RSI
- >80: Overbought
- <20: Oversold
- Crossovers indicate momentum shifts

**Rate of Change (ROC)**
- Measures price momentum over 12 periods
- Positive = Upward momentum
- Negative = Downward momentum

### Trend Indicators

**ADX (Average Directional Index)**
- Measures trend strength (not direction)
- >25: Strong trend
- 20-25: Developing trend
- <20: Weak trend (ranging market)

**Moving Averages**
- **20 EMA**: Short-term trend
- **50 EMA**: Medium-term trend
- **200 SMA**: Long-term trend
- Bullish: 20 > 50 > 200
- Bearish: 20 < 50 < 200

**Bollinger Bands**
- Upper/Lower bands show volatility
- Price near upper band: Strong uptrend or overbought
- Price near lower band: Strong downtrend or oversold
- Narrow bands: Low volatility (breakout coming)
- Wide bands: High volatility

### Volume Indicators

**Volume Ratio**
- Current volume vs 20-day average
- >1.2: High volume (confirms trend)
- <0.8: Low volume (weak trend)

**OBV (On-Balance Volume)**
- Cumulative volume based on price direction
- Rising OBV + rising price = Strong uptrend
- Falling OBV + falling price = Strong downtrend
- Divergence = Potential reversal

### Volatility Indicators

**ATR (Average True Range)**
- Measures price volatility
- Used for stop-loss placement
- Higher ATR = Wider stops needed

## Risk Management

### Stop Loss Placement
- **LONG**: Below recent swing low - (0.5 × ATR)
- **SHORT**: Above recent swing high + (0.5 × ATR)

### Take Profit Targets
- **TP1**: Entry + 1.5 × ATR (conservative)
- **TP2**: Entry + 2.5 × ATR (moderate)
- **TP3**: Entry + 4 × ATR (aggressive)

**Recommended Strategy:**
- Close 50% at TP1
- Close 30% at TP2
- Let 20% run to TP3 or trail stop

### Risk/Reward Ratio
- **Minimum acceptable**: 1:2
- **Good**: 1:3 or better
- **Excellent**: 1:4+
- Dashboard warns if R:R < 1.5

### Position Sizing
Calculate position size based on:
- Account balance
- Risk per trade (1-2% recommended)
- Stop loss distance

**Formula:**
```
Position Size = (Account × Risk %) / Stop Loss Distance
```

Example:
- Account: $10,000
- Risk: 2% = $200
- Entry: $50,000
- Stop: $48,500
- Distance: $1,500

Position Size = $200 / $1,500 = 0.133 BTC

### Correlation Warning
- Don't trade highly correlated pairs (>0.7)
- Example: If longing BTC, avoid longing ETH if correlation >0.7
- Check correlation matrix before entering trades

## Trading Rules & Best Practices

### Entry Rules
1. **Wait for Confluence**: Minimum 5 factors aligned
2. **Check Trend Strength**: ADX > 25
3. **Confirm with Volume**: Volume ratio > 1.2
4. **Verify R:R**: Minimum 1:2 ratio
5. **Avoid Extremes**: Don't buy RSI >70 or sell RSI <30

### When to Trade
**BEST Conditions:**
- Confidence score ≥ 7
- Confluence count ≥ 7
- ADX > 30
- Volume increasing
- R:R ratio > 2.5

**GOOD Conditions:**
- Confidence score 6-7
- Confluence count 5-6
- ADX 25-30
- R:R ratio 1.5-2.5

**AVOID:**
- Confidence score < 6
- WAIT signals
- ADX < 20 (ranging market)
- R:R ratio < 1.5
- Conflicting timeframes

### Exit Rules
1. **Hit Stop Loss**: Exit immediately, no questions
2. **Take Profit**: Follow TP1, TP2, TP3 plan
3. **Signal Reversal**: If signal flips, consider exit
4. **Momentum Fading**: If momentum score drops below 40, tighten stops

### Multi-Timeframe Confirmation (Future Feature)
While the dashboard shows 1H data, professional traders confirm across:
- 1H: Entry timing
- 4H: Trend confirmation
- 1D: Overall direction

**Rule**: All three timeframes should agree on direction

## Example Trading Scenarios

### Scenario 1: Strong Long Setup
```
Asset: BTC
Signal: STRONG BUY
Direction: LONG
Confluence: 8 factors
Confidence: 9/10
Momentum: 78/100
R:R: 1:3.2

Indicators:
✓ Price: $68,500 (above all MAs)
✓ RSI: 62 (bullish momentum)
✓ MACD: Positive histogram expanding
✓ ADX: 32 (strong uptrend)
✓ Volume: 1.8x average (confirming)
✓ Structure: Higher highs + higher lows
✓ Stoch RSI: 65
✓ ROC: +8.5%

Trade Plan:
Entry: $68,500
Stop: $66,800 (recent swing low - 0.5 ATR)
TP1: $70,000 (close 50%)
TP2: $71,500 (close 30%)
TP3: $73,800 (let 20% run)

Risk: $1,700
Reward (TP1): $1,500
Reward (TP2): $3,000
Reward (TP3): $5,300
```

**Action**: ENTER LONG position with confidence

### Scenario 2: Conflicting Signals
```
Asset: ETH
Signal: NEUTRAL (WAIT)
Direction: WAIT
Confluence: 3 factors
Confidence: 4/10
Momentum: 48/100

Indicators:
✓ Price: Between MAs (no clear trend)
✗ RSI: 52 (neutral zone)
✓ MACD: Barely positive
✗ ADX: 18 (weak trend)
✓ Volume: 0.9x average (low)
✗ Structure: Mixed signals

```

**Action**: WAIT for better setup. Market is ranging.

### Scenario 3: Strong Short Setup
```
Asset: SOL
Signal: STRONG SELL
Direction: SHORT
Confluence: 7 factors
Confidence: 8/10
Momentum: 22/100
R:R: 1:2.8

Indicators:
✓ Price: $145 (below all MAs)
✓ RSI: 38 (bearish momentum)
✓ MACD: Negative histogram expanding
✓ ADX: 28 (strong downtrend)
✓ Volume: 1.5x average
✓ Structure: Lower lows + lower highs
✓ ROC: -6.2%

Trade Plan:
Entry: $145
Stop: $148.50 (recent swing high + 0.5 ATR)
TP1: $140 (close 50%)
TP2: $137 (close 30%)
TP3: $132 (trail remaining)
```

**Action**: ENTER SHORT position

## Common Mistakes to Avoid

1. **Trading against the trend** - Always trade in the direction of the signal
2. **Ignoring stop losses** - Set them and honor them
3. **Over-leveraging** - Use proper position sizing (1-2% risk)
4. **Chasing green candles** - Wait for pullbacks in uptrends
5. **Trading on low confluence** - Minimum 5 factors required
6. **Ignoring correlation** - Don't double up on correlated trades
7. **Trading in ranging markets** - Wait for ADX > 25
8. **Revenge trading** - After a loss, wait for next valid signal
9. **Moving stops** - Don't move stop loss further away from entry
10. **FOMO** - Missing a setup is better than forcing a bad trade

## API Rate Limits & Data Sources

### CoinGecko (Free Tier)
- 10-30 calls/minute
- Used for: Price data, market cap, 24h stats
- Fallback: Built into dashboard

### Binance Public API
- 1200 requests/minute
- Used for: OHLCV data (candlesticks)
- No API key required

### Data Accuracy
- Prices: Real-time (60-second delay)
- Indicators: Calculated from last 200 candles
- Updates: Every 60 seconds

## Troubleshooting

### Dashboard won't load
- Check internet connection
- Verify APIs are accessible (CoinGecko, Binance)
- Check browser console for errors

### Missing data for an asset
- API rate limit hit (wait 1 minute)
- Asset temporarily unavailable
- Check "Missed Updates" counter

### Incorrect signals
- Ensure enough data loaded (minimum 200 candles)
- Verify timeframe matches your trading style
- Cross-reference with multiple indicators

### Slow performance
- Clear browser cache
- Close other applications
- Reduce browser tab count

## Future Enhancements

### Planned Features
- [ ] Multi-timeframe analysis (1H, 4H, 1D tabs)
- [ ] TradingView charts integration
- [ ] Historical win rate tracking
- [ ] Backtesting engine
- [ ] Email/Discord/Telegram alerts
- [ ] Liquidation heatmap
- [ ] Social sentiment integration
- [ ] Custom indicator settings
- [ ] Portfolio tracking
- [ ] Trade journal

### Contributing
Contributions welcome for new features and improvements.

### License
MIT License - Free to use and modify

