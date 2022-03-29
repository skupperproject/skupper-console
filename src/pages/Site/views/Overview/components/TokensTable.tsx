import React, { useState } from 'react';

import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

import TokensCard from '@core/components/SummaryCard';
import { ErrorRoutesPaths } from '@pages/Errors/errors.enum';
import LoadingPage from '@pages/Loading';
import { SitesServices } from '@pages/Site/services';
import { QuerySite } from '@pages/Site/site.enum';
import { UPDATE_INTERVAL } from 'config';

const Pluralize = require('pluralize');

export enum TokenColumns {
  Name = 'Name',
  ClaimsMade = 'Claims Made',
  ClaimsRemaining = 'Claims Remaining',
  Created = 'Created',
  ClaimExpiration = 'Claim expiration',
}

export const TOKENS_HEADER_TABLE = [
  { property: 'name', name: TokenColumns.Name },
  { property: 'claimsMade', name: TokenColumns.ClaimsMade },
  { property: 'claimsRemaining', name: TokenColumns.ClaimsRemaining },
  { property: 'created', name: TokenColumns.Created },
  { property: 'claimExpiration', name: TokenColumns.ClaimExpiration },
];

const TokenTable = function () {
  const navigate = useNavigate();

  const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);
  const { data, isLoading } = useQuery(QuerySite.GetTokens, SitesServices.fetchTokens, {
    refetchInterval,
    onError: handleError,
  });

  function handleError({ httpStatus }: { httpStatus?: number }) {
    const route = httpStatus ? ErrorRoutesPaths.ErrServer : ErrorRoutesPaths.ErrConnection;

    setRefetchInterval(0);
    navigate(route);
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!data) {
    return null;
  }

  return (
    <TokensCard
      columns={TOKENS_HEADER_TABLE}
      data={data}
      label={Pluralize('Token', data.length, true)}
    />
  );
};

export default TokenTable;
