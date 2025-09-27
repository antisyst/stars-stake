import { useEffect } from 'react';
import { miniApp } from '@telegram-apps/sdk-react';
import {
  init,
  viewport,
  closingBehavior,
  swipeBehavior,
  backButton,
} from '@telegram-apps/sdk';

export const useTelegramSdk = () => {
  useEffect(() => {
    let removeThemeListener: (() => void) | null = null;
    let visibilityHandler: (() => void) | null = null;

    const readCssVar = (name: string) => {
      try {
        return getComputedStyle(document.documentElement)
          .getPropertyValue(name)
          .trim();
      } catch {
        return '';
      }
    };

    const getPreferredBg = (token: 'bg' | 'secondary_bg' = 'secondary_bg') => {
      // 1) after bindCssVars, these exist
      const cssVar =
        token === 'bg'
          ? readCssVar('--tg-theme-bg-color')
          : readCssVar('--tg-theme-secondary-bg-color');

      if (cssVar) return cssVar;

      // 2) fallback to your own variable
      const fallback =
        token === 'bg'
          ? readCssVar('--bg-color-fallback')
          : readCssVar('--secondary-bg-color-fallback');
      if (fallback) return fallback;

      // 3) last resort: untyped Telegram object (snake_case key names)
      const tp = (window as any)?.Telegram?.WebApp?.themeParams;
      const raw =
        token === 'bg' ? tp?.bg_color : tp?.secondary_bg_color; // e.g. "#0a0a0a"
      return typeof raw === 'string' && raw ? raw : '';
    };

    const applyColors = (usePrimary = false) => {
      const tokenName = usePrimary ? 'bg_color' : 'secondary_bg_color';

      try {
        // Tell Telegram to style chrome with its theme token
        miniApp.setHeaderColor(tokenName);
        miniApp.setBackgroundColor(tokenName);
        miniApp.setBottomBarColor(tokenName);
      } catch (err) {
        console.warn('applyColors (set*) error:', err);
      }

      // Ensure the document background is in sync immediately (prevents any black flash).
      const hardColor = getPreferredBg(usePrimary ? 'bg' : 'secondary_bg');
      if (hardColor) {
        document.documentElement.style.backgroundColor = hardColor;
        document.body.style.backgroundColor = hardColor;
      }
    };

    const bindThemeVars = async () => {
      try {
        await viewport.mount(); // idempotent-safe
      } catch (err: unknown) {
        const msg = (err as Error)?.message ?? '';
        if (!/already mounting|already mounted/i.test(msg)) {
          console.warn('Viewport mount error:', err);
        }
      }

      try {
        viewport.bindCssVars(); // exposes --tg-theme-* on :root
      } catch (err) {
        console.warn('bindCssVars error:', err);
      }
    };

    (async () => {
      try {
        // 1) init Telegram webapp env
        init();

        // 2) wait until Telegram is ready before touching chrome colors
        if (typeof (miniApp as any).ready === 'function') {
          await (miniApp as any).ready();
        }

        // 3) bind CSS vars first, then 4) apply colors
        await bindThemeVars();
        applyColors(false); // use secondary tone by default; flip to true to use primary

        // 5) expand viewport
        try {
          viewport.expand();
        } catch (err) {
          console.warn('expand error:', err);
        }

        // back button
        try {
          backButton.mount();
        } catch (err) {
          console.warn('backButton.mount() failed (continuing):', err);
        }

        // confirm on close & swipe behavior
        try {
          closingBehavior.mount();
          closingBehavior.enableConfirmation();
        } catch (err) {
          console.warn('ClosingBehavior init error:', err);
        }
        try {
          swipeBehavior.mount();
          swipeBehavior.disableVertical();
        } catch (err) {
          console.warn('SwipeBehavior error:', err);
        }

        // Re-apply on theme change (use untyped onEvent API to avoid TS issues)
        try {
          const handler = async () => {
            await bindThemeVars();
            applyColors(false);
          };
          (window as any)?.Telegram?.WebApp?.onEvent?.('themeChanged', handler);
          removeThemeListener = () => {
            (window as any)?.Telegram?.WebApp?.offEvent?.('themeChanged', handler);
          };
        } catch {
          /* ignore */
        }

        // iOS resume case
        visibilityHandler = async () => {
          if (document.visibilityState === 'visible') {
            await bindThemeVars();
            applyColors(false);
          }
        };
        document.addEventListener('visibilitychange', visibilityHandler);
      } catch (err) {
        console.error('Init error:', err);
      }
    })();

    return () => {
      try {
        removeThemeListener?.();
      } catch {}
      if (visibilityHandler) {
        document.removeEventListener('visibilitychange', visibilityHandler);
      }
      (async () => {
        try {
          await viewport.exitFullscreen();
        } catch {
          /* ignore */
        }
      })();
    };
  }, []);
};
