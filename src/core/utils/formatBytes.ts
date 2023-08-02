/**
 *  Converts input bytes in the most appropriate format
 */
const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
const K = 1024;

export function formatBytes(bytes: number, decimals = 2) {
  if (isNaN(bytes) || bytes < 0) {
    return '';
  }

  if (bytes === 0) {
    return '0 B';
  }

  const i = Math.floor(Math.log(bytes < 1 ? 1 : bytes) / Math.log(K));
  const bytesSized = parseFloat((bytes / Math.pow(K, i)).toFixed(decimals));

  return `${bytesSized} ${sizes[i]}`;
}

export function formatByteRate(byteRate: number, decimals = 2) {
  const byteRateFormatted = formatBytes(byteRate, decimals);

  return byteRateFormatted ? `${byteRateFormatted}/s` : '';
}
