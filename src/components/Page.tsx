import { useNavigate } from 'react-router-dom';
import {
  showBackButton,
  hideBackButton,
  onBackButtonClick,
} from '@telegram-apps/sdk';
import { type PropsWithChildren, useEffect } from 'react';

export function Page({ children, back = true }: PropsWithChildren<{ back?: boolean }>) {
  const navigate = useNavigate();

  useEffect(() => {
    let off: (() => void) | undefined;

    try {
      if (back) {
        // Show and bind; rely on runtime guards inside SDK
        try { showBackButton(); } catch {}
        try { off = onBackButtonClick(() => navigate(-1)); } catch {}
      } else {
        try { hideBackButton(); } catch {}
      }
    } catch {}

    return () => {
      try { off?.(); } catch {}
    };
  }, [back, navigate]);

  return <>{children}</>;
}
