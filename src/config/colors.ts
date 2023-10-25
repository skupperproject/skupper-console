export enum Colors {
  White = '--pf-v5-global--palette--white',
  Black600 = '--pf-v5-global--palette--black-600',
  Black500 = '--pf-v5-global--palette--black-500',
  Green500 = '--pf-v5-global--palette--green-500',
  Blue400 = '--pf-v5-global--palette--blue-400',
  Purple500 = '--pf-v5-global--palette--purple-500',
  Cyan300 = '--pf-v5-global--palette--cyan-300',
  Orange200 = '--pf-v5-global--palette--orange-200',
  Red200 = '--pf-v5-global--palette--red-200'
}

export enum VarColors {
  White = `var(${Colors.White})`,
  Black500 = `var(${Colors.Black500})`,
  Black600 = `var(${Colors.Black600})`,
  Green500 = `var(${Colors.Green500})`,
  Blue400 = `var(${Colors.Blue400})`
}

export enum HexColors {
  White = '#FFFFFF',
  Blue400 = '#0066CC',
  Black400 = '#B8BBBE',
  Black500 = '#8A8D90',
  Black600 = '#6A6E73',
  Black900 = '#151515'
}
