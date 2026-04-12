import { useEffect } from 'react';
import { settingsButton } from '@telegram-apps/sdk';
import { useNavigate } from 'react-router-dom';

export function useSettingsButton() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!settingsButton.isSupported()) return;

    if (!settingsButton.isMounted()) {
      settingsButton.mount();
    }

    settingsButton.show();

    const offClick = settingsButton.onClick(() => {
      navigate('/profile');
    });

    return () => {
      offClick();
      try { settingsButton.hide(); } catch {}
    };
  }, [navigate]);
}