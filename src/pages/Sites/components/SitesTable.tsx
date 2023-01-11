import React, { FC } from 'react';

import SkTable from '@core/components/SkTable';
import { SiteResponse } from 'API/REST.interfaces';

import { Labels, SitesTableColumns } from '../Sites.enum';
import { SitesTableProps } from '../Sites.interfaces';
import SiteNameLinkCell from './SiteNameLinkCell';

const SitesTable: FC<SitesTableProps> = function ({ sites, onGetFilters, rowsCount }) {
    const columns = [
        {
            name: SitesTableColumns.Name,
            prop: 'name' as keyof SiteResponse,
            component: 'linkCell',
        },
    ];

    return (
        <SkTable
            title={Labels.Sites}
            titleDescription={Labels.SitesDescription}
            columns={columns}
            rows={sites}
            rowsCount={rowsCount}
            onGetFilters={onGetFilters}
            components={{ linkCell: SiteNameLinkCell }}
        />
    );
};

export default SitesTable;
