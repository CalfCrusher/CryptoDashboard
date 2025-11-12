'use client';

import { AssetAnalysis } from '@/types';
import { formatPrice, formatPercentage } from '@/lib/analysis';

interface DetailedAnalysisModalProps {
  analysis: AssetAnalysis | null;
  onClose: () => void;
}

export default function DetailedAnalysisModal({ analysis, onClose }: DetailedAnalysisModalProps) {
  if (!analysis) return null;

  const { asset, currentPrice, indicators, signal, riskManagement, marketStructure, volumeMetrics } = analysis;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">{asset.symbol} - Detailed Analysis</h2>
            <p className="text-gray-400">{asset.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Price Information */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Price Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-400">Current Price</div>
                <div className="text-2xl font-bold text-white">${formatPrice(currentPrice.price)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">24h Change</div>
                <div className={`text-2xl font-bold ${currentPrice.changePercent24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatPercentage(currentPrice.changePercent24h)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">24h High</div>
                <div className="text-lg font-bold text-white">${formatPrice(currentPrice.high24h)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">24h Low</div>
                <div className="text-lg font-bold text-white">${formatPrice(currentPrice.low24h)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">52W High</div>
                <div className="text-lg font-bold text-white">${formatPrice(currentPrice.high52w)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">52W Low</div>
                <div className="text-lg font-bold text-white">${formatPrice(currentPrice.low52w)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Market Cap</div>
                <div className="text-lg font-bold text-white">
                  ${(currentPrice.marketCap / 1e9).toFixed(2)}B
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">24h Volume</div>
                <div className="text-lg font-bold text-white">
                  ${(currentPrice.volume24h / 1e9).toFixed(2)}B
                </div>
              </div>
            </div>
          </div>

          {/* Trading Signal */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Trading Signal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Direction:</span>
                    <span className={`font-bold text-lg ${
                      signal.direction === 'LONG' ? 'text-green-500' :
                      signal.direction === 'SHORT' ? 'text-red-500' :
                      'text-gray-400'
                    }`}>
                      {signal.direction}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Strength:</span>
                    <span className="font-bold text-white">{signal.strength}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Confluence:</span>
                    <span className="font-bold text-white">{signal.confluenceCount} factors</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Confidence:</span>
                    <span className="font-bold text-white">{signal.confidenceScore}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Momentum:</span>
                    <span className="font-bold text-white">{signal.momentum}/100</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-2">Reasons:</div>
                <ul className="space-y-1">
                  {signal.reasons.map((reason, idx) => (
                    <li key={idx} className="text-sm text-gray-300">• {reason}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Risk Management */}
          {signal.direction !== 'WAIT' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Risk Management</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Entry Price</div>
                  <div className="text-lg font-bold text-white">${formatPrice(riskManagement.entryPrice)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Stop Loss</div>
                  <div className="text-lg font-bold text-red-500">${formatPrice(riskManagement.stopLoss)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Risk/Reward</div>
                  <div className={`text-lg font-bold ${
                    riskManagement.riskRewardRatio >= 2 ? 'text-green-500' : 'text-yellow-500'
                  }`}>
                    1:{riskManagement.riskRewardRatio.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Take Profit 1</div>
                  <div className="text-lg font-bold text-green-500">${formatPrice(riskManagement.takeProfit1)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Take Profit 2</div>
                  <div className="text-lg font-bold text-green-500">${formatPrice(riskManagement.takeProfit2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Take Profit 3</div>
                  <div className="text-lg font-bold text-green-500">${formatPrice(riskManagement.takeProfit3)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Technical Indicators */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Technical Indicators</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-400">RSI (14)</div>
                <div className="text-lg font-bold text-white">{indicators.rsi.rsi14.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">RSI (21)</div>
                <div className="text-lg font-bold text-white">{indicators.rsi.rsi21.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">MACD</div>
                <div className="text-lg font-bold text-white">{indicators.macd.macd.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">MACD Signal</div>
                <div className="text-lg font-bold text-white">{indicators.macd.signal.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">MACD Histogram</div>
                <div className={`text-lg font-bold ${indicators.macd.histogram >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {indicators.macd.histogram.toFixed(4)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">ADX</div>
                <div className="text-lg font-bold text-white">{indicators.adx.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">ATR</div>
                <div className="text-lg font-bold text-white">{formatPrice(indicators.atr)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">ROC (12)</div>
                <div className={`text-lg font-bold ${indicators.roc >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {indicators.roc.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Stoch RSI K</div>
                <div className="text-lg font-bold text-white">{indicators.stochRsi.k.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">EMA 20</div>
                <div className="text-lg font-bold text-white">${formatPrice(indicators.movingAverages.ema20)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">EMA 50</div>
                <div className="text-lg font-bold text-white">${formatPrice(indicators.movingAverages.ema50)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">SMA 200</div>
                <div className="text-lg font-bold text-white">${formatPrice(indicators.movingAverages.sma200)}</div>
              </div>
            </div>
          </div>

          {/* Market Structure */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Market Structure</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-400">Trend</div>
                <div className={`text-lg font-bold ${
                  marketStructure.trend === 'uptrend' ? 'text-green-500' :
                  marketStructure.trend === 'downtrend' ? 'text-red-500' :
                  'text-yellow-500'
                }`}>
                  {marketStructure.trend.toUpperCase()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Higher Highs</div>
                <div className={`text-lg font-bold ${marketStructure.higherHighs ? 'text-green-500' : 'text-gray-500'}`}>
                  {marketStructure.higherHighs ? 'Yes' : 'No'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Higher Lows</div>
                <div className={`text-lg font-bold ${marketStructure.higherLows ? 'text-green-500' : 'text-gray-500'}`}>
                  {marketStructure.higherLows ? 'Yes' : 'No'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Volume Trend</div>
                <div className={`text-lg font-bold ${
                  volumeMetrics.trend === 'increasing' ? 'text-green-500' :
                  volumeMetrics.trend === 'decreasing' ? 'text-red-500' :
                  'text-gray-400'
                }`}>
                  {volumeMetrics.trend}
                </div>
              </div>
            </div>
            
            {marketStructure.supportLevels.length > 0 && (
              <div className="mt-4">
                <div className="text-sm text-gray-400 mb-2">Support Levels</div>
                <div className="flex gap-2 flex-wrap">
                  {marketStructure.supportLevels.map((level, idx) => (
                    <div key={idx} className="bg-green-900 text-green-300 px-3 py-1 rounded text-sm">
                      ${formatPrice(level)}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {marketStructure.resistanceLevels.length > 0 && (
              <div className="mt-4">
                <div className="text-sm text-gray-400 mb-2">Resistance Levels</div>
                <div className="flex gap-2 flex-wrap">
                  {marketStructure.resistanceLevels.map((level, idx) => (
                    <div key={idx} className="bg-red-900 text-red-300 px-3 py-1 rounded text-sm">
                      ${formatPrice(level)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Volume Metrics */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Volume Analysis</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-400">Current Volume</div>
                <div className="text-lg font-bold text-white">
                  ${(volumeMetrics.current / 1e6).toFixed(2)}M
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">20D Avg Volume</div>
                <div className="text-lg font-bold text-white">
                  ${(volumeMetrics.average20d / 1e6).toFixed(2)}M
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Volume Ratio</div>
                <div className={`text-lg font-bold ${
                  volumeMetrics.ratio > 1.2 ? 'text-green-500' : 'text-gray-400'
                }`}>
                  {volumeMetrics.ratio.toFixed(2)}x
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Volume ROC</div>
                <div className={`text-lg font-bold ${
                  volumeMetrics.volumeRoc >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {volumeMetrics.volumeRoc.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
