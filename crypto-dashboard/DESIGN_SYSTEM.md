## Crypto Momentum Dashboard – Professional Redesign Specification

### Vision & Positioning
Build a serious, data-dense yet calm trading interface that feels worthy of a $50+/month subscription. Visual hierarchy pushes actionable momentum + signal strength to the foreground while supporting context sits in a quiet, structured backdrop.

---
## 1. Visual Hierarchy
1. Hero Row: 5 Trading Signal Cards (dominant). Each card: price + momentum gauge + signal badge + micro sparkline + confluence & risk snippet.
2. Secondary: Market Overview strip (BTC dominance, Total Cap, Altseason) above cards OR compressed into header on narrow widths.
3. Detail Zone: Signal Table (sortable) below hero row.
4. Optional Sidebar (desktop ≥ 1440px): Alerts, Correlation Matrix, Quick Stats.

Hierarchy Tools:
- Scale: Price (56–64px), Card title (28px), secondary metrics (14px), micro text (12px).
- Color Intensity: Action signals (greens/reds) are saturated; neutral/supporting text uses medium/low opacity.
- Elevation: Hero cards use glass + subtle glow; tables and overview use flatter surfaces.

---
## 2. Color Palette (Dark Mode Primary)
Base background: #0F0F23
Elevated surface: #111827 / #1a1f34 (hover/elevation)
Text high: #F5F7FA
Text medium: rgba(245,247,250,0.8)
Text low: rgba(245,247,250,0.55)
Uptrend green: #10B981 (Alt: #00D084)
Downtrend red: #EF4444 (Alt: #FF4757)
Neutral gray: #64748B
Accent yellow (alerts): #FFD60A
Accent cyan (secondary accent/focus): #06B6D4
Info blue: #3B82F6
Borders subtle: rgba(255,255,255,0.08)
Borders strong: rgba(255,255,255,0.14)

AAA Contrast Notes:
- Text high on base (#F5F7FA vs #0F0F23) ratio > 12:1.
- Medium text opacity ensures still > 7:1 on base.
- Red (#EF4444) & green (#10B981) on dark base both exceed 4.5:1 for large text; large numeric counters use ≥24px meeting AAA (≥7:1 targeted by shade choice).

Momentum Gradient: Red (#EF4444) → Yellow (#FFD60A) → Green (#10B981) applied via conic or linear gradient to depict strength progression.

---
## 3. Typography System
Primary Font: Geist Sans (already loaded) with Inter fallback.
Monospace (code/numerical optional): Geist Mono / JetBrains Mono fallback.
Scale:
- Display Price: 56–64px / 700 weight / -0.5px tracking
- Heading (Card Title): 28px / 600 / -0.5px
- Subheading / Section Label: 20px / 600 / 0.25px
- Body: 14px / 400–500 / 0.5px
- Micro Labels: 12px / 600 uppercase optional / 0.75px

Rules:
- Letter-spacing always ≥ 0.5px for body, tighter for headings.
- Avoid more than two weights per card to reduce visual noise.

---
## 4. Spacing & Layout
Grid Unit: 8px (macro) with internal 4px fine adjustments.
Hero Card Padding: 24px (top/bottom) / 24–28px (sides).
Row Gaps: 24px between hero cards on desktop; 16px on tablet; 12px on mobile.
Section Margins: 48px top of hero row below header; 40px between hero cards and signal table.
Sidebar Width: 300–340px.
Breakpoints:
- sm < 640: 1 column cards
- md 640–1024: 2–3 columns (auto)
- lg 1024–1280: 3–4 columns
- xl ≥1280: 5 columns guaranteed

---
## 5. Component Design: Trading Signal Card
Structure (Vertical Stack):
1. Header: Symbol + name left; Signal Badge right (pulses on change).
2. Price Block: Large price; 24h change (color flash) + absolute delta.
3. Middle Data Band: Momentum Gauge (radial) left, Micro Sparkline right.
4. Indicators Row: Confluence (e.g. "7/8") + Confidence Score + Risk/Reward.
5. Key Indicators: RSI, ADX, Market Structure.
6. Footer Hint: "Click for detailed analysis" subdued.

Visual Style:
- Glass effect: backdrop-filter: blur(18px); semi-transparent layer.
- Border: 1px solid rgba(255,255,255,0.1); radius 18px.
- Glow accent on hover (radial gradient + stronger shadow).
- Animate price change flash for 2s via keyframes (green/red fade to neutral).

States:
- Hover: Lift (translateY(-4px)), brighter background, glow.
- Active/Focus: Outline with cyan focus ring.
- Loading: Skeleton blocks replicating layout lines.

---
## 6. Momentum Gauge
Circular progress using gradient arc (SVG stroke). Center numeric (e.g. 72 /100) semantic label under number: Weak / Moderate / Strong.
Color Encoding: 0–33 red, 34–66 yellow, 67–100 green.
Optional Confluence caption: "7/8 indicators aligned".
Accessibility: aria-label providing semantic interpretation.

---
## 7. Signal Badge
Shape: Pill (radius 999px).
Variants:
- STRONG BUY / BUY: Gradient green (#00D084→#10B981)
- STRONG SELL / SELL: Gradient red (#FF4757→#EF4444)
- NEUTRAL: Solid #64748B
Pulse: Single outward glow animation on change (1.8s).
Text: Uppercase, 12px, 700 weight, letter-spacing 0.75px.

---
## 8. Micro Sparkline
Minimal fill gradient under line. Green if final >= first else red. Height 36px. No axes; interactive tooltip optional later.

---
## 9. Charts (Advanced Panels)
Candles: Green (#10B981) bullish, Red (#EF4444) bearish. Wick thinner, body medium weight.
Moving Averages:
- 20 EMA: #3B82F6 (solid 1.75px)
- 50 EMA: #F59E0B (orange, dashed 2px)
- 200 SMA: #EF4444 (semi-opaque 2px)
Indicators:
- RSI line: #06B6D4; Overbought/oversold zones subtle translucent fill.
- MACD: MACD line #06B6D4; Signal line #FBBF24; Histogram green/red with 60% opacity.
Volume Bars: Muted teal/brick (#0d3d3d / #3d0d0d) at low opacity; highlight only surges.

---
## 10. Animation & Interaction Guidelines
Micro-transitions: 120–240ms cubic-bezier(.4,.4,.2,1).
Hover Lift: transform translateY(-4px) + shadow increase.
Price Flash: Keyframes from saturated color to neutral over 2s (class .flash-up / .flash-down).
Signal Pulse: radial expansion box-shadow fade (pulseSignal keyframes).
Skeleton: Shimmer gradient (1.8s linear infinite).
Numeric Changes: Smooth color transitions + slight scale (1.05) on increase; revert on settle.

Performance: Prefer CSS transforms & opacity (GPU-friendly). Avoid layout thrash.

---
## 11. Accessibility
Focus states: Cyan outline (#06B6D4) with 2px offset.
ARIA labels for gauges, sparkline fallback text.
Color alone never sole indicator: add icons/arrows (↑ ↓ →) where trend conveyed.

---
## 12. Dark Mode Mastery
Avoid pure black; layering uses progressively lighter surfaces for elevation (0F0F23 → 111827 → 1a1f34).
Secondary text opacity 0.55; disabled elements ~0.35.
Depth: Shadows use multi-layer composition (soft + inner). Glow reserved for active/pulse.

---
## 13. Tailwind / CSS Token Integration
CSS Variables defined in `app/globals.css` under :root.
Usage Examples:
```html
<div class="glass-card p-6">
  <span class="signal-badge signal-pulse" data-signal="STRONG BUY">STRONG BUY</span>
  <div class="text-(--text-high) text-[56px] leading-none font-bold">$63,245.12</div>
  <div class="flex justify-between mt-4">
    <div class="momentum-gauge" data-level="high">...</div>
    <div class="sparkline">...</div>
  </div>
</div>
```

If a Tailwind config is preferred (legacy style):
```js
// tailwind.config.js (optional)
module.exports = {
  darkMode: 'class',
  content: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0F0F23', alt: '#111827', elevated: '#1a1f34',
        up: '#10B981', upBright: '#00D084', down: '#EF4444', downBright: '#FF4757',
        neutral: '#64748B', accentYellow: '#FFD60A', accentCyan: '#06B6D4'
      },
      boxShadow: {
        soft: '0 4px 12px -2px rgba(0,0,0,0.4),0 2px 4px rgba(0,0,0,0.5)',
        hover: '0 6px 18px -4px rgba(0,0,0,0.55),0 4px 8px rgba(0,0,0,0.4)'
      },
      borderRadius: { 'lgx': '18px' },
      keyframes: {
        priceUp: { '0%': { color: '#10B981' }, '100%': { color: '#F5F7FA' } },
        priceDown: { '0%': { color: '#EF4444' }, '100%': { color: '#F5F7FA' } },
        pulseSignal: {
          '0%': { boxShadow: '0 0 0 0 rgba(255,214,10,0.6)' },
          '70%': { boxShadow: '0 0 0 12px rgba(255,214,10,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(255,214,10,0)' }
        }
      },
      animation: {
        'flash-up': 'priceUp 2s ease',
        'flash-down': 'priceDown 2s ease',
        'signal-pulse': 'pulseSignal 1.8s ease forwards'
      }
    }
  }
};
```

---
## 14. Wireframes (ASCII)
Desktop ≥1280px:
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Header: [Title]   [Last Update: 32s ago] [BTC Dom 54.2%] [Market: Mixed] [R] │
├──────────────────────────────────────────────────────────────────────────────┤
│ CARD1  CARD2  CARD3  CARD4  CARD5                                           │
│                                                                          S  │
│ (Each: Symbol | SignalBadge | Price | Sparkline | Momentum | Confluence...) │
├──────────────────────────────────────────────────────────────────────────────┤
│ Signal Table (sortable, filter chips)                                      │
├───────────────────────┬──────────────────────────────────────────────────────┤
│ Sidebar (Alerts,      │ Momentum Heat Map / Correlation Matrix (expandable) │
│ Quick Stats,          │                                                      │
│ Notifications)        │                                                      │
└───────────────────────┴──────────────────────────────────────────────────────┘
```

Tablet:
```
Header (compressed)
Grid: 2–3 cards per row
Signal Table full width below cards
Optional accordion for sidebar content
```

Mobile:
```
Header (stacked)
Cards: Single column scroll
Momentum gauge shrinks (64px). Sparkline below price.
Signal table collapsible (tap to expand)
```

---
## 15. Data Density vs Clarity
Rule-of-three per layer: Max 3 primary numeric emphases per card (Price, Momentum, Signal). Remaining metrics formatted small with consistent alignment.

---
## 16. Implementation Checklist
- [x] Global tokens in `globals.css`
- [x] MomentumGauge component
- [x] Sparkline component placeholder
- [ ] Integrate MomentumGauge + Sparkline into `AssetCard`
- [ ] Replace linear momentum bar
- [ ] Add signal badge pulse trigger on strength change
- [ ] Introduce skeleton states (wrap AssetCard when loading)
- [ ] Add accessible ARIA labels

---
## 17. Future Enhancements
1. Real-time streaming updates (websocket) with diff animations.
2. User theme customization panel (color-blind safe palette variants).
3. Persist user layout (localStorage or server profile).
4. Export card snapshot (PNG for sharing). 
5. Add multi-timeframe tabs inside modal with consistent micro-gauges.

---
## 18. Performance Considerations
SVG + CSS only for micro visuals → minimal bundle impact.
Avoid heavy chart libs for sparklines; main charts can lazy-load (dynamic import). Memoize derived arrays (sparkline data). Use IntersectionObserver for off-screen card updates to pause animations.

---
## 19. Accessibility & QA Notes
Contrast checks performed for base palette. Test with simulated Daltonization. Ensure focus order: Header actions → Cards left→right → Table → Sidebar. Provide keyboard shortcuts (later) for Refresh ("r"), Focus next card (ArrowRight), open modal (Enter).

---
## 20. Success Metrics
1. Time-to-understand trend for new user < 8 seconds.
2. Card interaction (modal open) CTR ≥ 40% of sessions.
3. No layout shift (CLS ~0) after first render.
4. 60 FPS hover/flash animations on mid-tier hardware.

---
### END OF SPEC
