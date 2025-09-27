import { useEffect } from 'react';
import { miniApp } from '@telegram-apps/sdk-react';
import {
  init,
  viewport,
  closingBehavior,
  swipeBehavior,
  backButton,
} from '@telegram-apps/sdk';

function resolveThemeHex(token: 'bg_color' | 'secondary_bg_color', fallback = '#121212') {
  const tp = (window as any)?.Telegram?.WebApp?.themeParams ?? {};
  const raw = tp?.[token];
  if (typeof raw === 'string' && raw.length > 0) {
    const hex = raw.startsWith('#') ? raw : `#${raw}`;
    return hex;
  }
  return fallback;
}

export const useTelegramSdk = () => {
  useEffect(() => {
    let themeChangedUnsub: (() => void) | null = null;

    const applyBackgroundNow = () => {
      const hex = resolveThemeHex('secondary_bg_color');
      try {
        miniApp.setHeaderColor(hex as any);
        miniApp.setBackgroundColor(hex as any);
      } catch (err) {
        console.warn('miniApp color set error:', err);
      }
      document.documentElement.style.setProperty('--secondary-bg-color-fallback', hex);
    };

    (async () => {
      try {
        init({ acceptCustomStyles: true } as any);
      } catch (err) {
        console.error('Init error:', err);
      }

      applyBackgroundNow();

      try {
        try {
          backButton.mount();
        } catch (err) {
          console.warn('backButton.mount() failed (continuing):', err);
        }
      } catch (err) {
        console.warn('backButton mount error:', err);
      }

      try {
        await viewport.mount();
      } catch (err: unknown) {
        const msg = (err as Error)?.message ?? '';
        if (!/already mounting|already mounted/i.test(msg)) {
          console.warn('Viewport mount error:', err);
        }
      }

      try {
        viewport.bindCssVars();
      } catch (err) {
        console.warn('bindCssVars error:', err);
      }

      try {
        viewport.expand();
      } catch (err) {
        console.warn('expand error:', err);
      }

      try {
        closingBehavior.mount();
        closingBehavior.enableConfirmation();
      } catch (err) {
        console.warn('ClosingBehavior error:', err);
      }

      try {
        swipeBehavior.mount();
        swipeBehavior.disableVertical();
      } catch (err) {
        console.warn('SwipeBehavior error:', err);
      }

      try {
        const WA = (window as any)?.Telegram?.WebApp;
        if (WA?.onEvent && WA?.offEvent) {
          const handler = () => {
            applyBackgroundNow();
          };
          WA.onEvent('themeChanged', handler);
          themeChangedUnsub = () => {
            try { WA.offEvent('themeChanged', handler); } catch { /* ignore */ }
          };
        }
      } catch {
        /* ignore */
      }
    })();

    return () => {
      try {
        viewport.exitFullscreen();
      } catch {
        /* ignore */
      }
      if (themeChangedUnsub) {
        try { themeChangedUnsub(); } catch { /* ignore */ }
      }
    };
  }, []);
};