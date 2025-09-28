import { useEffect } from 'react';
import { miniApp } from '@telegram-apps/sdk-react';
import {
  init,
  viewport,
  closingBehavior,
  swipeBehavior,
  backButton,
} from '@telegram-apps/sdk';

const tokenToCssVar: Record<'bg_color' | 'secondary_bg_color', string> = {
  bg_color: '--tg-theme-bg-color',
  secondary_bg_color: '--tg-theme-secondary-bg-color',
};

function readCssVar(varName: string): string | null {
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || null;
}

function applyHtmlBackgroundFromToken(token: 'bg_color' | 'secondary_bg_color') {
  const cssVar = tokenToCssVar[token];
  const color = readCssVar(cssVar) || '#111111';
  document.documentElement.style.backgroundColor = color;
  document.body.style.backgroundColor = color;
  const root = document.querySelector('tc-root, #root') as HTMLElement | null;
  if (root) root.style.backgroundColor = color;
}

async function applyTelegramColors(token: 'bg_color' | 'secondary_bg_color') {
  applyHtmlBackgroundFromToken(token);

  try { miniApp.setHeaderColor(token); } catch {}
  try { miniApp.setBackgroundColor(token); } catch {}
  try { miniApp.setBottomBarColor(token); } catch {}

  setTimeout(() => {
    try { miniApp.setBackgroundColor(token); } catch {}
  }, 16);

  try {
    await viewport.expand();
    applyHtmlBackgroundFromToken(token);
    try { miniApp.setBackgroundColor(token); } catch {}
  } catch {
    // ignore
  }
}

export const useTelegramSdk = () => {
  useEffect(() => {
    let mounted = true;

    const token: 'bg_color' | 'secondary_bg_color' = 'secondary_bg_color';

    const safeWaitFor = (pred: () => boolean, timeoutMs = 2000, intervalMs = 50) =>
      new Promise<void>((resolve) => {
        const start = Date.now();
        const tick = () => {
          if (!mounted) return resolve();
          if (pred()) return resolve();
          if (Date.now() - start >= timeoutMs) return resolve();
          setTimeout(tick, intervalMs);
        };
        tick();
      });

    const onThemeChanged = () => {
      void applyTelegramColors(token);
    };

    const onVisibilityOrFocus = () => {
      void applyTelegramColors(token);
    };

    const onPageShow = (_e: PageTransitionEvent) => {
      void applyTelegramColors(token);
    };

    (async () => {
      try { init(); } catch (err) { console.error('Init error:', err); }

      try { backButton.mount(); } catch {}

      try { await viewport.mount(); } catch {}

      try { viewport.bindCssVars(); } catch {}

      await safeWaitFor(() => true, 50);
      await applyTelegramColors(token);

      try { closingBehavior.mount(); closingBehavior.enableConfirmation(); } catch {}
      try { swipeBehavior.mount(); swipeBehavior.disableVertical(); } catch {}
    })();

    window.addEventListener('focus', onVisibilityOrFocus);
    document.addEventListener('visibilitychange', onVisibilityOrFocus);
    window.addEventListener('pageshow', onPageShow);

    window.addEventListener('theme_changed', onThemeChanged as EventListener);

    return () => {
      mounted = false;
      window.removeEventListener('focus', onVisibilityOrFocus);
      document.removeEventListener('visibilitychange', onVisibilityOrFocus);
      window.removeEventListener('pageshow', onPageShow);
      window.removeEventListener('theme_changed', onThemeChanged as EventListener);
      (async () => { try { await viewport.exitFullscreen(); } catch {} })();
    };
  }, []);
};