import React, { FC } from 'react';

import SkTable from '@core/components/SkTable';
import { SiteResponse } from 'API/REST.interfaces';

import SiteNameLinkCell from './SiteNameLinkCell';
import { Labels, SitesTableColumns } from '../Sites.enum';
import { SitesTableProps } from '../Sites.interfaces';

const SitesTable: FC<SitesTableProps> = function ({ sites }) {
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
            components={{ linkCell: SiteNameLinkCell }}
        />
    );
};

export default SitesTable;
