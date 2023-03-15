import { SKColumn } from '@core/components/SkTable/SkTable.interface';
import { formatByteRate, formatBytes, formatTraceBySites } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';
import { timeAgo } from '@core/utils/timeAgo';
import { FlowPairsColumnsNames } from '@pages/shared/FlowPairs/FlowPairs.enum';
import { FlowAggregatesResponse, FlowPairsResponse, ProcessResponse } from 'API/REST.interfaces';

import {
  ProcessesLabels,
  ProcessesRoutesPaths,
  ProcessesTableColumns,
  ProcessPairsColumnsNames
} from './Processes.enum';

export const ProcessesPaths = {
  path: ProcessesRoutesPaths.Processes,
  name: ProcessesLabels.Section
};

export const processesTableColumns = [
  {
    name: ProcessesTableColumns.Name,
    prop: 'name' as keyof ProcessResponse,
    component: 'linkCell'
  },
  {
    name: ProcessesTableColumns.Site,
    prop: 'parentName' as keyof ProcessResponse,
    component: 'linkCellSite'
  }
];

export const processesConnectedColumns: SKColumn<FlowAggregatesResponse>[] = [
  {
    name: ProcessPairsColumnsNames.Process,
    prop: 'destinationName' as keyof FlowAggregatesResponse,
    width: 30,
    component: 'ProcessLinkCell'
  },
  {
    name: ProcessPairsColumnsNames.Traffic,
    component: 'TotalBytesExchanged'
  },
  {
    name: ProcessPairsColumnsNames.AvgLatency,
    component: 'AvgLatency'
  },
  {
    name: ProcessPairsColumnsNames.Flows,
    prop: 'recordCount' as keyof FlowAggregatesResponse,
    columnDescription: 'number of connections or requests'
  },
  {
    name: '',
    component: 'viewDetailsLinkCell'
  }
];

export const TcpProcessesFlowPairsColumns: SKColumn<FlowPairsResponse>[] = [
  {
    name: FlowPairsColumnsNames.ClientPort,
    prop: 'forwardFlow.sourcePort' as keyof FlowPairsResponse,
    width: 10
  },
  {
    name: FlowPairsColumnsNames.TxByteRate,
    prop: 'forwardFlow.octetRate' as keyof FlowPairsResponse,
    format: formatByteRate,
    width: 10
  },
  {
    name: FlowPairsColumnsNames.RxByteRate,
    prop: 'counterFlow.octetRate' as keyof FlowPairsResponse,
    format: formatByteRate,
    width: 10
  },
  {
    name: FlowPairsColumnsNames.TxBytes,
    prop: 'forwardFlow.octets' as keyof FlowPairsResponse,
    format: formatBytes,
    width: 10
  },
  {
    name: FlowPairsColumnsNames.RxBytes,
    prop: 'counterFlow.octets' as keyof FlowPairsResponse,
    format: formatBytes,
    width: 10
  },
  {
    name: FlowPairsColumnsNames.TTFB,
    columnDescription: 'time elapsed between client and server',
    component: 'ClientServerLatencyCell',
    width: 10
  },
  {
    name: FlowPairsColumnsNames.Duration,
    component: 'DurationCell',
    width: 10
  },
  {
    name: FlowPairsColumnsNames.Trace,
    prop: 'flowTrace' as keyof FlowPairsResponse,
    format: formatTraceBySites,
    width: 20
  }
];

export const HttpProcessesFlowPairsColumns: SKColumn<FlowPairsResponse>[] = [
  {
    name: FlowPairsColumnsNames.Method,
    prop: 'forwardFlow.method' as keyof FlowPairsResponse,
    width: 10
  },
  {
    name: FlowPairsColumnsNames.StatusCode,
    prop: 'counterFlow.result' as keyof FlowPairsResponse,
    width: 10
  },
  {
    name: FlowPairsColumnsNames.TxBytes,
    prop: 'forwardFlow.octets' as keyof FlowPairsResponse,
    format: formatBytes,
    width: 10
  },
  {
    name: FlowPairsColumnsNames.RxBytes,
    prop: 'counterFlow.octets' as keyof FlowPairsResponse,
    format: formatBytes,
    width: 10
  },
  {
    name: FlowPairsColumnsNames.TxLatency,
    prop: 'forwardFlow.latency' as keyof FlowPairsResponse,
    format: formatTime,
    width: 10
  },
  {
    name: FlowPairsColumnsNames.RxLatency,
    prop: 'counterFlow.latency' as keyof FlowPairsResponse,
    format: formatTime,
    width: 10
  },
  {
    name: FlowPairsColumnsNames.RequestCompleted,
    prop: 'counterFlow.endTime' as keyof FlowPairsResponse,
    format: timeAgo,
    width: 10
  },
  {
    name: FlowPairsColumnsNames.Duration,
    component: 'DurationCell',
    width: 10
  },
  {
    name: FlowPairsColumnsNames.Trace,
    prop: 'flowTrace' as keyof FlowPairsResponse,
    format: formatTraceBySites,
    width: 20
  }
];
