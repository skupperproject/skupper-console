import { DetailsColumnsNames } from './VANServices.enum';

// CONNECTIONS VIEW
export const DetailsColumns = [
    { name: DetailsColumnsNames.ConnectionStatus, prop: '' },
    { name: DetailsColumnsNames.StartSite, prop: 'siteName' },
    { name: DetailsColumnsNames.StartProcess, prop: 'processName' },
    { name: DetailsColumnsNames.EndSite, prop: 'targetSiteName' },
    { name: DetailsColumnsNames.EndProcess, prop: 'targetProcessName' },
    { name: DetailsColumnsNames.Traffic, prop: 'octets' },
    {
        name: DetailsColumnsNames.Latency,
        prop: 'latency',
        description:
            'Time to first byte: the time elapsed between the opening of a TCP connection between a client and a server and the receipt by the client of the first packet with payload from the server',
    },
    { name: DetailsColumnsNames.StartTime, prop: 'startTime' },
];

export const CONNECTIONS_PAGINATION_SIZE_DEFAULT = 20;
