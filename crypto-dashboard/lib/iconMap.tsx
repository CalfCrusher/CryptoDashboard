import React from 'react';

// Minimal, crisp SVG icons for common crypto symbols.
// Designed to look good on dark backgrounds at 16–20px.

export type IconProps = React.SVGProps<SVGSVGElement> & { title?: string };

const circle = (fill = 'none', stroke = 'currentColor') => (
  <circle cx="12" cy="12" r="9" fill={fill} stroke={stroke} strokeWidth="1.5" />
);

const makeLetterIcon = (letter: string) => {
  const Comp: React.FC<IconProps> = (props) => (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden focusable="false" {...props}>
      {circle('none', 'currentColor')}
      <text x="12" y="15" textAnchor="middle" fontWeight={700} fontSize={10} fill="currentColor">{letter}</text>
    </svg>
  );
  Comp.displayName = `${letter}Icon`;
  return Comp;
};

export const BTCIcon: React.FC<IconProps> = makeLetterIcon('₿');
export const ETHTempIcon: React.FC<IconProps> = makeLetterIcon('Ξ');
export const BNBIcon: React.FC<IconProps> = makeLetterIcon('B');
export const SOLIcon: React.FC<IconProps> = makeLetterIcon('S');
export const XRPIcon: React.FC<IconProps> = makeLetterIcon('X');

(BTCIcon as React.FC).displayName = 'BTCIcon';
(ETHTempIcon as React.FC).displayName = 'ETHTempIcon';
(BNBIcon as React.FC).displayName = 'BNBIcon';
(SOLIcon as React.FC).displayName = 'SOLIcon';
(XRPIcon as React.FC).displayName = 'XRPIcon';

export const GenericCoinIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden focusable="false" {...props}>
    {circle('none', 'currentColor')}
    <path d="M7 12c0-2.761 2.239-5 5-5s5 2.239 5 5-2.239 5-5 5-5-2.239-5-5z" fill="currentColor" opacity="0.45" />
  </svg>
);
GenericCoinIcon.displayName = 'GenericCoinIcon';

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
