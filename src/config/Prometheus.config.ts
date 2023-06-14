import { IntervalTimeMap } from '@API/Prometheus.interfaces';
import { PROMETHEUS_URL } from './config';

let PROMETHEUS_START_TIME: number = new Date().getTime();

// TODO: not remove yet.
export const isPrometheusActive = () => true;
// Override the default prometheus path with the value from the skupper flow collector api
export const setPrometheusStartTime = (time: number) => (PROMETHEUS_START_TIME = time);
export const gePrometheusStartTime = () => PROMETHEUS_START_TIME;
export const gePrometheusQueryPATH = (queryType: 'single' | 'range' = 'range') =>
  queryType === 'range' ? `${PROMETHEUS_URL}/rangequery` : `${PROMETHEUS_URL}/query`;

export const timeIntervalMap: IntervalTimeMap = {
  oneMinute: { value: '1m', seconds: 60, step: '5s', key: 'oneMinute', label: 'Last min.' },
  fiveMinutes: { value: '5m', seconds: 5 * 60, step: '15s', key: 'fiveMinutes', label: 'Last 5 min.' },
  fifteenMinutes: { value: '15m', seconds: 15 * 60, step: '15s', key: 'fifteenMinutes', label: 'Last 15 min.' },
  thirtyMinutes: { value: '30m', seconds: 30 * 60, step: '15s', key: 'thirtyMinutes', label: 'Last 30 min.' },
  oneHours: { value: '1h', seconds: 3600, step: '15s', key: 'oneHours', label: 'Last hour' },
  twoHours: { value: '2h', seconds: 2 * 3600, step: '30s', key: 'twoHours', label: 'Last 2 hours' },
  sixHours: { value: '6h', seconds: 6 * 3600, step: '1m', key: 'sixHours', label: 'Last 6 hours' },
  twelveHours: { value: '12h', seconds: 12 * 3600, step: '2m', key: 'twelveHours', label: 'Last 12 hours' },
  oneDay: { value: '1d', seconds: 24 * 3600, step: '4m', key: 'oneDay', label: 'Last day' },
  twoDay: { value: '2d', seconds: 2 * 24 * 3600, step: '9m', key: 'twoDay', label: 'Last 2 day' },
  threeDay: { value: '3d', seconds: 3 * 24 * 3600, step: '12m', key: 'threeDay', label: 'Last 3 day' },
  oneWeek: { value: '1w', seconds: 7 * 24 * 3600, step: '10m', key: 'oneWeek', label: 'Last week' },
  twoWeeks: { value: '2w', seconds: 14 * 24 * 3600, step: '20m', key: 'twoWeeks', label: 'Last2 weeks' }
};

export const defaultTimeInterval = Object.values(timeIntervalMap)[0];
