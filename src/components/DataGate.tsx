import React from 'react';
import { useAppData } from '@/contexts/AppDataContext';
import { LoaderScreen } from './LoaderScreen/LoaderScreen';

export const DataGate: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { loading } = useAppData();
  if (loading) return <LoaderScreen />;
  return <>{children}</>;
};