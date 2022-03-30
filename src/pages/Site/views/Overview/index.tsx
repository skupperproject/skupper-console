import React, { useState } from 'react';

import {
  Split,
  SplitItem,
  Stack,
  StackItem,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { ErrorRoutesPaths } from '@pages/Errors/errors.enum';
import LoadingPage from '@pages/Loading';
import { UPDATE_INTERVAL } from 'config';

import { SitesServices } from '../../services';
import { QuerySite } from '../../site.enum';
import LinksTable from './components/LinksTable';
import ServicesTable from './components/ServicesTable';
import SiteInfo from './components/SiteInfo';
import SitesTable from './components/SitesTable';
import TokenTable from './components/TokensTable';
import TrafficChart from './components/TrafficChart';
import { OverviewLabels } from './Overview.enum';

const Overview = function () {
  const navigate = useNavigate();
  const [refetchInterval, setRefetchInterval] = useState(UPDATE_INTERVAL);

  const { data: siteId, isLoading } = useQuery(QuerySite.GetSiteId, SitesServices.fetchSiteId, {
    onError: handleError,
  });

  const { data: info, isLoading: isLoadingSiteInfo } = useQuery(
    QuerySite.GetSiteInfo,
    SitesServices.fetchSiteInfo,
    {
      onError: handleError,
    },
  );

  const { data: links, isLoading: isLoadingLinks } = useQuery(
    QuerySite.GetLinks,
    SitesServices.fetchLinks,
    {
      refetchInterval,
      onError: handleError,
    },
  );

  const { data: tokens, isLoading: isLoadingTokens } = useQuery(
    QuerySite.GetTokens,
    SitesServices.fetchTokens,
    {
      refetchInterval,
      onError: handleError,
    },
  );

  const { data: services, isLoading: isLoadingServices } = useQuery(
    QuerySite.GetServices,
    SitesServices.fetchServices,
    {
      refetchInterval,
      onError: handleError,
    },
  );

  const { data: sites, isLoading: isLoadingSites } = useQuery(
    QuerySite.GetSites,
    SitesServices.fetchSites,
    {
      refetchInterval,
      onError: handleError,
    },
  );
  function handleError({ httpStatus }: { httpStatus?: number }) {
    const route = httpStatus ? ErrorRoutesPaths.ErrServer : ErrorRoutesPaths.ErrConnection;

    setRefetchInterval(0);
    navigate(route);
  }

  if (
    isLoading ||
    isLoadingLinks ||
    isLoadingServices ||
    isLoadingSites ||
    isLoadingTokens ||
    isLoadingSiteInfo
  ) {
    return <LoadingPage />;
  }

  if (!siteId) {
    return null;
  }

  return (
    <Stack>
      <StackItem className="pf-u-mb-xl">
        <TextContent>
          <Text component={TextVariants.h2}>{OverviewLabels.SiteDetails}</Text>
        </TextContent>
      </StackItem>

      {info && (
        <StackItem className="pf-u-mb-xl">
          <SiteInfo data={info} />
        </StackItem>
      )}

      {links && tokens && (
        <StackItem className="pf-u-mb-xl">
          <Split hasGutter>
            <SplitItem isFilled>
              <TokenTable tokens={tokens} />
            </SplitItem>
            <SplitItem isFilled>
              <LinksTable links={links} />
            </SplitItem>
          </Split>
        </StackItem>
      )}

      <StackItem className="pf-u-mb-xl">
        <TextContent>
          <Text component={TextVariants.h2}>{OverviewLabels.NetworkDetails}</Text>
        </TextContent>
      </StackItem>

      {services && sites && (
        <StackItem className="pf-u-mb-xl">
          <Split hasGutter>
            <SplitItem isFilled>
              <SitesTable siteId={siteId} sites={sites} />
            </SplitItem>
            <SplitItem isFilled>
              <ServicesTable siteId={siteId} services={services} />
            </SplitItem>
          </Split>
        </StackItem>
      )}

      <StackItem>
        <TextContent>
          <Text component={TextVariants.h2}>{OverviewLabels.TrafficSite}</Text>
        </TextContent>
      </StackItem>

      <StackItem>
        <TrafficChart siteId={siteId} />
      </StackItem>
    </Stack>
  );
};

export default Overview;
