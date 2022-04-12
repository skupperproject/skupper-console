import React, { memo, useEffect, useState } from 'react';

import OverviewCard from '@core/components/SummaryCard';
import { SummaryCardColors } from '@core/components/SummaryCard/SummaryCard.enum';

import { LINKS_HEADER_TABLE } from './LinksTable.constants';
import { LinkMessages } from './LinksTable.enum';
import { LinkRow, LinksTableProps } from './LinksTable.interfaces';

const Pluralize = require('pluralize');

const LinksTable = memo(function ({ links }: LinksTableProps) {
  const [rows, setRows] = useState<LinkRow[]>();

  useEffect(() => {
    if (links) {
      const newRow = links.map(({ siteConnected, connected, configured, ...rest }) => {
        let siteConnectedMessage = LinkMessages.NotConnected as string;

        if (connected && configured) {
          siteConnectedMessage = `${LinkMessages.ConnectedTo} ${siteConnected}`;
        } else if (connected && !configured) {
          siteConnectedMessage = LinkMessages.NoConfigured;
        }

        return { ...rest, status: siteConnectedMessage };
      });

      setRows(newRow);
    }
  }, [links]);

  return (
    <OverviewCard
      columns={LINKS_HEADER_TABLE}
      data={rows}
      color={SummaryCardColors.Blue}
      label={Pluralize('Link', rows?.length, true)}
    />
  );
});

export default LinksTable;
