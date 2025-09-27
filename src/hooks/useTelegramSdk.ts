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
    let gestureHandler: (() => void) | null = null;

    const waitFor = (predicate: () => boolean, timeoutMs = 2000, intervalMs = 50) =>
      new Promise<void>((resolve, reject) => {
        const start = Date.now();
        const tick = () => {
          if (predicate()) return resolve();
          if (Date.now() - start >= timeoutMs) return reject(new Error('timeout'));
          setTimeout(tick, intervalMs);
        };
        tick();
      });

    (async () => {
      try {
        miniApp.setHeaderColor('secondary_bg_color');
        miniApp.setBackgroundColor('secondary_bg_color');
        miniApp.setBottomBarColor('secondary_bg_color');
        init();
      } catch (err) {
        console.error('Init error:', err);
      }

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
        await waitFor(() => viewport.isMounted(), 2000);
      } catch {
        console.warn('Viewport did not report mounted in time; some features will be skipped.');
      }

      try {
        if (viewport.isMounted()) {
          viewport.bindCssVars();
        }
      } catch (err) {
        console.warn('bindCssVars error:', err);
      }

      try {
        if (viewport.isMounted()) {
          viewport.expand();
        }
      } catch (err) {
        console.warn('expand error:', err);
      }

      try {
        closingBehavior.mount();
      } catch (err: unknown) {
        const msg = (err as Error)?.message ?? '';
        if (!/already mounting|already mounted/i.test(msg)) {
          console.warn('ClosingBehavior mount error:', err);
        }
      }
      try {
        closingBehavior.enableConfirmation();
      } catch (err) {
        console.warn('enableConfirmation error:', err);
      }

      try {
        swipeBehavior.mount();
        swipeBehavior.disableVertical();
      } catch (err) {
        console.warn('SwipeBehavior error:', err);
      }
    })();

    return () => {
      if (gestureHandler) {
        document.removeEventListener('click', gestureHandler);
        document.removeEventListener('touchend', gestureHandler);
      }
      (async () => {
        try {
          await viewport.exitFullscreen();
        } catch {
          /* ignore */
        }
      })();
      try {
      } catch {
        /* ignore */
      }
    };
  }, []);
};
