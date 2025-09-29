import { useEffect } from 'react';
import { miniApp, themeParamsState } from '@telegram-apps/sdk-react';
import {
  init,
  viewport,
  closingBehavior,
  swipeBehavior,
  backButton,
} from '@telegram-apps/sdk';

// Poll CSS vars — we only apply colors once they exist to avoid the "header ok / bg black" mismatch.
const isThemeCssReady = () => {
  const root = document.documentElement;
  const bg = getComputedStyle(root).getPropertyValue('--tg-theme-bg-color').trim();
  const sec = getComputedStyle(root).getPropertyValue('--tg-theme-secondary-bg-color').trim();
  return Boolean(bg || sec);
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const waitFor = async (pred: () => boolean, timeoutMs = 3000, intervalMs = 50) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (pred()) return true;
    await wait(intervalMs);
  }
  return pred();
};

export const useTelegramSdk = () => {
  useEffect(() => {
    let unmounted = false;

    (async () => {
      // Init base SDK first
      try { init(); } catch (err) { console.error('Init error:', err); }

      // Back button safest
      try { backButton.mount(); } catch (err) { console.warn('backButton.mount() failed:', err); }

      // Viewport bind/mount/expand
      try {
        await viewport.mount();
      } catch (err: unknown) {
        const msg = (err as Error)?.message ?? '';
        if (!/already mounting|already mounted/i.test(msg)) {
          console.warn('Viewport mount error:', err);
        }
      }

      try { await waitFor(() => viewport.isMounted(), 2000); } catch { /* ignore */ }

      try { if (viewport.isMounted()) viewport.bindCssVars(); } catch (err) { console.warn('bindCssVars:', err); }
      try { if (viewport.isMounted()) viewport.expand(); } catch (err) { console.warn('expand:', err); }

      // Closing/swipe behaviors
      try { closingBehavior.mount(); } catch (err) { /* ignore */ }
      try { closingBehavior.enableConfirmation(); } catch (err) { /* ignore */ }
      try { swipeBehavior.mount(); swipeBehavior.disableVertical(); } catch (err) { /* ignore */ }

      // IMPORTANT: only apply header/bg colors after theme params are available
      try {
        // Either SDK theme signal exists or CSS vars present
        const ok = await waitFor(() => Boolean(themeParamsState()) || isThemeCssReady(), 4000, 50);
        if (!ok) {
          console.warn('Theme not ready in time; proceeding with best-effort.');
        }
        if (unmounted) return;

        // Use token names so Telegram maps them to the current theme
        // HeaderColor accepts 'bg_color' | 'secondary_bg_color'
        miniApp.setHeaderColor('secondary_bg_color');
        miniApp.setBackgroundColor('secondary_bg_color');
        // Bottom bar color isn't available on all clients; wrap in try
        try { miniApp.setBottomBarColor?.('secondary_bg_color' as any); } catch {/* ignore */}
      } catch (err) {
        console.warn('Color application error:', err);
      }
    })();

    return () => {
      unmounted = true;
      (async () => { try { await viewport.exitFullscreen(); } catch { /* ignore */ } })();
    };
  }, []);
};