import React, { FC } from 'react';

import SkTable from '@core/components/SkTable';
import SiteNameLinkCell from '@pages/Processes/components/SiteNameLinkCell';

import ProcessNameLinkCell from './ProcessesNameLinkCell';
import { processesTableColumns } from '../Processes.constant';
import { ProcessesLabels } from '../Processes.enum';
import { ProcessesTableProps } from '../Processes.interfaces';

const ProcessesTable: FC<ProcessesTableProps> = function ({ processes, rowsCount, onGetFilters }) {
    return (
        <SkTable
            title={ProcessesLabels.Section}
            titleDescription={ProcessesLabels.Description}
            columns={processesTableColumns}
            rows={processes}
            components={{ linkCell: ProcessNameLinkCell, linkCellSite: SiteNameLinkCell }}
            rowsCount={rowsCount}
            onGetFilters={onGetFilters}
        />
    );
};

export default ProcessesTable;
