import React, { memo } from 'react';

import OverviewCard from '@core/components/SummaryCard';
import { SummaryCardColors } from '@core/components/SummaryCard/SummaryCard.enum';
import { SiteInfo } from '@pages/Sites/services/services.interfaces';

import { GATEWAYS_HEADER_TABLE } from './GatewayTable.constants';
import { GatewaysTableProps } from './GatewayTable.interfaces';

const Pluralize = require('pluralize');

const GatewaysTable = memo(function ({ siteId, gateways }: GatewaysTableProps) {
  return (
    <OverviewCard
      columns={GATEWAYS_HEADER_TABLE}
      data={gateways}
      label={Pluralize('Gateway', gateways?.length, true)}
      color={SummaryCardColors.Green}
      styleCell={(cell: SiteInfo) => (cell.siteId === siteId ? 'sk-table-bg-green' : '')}
    />
  );
});

export default GatewaysTable;
