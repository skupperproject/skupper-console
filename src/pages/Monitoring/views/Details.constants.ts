import { DetailsColumnsNames } from './Details.enum';

export const DetailsColumns = [
    { name: DetailsColumnsNames.ConnectionStatus, prop: '' },
    { name: DetailsColumnsNames.Connections, prop: '' },
    { name: DetailsColumnsNames.Traffic, prop: 'octets' },
    { name: DetailsColumnsNames.Latency, prop: 'latency' },
    { name: DetailsColumnsNames.StartTime, prop: 'startTime' },
];
