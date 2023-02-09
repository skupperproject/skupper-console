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
    ProcessPairsColumnsNames,
} from './Processes.enum';

export const ProcessesPaths = {
    path: ProcessesRoutesPaths.Processes,
    name: ProcessesLabels.Section,
};

export const processesTableColumns = [
    {
        name: ProcessesTableColumns.Name,
        prop: 'name' as keyof ProcessResponse,
        component: 'linkCell',
    },
    {
        name: ProcessesTableColumns.Site,
        prop: 'parentName' as keyof ProcessResponse,
        component: 'linkCellSite',
    },
];

export const processesConnectedColumns: SKColumn<FlowAggregatesResponse>[] = [
    {
        name: ProcessPairsColumnsNames.Process,
        prop: 'destinationName' as keyof FlowAggregatesResponse,
        width: 30,
        component: 'ProcessLinkCell',
    },
    {
        name: ProcessPairsColumnsNames.Traffic,
        component: 'TotalBytesExchanged',
    },
    {
        name: ProcessPairsColumnsNames.AvgLatency,
        component: 'AvgLatency',
    },
    {
        name: ProcessPairsColumnsNames.Flows,
        prop: 'recordCount' as keyof FlowAggregatesResponse,
        columnDescription: 'number of connections or requests',
    },
    {
        name: '',
        component: 'viewDetailsLinkCell',
    },
];

export const TcpProcessesFlowPairsColumns: SKColumn<FlowPairsResponse>[] = [
    {
        name: FlowPairsColumnsNames.ClientPort,
        prop: 'forwardFlow.sourcePort' as keyof FlowPairsResponse,
    },
    {
        name: FlowPairsColumnsNames.TxByteRate,
        prop: 'forwardFlow.octetRate' as keyof FlowPairsResponse,
        format: formatByteRate,
    },
    {
        name: FlowPairsColumnsNames.RxByteRate,
        prop: 'counterFlow.octetRate' as keyof FlowPairsResponse,
        format: formatByteRate,
    },
    {
        name: FlowPairsColumnsNames.TxBytes,
        prop: 'forwardFlow.octets' as keyof FlowPairsResponse,
        format: formatBytes,
    },
    {
        name: FlowPairsColumnsNames.RxBytes,
        prop: 'counterFlow.octets' as keyof FlowPairsResponse,
        format: formatBytes,
    },
    {
        name: FlowPairsColumnsNames.TTFB,
        columnDescription: 'time elapsed between client and server',
        component: 'ClientServerLatencyCell',
    },
    {
        name: FlowPairsColumnsNames.Trace,
        prop: 'flowTrace' as keyof FlowPairsResponse,
        format: formatTraceBySites,
        width: 20,
    },
    {
        name: FlowPairsColumnsNames.Duration,
        component: 'DurationCell',
    },
];

export const HttpProcessesFlowPairsColumns: SKColumn<FlowPairsResponse>[] = [
    {
        name: FlowPairsColumnsNames.Method,
        prop: 'forwardFlow.method' as keyof FlowPairsResponse,
    },
    {
        name: FlowPairsColumnsNames.StatusCode,
        prop: 'counterFlow.result' as keyof FlowPairsResponse,
    },
    {
        name: FlowPairsColumnsNames.TxBytes,
        prop: 'forwardFlow.octets' as keyof FlowPairsResponse,
        format: formatBytes,
    },
    {
        name: FlowPairsColumnsNames.RxBytes,
        prop: 'counterFlow.octets' as keyof FlowPairsResponse,
        format: formatBytes,
    },
    {
        name: FlowPairsColumnsNames.TxLatency,
        prop: 'forwardFlow.latency' as keyof FlowPairsResponse,
        format: formatTime,
    },
    {
        name: FlowPairsColumnsNames.RxLatency,
        prop: 'counterFlow.latency' as keyof FlowPairsResponse,
        format: formatTime,
    },
    {
        name: FlowPairsColumnsNames.RequestCompleted,
        prop: 'counterFlow.endTime' as keyof FlowPairsResponse,
        format: timeAgo,
    },
    {
        name: FlowPairsColumnsNames.Duration,
        component: 'DurationCell',
    },
];
