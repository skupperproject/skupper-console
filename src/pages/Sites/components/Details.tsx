import { FC } from 'react';

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
import { Link } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { SiteResponse } from '@API/REST.interfaces';
import EmptyData from '@core/components/EmptyData';
import ResourceIcon from '@core/components/ResourceIcon';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';

import SitesController from '../services';
import { SitesRoutesPaths, SiteLabels, QueriesSites } from '../Sites.enum';

const processQueryParams = { endTime: 0 };

interface DetailsProps {
  site: SiteResponse;
}

const Details: FC<DetailsProps> = function ({ site }) {
  const { identity: siteId, nameSpace, siteVersion, platform } = site;

  const { data: sites } = useQuery({ queryKey: [QueriesSites.GetSites], queryFn: () => RESTApi.fetchSites() });
  const { data: hosts } = useQuery({
    queryKey: [QueriesSites.GetHostsBySiteId, siteId],
    queryFn: () => RESTApi.fetchHostsBySite(siteId)
  });
  const { data: links } = useQuery({
    queryKey: [QueriesSites.GetLinksBySiteId, siteId],
    queryFn: () => RESTApi.fetchLinksBySite(siteId)
  });
  const { data: routers } = useQuery({ queryKey: [QueriesSites.GetRouters], queryFn: () => RESTApi.fetchRouters() });
  const { data: processesData } = useQuery({
    queryKey: [QueriesSites.GetProcessesBySiteId, { ...processQueryParams, parent: siteId }],
    queryFn: () => RESTApi.fetchProcesses({ ...processQueryParams, parent: siteId })
  });

  if (!sites || !routers || !hosts || !links || !processesData) {
    return null;
  }

  const { targetIds } = SitesController.bindLinksWithSiteIds([site], links, routers)[0];
  const linkedSites = sites.filter(({ identity }) => targetIds.map((id) => id.targetId).includes(identity));
  const processResults = processesData.results.filter(({ processRole }) => processRole !== 'internal');

  return (
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
                <DescriptionListTerm>{SiteLabels.Platform}</DescriptionListTerm>
                <DescriptionListDescription>{platform}</DescriptionListDescription>
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
  );
};

export default Details;
