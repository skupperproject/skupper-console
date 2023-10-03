import { useCallback, useState, MouseEvent as ReactMouseEvent } from 'react';

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
import { siteNameAndIdSeparator } from '@config/prometheus';
import { getTestsIds } from '@config/testIds';
import EmptyData from '@core/components/EmptyData';
import ResourceIcon from '@core/components/ResourceIcon';
import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';
import { getDataFromSession, storeDataToSession } from '@core/utils/persistData';
import MainContainer from '@layout/MainContainer';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import Metrics from '@pages/shared/Metrics';
import { SelectedMetricFilters } from '@pages/shared/Metrics/Metrics.interfaces';
import { TopologyRoutesPaths, TopologyURLQueyParams, TopologyViews } from '@pages/Topology/Topology.enum';

import SitesController from '../services';
import { SitesRoutesPaths, SiteLabels, QueriesSites } from '../Sites.enum';

const PREFIX_METRIC_FILTERS_CACHE_KEY = 'site-metric-filter';

const processQueryParams = { endTime: 0 };

const Site = function () {
  const { id } = useParams() as { id: string };
  const [searchParams, setSearchParams] = useSearchParams();

  const { id: siteId } = getIdAndNameFromUrlParams(id);
  const type = searchParams.get('type') || SiteLabels.Overview;

  const { data: site } = useQuery([QueriesSites.GetSite, siteId], () => RESTApi.fetchSite(siteId));
  const { data: sites } = useQuery([QueriesSites.GetSites], () => RESTApi.fetchSites());
  const { data: hosts } = useQuery([QueriesSites.GetHostsBySiteId, siteId], () => RESTApi.fetchHostsBySite(siteId));
  const { data: links } = useQuery([QueriesSites.GetLinksBySiteId, siteId], () => RESTApi.fetchLinksBySite(siteId));
  const { data: routers } = useQuery([QueriesSites.GetRouters], () => RESTApi.fetchRouters());
  const { data: processesData } = useQuery(
    [QueriesSites.GetProcessesBySiteId, { ...processQueryParams, parent: siteId }],
    () => RESTApi.fetchProcesses({ ...processQueryParams, parent: siteId })
  );

  const [tabSelected, setTabSelected] = useState(type);

  const handleSelectedFilters = useCallback(
    (filters: SelectedMetricFilters) => {
      storeDataToSession(`${PREFIX_METRIC_FILTERS_CACHE_KEY}-${siteId}`, filters);
    },
    [siteId]
  );

  function handleTabClick(_: ReactMouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) {
    setTabSelected(tabIndex as SiteLabels);
    setSearchParams({ type: tabIndex as string });
  }

  if (!sites || !routers || !site || !hosts || !links || !processesData) {
    return null;
  }

  const { name, nameSpace, siteVersion } = site;
  const { targetIds } = SitesController.bindLinksWithSiteIds([site], links, routers)[0];
  const sitePairs = SitesController.getSitePairs(sites, links, routers);
  const linkedSites = sites.filter(({ identity }) => targetIds.includes(identity));
  const processResults = processesData.results.filter(({ processRole }) => processRole !== 'internal');

  const destSiteNames = Object.values([site, ...sitePairs]).map(({ name: siteName, identity }) => ({
    name: `${siteName}${siteNameAndIdSeparator}${identity}`
  }));

  const startTime = processResults.reduce((acc, process) => Math.min(acc, process.startTime), 0);

  const NavigationMenu = function () {
    return (
      <Tabs activeKey={tabSelected} onSelect={handleTabClick} component="nav">
        <Tab eventKey={SiteLabels.Overview} title={<TabTitleText>{SiteLabels.Overview}</TabTitleText>} />
        <Tab eventKey={SiteLabels.Details} title={<TabTitleText>{SiteLabels.Details}</TabTitleText>} />
      </Tabs>
    );
  };

  return (
    <MainContainer
      dataTestId={getTestsIds.siteView(siteId)}
      title={name}
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLQueyParams.Type}=${TopologyViews.Sites}&${TopologyURLQueyParams.IdSelected}=${siteId}`}
      navigationComponent={<NavigationMenu />}
      mainContentChildren={
        <>
          {tabSelected === SiteLabels.Overview && (
            <Metrics
              key={siteId}
              defaultMetricFilterValues={{
                sourceSite: `${name}${siteNameAndIdSeparator}${siteId}`,
                ...getDataFromSession<SelectedMetricFilters>(`${PREFIX_METRIC_FILTERS_CACHE_KEY}-${siteId}`)
              }}
              startTime={startTime}
              sourceSites={[{ name: `${name}${siteNameAndIdSeparator}${siteId}` }]}
              destSites={destSiteNames}
              configFilters={{
                sourceSites: { disabled: true },
                destinationProcesses: { hide: true },
                sourceProcesses: {
                  hide: true
                }
              }}
              onGetMetricFilters={handleSelectedFilters}
            />
          )}
          {tabSelected === SiteLabels.Details && (
            <Grid hasGutter sm={12} xl={6} xl2={4}>
              <GridItem sm={12}>
                <Card>
                  <CardTitle>
                    <Title headingLevel="h2">{SiteLabels.Details}</Title>
                  </CardTitle>
                  <CardBody>
                    <DescriptionList>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{SiteLabels.Namespace}</DescriptionListTerm>
                        <DescriptionListDescription>{nameSpace}</DescriptionListDescription>
                        <DescriptionListTerm>{SiteLabels.SiteVersion}</DescriptionListTerm>
                        <DescriptionListDescription>{siteVersion}</DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </CardBody>
                </Card>
              </GridItem>

              <GridItem>
                <Card isFullHeight>
                  <CardTitle>
                    <Title headingLevel="h2">{SiteLabels.Links}</Title>
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
                    <Title headingLevel="h2">{SiteLabels.Hosts}</Title>
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
                    <Title headingLevel="h2">{SiteLabels.Processes}</Title>
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
        </>
      }
    />
  );
};

export default Site;
