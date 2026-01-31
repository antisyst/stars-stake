import { useNavigate, useLocation } from 'react-router-dom';
import {
  showBackButton,
  hideBackButton,
  onBackButtonClick,
} from '@telegram-apps/sdk';
import { type PropsWithChildren, useEffect } from 'react';

export function Page({
  children,
  back = true,
  backTo,
}: PropsWithChildren<{ back?: boolean; backTo?: string }>) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let off: (() => void) | undefined;

    try {
      if (back) {
        try { showBackButton(); } catch {}

        try {
          off = onBackButtonClick(() => {
            if (backTo && backTo !== location.pathname) {
              navigate(backTo, { replace: true });
              return;
            }
            navigate(-1);
          });
        } catch {}
      } else {
        try { hideBackButton(); } catch {}
      }
    } catch {}

    return () => {
      try { off?.(); } catch {}
    };
  }, [back, backTo, navigate, location.pathname]);

  return <>{children}</>;
}
