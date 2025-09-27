import type { ReactNode, ComponentType } from "react";

export interface UserData {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  photoUrl?: string;
  savedGifts?: string[];
}

export interface Referral {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  createdAt: string;
}

export interface GiftType {
  slug:    string;
  name:    string;
  price:   number;
  status:  'for-sale'|'sold'|'not-for-sale'|'available'|'on-auction';
}

export type StatusOption = 'all' | 'on-auction' | 'sold' | 'for-sale';

export type PriceSortOption = 'high-to-low' | 'low-to-high';

export interface PurchaseType {
  slug: string
  name: string
  image: string
  status: 'sold'
  purchasedAt: string
  priceStars: number
}

export interface GiftDetail extends GiftType {
  description: string;
  image: string;
  attributes: { trait_type: string; value: string }[];
  lottie: string;
}

export interface LoaderScreenProps {
  progress: number;
}

export interface SpinnerProps {
  size?: number;
}

export interface SwitchProps {
  isOn: boolean;
  onToggle: () => void;
}

export type ToastStatus = 'success' | 'error';

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

export interface Insets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}