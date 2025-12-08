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
import type { Platform, Scheme } from '@/types';

export const useTelegramSdk = () => {
  const lp = useLaunchParams();

  const isDarkValue = Boolean(useSignal(miniApp.isDark) ?? false);
  const scheme: Scheme = isDarkValue ? 'dark' : 'light';

  const host = lp.platform;
  const platform: Platform =
    host === 'ios' || host === 'macos' ? 'ios'
    : host === 'android' ? 'android'
    : 'web';

  useEffect(() => {
    (async () => {
      try { init(); } catch (err) { console.error('Init error:', err); }

      try {
        try { backButton.mount(); } catch {}
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
      } finally {
        applyTheme(platform, scheme);
      }
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
