import React, { useState } from 'react';

import { Split, SplitItem } from '@patternfly/react-core';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

import OverviewCard from '@core/components/SummaryCard';
import { SummaryCardColors } from '@core/components/SummaryCard/SummaryCard.enum';
import { ErrorRoutesPaths } from '@pages/Errors/errors.enum';
import LoadingPage from '@pages/Loading';
import { OverviewService, OverviewSite } from '@pages/Site/services/services.interfaces';
import { UPDATE_INTERVAL } from 'config';

import { SitesServices } from '../../services';
import { QuerySite } from '../../site.enum';
import { OVERVIEW_HEADER_SERVICES, OVERVIEW_HEADER_SITES } from './Overview.constant';

const Pluralize = require('pluralize');

const Overview = function () {
  const navigate = useNavigate();
  const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);
  const { data, isLoading } = useQuery(QuerySite.GetOverview, SitesServices.fetchOverview, {
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

  if (data?.sites.length) {
    return (
      <Split hasGutter isWrappable>
        <SplitItem isFilled>
          <OverviewCard
            columns={OVERVIEW_HEADER_SITES}
            data={data.sites}
            label={Pluralize('Site', data.sites.length, true)}
            styleCell={(cell: OverviewSite) =>
              cell.site_id === data.site.id ? 'sk-table-bg-gray' : ''
            }
          />
        </SplitItem>
        <SplitItem isFilled>
          <OverviewCard
            columns={OVERVIEW_HEADER_SERVICES}
            data={data.services}
            label={Pluralize('exposed Service', data.services.length, true)}
            color={SummaryCardColors.Purple}
            styleCell={(cell: OverviewService) =>
              cell.siteId === data.site.id ? 'sk-table-bg-purple' : ''
            }
          />
        </SplitItem>
        <SplitItem isFilled>
          <OverviewCard
            columns={OVERVIEW_HEADER_SERVICES}
            data={[]}
            label={Pluralize('Gateway', [], true)}
            color={SummaryCardColors.Green}
            styleCell={(cell: OverviewService) =>
              cell.siteId === data.site.id ? 'sk-table-bg-green' : ''
            }
          />
        </SplitItem>
      </Split>
    );
  }

  return null;
};

export default Overview;
