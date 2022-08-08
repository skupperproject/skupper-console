import { DetailsColumnsNames } from './VANServices.enum';

// CONNECTIONS VIEW
export const DetailsColumns = [
    { name: DetailsColumnsNames.FlowPairStatus, prop: '', description: '' },
    { name: DetailsColumnsNames.StartSite, prop: 'siteName' },
    { name: DetailsColumnsNames.StartProcess, prop: 'processName' },
    { name: DetailsColumnsNames.EndSite, prop: 'targetSiteName' },
    { name: DetailsColumnsNames.EndProcess, prop: 'targetProcessName' },
    { name: DetailsColumnsNames.Traffic, prop: 'octets' },
    { name: DetailsColumnsNames.StartTime, prop: 'startTime' },
];

export const CONNECTIONS_PAGINATION_SIZE_DEFAULT = 20;

// FLOW PAIR VIEW
export const CONNECTION_PATH_NAME = 'flowpair';
export const TOPOLOGY_CONTAINER_HEIGHT = 500;
