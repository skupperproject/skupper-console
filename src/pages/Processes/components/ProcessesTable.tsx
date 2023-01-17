import React, { FC } from 'react';

import SkTable from '@core/components/SkTable';
import SiteNameLinkCell from '@pages/Processes/components/SiteNameLinkCell';
import { ProcessResponse } from 'API/REST.interfaces';

import { ProcessesLabels, ProcessesTableColumns } from '../Processes.enum';
import { ProcessesTableProps } from '../Processes.interfaces';
import ProcessNameLinkCell from './ProcessesNameLinkCell';

const ProcessesTable: FC<ProcessesTableProps> = function ({ processes, rowsCount, onGetFilters }) {
    const columns = [
        {
            name: ProcessesTableColumns.Name,
            prop: 'name' as keyof ProcessResponse,
            component: 'linkCell',
        },
        {
            name: ProcessesTableColumns.Site,
            prop: 'parentName' as keyof ProcessResponse,
            component: 'linkCellSite',
        },
    ];

    return (
        <SkTable
            title={ProcessesLabels.Section}
            titleDescription={ProcessesLabels.Description}
            columns={columns}
            rows={processes}
            components={{ linkCell: ProcessNameLinkCell, linkCellSite: SiteNameLinkCell }}
            rowsCount={rowsCount}
            onGetFilters={onGetFilters}
        />
    );
};

export default ProcessesTable;
