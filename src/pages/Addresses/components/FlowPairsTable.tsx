import React, { FC } from 'react';

import { useParams } from 'react-router-dom';

import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import { formatByteRate, formatBytes } from '@core/utils/formatBytes';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';

import LinkCell from '../../../core/components/LinkCell';
import { AddressesRoutesPaths, FlowPairsColumnsNames, FlowPairsLabels } from '../Addresses.enum';
import { FlowPairsTableProps } from '../Addresses.interfaces';
import { FlowPairBasic } from '../services/services.interfaces';

const columns = [
    {
        name: FlowPairsColumnsNames.Client,
        prop: 'processName' as keyof FlowPairBasic,
        component: 'ProcessNameLinkCell',
    },
    {
        name: FlowPairsColumnsNames.Port,
        prop: 'port' as keyof FlowPairBasic,
    },
    {
        name: FlowPairsColumnsNames.Site,
        prop: 'siteName' as keyof FlowPairBasic,
        component: 'SiteNameLinkCell',
    },
    {
        name: FlowPairsColumnsNames.ByteRateTX,
        prop: 'byteRate' as keyof FlowPairBasic,
        format: formatByteRate,
    },
    {
        name: FlowPairsColumnsNames.ByteRateRX,
        prop: 'targetByteRate' as keyof FlowPairBasic,
        format: formatByteRate,
    },
    {
        name: FlowPairsColumnsNames.BytesTx,
        prop: 'bytes' as keyof FlowPairBasic,
        format: formatBytes,
    },
    {
        name: FlowPairsColumnsNames.BytesRx,
        prop: 'targetBytes' as keyof FlowPairBasic,
        format: formatBytes,
    },
    {
        name: FlowPairsColumnsNames.Server,
        prop: 'targetProcessName' as keyof FlowPairBasic,
        component: 'TargetProcessNameLinkCell',
    },
    {
        name: FlowPairsColumnsNames.ServerSite,
        prop: 'targetSiteName' as keyof FlowPairBasic,
        component: 'TargetSiteNameLinkCell',
    },
    {
        name: '',
        component: 'viewDetailsLinkCell',
        width: 10,
    },
];

const components = {
    ProcessNameLinkCell: (props: LinkCellProps<FlowPairBasic>) =>
        LinkCell({
            ...props,
            type: 'process',
            link: `${ProcessesRoutesPaths.Processes}/${props.data.processId}`,
        }),
    SiteNameLinkCell: (props: LinkCellProps<FlowPairBasic>) =>
        LinkCell({
            ...props,
            type: 'site',
            link: `${SitesRoutesPaths.Sites}/${props.data.siteId}`,
        }),
    TargetProcessNameLinkCell: (props: LinkCellProps<FlowPairBasic>) =>
        LinkCell({
            ...props,
            type: 'process',
            link: `${ProcessesRoutesPaths.Processes}/${props.data.targetProcessId}`,
        }),
    TargetSiteNameLinkCell: (props: LinkCellProps<FlowPairBasic>) =>
        LinkCell({
            ...props,
            type: 'site',
            link: `${SitesRoutesPaths.Sites}/${props.data.targetSiteId}`,
        }),
};
const FlowPairsTable: FC<FlowPairsTableProps> = function ({ connections }) {
    const { address } = useParams();

    return (
        <SkTable
            columns={columns}
            rows={connections}
            components={{
                ...components,
                viewDetailsLinkCell: (props: LinkCellProps<FlowPairBasic>) =>
                    LinkCell({
                        ...props,
                        link: `${AddressesRoutesPaths.Addresses}/${address}/${props.data.id}`,
                        value: FlowPairsLabels.ViewDetails,
                    }),
            }}
        />
    );
};

export default FlowPairsTable;
