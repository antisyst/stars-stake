import { useEffect } from "react";
import { useLaunchParams, miniApp, useSignal } from "@telegram-apps/sdk-react";
import { AppRoot } from "@telegram-apps/telegram-ui";
import { AppRoutes } from "./AppRoutes";
import { HashRouter } from "react-router-dom";
import { useTelegramSdk } from "@/hooks/useTelegramSdk";

export function App() {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);
  const isSupportedPlatform = ["ios", "android"].includes(lp.platform);
  useTelegramSdk();

  useEffect(() => {
    const disableScrolling = () => {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    };

    const enableScrolling = () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };

    disableScrolling();
    return () => {
      enableScrolling();
    };
  }, []);

  return (
    <AppRoot
      appearance={isDark ? "dark" : "light"}
      platform={['macos', 'ios'].includes(lp.platform) ? 'ios' : 'base'}
      style={{ background: 'transparent' }}
    >
      <HashRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        {isSupportedPlatform ? <AppRoutes /> : <AppRoutes />}
      </HashRouter>
    </AppRoot>
  );
}