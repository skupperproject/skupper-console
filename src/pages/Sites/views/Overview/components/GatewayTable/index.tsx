import React, { memo } from 'react';

import OverviewCard from '@core/components/SummaryCard';
import { SummaryCardColors } from '@core/components/SummaryCard/SummaryCard.enum';

import { GATEWAYS_HEADER_TABLE } from './GatewayTable.constants';
import { GatewaysTableProps } from './GatewayTable.interfaces';

const Pluralize = require('pluralize');

const GatewaysTable = memo(function ({ gateways }: GatewaysTableProps) {
    return (
        <OverviewCard
            columns={GATEWAYS_HEADER_TABLE}
            data={gateways}
            label={Pluralize('Gateway', gateways?.length, true)}
            color={SummaryCardColors.Green}
        />
    );
});

export default GatewaysTable;
