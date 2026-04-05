export function lockStableVh(): void {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--stable-vh', `${vh}px`);
}