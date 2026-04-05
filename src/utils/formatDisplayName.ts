import type { UserData } from '@/types';

export function formatDisplayName(user: Pick<UserData, 'firstName' | 'lastName' | 'username'> | null | undefined): string {
  if (!user) return 'Anonymous';

  const first = user.firstName?.trim() || '';
  const last = user.lastName?.trim() || '';
  const username = user.username?.trim() || '';

  if (first && last) return `${first} ${last}`;
  if (first) return first;
  if (username) return username;
  return 'Anonymous';
}

export function formatInitials(user: Pick<UserData, 'firstName' | 'lastName' | 'username'> | null | undefined): string {
  if (!user) return 'A';

  const first = user.firstName?.trim() || '';
  const last = user.lastName?.trim() || '';
  const username = user.username?.trim() || '';

  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (first) return first[0].toUpperCase();
  if (username) return username[0].toUpperCase();
  return 'A';
}