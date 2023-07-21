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
  Title
} from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { getTestsIds } from '@config/testIds.config';
import EmptyData from '@core/components/EmptyData';
import ResourceIcon from '@core/components/ResourceIcon';
import { getIdAndNameFromUrlParams } from '@core/utils/getIdAndNameFromUrlParams';
import SkDefaultPage from '@layout/DefaultPage';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import LoadingPage from '@pages/shared/Loading';
import { TopologyRoutesPaths, TopologyURLFilters, TopologyViews } from '@pages/Topology/Topology.enum';

import SitesController from '../services';
import { QueriesSites } from '../services/services.enum';
import { SitesRoutesPaths, Labels } from '../Sites.enum';

const processQueryParams = { endTime: 0 };

const Site = function () {
  const { id } = useParams() as { id: string };
  const { id: siteId } = getIdAndNameFromUrlParams(id);

  const { data: site, isLoading: isLoadingSite } = useQuery([QueriesSites.GetSite, siteId], () =>
    RESTApi.fetchSite(siteId)
  );

  const { data: sites, isLoading: isLoadingSites } = useQuery([QueriesSites.GetSites], () => RESTApi.fetchSites());

  const { data: hosts, isLoading: isLoadingHosts } = useQuery([QueriesSites.GetHostsBySiteId, siteId], () =>
    RESTApi.fetchHostsBySite(siteId)
  );

  const { data: links, isLoading: isLoadingLinks } = useQuery([QueriesSites.GetLinksBySiteId, siteId], () =>
    RESTApi.fetchLinksBySite(siteId)
  );

  const { data: processesData, isLoading: isLoadingProcessesData } = useQuery(
    [QueriesSites.GetProcessesBySiteId, { ...processQueryParams, parent: siteId }],
    () => RESTApi.fetchProcesses({ ...processQueryParams, parent: siteId })
  );

  const { data: routers, isLoading: isLoadingRouters } = useQuery([QueriesSites.GetRouters], () =>
    RESTApi.fetchRouters()
  );

  if (
    isLoadingSite ||
    isLoadingHosts ||
    isLoadingLinks ||
    isLoadingProcessesData ||
    isLoadingRouters ||
    isLoadingSites
  ) {
    return <LoadingPage />;
  }

  if (!sites || !routers || !site || !hosts || !links || !processesData) {
    return null;
  }

  const { name, nameSpace, siteVersion } = site;
  const { targetIds } = SitesController.bindLinksWithSiteIds([site], links, routers)[0];
  const linkedSites = sites.filter(({ identity }) => targetIds.includes(identity));

  const processes = processesData.results.filter(({ processRole }) => processRole !== 'internal');

  return (
    <SkDefaultPage
      dataTestId={getTestsIds.siteView(siteId)}
      title={name}
      link={`${TopologyRoutesPaths.Topology}?${TopologyURLFilters.Type}=${TopologyViews.Sites}&${TopologyURLFilters.IdSelected}=${siteId}`}
      mainContentChildren={
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
                          <Link to={`${SitesRoutesPaths.Sites}/${linkedSiteName}@${identity}`}>{linkedSiteName}</Link>
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
                {(!!processes.length && (
                  <List isPlain>
                    {processes.map(({ identity, name: processName }) => (
                      <ListItem key={identity}>
                        <Flex>
                          <ResourceIcon type="process" />
                          <Link to={`${ProcessesRoutesPaths.Processes}/${processName}@${identity}`}>{processName}</Link>
                        </Flex>
                      </ListItem>
                    ))}
                  </List>
                )) || <EmptyData />}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      }
    />
  );
};

export default Site;
