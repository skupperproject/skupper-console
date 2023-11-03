import { DARK_THEME_CLASS } from '@config/config';

export enum ThemePreference {
  Dark = DARK_THEME_CLASS
}
export const THEME_PREFERENCE_CACHE_KEY = 'theme-preference';

export function setThemePreference(theme: string) {
  localStorage.setItem(THEME_PREFERENCE_CACHE_KEY, theme);
  reflectThemePreference(theme);
}

export function removeThemePreference() {
  localStorage.removeItem(THEME_PREFERENCE_CACHE_KEY);
  reflectThemePreference(null);
}

export function getThemePreference() {
  return localStorage.getItem(THEME_PREFERENCE_CACHE_KEY) as ThemePreference.Dark | null;
}

export function reflectThemePreference(themeClassName: string | null) {
  const htmlElement = document.documentElement;
  themeClassName ? htmlElement.classList.toggle(themeClassName) : htmlElement.removeAttribute('class');
}
