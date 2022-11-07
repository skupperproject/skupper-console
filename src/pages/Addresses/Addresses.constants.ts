import { AddressesRoutesPaths, FlowPairsColumnsNames, AddressesLabels } from './Addresses.enum';

export const AddressesPaths = {
    path: AddressesRoutesPaths.Addresses,
    name: AddressesLabels.Section,
};

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
