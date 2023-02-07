import { SKColumn } from '@core/components/SkTable/SkTable.interface';
import { formatBytes } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';
import { FlowAggregatesResponse, ProcessResponse } from 'API/REST.interfaces';

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
        component: 'linkCell',
    },
    {
        name: ProcessPairsColumnsNames.BytesRx,
        prop: 'sourceOctets' as keyof FlowAggregatesResponse,
        format: formatBytes,
    },
    {
        name: ProcessPairsColumnsNames.BytesTx,
        prop: 'destinationOctets' as keyof FlowAggregatesResponse,
        format: formatBytes,
    },
    {
        name: ProcessPairsColumnsNames.LatencyAvgRx,
        prop: 'sourceAverageLatency' as keyof FlowAggregatesResponse,
        format: formatTime,
    },
    {
        name: ProcessPairsColumnsNames.LatencyAvgTx,
        prop: 'destinationAverageLatency' as keyof FlowAggregatesResponse,
        format: formatTime,
    },
    {
        name: ProcessPairsColumnsNames.Flows,
        prop: 'recordCount' as keyof FlowAggregatesResponse,
        columnDescription: 'number of connections or requests',
    },
];
