import { Scheme, Platform, Palette } from '@/types';

const iosDark: Palette = {
  bg: '#000000',
  secondaryBg: '#1a1a1a',
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
  glassBg: 'rgba(44, 44, 46, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
};

const iosLight: Palette = {
  bg: '#ffffff',
  secondaryBg: '#efeff4',
  sectionBg: '#ffffff',
  headerBg: '#f8f8f8',
  text: '#000000',
  subtitle: '#8e8e93',
  hint: '#8e8e93',
  link: '#007aff',
  accentText: '#007aff',
  button: '#007aff',
  buttonText: '#ffffff',
  sectionHeaderText: '#6d6d72',
  destructiveText: '#ff3b30',
  sectionSeparator: '#c8c7cc',
  bottomBarBg: '#f2f2f2',
  glassBg: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(0, 0, 0, 0.06)',
};

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
  glassBg: 'rgba(29, 39, 51, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.05)',
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
  glassBg: 'rgba(255, 255, 255, 0.8)',
  glassBorder: 'rgba(0, 0, 0, 0.05)',
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
  glassBg: 'rgba(33, 33, 33, 0.75)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
};

const webLight: Palette = {
  bg: '#ffffff',
  secondaryBg: '#f4f4f5',
  sectionBg: '#ffffff',
  headerBg: '#ffffff',
  text: '#000000',
  subtitle: '#707579',
  hint: '#707579',
  link: '#00488f',
  accentText: '#3390ec',
  button: '#3390ec',
  buttonText: '#ffffff',
  sectionHeaderText: '#3390ec',
  destructiveText: '#df3f40',
  sectionSeparator: '#e5e5e5',
  bottomBarBg: '#f4f4f5',
  glassBg: 'rgba(255, 255, 255, 0.75)',
  glassBorder: 'rgba(0, 0, 0, 0.08)',
};

export function getPalette(platform: Platform, scheme: Scheme): Palette {
  if (platform === 'ios') return scheme === 'dark' ? iosDark : iosLight;
  if (platform === 'android') return scheme === 'dark' ? androidDark : androidLight;
  return scheme === 'dark' ? webDark : webLight;
}