import { useEffect, useMemo } from 'react';
import { useLaunchParams, miniApp, useSignal, themeParams } from '@telegram-apps/sdk-react';
import { viewport } from '@telegram-apps/sdk';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { AppRoutes } from './AppRoutes';
import { HashRouter } from 'react-router-dom';
import { useTelegramSdk } from '@/hooks/useTelegramSdk';

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

  useEffect(() => {
    try { themeParams.mount?.(); } catch {}
  }, []);

  useEffect(() => {
    miniApp.setBackgroundColor('secondary_bg_color');
    miniApp.setBottomBarColor('secondary_bg_color');
    miniApp.setHeaderColor('secondary_bg_color');
  }, []);

  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);

  const isSupportedPlatform = useMemo(
    () => ['ios', 'android', 'web'].includes(lp.platform),
    [lp.platform]
  );

  useEffect(() => {
    (async () => {
      await waitFor(() => {
        try { return (viewport.isMounted?.() ?? true); } catch { return true; }
      }, 500);
      try { viewport.expand(); } catch {}
    })();
  }, []);

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
    <AppRoot appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.platform) ? 'ios' : 'base'}>
      <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {isSupportedPlatform ? <AppRoutes /> : <div>Unsupported platform</div>}
      </HashRouter>
    </AppRoot>
  );
}