import { useEffect, useMemo } from 'react';
import { useLaunchParams, miniApp, useSignal } from '@telegram-apps/sdk-react';
import { viewport } from '@telegram-apps/sdk';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { AppRoutes } from './AppRoutes';
import { HashRouter } from 'react-router-dom';
import { useTelegramSdk } from '@/hooks/useTelegramSdk';
import { UnsupportedPlatform } from './UnsupportedPlatform/UnsupportedPlatform';

const waitFor = async (pred: () => boolean, t = 1500, step = 50) => {
  const start = Date.now();
  while (Date.now() - start < t) {
    if (pred()) return true;
    await new Promise(r => setTimeout(r, step));
  }
  return pred();
};

export function App() {
  useTelegramSdk();

  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);
  const isSupportedPlatform = useMemo(
    () => ['ios', 'android', 'web', 'weba'].includes(lp.platform),
    [lp.platform]
  );

  useEffect(() => {
    (async () => {
      await waitFor(() => {
        try { return (viewport.isMounted?.() ?? true); } catch { return true; }
      }, 500, 50);

      try {
        miniApp.setHeaderColor('secondary_bg_color');
        if (typeof (miniApp as any).setBackgroundColor === 'function') {
          const color = getComputedStyle(document.documentElement)
            .getPropertyValue('--app-secondary-bg')
            .trim();
          if (color) (miniApp as any).setBackgroundColor(color);
        }
      } catch (e) {
        console.warn('setHeaderColor early failed:', e);
      }
    })();
  }, [isDark]); 

  useEffect(() => {
    const disableScrolling = () => {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    };
    const enableScrolling = () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
    disableScrolling();
    return enableScrolling;
  }, []);

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.platform) ? 'ios' : 'base'}
    >
      <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {isSupportedPlatform ? <AppRoutes /> : <UnsupportedPlatform />}
      </HashRouter>
    </AppRoot>
  );
}