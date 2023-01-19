import { SKColumn } from '@core/components/SkTable/SkTable.interface';
import { formatByteRate, formatBytes, formatTraceBySites } from '@core/utils/formatBytes';
import { FlowPairsResponse } from 'API/REST.interfaces';

import { AddressesRoutesPaths, AddressesLabels, FlowPairsColumnsNames } from './Addresses.enum';

export const AddressesPaths = {
    path: AddressesRoutesPaths.Addresses,
    name: AddressesLabels.Section,
};

export const ConnectionsByAddressColumns: SKColumn<FlowPairsResponse>[] = [
    {
        name: FlowPairsColumnsNames.Client,
        prop: 'forwardFlow.processName' as keyof FlowPairsResponse,
        component: 'ProcessNameLinkCell',
    },
    {
        name: FlowPairsColumnsNames.Port,
        prop: 'forwardFlow.sourcePort' as keyof FlowPairsResponse,
    },
    {
        name: FlowPairsColumnsNames.Site,
        prop: 'sourceSiteName' as keyof FlowPairsResponse,
        component: 'SiteNameLinkCell',
    },
    {
        name: FlowPairsColumnsNames.ByteRateTX,
        prop: 'forwardFlow.octetRate' as keyof FlowPairsResponse,
        format: formatByteRate,
    },
    {
        name: FlowPairsColumnsNames.ByteRateRX,
        prop: 'counterFlow.octetRate' as keyof FlowPairsResponse,
        format: formatByteRate,
    },
    {
        name: FlowPairsColumnsNames.BytesTx,
        prop: 'forwardFlow.octets' as keyof FlowPairsResponse,
        format: formatBytes,
    },
    {
        name: FlowPairsColumnsNames.BytesRx,
        prop: 'counterFlow.octets' as keyof FlowPairsResponse,
        format: formatBytes,
    },
    {
        name: FlowPairsColumnsNames.Server,
        prop: 'counterFlow.processName' as keyof FlowPairsResponse,
        component: 'TargetProcessNameLinkCell',
    },
    {
        name: FlowPairsColumnsNames.ServerSite,
        prop: 'destinationSiteName' as keyof FlowPairsResponse,
        component: 'TargetSiteNameLinkCell',
    },
    {
        name: FlowPairsColumnsNames.Trace,
        prop: 'flowTrace' as keyof FlowPairsResponse,
        format: formatTraceBySites,
    },
    {
        name: '',
        component: 'viewDetailsLinkCell',
        width: 10,
    },
];

export const RequestsByAddressColumns: SKColumn<FlowPairsResponse>[] = [
    {
        name: FlowPairsColumnsNames.Client,
        prop: 'forwardFlow.processName' as keyof FlowPairsResponse,
        component: 'ProcessNameLinkCell',
    },
    {
        name: FlowPairsColumnsNames.Site,
        prop: 'sourceSiteName' as keyof FlowPairsResponse,
        component: 'SiteNameLinkCell',
    },
    {
        name: FlowPairsColumnsNames.ByteRateTX,
        prop: 'forwardFlow.octetRate' as keyof FlowPairsResponse,
        format: formatByteRate,
    },
    {
        name: FlowPairsColumnsNames.ByteRateRX,
        prop: 'counterFlow.octetRate' as keyof FlowPairsResponse,
        format: formatByteRate,
    },
    {
        name: FlowPairsColumnsNames.BytesTx,
        prop: 'forwardFlow.octets' as keyof FlowPairsResponse,
        format: formatBytes,
    },
    {
        name: FlowPairsColumnsNames.BytesRx,
        prop: 'counterFlow.octets' as keyof FlowPairsResponse,
        format: formatBytes,
    },
    {
        name: FlowPairsColumnsNames.Server,
        prop: 'counterFlow.processName' as keyof FlowPairsResponse,
        component: 'TargetProcessNameLinkCell',
    },
    {
        name: FlowPairsColumnsNames.ServerSite,
        prop: 'destinationSiteName' as keyof FlowPairsResponse,
        component: 'TargetSiteNameLinkCell',
    },
    {
        name: FlowPairsColumnsNames.Method,
        prop: 'forwardFlow.method' as keyof FlowPairsResponse,
    },
    {
        name: FlowPairsColumnsNames.Trace,
        prop: 'flowTrace' as keyof FlowPairsResponse,
        format: formatTraceBySites,
    },
    {
        name: '',
        component: 'viewDetailsLinkCell',
        width: 10,
    },
];
