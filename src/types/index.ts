import type { ReactNode, ComponentType } from "react";

export interface UserData {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  photoUrl?: string;
  starsBalance: number;
  currentApy: number;
  starsCents?: number;
  walletAddress?: string;
  walletConnected?: boolean;
  defaultCurrency?: 'USD' | 'EUR' | 'RUB' | 'INR' | 'BRL' | 'IDR' | 'TRY' | 'UAH' | 'KZT';
}

export type ToastStatus = 'success' | 'error';

export type Scheme = 'dark' | 'light';

export type Platform = 'ios' | 'android' | 'web';

export interface Palette {
  bg: string;
  secondaryBg: string;
  sectionBg: string;
  headerBg: string;
  text: string;
  subtitle: string;
  hint: string;
  link: string;
  accentText: string;
  button: string;
  buttonText: string;
  sectionHeaderText: string;
  destructiveText: string;
  sectionSeparator: string;
  bottomBarBg: string;
}

export interface ToastProps {
  title: string;
  status: ToastStatus;
  duration?: number;
  onClose: () => void;
}

export interface ToastOptions {
  title: string;
  status: ToastStatus;
  duration?: number;
}

export interface ToastContextType {
  showToast: (opts: ToastOptions) => void;
  showSuccess: (title: string, duration?: number) => void;
  showError: (title: string, duration?: number) => void;
}

export interface ToastProviderProps {
  children: ReactNode;
}

export type Faq = {
  question: string;
  answer: string;
};

export interface Insets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export type FaqSectionProps = {
  variant?: 'home' | 'full';
  homeCount?: number;
  title?: string;
};

export type ModalVariant = 'info' | 'history';

export type ModalProps = {
  isOpen: boolean;
  title: string;
  button?: string;
  content?: string;
  onClose: () => void;
  children?: React.ReactNode;
  mainButtonBgVar?: string;
  mainButtonTextVar?: string;
  variant?: ModalVariant;
  historyItem?: ActivityWithExtras | null;
};

export type ProgressiveTiersBarProps = {
  widths: [number, number, number, number];
  topLabels: [string, string, string, string];  
  colors?: [string, string, string, string]; 
  ariaLabel?: string;
  durationPerSeg?: number;
  stagger?: number; 
};

export interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export interface GlobalStats {
  totalStaked: number;  
  exchangeRate: number; 
  systemHealth: 'Stable' | 'Degraded' | 'Critical';
}

export interface Position {
  id?: string;
  amount: number;
  apy: number;
  tier: 1 | 2 | 3 | 4;
  createdAt: any;
  unlockAt: any;

  lastAccruedAt?: any;
  accruedDays?: number;
  earned?: number;
  fracCarryCents?: number;
}

export type ActivityType = 'stake' | 'unstake' | 'reward';

export interface Activity {
  id?: string;
  type: ActivityType;
  amount: number; 
  apy: number;      
  createdAt: any;
}

export type ActivityWithExtras = Activity & {
  unlockAt?: any;
  lockDays?: number;
};

export type AppDataContextType = {
  loading: boolean;
  uid: string | null;
  user: UserData | null;
  stats: GlobalStats | null;
  positions: Position[];
  effectiveApy: number; 
  exchangeRate: number;
  balanceUsd: number;
};

interface DropdownItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  items: DropdownItem[];
  position?: 'left' | 'right' | 'center';
  triggerRef?: React.RefObject<HTMLElement>;
}