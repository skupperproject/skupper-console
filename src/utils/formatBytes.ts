/**
 *  Converts input bytes in the most appropriate format
 */
export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const bytesSized = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return isNaN(bytesSized) ? '' : `${bytesSized} ${sizes[i]}`;
}
