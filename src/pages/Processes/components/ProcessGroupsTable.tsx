import React, { FC } from 'react';

import SkTable from '@core/components/SkTable';
import { ProcessResponse } from 'API/REST.interfaces';

import { ProcessesLabels, ProcessesTableColumns } from '../Processes.enum';
import { ProcessesTableProps } from '../Processes.interfaces';
import ProcessNameLinkCell from './ProcessesNameLinkCell';

const ProcessGroupsTable: FC<ProcessesTableProps> = function ({ processes }) {
    const columns = [
        {
            name: ProcessesTableColumns.Name,
            prop: 'name' as keyof ProcessResponse,
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
