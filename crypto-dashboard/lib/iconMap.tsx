import React from 'react';

// Minimal, crisp SVG icons for common crypto symbols.
// Designed to look good on dark backgrounds at 16–20px.

export type IconProps = React.SVGProps<SVGSVGElement> & { title?: string };

const circle = (fill = 'none', stroke = 'currentColor') => (
  <circle cx="12" cy="12" r="9" fill={fill} stroke={stroke} strokeWidth="1.5" />
);

const makeLetterIcon = (letter: string) => (props: IconProps) => (
  <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden focusable="false" {...props}>
    {circle('none', 'currentColor')}
    <text x="12" y="15" textAnchor="middle" fontWeight={700} fontSize={10} fill="currentColor">{letter}</text>
  </svg>
);

export const BTCIcon = makeLetterIcon('₿');
export const ETHTempIcon = makeLetterIcon('Ξ');
export const BNBIcon = makeLetterIcon('B');
export const SOLIcon = makeLetterIcon('S');
export const XRPIcon = makeLetterIcon('X');

export const GenericCoinIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden focusable="false" {...props}>
    {circle('none', 'currentColor')}
    <path d="M7 12c0-2.761 2.239-5 5-5s5 2.239 5 5-2.239 5-5 5-5-2.239-5-5z" fill="currentColor" opacity="0.45" />
  </svg>
);

// Map uppercase symbol to icon component
export const iconMap: Record<string, React.ComponentType<IconProps>> = {
  BTC: BTCIcon,
  ETH: ETHTempIcon,
  BNB: BNBIcon,
  SOL: SOLIcon,
  XRP: XRPIcon,
};

export function getAssetIcon(symbol?: string) {
  if (!symbol) return GenericCoinIcon;
  const key = symbol.toUpperCase();
  return iconMap[key] || GenericCoinIcon;
}
