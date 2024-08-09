import { IntervalTimeMap } from '@sk-types/Prometheus.interfaces';

export function calculateStep(seconds: number) {
  if (seconds <= 60) {
    return '5s';
  }

  if (seconds <= 3600) {
    return '15s';
  }

  if (seconds <= 2 * 3600) {
    return '30s';
  }

  if (seconds <= 6 * 3600) {
    return '1m';
  }

  if (seconds <= 12 * 3600) {
    return '2m';
  }

  if (seconds <= 24 * 3600) {
    return '4m';
  }

  if (seconds <= 2 * 24 * 3600) {
    return '9m';
  }

  return `${Math.floor(seconds / 1000)}s`;
}

export const timeIntervalMap: IntervalTimeMap = {
  oneMinute: { value: '1m', seconds: 60, step: '5s', key: 'oneMinute', label: 'Last 1 min.' },
  fiveMinutes: { value: '5m', seconds: 5 * 60, step: '15s', key: 'fiveMinutes', label: 'Last 5 min.' },
  fifteenMinutes: { value: '15m', seconds: 15 * 60, step: '15s', key: 'fifteenMinutes', label: 'Last 15 min.' },
  thirtyMinutes: { value: '30m', seconds: 30 * 60, step: '15s', key: 'thirtyMinutes', label: 'Last 30 min.' },
  oneHours: { value: '1h', seconds: 3600, step: '15s', key: 'oneHours', label: 'Last hour' },
  twoHours: { value: '2h', seconds: 2 * 3600, step: '30s', key: 'twoHours', label: 'Last 2 hours' },
  sixHours: { value: '6h', seconds: 6 * 3600, step: '1m', key: 'sixHours', label: 'Last 6 hours' },
  twelveHours: { value: '12h', seconds: 12 * 3600, step: '2m', key: 'twelveHours', label: 'Last 12 hours' },
  oneDay: { value: '1d', seconds: 24 * 3600, step: '4m', key: 'oneDay', label: 'Last day' },
  twoDay: { value: '2d', seconds: 2 * 24 * 3600, step: '9m', key: 'twoDay', label: 'Last 2 day' }
};

export const defaultTimeInterval = Object.values(timeIntervalMap)[0];
export const prometheusSiteNameAndIdSeparator = '@_@'; // This is an internal team role convention to unify a siteId and a siteName in prometheus
export const prometheusProcessNameseparator = '|';
