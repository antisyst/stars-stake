import { useEffect } from 'react';
import { init, viewport, closingBehavior, swipeBehavior, backButton } from '@telegram-apps/sdk';

export const useTelegramSdk = () => {
  useEffect(() => {
    (async () => {
      try { init(); } catch (err) { console.error('Init error:', err); }

      try { backButton.mount(); } catch {}
      try {
        await viewport.mount().catch((err) => {
          const msg = (err as Error)?.message ?? '';
          if (!/already mounting|already mounted/i.test(msg)) {
            console.warn('Viewport mount error:', err);
          }
        });
      } catch {}
      try { viewport.bindCssVars(); } catch {}
      try { viewport.expand(); } catch {}
      try { closingBehavior.mount(); closingBehavior.enableConfirmation(); } catch {}
      try { swipeBehavior.mount(); swipeBehavior.disableVertical(); } catch {}
    })();

    return () => { (async () => { try { await viewport.exitFullscreen(); } catch {} })(); };
  }, []);
};
