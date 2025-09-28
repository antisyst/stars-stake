import { useEffect } from 'react';
import { miniApp } from '@telegram-apps/sdk-react';
import {
  init,
  viewport,
  closingBehavior,
  swipeBehavior,
  backButton,
} from '@telegram-apps/sdk';

const TOKEN: 'bg_color' | 'secondary_bg_color' = 'secondary_bg_color';

function cssColorFromToken(token: 'bg_color' | 'secondary_bg_color') {
  const varName =
    token === 'bg_color' ? '--tg-theme-bg-color' : '--tg-theme-secondary-bg-color';
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || '#111111';
}

function paintRoot(color: string) {
  document.documentElement.style.backgroundColor = color;
  document.body.style.backgroundColor = color;
  const root = document.querySelector('tc-root, #root') as HTMLElement | null;
  if (root) root.style.backgroundColor = color;
}

/**
 * Hard resync that mimics iOS app background -> foreground.
 * Use this right after first navigation to your main screen.
 */
export async function resyncTelegramChrome(): Promise<void> {
  const targetCssColor = cssColorFromToken(TOKEN);

  // 1) Paint DOM immediately.
  paintRoot(targetCssColor);

  // 2) Force Telegram system bars to update:
  //    flip to a dummy hex then back to token (this “jolts” iOS to repaint).
  try {
    miniApp.setHeaderColor('#010101');
    miniApp.setBackgroundColor('#010101');
    miniApp.setBottomBarColor('#010101');
  } catch {}

  await new Promise((r) => setTimeout(r, 24));

  try {
    miniApp.setHeaderColor(TOKEN);
    miniApp.setBackgroundColor(TOKEN);
    miniApp.setBottomBarColor(TOKEN);
  } catch {}

  // 3) Bounce viewport to ensure insets/expansion commit on iOS.
  try { await viewport.expand(); } catch {}

  // 4) Brutal repaint: hide/show + reflow + composite bump.
  const html = document.documentElement;
  const prevTransform = html.style.transform;
  html.style.visibility = 'hidden';
  // trigger reflow
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  html.offsetHeight;
  html.style.transform = 'translateZ(0)'; // new composite layer
  html.style.visibility = '';
  requestAnimationFrame(() => {
    html.style.transform = prevTransform;
    paintRoot(targetCssColor); // final paint with the correct color
  });
}

async function applyInitialChrome() {
  const c = cssColorFromToken(TOKEN);
  paintRoot(c);
  try { miniApp.setHeaderColor(TOKEN); } catch {}
  try { miniApp.setBackgroundColor(TOKEN); } catch {}
  try { miniApp.setBottomBarColor(TOKEN); } catch {}
}

export const useTelegramSdk = () => {
  useEffect(() => {
    let mounted = true;

    (async () => {
      try { init(); } catch (e) { console.error('Init error:', e); }
      try { backButton.mount(); } catch {}
      try { await viewport.mount(); } catch {}
      try { viewport.bindCssVars(); } catch {}

      await applyInitialChrome();

      try { closingBehavior.mount(); closingBehavior.enableConfirmation(); } catch {}
      try { swipeBehavior.mount(); swipeBehavior.disableVertical(); } catch {}
    })();

    const reapply = () => { if (mounted) void resyncTelegramChrome(); };
    window.addEventListener('pageshow', reapply);
    window.addEventListener('focus', reapply);
    document.addEventListener('visibilitychange', reapply);
    window.addEventListener('theme_changed', reapply as EventListener);

    return () => {
      mounted = false;
      window.removeEventListener('pageshow', reapply);
      window.removeEventListener('focus', reapply);
      document.removeEventListener('visibilitychange', reapply);
      window.removeEventListener('theme_changed', reapply as EventListener);
      (async () => { try { await viewport.exitFullscreen(); } catch {} })();
    };
  }, []);
};
