export function formatNumber(number: number, decimals = 2) {
  const suffixes = [
    '',
    'million',
    'billion',
    'trillion',
    'quadrillion',
    'quintillion',
    'sextillion',
    'septillion',
    'octillion',
    'nonillion',
    'decillion',
    'undecillion',
    'duodecillion',
    'tredecillion',
    'quattuordecillion',
    'quindecillion',
    'sexdecillion',
    'septendecillion',
    'octodecillion',
    'novemdecillion',
    'vigintillion'
  ];

  if (number < 1000) {
    return number.toString();
  }

  for (let i = 0; i < suffixes.length; i++) {
    const magnitude = Math.pow(1000, i + 1);
    if (number < magnitude * 1000) {
      return `${(number / magnitude).toFixed(decimals)} ${suffixes[i]}`.replace('.0', '');
    }
  }

  return 'Number too large to handle.';
}
