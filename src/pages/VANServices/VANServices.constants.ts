import { DetailsColumnsNames } from './VANServices.enum';

// CONNECTIONS VIEW
export const DetailsColumns = [
    { name: DetailsColumnsNames.Site, prop: 'siteName' },
    { name: DetailsColumnsNames.Host, prop: 'host' },
    { name: DetailsColumnsNames.Port, prop: 'port' },
    { name: DetailsColumnsNames.Process, prop: 'processName' },
    { name: DetailsColumnsNames.ByteRate, prop: 'byteRate' },
    { name: DetailsColumnsNames.Bytes, prop: 'bytes' },
    { name: DetailsColumnsNames.Site, prop: 'targetSiteName' },
    { name: DetailsColumnsNames.Host, prop: 'targetHost' },
    { name: DetailsColumnsNames.Host, prop: 'targetPort' },
    { name: DetailsColumnsNames.Process, prop: 'targetProcessName' },
    { name: DetailsColumnsNames.ByteRate, prop: 'targetByteRate' },
    { name: DetailsColumnsNames.Bytes, prop: 'targetBytes' },
];

export const CONNECTIONS_PAGINATION_SIZE_DEFAULT = 20;

// FLOW PAIR VIEW
export const CONNECTION_PATH_NAME = 'flowpair';
export const TOPOLOGY_CONTAINER_HEIGHT = 500;
