import { getPalette, Platform, Scheme, Palette } from './palettes';

export function applyTheme(platform: Platform, scheme: Scheme): Palette {
  const root = document.documentElement;
  const p = getPalette(platform, scheme);

  root.style.setProperty('--app-bg', p.bg);
  root.style.setProperty('--app-secondary-bg', p.secondaryBg);
  root.style.setProperty('--app-section-bg', p.sectionBg);
  root.style.setProperty('--app-header-bg', p.headerBg);
  root.style.setProperty('--app-text', p.text);
  root.style.setProperty('--app-subtitle', p.subtitle);
  root.style.setProperty('--app-hint', p.hint);
  root.style.setProperty('--app-link', p.link);
  root.style.setProperty('--app-accent-text', p.accentText);
  root.style.setProperty('--app-button', p.button);
  root.style.setProperty('--app-button-text', p.buttonText);
  root.style.setProperty('--app-section-header-text', p.sectionHeaderText);
  root.style.setProperty('--app-destructive-text', p.destructiveText);
  root.style.setProperty('--app-section-separator', p.sectionSeparator);
  root.style.setProperty('--app-bottom-bar-bg', p.bottomBarBg);

  document.body.style.backgroundColor = p.secondaryBg;

  return p;
}