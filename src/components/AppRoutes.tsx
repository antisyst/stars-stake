import React, { useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { miniApp, useSignal, initData } from '@telegram-apps/sdk-react';
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

export const AppRoutes: React.FC = () => {
  useTelegramSdk();
  return <AppRoutesInner />;
};

const AppRoutesInner: React.FC = () => {
  const initDataState = useSignal(initData.state);
  const iconsLoaded = usePreloadImages(icons);
  const iconsLoadedRef = useRef(iconsLoaded);
  useEffect(() => {
    iconsLoadedRef.current = iconsLoaded;
  }, [iconsLoaded]);

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      try {
        await waitFor(() => Boolean(initDataState?.user), 10000, 50);
        if (cancelled) return;

        const user = initDataState?.user;
        if (!user?.id) {
          if (!cancelled) {
            setLoading(false);
            navigate('/home', { replace: true });
          }
          return;
        }

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

        if (cancelled) return;

        setLoading(false);

        navigate('/home', { replace: true });
        miniApp.setHeaderColor('secondary_bg_color')
      } catch (err) {
        console.error('User init error:', err);
        setLoading(false);
        navigate('/home', { replace: true });
      }
    };

    boot();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div
      >
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