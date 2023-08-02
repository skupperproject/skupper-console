export function formatTraceBySites(trace: string) {
  const traceSanitized = trace.replace(/\|+$/, '');

  if (!traceSanitized) {
    return '';
  }

  const traceParts = traceSanitized.split('|');

  if (traceParts.length < 2) {
    return traceParts[0]?.split('@')[1] || '';
  }

  return traceParts.map((part) => part.split('@')[1]).join(' - ');
}
