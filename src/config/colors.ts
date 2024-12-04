import { PATTERNFLY_VERSION } from './config';

export const Colors = {
  White: `--pf-${PATTERNFLY_VERSION}-global--palette--white`,
  Black900: `--pf-${PATTERNFLY_VERSION}-global--palette--black-900`,
  Black600: `--pf-${PATTERNFLY_VERSION}-global--palette--black-600`,
  Black500: `--pf-${PATTERNFLY_VERSION}-global--palette--black-500`,
  Black400: `--pf-${PATTERNFLY_VERSION}-global--palette--black-400`,
  Black200: `--pf-${PATTERNFLY_VERSION}-global--palette--black-200`,
  Black100: `--pf-${PATTERNFLY_VERSION}-global--palette--black-100`,
  Green500: `--pf-${PATTERNFLY_VERSION}-global--palette--green-500`,
  Blue400: `--pf-${PATTERNFLY_VERSION}-global--palette--blue-400`,
  Purple100: `--pf-${PATTERNFLY_VERSION}-global--palette--purple-100`,
  Purple400: `--pf-${PATTERNFLY_VERSION}-global--palette--purple-400`,
  Purple500: `--pf-${PATTERNFLY_VERSION}-global--palette--purple-500`,
  Cyan300: `--pf-${PATTERNFLY_VERSION}-global--palette--cyan-300`,
  Orange100: `--pf-${PATTERNFLY_VERSION}-global--palette--orange-100`,
  Orange200: `--pf-${PATTERNFLY_VERSION}-global--palette--orange-200`,
  Orange400: `--pf-${PATTERNFLY_VERSION}-global--palette--orange-400`,
  Red200: `--pf-${PATTERNFLY_VERSION}-global--palette--red-200`
};

export const VarColors = {
  White: `var(${Colors.White})`,
  Black100: `var(${Colors.Black100})`,
  Black200: `var(${Colors.Black200})`,
  Black400: `var(${Colors.Black400})`,
  Black500: `var(${Colors.Black500})`,
  Black600: `var(${Colors.Black600})`,
  Black900: `var(${Colors.Black900})`,
  Green500: `var(${Colors.Green500})`,
  Blue400: `var(${Colors.Blue400})`,
  Orange100: `var(${Colors.Orange100})`,
  Orange200: `var(${Colors.Orange200})`,
  Orange400: `var(${Colors.Orange400})`,
  Purple100: `var(${Colors.Purple100})`,
  Purple400: `var(${Colors.Purple400})`
};

export enum HexColors {
  White = '#FFFFFF',
  Blue50 = '#E7F1FA',
  Blue200 = '#73BCF7',
  Black200 = '#F0F0F0',
  Black400 = '#B8BBBE',
  DefaultHighLight = '#0066CC',
  DefaultBackground = '#F0F0F0',
  DefaultStatusBackground = '#E7F1FA',
  DefaultStatusText = '#002952',
  DefaultBorder = '#c7c7c7',
  DefaultEdge = '#707070',
  DarkThemeBackground = '#151515',
  DarkThemeText = '#f2f2f2',
  DefaultStatusDanger = '#C9190B',
  DefaultStatusWarning = '#F0AB00',
  Black300 = '#D2D2d2',
  Black500 = '#8A8D90',
  Black600 = '#6A6E73',
  Black700 = '#4F5255',
  Black800 = '#3C3F42',
  Black900 = '#151515'
}
