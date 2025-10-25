export type Scheme = 'dark' | 'light';
export type Platform = 'ios' | 'android' | 'web' | 'tdesktop';

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

const iosDark: Palette = {
  bg: '#000000',
  secondaryBg: '#1c1c1d',
  sectionBg: '#2c2c2e',
  headerBg: '#1a1a1a',
  text: '#ffffff',
  subtitle: '#98989e',
  hint: '#98989e',
  link: '#3e88f7',
  accentText: '#3e88f7',
  button: '#3e88f7',
  buttonText: '#ffffff',
  sectionHeaderText: '#8d8e93',
  destructiveText: '#eb5545',
  sectionSeparator: '#545458',
  bottomBarBg: '#1d1d1d',
};

const iosLight: Palette = {
  link: '#007aff',
  bg: '#ffffff',
  accentText: '#007aff',
  sectionBg: '#ffffff',
  sectionSeparator: '#c8c7cc',
  destructiveText: '#ff3b30',
  hint: '#8e8e93',
  button: '#007aff',
  secondaryBg: '#efeff4',
  sectionHeaderText: '#6d6d72',
  text: '#000000',
  headerBg: '#f8f8f8',
  buttonText: '#ffffff',
  bottomBarBg: '#f2f2f2',
  subtitle: '#8e8e93',
};

/** Android */
const androidDark: Palette = {
  bg: '#212d3b',
  sectionBg: '#1d2733',
  secondaryBg: '#151e27',
  text: '#ffffff',
  hint: '#7d8b99',
  link: '#5eabe1',
  button: '#50a8eb',
  buttonText: '#ffffff',
  headerBg: '#242d39',
  accentText: '#64b5ef',
  sectionHeaderText: '#79c4fc',
  subtitle: '#7b8790',
  destructiveText: '#ee686f',
  sectionSeparator: '#0d1218',
  bottomBarBg: '#151e27',
};

const androidLight: Palette = {
  bg: '#ffffff',
  sectionBg: '#ffffff',
  secondaryBg: '#f0f0f0',
  text: '#222222',
  hint: '#a8a8a8',
  link: '#2678b6',
  button: '#50a8eb',
  buttonText: '#ffffff',
  headerBg: '#527da3',
  accentText: '#1c93e3',
  sectionHeaderText: '#3a95d5',
  subtitle: '#82868a',
  destructiveText: '#cc2929',
  sectionSeparator: '#d9d9d9',
  bottomBarBg: '#f0f0f0',
};

const webDark: Palette = {
  bg: '#212121',
  secondaryBg: '#181818',
  sectionBg: '#212121',
  headerBg: '#212121',
  text: '#ffffff',
  subtitle: '#aaaaaa',
  hint: '#aaaaaa',
  link: '#8774e1',
  accentText: '#8774e1',
  button: '#8774e1',
  buttonText: '#ffffff',
  sectionHeaderText: '#8774e1',
  destructiveText: '#ff595a',
  sectionSeparator: '#545458',
  bottomBarBg: '#181818',
};

const tdesktopLight: Palette = {
  accentText: '#168acd',
  bg: '#ffffff',
  bottomBarBg: '#ffffff',
  button: '#40a7e3',
  buttonText: '#ffffff',
  destructiveText: '#d14e4e',
  headerBg: '#ffffff',
  hint: '#999999',
  link: '#168acd',
  secondaryBg: '#f1f1f1',
  sectionBg: '#ffffff',
  sectionHeaderText: '#168acd',
  sectionSeparator: '#e7e7e7',
  subtitle: '#999999',
  text: '#000000',
};

const tdesktopDark: Palette = {
  accentText: '#6ab2f2',
  bg: '#17212b',
  bottomBarBg: '#17212b',
  button: '#5288c1',
  buttonText: '#ffffff',
  destructiveText: '#ec3942',
  headerBg: '#17212b',
  hint: '#708499',
  link: '#6ab3f3',
  secondaryBg: '#232e3c',
  sectionBg: '#17212b',
  sectionHeaderText: '#6ab3f3',
  sectionSeparator: '#111921',
  subtitle: '#708499',
  text: '#f5f5f5',
};

export function getPalette(platform: Platform, scheme: Scheme): Palette {
  if (platform === 'ios') return scheme === 'dark' ? iosDark : iosLight;
  if (platform === 'android') return scheme === 'dark' ? androidDark : androidLight;
  if (platform === 'tdesktop') return scheme === 'dark' ? tdesktopDark : tdesktopLight;
  return webDark;
}