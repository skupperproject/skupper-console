import React, { useState } from 'react';

import {
  ActionList,
  ActionListItem,
  Button,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { ArrowDownIcon, ArrowUpIcon } from '@patternfly/react-icons';
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
import TrafficChart from './components/TrafficChart';
import { OVERVIEW_HEADER_SERVICES, OVERVIEW_HEADER_SITES } from './Overview.constants';
import { OverviewLabels } from './Overview.enum';

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
      <Stack>
        <StackItem className="pf-u-mb-xl">
          <Split hasGutter>
            <SplitItem>
              <TextContent>
                <Text component={TextVariants.h4}>{OverviewLabels.NetworkDetails}</Text>
              </TextContent>
            </SplitItem>
            <SplitItem isFilled />
            <SplitItem>
              <ActionList>
                <ActionListItem>
                  <Button variant={'primary'} icon={<ArrowDownIcon />}>
                    {OverviewLabels.ActionLinkARemoteSite}
                  </Button>
                </ActionListItem>
                <ActionListItem>
                  <Button variant={'primary'} icon={<ArrowUpIcon />}>
                    {OverviewLabels.ActionUseToken}
                  </Button>
                </ActionListItem>
              </ActionList>
            </SplitItem>
          </Split>
        </StackItem>
        <StackItem isFilled className="pf-u-mb-xl">
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
        </StackItem>
        <StackItem>
          <TextContent>
            <Text component={TextVariants.h4}>{OverviewLabels.TrafficSite}</Text>
          </TextContent>
        </StackItem>
        <StackItem>
          <TrafficChart totalBytesBySites={data.site.totalBytesBySites} timestamp={Date.now()} />
        </StackItem>
      </Stack>
    );
  }

  return null;
};

export default Overview;
