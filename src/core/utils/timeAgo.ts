import { formatRelative } from 'date-fns';

export function timeAgo(timestamp: number) {
  if (!timestamp) {
    return ' ';
  }

  return formatRelative(new Date(timestamp / 1000), new Date());
}
