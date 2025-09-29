import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useSignal, initData, themeParamsState } from '@telegram-apps/sdk-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/configs/firebaseConfig';
import { routes } from '@/navigation/routes';
import { ToastProvider } from '@/contexts/ToastContext';
import { useTelegramSdk } from '@/hooks/useTelegramSdk';
import { icons } from '@/configs/icons';
import { usePreloadImages } from '@/hooks/usePreloadImages';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const waitFor = async (
  predicate: () => boolean,
  timeoutMs = 8000,
  intervalMs = 50
) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (predicate()) return true;
    await wait(intervalMs);
  }
  return predicate();
};

const isThemeCssReady = () => {
  const root = document.documentElement;
  const bg = getComputedStyle(root).getPropertyValue('--tg-theme-bg-color').trim();
  const sec = getComputedStyle(root).getPropertyValue('--tg-theme-secondary-bg-color').trim();
  return Boolean(bg || sec);
};

export const AppRoutes: React.FC = () => {
  useTelegramSdk();
  return <AppRoutesInner />;
};

const AppRoutesInner: React.FC = () => {
  const initDataSig = useSignal(initData.state);
  const themeSig = useSignal(themeParamsState);
  const iconsLoaded = usePreloadImages(icons);
  const iconsLoadedRef = useRef(iconsLoaded);
  useEffect(() => { iconsLoadedRef.current = iconsLoaded; }, [iconsLoaded]);

  const navigate = useNavigate();

  const [booting, setBooting] = useState(true);

  const themeReady = useMemo(() => {
    return Boolean(themeSig) || isThemeCssReady();
  }, [themeSig]);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      try {
        await waitFor(() => themeReady, 6000, 50);

        if (cancelled) return;

        await waitFor(() => Boolean(useSignal(initData.state)?.user) || true, 10000, 50);

        if (cancelled) return;

        const user = initDataSig?.user;
        if (user?.id) {
          const uid = String(user.id);
          const userRef = doc(db, 'users', uid);
          const payload = {
            id: user.id,
            username:
              user.username ||
              `${user.firstName} ${user.lastName || ''}`.trim() ||
              'Anonymous',
            languageCode: user.languageCode || '',
            photoUrl: user.photoUrl || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
          };
          await setDoc(userRef, payload, { merge: true });
        }

        if (cancelled) return;

        setBooting(false);
        navigate('/home', { replace: true });
      } catch (err) {
        console.error('Boot error:', err);
        setBooting(false);
        navigate('/home', { replace: true });
      }
    };

    boot();
    return () => { cancelled = true; };
  }, [themeReady]);

  if (booting) {
    return (
      <div role="status" aria-live="polite">
        Loading...
      </div>
    );
  }

  return (
    <ToastProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Routes>
            {routes.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
      </div>
    </ToastProvider>
  );
};