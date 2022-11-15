import React, { FC } from 'react';

import { Link } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import SkTable from '@core/components/SkTable';
import { formatByteRate, formatBytes } from '@core/utils/formatBytes';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { ProcessGroupsRoutesPaths } from '@pages/ProcessGroups/ProcessGroups.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';

import { FlowPairsColumnsNames, ProcessesColumnsNames } from '../Addresses.enum';
import { ProcessesTableProps } from '../Addresses.interfaces';
import { ProcessRow } from '../services/services.interfaces';

const AddressProcessesTable: FC<ProcessesTableProps> = function ({ processes }) {
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
            width: 20,
        },
        {
            name: ProcessesColumnsNames.Site,
            prop: 'siteName' as keyof ProcessRow,
            component: 'nameLinkCellSite',
            width: 20,
        },
        {
            name: ProcessesColumnsNames.Host,
            prop: 'host' as keyof ProcessRow,
        },
        {
            name: FlowPairsColumnsNames.ImageName,
            prop: 'imageName' as keyof ProcessRow,
            width: 20,
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
                nameLinkCellProcess: (props: NameLinkCellProps) =>
                    NameLinkCell({
                        ...props,
                        type: 'process',
                        link: `${ProcessesRoutesPaths.Processes}/${props.data.identity}`,
                    }),
                nameLinkCellProcessGroup: (props: NameLinkCellProps) =>
                    NameLinkCell({
                        ...props,
                        type: 'service',
                        link: `${ProcessGroupsRoutesPaths.ProcessGroups}/${props.data.groupId}`,
                    }),
                nameLinkCellSite: (props: NameLinkCellProps) =>
                    NameLinkCell({
                        ...props,
                        type: 'site',
                        link: `${SitesRoutesPaths.Sites}/${props.data.siteId}`,
                    }),
            }}
        />
    );
};

export default AddressProcessesTable;

interface NameLinkCellProps {
    data: ProcessRow;
    value: ProcessRow[keyof ProcessRow];
    link: string;
    type: 'process' | 'site' | 'service';
}

const NameLinkCell: FC<NameLinkCellProps> = function ({ value, link, type }) {
    return (
        <>
            <ResourceIcon type={type} />
            <Link to={link}>{value}</Link>
        </>
    );
};
