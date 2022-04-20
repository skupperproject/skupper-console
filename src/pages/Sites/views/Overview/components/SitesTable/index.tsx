import React, { memo } from 'react';

import OverviewCard from '@core/components/SummaryCard';
import { SummaryCardColors } from '@core/components/SummaryCard/SummaryCard.enum';

import { SITE_HEADER_TABLE } from './SitesTable.constants';
import { SitesTableProps } from './SitesTable.interfaces';

const Pluralize = require('pluralize');

const SitesTable = memo(function ({ sites }: SitesTableProps) {
    return (
        <OverviewCard
            columns={SITE_HEADER_TABLE}
            data={sites}
            label={Pluralize('Site', sites?.length, true)}
            color={SummaryCardColors.Blue}
        />
    );
});

export default SitesTable;
