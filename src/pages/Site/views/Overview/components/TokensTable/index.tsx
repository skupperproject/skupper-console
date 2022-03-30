import React, { memo } from 'react';

import OverviewCard from '@core/components/SummaryCard';
import { SummaryCardColors } from '@core/components/SummaryCard/SummaryCard.enum';

import { TOKENS_HEADER_TABLE } from './TokensTable.constants';
import { TokensTableProps } from './TokensTable.interfaces';

const Pluralize = require('pluralize');

const TokenTable = memo(function ({ tokens }: TokensTableProps) {
  return (
    <OverviewCard
      columns={TOKENS_HEADER_TABLE}
      data={tokens}
      color={SummaryCardColors.Blue}
      label={Pluralize('Token', tokens?.length, true)}
    />
  );
});

export default TokenTable;
