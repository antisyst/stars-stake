import { useEffect } from 'react';
import { miniApp, useSignal, useLaunchParams } from '@telegram-apps/sdk-react';
import {
  init,
  viewport,
  closingBehavior,
  swipeBehavior,
  backButton,
} from '@telegram-apps/sdk';
import { applyTheme } from '@/theme/applyTheme';
import type { Platform, Scheme } from '@/theme/palettes';

export const useTelegramSdk = () => {
  const lp = useLaunchParams();

  const isDark = useSignal(miniApp.isDark);
  const scheme: Scheme = isDark ? 'dark' : 'light';

  const platform: Platform =
    lp.platform === 'ios' ? 'ios'
    : lp.platform === 'android' ? 'android'
    : lp.platform === 'tdesktop' ? 'tdesktop'
    : 'web';

  useEffect(() => {
    (async () => {
      try {
        init();
      } catch (err) {
        console.error('Init error:', err);
      }

      try {
        try { backButton.mount(); } catch (err) { /* ignore */ }

        await viewport.mount().catch((err) => {
          const msg = (err as Error)?.message ?? '';
          if (!/already mounting|already mounted/i.test(msg)) {
            console.warn('Viewport mount error:', err);
          }
        });

        try { viewport.bindCssVars(); } catch {}
        try { viewport.expand(); } catch {}

        try { closingBehavior.mount(); closingBehavior.enableConfirmation(); } catch {}
        try { swipeBehavior.mount(); swipeBehavior.disableVertical(); } catch {}
      } catch (err) {
        console.warn('SDK setup warning:', err);
      }

      applyTheme(platform, scheme);
    })();

    return () => {
      (async () => {
        try { await viewport.exitFullscreen(); } catch {}
      })();
    };
  }, []);

  useEffect(() => {
    applyTheme(platform, scheme);
  }, [platform, scheme]);
};