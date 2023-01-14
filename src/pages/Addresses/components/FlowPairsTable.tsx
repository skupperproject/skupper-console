import React, { FC } from 'react';

import { useParams } from 'react-router-dom';

import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import { formatByteRate, formatBytes } from '@core/utils/formatBytes';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';
import { FlowPairResponse } from 'API/REST.interfaces';

import LinkCell from '../../../core/components/LinkCell';
import { AddressesRoutesPaths, FlowPairsColumnsNames, FlowPairsLabels } from '../Addresses.enum';
import { FlowPairsTableProps } from '../Addresses.interfaces';

const columns = [
    {
        name: FlowPairsColumnsNames.Client,
        prop: 'forwardFlow.processName' as keyof FlowPairResponse,
        component: 'ProcessNameLinkCell',
    },
    {
        name: FlowPairsColumnsNames.Port,
        prop: 'forwardFlow.sourcePort' as keyof FlowPairResponse,
    },
    {
        name: FlowPairsColumnsNames.Site,
        prop: 'sourceSiteName' as keyof FlowPairResponse,
        component: 'SiteNameLinkCell',
    },
    {
        name: FlowPairsColumnsNames.ByteRateTX,
        prop: 'forwardFlow.octetRate' as keyof FlowPairResponse,
        format: formatByteRate,
    },
    {
        name: FlowPairsColumnsNames.ByteRateRX,
        prop: 'counterFlow.octetRate' as keyof FlowPairResponse,
        format: formatByteRate,
    },
    {
        name: FlowPairsColumnsNames.BytesTx,
        prop: 'forwardFlow.octets' as keyof FlowPairResponse,
        format: formatBytes,
    },
    {
        name: FlowPairsColumnsNames.BytesRx,
        prop: 'counterFlow.octets' as keyof FlowPairResponse,
        format: formatBytes,
    },
    {
        name: FlowPairsColumnsNames.Server,
        prop: 'counterFlow.processName' as keyof FlowPairResponse,
        component: 'TargetProcessNameLinkCell',
    },
    {
        name: FlowPairsColumnsNames.ServerSite,
        prop: 'destinationSiteName' as keyof FlowPairResponse,
        component: 'TargetSiteNameLinkCell',
    },
    {
        name: '',
        component: 'viewDetailsLinkCell',
        width: 10,
    },
];

const components = {
    ProcessNameLinkCell: (props: LinkCellProps<FlowPairResponse>) =>
        LinkCell({
            ...props,
            type: 'process',
            link: `${ProcessesRoutesPaths.Processes}/${props.data.forwardFlow.process}`,
        }),
    SiteNameLinkCell: (props: LinkCellProps<FlowPairResponse>) =>
        LinkCell({
            ...props,
            type: 'site',
            link: `${SitesRoutesPaths.Sites}/${props.data.sourceSiteId}`,
        }),
    TargetProcessNameLinkCell: (props: LinkCellProps<FlowPairResponse>) =>
        LinkCell({
            ...props,
            type: 'process',
            link: `${ProcessesRoutesPaths.Processes}/${props.data.counterFlow.process}`,
        }),
    TargetSiteNameLinkCell: (props: LinkCellProps<FlowPairResponse>) =>
        LinkCell({
            ...props,
            type: 'site',
            link: `${SitesRoutesPaths.Sites}/${props.data.destinationSiteId}`,
        }),
};
const FlowPairsTable: FC<FlowPairsTableProps> = function ({
    connections,
    onGetFilters,
    rowsCount,
}) {
    const { address } = useParams();

    return (
        <SkTable
            columns={columns}
            rows={connections}
            rowsCount={rowsCount}
            onGetFilters={onGetFilters}
            components={{
                ...components,
                viewDetailsLinkCell: (props: LinkCellProps<FlowPairResponse>) =>
                    LinkCell({
                        ...props,
                        link: `${AddressesRoutesPaths.Addresses}/${address}/${props.data.identity}`,
                        value: FlowPairsLabels.ViewDetails,
                    }),
            }}
        />
    );
};

export default FlowPairsTable;
