import React, { FC } from 'react';

import { useParams } from 'react-router-dom';

import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';
import { FlowPairsResponse } from 'API/REST.interfaces';
import { DEFAULT_TABLE_PAGE_SIZE } from 'config';

import LinkCell from '../../../core/components/LinkCell';
import { AddressesRoutesPaths, FlowPairsLabels } from '../Addresses.enum';
import { FlowPairsTableProps } from '../Addresses.interfaces';

const components = {
    ProcessNameLinkCell: (props: LinkCellProps<FlowPairsResponse>) =>
        LinkCell({
            ...props,
            type: 'process',
            link: `${ProcessesRoutesPaths.Processes}/${props.data.forwardFlow.process}`,
        }),
    SiteNameLinkCell: (props: LinkCellProps<FlowPairsResponse>) =>
        LinkCell({
            ...props,
            type: 'site',
            link: `${SitesRoutesPaths.Sites}/${props.data.sourceSiteId}`,
        }),
    TargetProcessNameLinkCell: (props: LinkCellProps<FlowPairsResponse>) =>
        LinkCell({
            ...props,
            type: 'process',
            link: `${ProcessesRoutesPaths.Processes}/${props.data.counterFlow.process}`,
        }),
    TargetSiteNameLinkCell: (props: LinkCellProps<FlowPairsResponse>) =>
        LinkCell({
            ...props,
            type: 'site',
            link: `${SitesRoutesPaths.Sites}/${props.data.destinationSiteId}`,
        }),
};
const FlowPairsTable: FC<FlowPairsTableProps> = function ({ connections, columns }) {
    const { address } = useParams();

    return (
        <SkTable
            columns={columns}
            rows={connections}
            pageSizeStart={DEFAULT_TABLE_PAGE_SIZE}
            components={{
                ...components,
                viewDetailsLinkCell: (props: LinkCellProps<FlowPairsResponse>) =>
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
