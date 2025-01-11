import { Labels } from '../../../config/labels';
import { MetricKeys } from '../../../types/SkSankeyChart.interfaces';

export const DEFAULT_SANKEY_CHART_FLOW_VALUE = 0.000001;
export const DEFAULT_SANKEY_CHART_HEIGHT = '350px';

//Filters
export const SankeyMetricOptions: {
  id: MetricKeys | ''; // 'id' può essere un MetricKeys o una stringa vuota
  label: string;
}[] = [
  { id: '', label: 'No Metrics' },
  { id: 'byteRate', label: Labels.ByteRate },
  { id: 'bytes', label: Labels.Bytes }
];

export const ServiceClientResourceOptions: { label: string; id: 'client' | 'clientSite' }[] = [
  {
    label: 'Clients',
    id: 'client'
  },
  {
    label: 'Client sites',
    id: 'clientSite'
  }
];

export const ServiceServerResourceOptions: { label: string; id: 'server' | 'serverSite' }[] = [
  {
    label: 'Servers',
    id: 'server'
  },
  {
    label: 'Server sites',
    id: 'serverSite'
  }
];
