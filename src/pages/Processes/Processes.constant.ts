import { SKColumn } from '@core/components/SkTable/SkTable.interface';
import { formatBytes } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';
import { FlowPairsColumnsNames } from '@pages/Addresses/Addresses.enum';
import { FlowAggregatesMapResponse, ProcessResponse } from 'API/REST.interfaces';

import { ProcessesLabels, ProcessesRoutesPaths, ProcessesTableColumns } from './Processes.enum';

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

export const processesConnectedColumns: SKColumn<FlowAggregatesMapResponse>[] = [
    {
        name: FlowPairsColumnsNames.Process,
        prop: 'destinationName' as keyof FlowAggregatesMapResponse,
        width: 30,
        component: 'linkCell',
    },
    {
        name: FlowPairsColumnsNames.BytesRx,
        prop: 'sourceOctets' as keyof FlowAggregatesMapResponse,
        format: formatBytes,
    },
    {
        name: FlowPairsColumnsNames.BytesTx,
        prop: 'destinationOctets' as keyof FlowAggregatesMapResponse,
        format: formatBytes,
    },
    {
        name: FlowPairsColumnsNames.LatencyAvgRx,
        prop: 'sourceAverageLatency' as keyof FlowAggregatesMapResponse,
        format: formatTime,
    },
    {
        name: FlowPairsColumnsNames.LatencyAvgTx,
        prop: 'destinationAverageLatency' as keyof FlowAggregatesMapResponse,
        format: formatTime,
    },
    {
        name: FlowPairsColumnsNames.Flows,
        prop: 'recordCount' as keyof FlowAggregatesMapResponse,
        columnDescription: 'number of connections or requests',
    },
];
