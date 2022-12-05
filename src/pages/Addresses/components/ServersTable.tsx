import React, { FC } from 'react';

import { LinkCellProps } from '@core/components/LinkCell/LinkCell.interfaces';
import SkTable from '@core/components/SkTable';
import { formatByteRate, formatBytes } from '@core/utils/formatBytes';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { ProcessGroupsRoutesPaths } from '@pages/ProcessGroups/ProcessGroups.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';

import LinkCell from '../../../core/components/LinkCell';
import { FlowPairsColumnsNames, ProcessesColumnsNames } from '../Addresses.enum';
import { ProcessesTableProps } from '../Addresses.interfaces';
import { ProcessRow } from '../services/services.interfaces';

const ServersTable: FC<ProcessesTableProps> = function ({ processes }) {
    const columns = [
        {
            name: ProcessesColumnsNames.Process,
            prop: 'processName' as keyof ProcessRow,
            component: 'nameLinkCellProcess',
            width: 20,
        },
        {
            name: ProcessesColumnsNames.ProcessGroup,
            prop: 'groupName' as keyof ProcessRow,
            component: 'nameLinkCellProcessGroup',
        },
        {
            name: ProcessesColumnsNames.Site,
            prop: 'siteName' as keyof ProcessRow,
            component: 'name[LinkCell]Site',
        },
        {
            name: ProcessesColumnsNames.Host,
            prop: 'host' as keyof ProcessRow,
        },
        {
            name: FlowPairsColumnsNames.ImageName,
            prop: 'imageName' as keyof ProcessRow,
            width: 10,
        },
        {
            name: ProcessesColumnsNames.ByteRate,
            prop: 'byteRate' as keyof ProcessRow,
            format: formatByteRate,
        },
        {
            name: ProcessesColumnsNames.Bytes,
            prop: 'bytes' as keyof ProcessRow,
            format: formatBytes,
        },
    ];

    return (
        <SkTable
            columns={columns}
            rows={processes}
            components={{
                nameLinkCellProcess: (props: LinkCellProps<ProcessRow>) =>
                    LinkCell({
                        ...props,
                        type: 'process',
                        link: `${ProcessesRoutesPaths.Processes}/${props.data.identity}`,
                    }),
                nameLinkCellProcessGroup: (props: LinkCellProps<ProcessRow>) =>
                    LinkCell({
                        ...props,
                        type: 'service',
                        link: `${ProcessGroupsRoutesPaths.ProcessGroups}/${props.data.groupId}`,
                    }),
                nameLinkCellSite: (props: LinkCellProps<ProcessRow>) =>
                    LinkCell({
                        ...props,
                        type: 'site',
                        link: `${SitesRoutesPaths.Sites}/${props.data.siteId}`,
                    }),
            }}
        />
    );
};

export default ServersTable;
