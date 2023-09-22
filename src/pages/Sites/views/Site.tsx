import { useCallback, useState, MouseEvent as ReactMouseEvent, Suspense } from 'react';

import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  Grid,
  GridItem,
  List,
  ListItem,
  Tab,
  Tabs,
  TabTitleText,
  Title
} from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { getTestsIds } from '@config/testIds';
import EmptyData from '@core/components/EmptyData';
import ResourceIcon from '@core/components/ResourceIcon';
import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import MainContainer from '@layout/MainContainer';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import LoadingPage from '@pages/shared/Loading';
import Metrics from '@pages/shared/Metrics';
import { MetricsLabels } from '@pages/shared/Metrics/Metrics.enum';
import { SelectedFilters } from '@pages/shared/Metrics/Metrics.interfaces';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';

import SitesController from '../services';
import { SitesRoutesPaths, Labels, QueriesSites } from '../Sites.enum';

const PREFIX_DISPLAY_INTERVAL_CACHE_KEY = 'site-display-interval';

const processQueryParams = { endTime: 0 };

const Site = function () {
  const { id } = useParams() as { id: string };
  const [searchParams, setSearchParams] = useSearchParams();

  const { id: siteId } = getIdAndNameFromUrlParams(id);
  const type = searchParams.get('type') || Labels.Overview;

  const { data: site } = useQuery([QueriesSites.GetSite, siteId], () => RESTApi.fetchSite(siteId));
  const { data: sites } = useQuery([QueriesSites.GetSites], () => RESTApi.fetchSites());
  const { data: hosts } = useQuery([QueriesSites.GetHostsBySiteId, siteId], () => RESTApi.fetchHostsBySite(siteId));
  const { data: links } = useQuery([QueriesSites.GetLinksBySiteId, siteId], () => RESTApi.fetchLinksBySite(siteId));
  const { data: processesData } = useQuery(
    [QueriesSites.GetProcessesBySiteId, { ...processQueryParams, parent: siteId }],
    () => RESTApi.fetchProcesses({ ...processQueryParams, parent: siteId })
  );

  const [tabSelected, setTabSelected] = useState(type);

  const handleRefreshMetrics = useCallback(
    (filters: SelectedFilters) => {
      storeDataToSession(`${PREFIX_DISPLAY_INTERVAL_CACHE_KEY}-${siteId}`, filters);
    },
    [siteId]
  );

  function handleTabClick(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setTabSelected(tabIndex as Labels);
    setSearchParams({ type: tabIndex as string });
  }

  const { data: routers } = useQuery([QueriesSites.GetRouters], () => RESTApi.fetchRouters());

  if (!sites || !routers || !site || !hosts || !links || !processesData) {
    return null;
  }

  const { name, nameSpace, siteVersion } = site;
  const { targetIds } = SitesController.bindLinksWithSiteIds([site], links, routers)[0];
  const linkedSites = sites.filter(({ identity }) => targetIds.includes(identity));

  const processResults = processesData.results.filter(({ processRole }) => processRole !== 'internal');
  const sourceComponentFilter = Object.values(processResults).map(({ name: destinationName }) => ({ destinationName }));
  const sourceProcesses = processResults.map(({ name: processName }) => processName).join('|');
  const startTime = processResults.reduce((acc, process) => Math.min(acc, process.startTime), 0);

  const NavigationMenu = function () {
    return (
      <Tabs activeKey={tabSelected} onSelect={handleTabClick} component="nav">
        <Tab eventKey={Labels.Overview} title={<TabTitleText>{Labels.Overview}</TabTitleText>} />
        <Tab eventKey={Labels.Details} title={<TabTitleText>{Labels.Details}</TabTitleText>} />
      </Tabs>
    );
  };

  return (
    <MainContainer
      dataTestId={getTestsIds.siteView(siteId)}
      title={name}
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.Sites}&${TopologyURLFilters.IdSelected}=${siteId}`}
      navigationComponent={<NavigationMenu />}
      mainContentChildren={
        <Suspense fallback={<LoadingPage />}>
          {tabSelected === Labels.Overview && (
            <Metrics
              key={siteId}
              selectedFilters={{
                ...getDataFromSession<SelectedFilters>(`${PREFIX_DISPLAY_INTERVAL_CACHE_KEY}-${siteId}`),
                processIdSource: sourceProcesses
              }}
              startTime={startTime}
              sourceProcesses={sourceComponentFilter}
              filterOptions={{
                destinationProcesses: { hide: true },
                sourceProcesses: {
                  disabled: sourceComponentFilter.length < 2,
                  placeholder: MetricsLabels.FilterAllSourceProcesses
                }
              }}
              onGetMetricFilters={handleRefreshMetrics}
            />
          )}
          {tabSelected === Labels.Details && (
            <Grid hasGutter sm={12} xl={6} xl2={4}>
              <GridItem sm={12}>
                <Card>
                  <CardTitle>
                    <Title headingLevel="h2">{Labels.Details}</Title>
                  </CardTitle>
                  <CardBody>
                    <DescriptionList>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{Labels.Namespace}</DescriptionListTerm>
                        <DescriptionListDescription>{nameSpace}</DescriptionListDescription>
                        <DescriptionListTerm>{Labels.SiteVersion}</DescriptionListTerm>
                        <DescriptionListDescription>{siteVersion}</DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </CardBody>
                </Card>
              </GridItem>

              <GridItem>
                <Card isFullHeight>
                  <CardTitle>
                    <Title headingLevel="h2">{Labels.Links}</Title>
                  </CardTitle>
                  <CardBody>
                    {(!!linkedSites.length && (
                      <List isPlain>
                        {linkedSites.map(({ identity, name: linkedSiteName }) => (
                          <ListItem key={identity}>
                            <Flex>
                              <ResourceIcon type="site" />
                              <Link to={`${SitesRoutesPaths.Sites}/${linkedSiteName}@${identity}`}>
                                {linkedSiteName}
                              </Link>
                            </Flex>
                          </ListItem>
                        ))}
                      </List>
                    )) || <EmptyData />}
                  </CardBody>
                </Card>
              </GridItem>

              <GridItem>
                <Card isFullHeight>
                  <CardTitle>
                    <Title headingLevel="h2">{Labels.Hosts}</Title>
                  </CardTitle>
                  <CardBody>
                    {(!!hosts.length && (
                      <List isPlain>
                        {hosts.map(({ identity, provider, name: hostName }) => (
                          <ListItem key={identity}>{`${provider} (${hostName})`}</ListItem>
                        ))}
                      </List>
                    )) || <EmptyData />}
                  </CardBody>
                </Card>
              </GridItem>

              <GridItem sm={12} xl={12} xl2={4}>
                <Card isFullHeight>
                  <CardTitle>
                    <Title headingLevel="h2">{Labels.Processes}</Title>
                  </CardTitle>
                  <CardBody>
                    {(!!processResults.length && (
                      <List isPlain>
                        {processResults.map(({ identity, name: processName }) => (
                          <ListItem key={identity}>
                            <Flex>
                              <ResourceIcon type="process" />
                              <Link to={`${ProcessesRoutesPaths.Processes}/${processName}@${identity}`}>
                                {processName}
                              </Link>
                            </Flex>
                          </ListItem>
                        ))}
                      </List>
                    )) || <EmptyData />}
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          )}
        </Suspense>
      }
    />
  );
};

export default Site;
