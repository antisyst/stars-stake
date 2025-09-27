import { FC, useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { viewport } from '@telegram-apps/sdk';
import type { Insets } from '@/types';

export const Layout: FC = () => {
  const [insets, setInsets] = useState<Insets>({ top: 0, bottom: 0, left: 0, right: 0 });
  const [initialHeight, setInitialHeight] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInsets(viewport.safeAreaInsets());
    if (typeof window !== 'undefined') {
      setInitialHeight(window.innerHeight);
    }
  }, []);

  return (
    <div
      className="layout"
      style={{
        position: 'relative',
        height: initialHeight ? `${initialHeight}px` : '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'hidden',
          overflowX: 'hidden',
        }}
      >
        <div style={{ padding: `${insets.top + 30}px 13px ${insets.bottom + 100}px 13px` }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};