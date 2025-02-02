import { timeIntervalMap } from '../../config/prometheus';

const createDateFormatter = (locale: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(locale, options);

export function formatChartDateByRange(timestamp: number, range: number): string {
  try {
    const date = new Date(timestamp * 1000);
    const locale = navigator.language || 'en-US';

    const formatterOptions: Intl.DateTimeFormatOptions =
      range <= timeIntervalMap.fifteenMinutes.seconds
        ? { hour: 'numeric', minute: '2-digit', second: '2-digit' }
        : range <= timeIntervalMap.twoHours.seconds
          ? { hour: 'numeric', minute: '2-digit' }
          : range <= timeIntervalMap.twelveHours.seconds
            ? { weekday: 'short', hour: 'numeric', minute: '2-digit' }
            : range <= timeIntervalMap.oneDay.seconds || range === timeIntervalMap.twoDays.seconds
              ? { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }
              : { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' };

    const formatter = createDateFormatter(locale, formatterOptions);

    return formatter.format(date);
  } catch {
    return 'Invalid Date';
  }
}
