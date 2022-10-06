import React, { FC } from 'react';

import SkTable from '@core/components/SkTable';

import { ProcessesLabels, ProcessesTableColumns } from '../Processes.enum';
import { ProcessesTableProps } from '../Processes.interfaces';
import ProcessNameLinkCell from './ProcessesNameLinkCell';

const ProcessGroupsTable: FC<ProcessesTableProps> = function ({ processes }) {
    const columns = [
        {
            name: ProcessesTableColumns.Name,
            prop: 'name',
            component: 'linkCell',
        },
    ];

    return (
        <SkTable
            title={ProcessesLabels.Section}
            titleDescription={ProcessesLabels.Description}
            columns={columns}
            rows={processes}
            components={{ linkCell: ProcessNameLinkCell }}
        />
    );
};

export default ProcessGroupsTable;
