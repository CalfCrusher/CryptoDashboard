'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';

interface DebugPanelProps {
  refresh?: () => void;
}

function isDebugEnabled() {
  if (typeof window === 'undefined') return false;
  if (process.env.NEXT_PUBLIC_DEBUG_TOOLS === 'true') return true;
  const qs = new URLSearchParams(window.location.search);
  if (qs.get('debug') === '1') return true;
  if (window.localStorage.getItem('debug:tools') === '1') return true;
  return false;
}

export default function DebugPanel({ refresh }: DebugPanelProps) {
  const [enabled] = useState<boolean>(() => (typeof window !== 'undefined' ? isDebugEnabled() : false));
  const [notif, setNotif] = useState<NotificationPermission>(() => (typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'));
  const [mode, setModeState] = useState<string>(() => (typeof window !== 'undefined' ? window.localStorage.getItem('debug:signal') || '' : ''));
  if (!enabled) return null;

  const setMode = (m: string | null) => {
    if (typeof window === 'undefined') return;
    if (m) window.localStorage.setItem('debug:signal', m);
    else window.localStorage.removeItem('debug:signal');
    setModeState(m || '');
    // Fire custom event so hook can react immediately without needing a fetch
    window.dispatchEvent(new Event('debug-signal-change'));
    refresh?.();
  };

  const requestNotif = async () => {
    try {
      const p = await Notification.requestPermission();
      setNotif(p);
    } catch {}
  };

  const fireNotif = () => {
    try {
      new Notification('Test Trading Signal', { body: 'This is a test desktop alert from Debug Tools.' });
    } catch {}
  };

  const content = (
    <div
      style={{
        position: 'fixed',
        right: 12,
        bottom: 12,
        zIndex: 2147483647, // ensure above any overlay
        pointerEvents: 'auto',
      }}
    >
      <div
        className="rounded-lg shadow-lg p-3 text-[11px]"
        style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="font-bold mb-2" style={{ color: 'var(--text-high)' }}>
          Debug Tools
        </div>
        <div className="mb-2 text-[10px]" style={{ color: 'var(--text-low)' }}>
          Mode: {mode || 'none'}
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          <button
            className="px-2 py-1 rounded-md border"
            onClick={() => setMode('strongBuy')}
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            Force STRONG BUY
          </button>
          <button
            className="px-2 py-1 rounded-md border"
            onClick={() => setMode('strongSell')}
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            Force STRONG SELL
          </button>
          <button
            className="px-2 py-1 rounded-md border"
            onClick={() => setMode(null)}
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            Clear
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {notif !== 'granted' ? (
            <button
              className="px-2 py-1 rounded-md border"
              onClick={requestNotif}
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              Enable Notifications
            </button>
          ) : (
            <button
              className="px-2 py-1 rounded-md border"
              onClick={fireNotif}
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              Test Notification
            </button>
          )}
          <button
            className="px-2 py-1 rounded-md border"
            onClick={() => refresh?.()}
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
