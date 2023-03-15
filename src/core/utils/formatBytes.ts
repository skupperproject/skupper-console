/**
 *  Converts input bytes in the most appropriate format
 */
export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) {
    return '0 B';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const bytesSized = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

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
    .join(' <-> ');
}
