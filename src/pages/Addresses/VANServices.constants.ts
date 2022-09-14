import { FlowPairsColumnsNames } from './VANServices.enum';

// CONNECTIONS VIEW
export const FlowPairsColumns = [
    { name: FlowPairsColumnsNames.Site, prop: 'siteName' },
    { name: FlowPairsColumnsNames.Process, prop: 'processName' },
    { name: FlowPairsColumnsNames.Host, prop: 'host' },
    { name: FlowPairsColumnsNames.Port, prop: 'port' },
    { name: FlowPairsColumnsNames.ByteRate, prop: 'byteRate' },
    { name: FlowPairsColumnsNames.Bytes, prop: 'bytes' },
    { name: FlowPairsColumnsNames.Site, prop: 'targetSiteName' },
    { name: FlowPairsColumnsNames.Process, prop: 'targetProcessName' },
    { name: FlowPairsColumnsNames.Host, prop: 'targetHost' },
    { name: FlowPairsColumnsNames.Host, prop: 'targetPort' },
    { name: FlowPairsColumnsNames.ByteRate, prop: 'targetByteRate' },
    { name: FlowPairsColumnsNames.Bytes, prop: 'targetBytes' },
];

export const CONNECTIONS_PAGINATION_SIZE_DEFAULT = 20;

// FLOW PAIR VIEW
export const CONNECTION_PATH_NAME = 'flowpair';
export const TOPOLOGY_CONTAINER_HEIGHT = 500;

// PROCESSES TABLE
export const ProcessesColumns = [
    { name: FlowPairsColumnsNames.Site, prop: 'siteName' },
    { name: FlowPairsColumnsNames.Process, prop: 'processName' },
    { name: FlowPairsColumnsNames.Host, prop: 'host' },
    { name: FlowPairsColumnsNames.Port, prop: 'port' },
    { name: FlowPairsColumnsNames.ImageName, prop: 'imageName' },
    { name: FlowPairsColumnsNames.Bytes, prop: 'bytes' },
    { name: FlowPairsColumnsNames.ByteRate, prop: 'byteRate' },
    { name: FlowPairsColumnsNames.MaxTTFB, prop: 'maxTTFB' },
];
