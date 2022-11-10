import { AddressesRoutesPaths, FlowPairsColumnsNames, AddressesLabels } from './Addresses.enum';

export const AddressesPaths = {
    path: AddressesRoutesPaths.Addresses,
    name: AddressesLabels.Section,
};

// CONNECTIONS VIEW
export const FlowPairsColumns = [
    { name: FlowPairsColumnsNames.Client, prop: 'processName' },
    { name: FlowPairsColumnsNames.Site, prop: 'siteName' },
    { name: FlowPairsColumnsNames.Port, prop: 'port' },
    { name: FlowPairsColumnsNames.ByteRateTX, prop: 'byteRate' },
    { name: FlowPairsColumnsNames.ByteRateRX, prop: 'targetByteRate' },
    { name: FlowPairsColumnsNames.Server, prop: 'targetProcessName' },
    { name: FlowPairsColumnsNames.Site, prop: 'targetSiteName' },
];

export const CONNECTIONS_PAGINATION_SIZE_DEFAULT = 20;
