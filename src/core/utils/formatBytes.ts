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

  const dm = decimals < 0 ? 0 : decimals;
  const i = Math.floor(Math.log(bytes < 1 ? 1 : bytes) / Math.log(K));
  const bytesSized = parseFloat((bytes / Math.pow(K, i)).toFixed(dm));

  if (isNaN(bytesSized)) {
    return '';
  }

  return isNaN(bytesSized) ? '' : `${bytesSized} ${sizes[i]}`;
}

export function formatByteRate(byteRate: number, decimals = 2) {
  const byteRateFormatted = formatBytes(byteRate, decimals);

  return byteRateFormatted ? `${byteRateFormatted}/s` : '';
}

export function formatTraceBySites(trace: string) {
  if (!trace) {
    return '';
  }

  let traceParts = trace.split('|');

  if (traceParts.length < 2) {
    traceParts = [traceParts[0]];
  }

  return traceParts
    .map((part) => {
      const traceSite = part.split('@')[1];

      return traceSite;
    })
    .join(' - ');
}
