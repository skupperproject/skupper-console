import { SKColumn } from '@core/components/SkTable/SkTable.interface';
import { formatByteRate, formatBytes, formatTraceBySites } from '@core/utils/formatBytes';
import { formatTime } from '@core/utils/formatTime';
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
        width: 20,
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
        width: 20,
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
        width: 20,
    },
    {
        name: '',
        component: 'viewDetailsLinkCell',
        width: 10,
    },
];

export const RequestsByAddressColumns: SKColumn<FlowPairsResponse>[] = [
    {
        name: FlowPairsColumnsNames.Method,
        prop: 'forwardFlow.method' as keyof FlowPairsResponse,
    },
    {
        name: FlowPairsColumnsNames.From,
        prop: 'forwardFlow.processName' as keyof FlowPairsResponse,
        component: 'ProcessNameLinkCell',
        width: 20,
    },
    {
        name: FlowPairsColumnsNames.To,
        prop: 'counterFlow.processName' as keyof FlowPairsResponse,
        component: 'TargetProcessNameLinkCell',
        width: 20,
    },
    {
        name: FlowPairsColumnsNames.Trace,
        prop: 'flowTrace' as keyof FlowPairsResponse,
        format: formatTraceBySites,
    },
    {
        name: FlowPairsColumnsNames.UploadRate,
        prop: 'forwardFlow.octetRate' as keyof FlowPairsResponse,
        format: formatByteRate,
    },
    {
        name: FlowPairsColumnsNames.DownloadRate,
        prop: 'counterFlow.octetRate' as keyof FlowPairsResponse,
        format: formatByteRate,
    },
    {
        name: FlowPairsColumnsNames.DownloadLatency,
        prop: 'counterFlow.latency' as keyof FlowPairsResponse,
        format: formatTime,
    },
    {
        name: FlowPairsColumnsNames.UploadLatency,
        prop: 'forwardFlow.latency' as keyof FlowPairsResponse,
        format: formatTime,
    },
    {
        name: FlowPairsColumnsNames.RequestCompleted,
        prop: 'counterFlow.endTime' as keyof FlowPairsResponse,
        format: timeAgo,
    },
    {
        name: '',
        component: 'viewDetailsLinkCell',
        width: 10,
    },
];

function timeAgo(timestamp: number) {
    if (!timestamp) {
        return ' ';
    }

    const currentTime = new Date().getTime();
    const timeDiff = currentTime - timestamp / 1000;

    const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    if (daysAgo > 0) {
        return daysAgo + (daysAgo > 1 ? ' days ago' : ' day ago');
    }

    const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
    if (hoursAgo > 0) {
        return hoursAgo + (hoursAgo > 1 ? ' hours ago' : ' hour ago');
    }

    const mineAgo = Math.floor(timeDiff / (1000 * 60));
    if (mineAgo > 0) {
        return mineAgo + (mineAgo > 1 ? ' mins ago' : ' min ago');
    }

    return 'less than an hour ago';
}
