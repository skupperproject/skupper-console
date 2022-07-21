import { DetailsColumnsNames } from './Details.enum';

export const DetailsColumns = [
    { name: DetailsColumnsNames.Status, prop: 'status' },
    { name: DetailsColumnsNames.Site, prop: 'namespace' },
    { name: DetailsColumnsNames.Router, prop: 'routerName' },
    { name: DetailsColumnsNames.TargetSite, prop: 'target.namespace' },
    { name: DetailsColumnsNames.TargetRouter, prop: 'target.routerName' },
    { name: DetailsColumnsNames.Direction, prop: 'device' },
    { name: DetailsColumnsNames.Protocol, prop: 'protocol' },
    { name: DetailsColumnsNames.Traffic, prop: 'octets' },
    { name: DetailsColumnsNames.Latency, prop: 'latency' },
    { name: DetailsColumnsNames.StartTime, prop: 'startTime' },
];
