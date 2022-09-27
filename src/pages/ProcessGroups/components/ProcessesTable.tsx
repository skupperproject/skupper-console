import React, { FC } from 'react';

import SkTable from '@core/components/SkTable';
import ProcessesNameLinkCell from '@pages/Processes/components/ProcessesNameLinkCell';

import { ProcessGroupsLabels, ProcessesTableColumns } from '../ProcessGroups.enum';
import { ProcessesTableProps } from '../ProcessGroups.interfaces';

const ProcessesTable: FC<ProcessesTableProps> = function ({ processes }) {
    const columns = [
        {
            name: ProcessesTableColumns.Name,
            prop: 'name',
            component: 'linkCell',
        },
    ];

    return (
        <SkTable
            title={ProcessGroupsLabels.Processes}
            columns={columns}
            rows={processes}
            components={{ linkCell: ProcessesNameLinkCell }}
        />
    );
};

export default ProcessesTable;
