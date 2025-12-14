import React, { useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useSignal, initData } from '@telegram-apps/sdk-react';
import { doc, runTransaction, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/configs/firebaseConfig';
import { routes } from '@/navigation/routes';
import { useTelegramSdk } from '@/hooks/useTelegramSdk';
import { LoaderScreen } from './LoaderScreen/LoaderScreen';
import { icons } from '@/configs/icons';
import { fonts } from '@/configs/fonts';
import { usePreloadImages } from '@/hooks/usePreloadImages';
import { ToastProvider } from '@/contexts/ToastContext';
import { usePreloadFonts } from '@/hooks/usePreloadFonts';
import { waitFor } from '@/utils/wait';
import { mainButton } from '@telegram-apps/sdk';
import { DataGate } from '@/components/DataGate';

export const AppRoutes: React.FC = () => {
  useTelegramSdk();
  return <AppRoutesInner />;
};

const AppRoutesInner: React.FC = () => {
  const initDataState = useSignal(initData.state);
  const iconsLoaded = usePreloadImages(icons);
  const fontsLoaded = usePreloadFonts(fonts);

  const navigate = useNavigate();
  const location = useLocation();

  const [bootLoading, setBootLoading] = useState(true);
  const bootedRef = useRef(false);
  const pageLayoutRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      const el = pageLayoutRef.current;
      if (el) el.scrollTop = 0;
    });
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
      try {
        await waitFor(() => Boolean(initDataState?.user) && iconsLoaded && fontsLoaded, 10000, 50);
        if (cancelled) return;

        const user = initDataState?.user;
        if (user?.id) {
          const uid = String(user.id);
          const userRef = doc(db, 'users', uid);

          await runTransaction(db, async (tx) => {
            const snap = await tx.get(userRef);

            if (!snap.exists()) {
              tx.set(userRef, {
                id: user.id,
                username: user.username || `${user.firstName} ${user.lastName || ''}`.trim() || 'Anonymous',
                languageCode: user.languageCode || '',
                photoUrl: user.photoUrl || '',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                starsBalance: 0,
                currentApy: 12.8,
                walletConnected: false,
                walletAddress: '',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            } else {
              const data = snap.data() as any;
              const patch: any = { updatedAt: serverTimestamp() };

              if ((user.firstName || '') !== (data.firstName || '')) patch.firstName = user.firstName || '';
              if ((user.lastName || '') !== (data.lastName || '')) patch.lastName = user.lastName || '';
              if ((user.username || '') !== (data.username || '')) patch.username = user.username || `${user.firstName} ${user.lastName || ''}`.trim() || 'Anonymous';
              if ((user.photoUrl || '') !== (data.photoUrl || '')) patch.photoUrl = user.photoUrl || '';

              if (!data.languageCode || data.languageCode === '') {
                if (user.languageCode) patch.languageCode = user.languageCode;
              }

              if (typeof data.walletConnected !== 'boolean') patch.walletConnected = false;
              if (typeof data.walletAddress !== 'string') patch.walletAddress = '';

              const keys = Object.keys(patch);
              if (keys.length > 0) {
                tx.update(userRef, patch);
              }
            }
          });

          const statsRef = doc(db, 'stats', 'global');
          const statsSnap = await getDoc(statsRef);
          if (!statsSnap.exists()) {
            await setDoc(statsRef, {
              totalStaked: 0,
              exchangeRate: 0.0199,
              systemHealth: 'Stable',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }

        setBootLoading(false);

        if (!bootedRef.current) {
          bootedRef.current = true;
          const path = location.pathname.replace(/^#?/, '');
          if (!path || path === '/' || path === '') {
            navigate('/home', { replace: true });
          }
        }
      } catch (err) {
        console.error('User init error:', err);
        setBootLoading(false);
        if (!bootedRef.current) {
          bootedRef.current = true;
          const path = location.pathname.replace(/^#?/, '');
          if (!path || path === '/' || path === '') {
            navigate('/home', { replace: true });
          }
        }
      }
    };

    boot();
    return () => { cancelled = true; };
  }, [initDataState, navigate, location.pathname, iconsLoaded, fontsLoaded]);

  useEffect(() => {
    const isDeposit = location.pathname === '/deposit';
    if (!isDeposit) {
      try {
        mainButton.setParams({ isVisible: false, isLoaderVisible: false, isEnabled: false });
      } catch {}
    }
  }, [location.pathname]);

  if (bootLoading) return <LoaderScreen />;

  return (
    <DataGate>
      <ToastProvider>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <div className="page-layout" ref={pageLayoutRef}>
            <Routes>
              {routes.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} />
              ))}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </div>
        </div>
      </ToastProvider>
    </DataGate>
  );
};