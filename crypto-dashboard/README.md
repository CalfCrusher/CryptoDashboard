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

## Documentation

See [TRADING_GUIDE.md](TRADING_GUIDE.md) for comprehensive usage documentation.

## How the dashboard works

Quick mental model of the inner workings and alert logic:

- Data cadence: refreshes every 60s.
- Sources:
	- Prices/market metrics: CoinGecko (current/24h).
	- OHLCV (analysis): Binance 1h (core indicators); Binance 5m (spike detection).
	- 52w data: Binance daily.
- Analysis: We compute indicators (RSI, MACD, ADX, MAs, ATR, momentum), market structure, risk, and a trade “signal” (LONG/SHORT/WAIT) with strength and confluence.
- Alerts (what shows and why):
	- Spike (5m): |Δ last two 5m closes| ≥ 0.5% → Spike Up/Down.
	- Momentum: momentum ≥ 60.
	- Confluence: confluenceCount ≥ 6.
	- Strong Signal: “STRONG BUY/SELL”.
	- Big 24h move: |24h change| ≥ 8%.
	- System: missed updates.

The Alerts card is hidden when empty; otherwise, each alert renders with a colored badge by type for fast scanning.

## Tech Stack

Next.js 16 • TypeScript • Tailwind CSS • CoinGecko API • Binance API

## License

MIT License
