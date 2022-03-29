import React, { useEffect, useState } from 'react';

import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

import LinksCard from '@core/components/SummaryCard';
import { ErrorRoutesPaths } from '@pages/Errors/errors.enum';
import LoadingPage from '@pages/Loading';
import { SitesServices } from '@pages/Site/services';
import { QuerySite } from '@pages/Site/site.enum';
import { UPDATE_INTERVAL } from 'config';

const Pluralize = require('pluralize');

export enum LinkMessages {
  NotConnected = 'No Connected',
  ConnectedTo = 'Connected to',
  NoConfigured = 'Connected but not configured',
}

export enum LinkColumns {
  Name = 'Name',
  Cost = 'Cost',
  Status = 'Status',
  Created = 'Created',
}

export const LINKS_HEADER_TABLE = [
  { property: 'name', name: LinkColumns.Name },
  { property: 'status', name: LinkColumns.Status },
  { property: 'cost', name: LinkColumns.Cost },
  { property: 'created', name: LinkColumns.Created },
];

export interface LinkRow {
  status: string;
  name: string;
  created: string;
}

const LinksTable = function () {
  const navigate = useNavigate();

  const [rows, setRows] = useState<LinkRow[]>();
  const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);
  const { data, isLoading } = useQuery(QuerySite.GetLinks, SitesServices.fetchLinks, {
    refetchInterval,
    onError: handleError,
  });

  function handleError({ httpStatus }: { httpStatus?: number }) {
    const route = httpStatus ? ErrorRoutesPaths.ErrServer : ErrorRoutesPaths.ErrConnection;

    setRefetchInterval(0);
    navigate(route);
  }

  useEffect(() => {
    if (data) {
      const newRow = data.map(({ siteConnected, connected, configured, ...rest }) => {
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
  }, [data]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!rows?.length) {
    return null;
  }

  return (
    <LinksCard
      columns={LINKS_HEADER_TABLE}
      data={rows}
      label={Pluralize('Link', rows.length, true)}
    />
  );
};

export default LinksTable;
