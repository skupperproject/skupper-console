export function isDarkTheme() {
  if (document.documentElement.classList.contains('pf-v5-theme-dark')) {
    return true;
  }

  return false;
}
