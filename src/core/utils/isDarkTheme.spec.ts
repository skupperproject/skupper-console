import { DARK_THEME_CLASS } from '@config/config';

import {
  THEME_PREFERENCE_CACHE_KEY,
  ThemePreference,
  getThemePreference,
  reflectThemePreference,
  removeThemePreference,
  setThemePreference
} from './isDarkTheme';

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

Object.defineProperty(document, 'documentElement', {
  writable: true,
  value: {
    classList: {
      toggle: jest.fn(),
      remove: jest.fn()
    },
    removeAttribute: jest.fn()
  }
});

describe('isDarkTheme', () => {
  afterEach(() => {
    (localStorageMock.getItem as jest.Mock).mockClear();
    (localStorageMock.setItem as jest.Mock).mockClear();
    (localStorageMock.removeItem as jest.Mock).mockClear();
    (document.documentElement.classList.toggle as jest.Mock).mockClear();
    (document.documentElement.removeAttribute as jest.Mock).mockClear();
  });

  describe('setThemePreference', () => {
    it('should set the theme preference to dark', () => {
      setThemePreference(ThemePreference.Dark);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(THEME_PREFERENCE_CACHE_KEY, ThemePreference.Dark);
      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(DARK_THEME_CLASS);
    });
  });

  describe('removeThemePreference', () => {
    it('should remove the theme preference', () => {
      removeThemePreference();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(THEME_PREFERENCE_CACHE_KEY);
    });
  });

  describe('getThemePreference', () => {
    it('should get the theme preference', () => {
      localStorageMock.getItem.mockReturnValue(ThemePreference.Dark);
      const themePreference = getThemePreference();
      expect(localStorageMock.getItem).toHaveBeenCalledWith(THEME_PREFERENCE_CACHE_KEY);
      expect(themePreference).toBe(ThemePreference.Dark);
    });

    it('should get a null theme preference', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const themePreference = getThemePreference();
      expect(localStorageMock.getItem).toHaveBeenCalledWith(THEME_PREFERENCE_CACHE_KEY);
      expect(themePreference).toBe(null);
    });
  });

  describe('reflectThemePreference', () => {
    it('should reflect the dark theme preference', () => {
      reflectThemePreference(ThemePreference.Dark);
      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith(DARK_THEME_CLASS);
    });

    it('should reflect no theme preference', () => {
      reflectThemePreference(null);
      expect(document.documentElement.removeAttribute).toHaveBeenCalledWith('class');
    });
  });
});
