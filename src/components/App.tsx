import { useEffect, useMemo } from 'react';
import { useLaunchParams, miniApp, useSignal } from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { AppRoutes } from './AppRoutes';
import { HashRouter } from 'react-router-dom';
import { useTelegramSdk } from '@/hooks/useTelegramSdk';
import { UnsupportedPlatform } from './UnsupportedPlatform/UnsupportedPlatform';

export function App() {
  useTelegramSdk();

  miniApp.setHeaderColor('secondary_bg_color')
  
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);
  const isSupportedPlatform = useMemo(
    () => ['ios', 'android', 'web'].includes(lp.platform), 
    [lp.platform]
  );

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
      <HashRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        {isSupportedPlatform ? <AppRoutes /> : <UnsupportedPlatform />}
      </HashRouter>
    </AppRoot>
  );
}
