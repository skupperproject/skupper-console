export function formatNumber(number: number, decimals = 2) {
  const suffixes = ['', 'K', 'Mil.', 'Bil.', 'Tril.', 'quadrillion', 'quintillion', 'sextillion', 'septillion'];

  if (number < 1000) {
    return number.toString();
  }

  for (let i = 0; i < suffixes.length; i++) {
    const magnitude = Math.pow(1000, i);
    if (number < magnitude * 1000) {
      const formattedNumber = (number / magnitude).toFixed(decimals);
      const formatted = formattedNumber.replace(/\.?0*$/, '');

      return `${formatted} ${suffixes[i]}`;
    }
  }

  return 'Number too large to handle.';
}
