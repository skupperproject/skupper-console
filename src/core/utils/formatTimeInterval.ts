import { formatDuration, intervalToDuration } from 'date-fns';

/**
 *  endTime and startTime are microseconds (because the Apis give us microseconds)
 */
export function formatTimeInterval(endTime: number, startTime: number) {
  const interval = intervalToDuration({
    start: new Date((startTime as number) / 1000),
    end: new Date((endTime as number) / 1000)
  });

  return formatDuration(interval);
}
