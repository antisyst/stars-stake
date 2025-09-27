import { useNavigate } from 'react-router-dom';
import { backButton } from '@telegram-apps/sdk-react';
import { PropsWithChildren, useEffect } from 'react';

export function Page({ children, back = true }: PropsWithChildren<{ back?: boolean }>) {
  const navigate = useNavigate();

  useEffect(() => {
    if (back) {
      backButton.show();
      const off = backButton.onClick(() => navigate(-1));
      return off;
    } else {
      backButton.hide();
    }
  }, [back, navigate]);

  return <>{children}</>;
}