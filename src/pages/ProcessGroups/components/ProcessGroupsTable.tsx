import React, { FC } from 'react';

import SkTable from '@core/components/SkTable';

import { ProcessGroupsLabels, ProcessGroupsTableColumns } from '../ProcessGroups.enum';
import { ProcessGroupsTableProps } from '../ProcessGroups.interfaces';
import ProcessGroupNameLinkCell from './ProcessGroupNameLinkCell';

const ProcessGroupsTable: FC<ProcessGroupsTableProps> = function ({ processGroups }) {
    const columns = [
        {
            name: ProcessGroupsTableColumns.Name,
            prop: 'name',
            component: 'linkCell',
        },
    ];

    return (
        <SkTable
            title={ProcessGroupsLabels.Section}
            titleDescription={ProcessGroupsLabels.Description}
            columns={columns}
            rows={processGroups}
            components={{ linkCell: ProcessGroupNameLinkCell }}
        />
    );
};

export default ProcessGroupsTable;
