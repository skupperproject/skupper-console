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
import { Link } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import SKEmptyData from '@core/components/SkEmptyData';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { SiteResponse } from '@sk-types/REST.interfaces';

import { useSiteDetailsData } from '../hooks/useSiteDetailsData';
import SitesController from '../services';
import { SitesRoutesPaths, SiteLabels } from '../Sites.enum';

interface DetailsProps {
  site: SiteResponse;
}

const Details: FC<DetailsProps> = function ({ site: { identity: id, nameSpace, siteVersion, platform } }) {
  const { sites, links, processes } = useSiteDetailsData(id);

  const { linkSiteIds } = SitesController.bindLinksWithSiteIds(
    sites.filter(({ identity }) => identity === id),
    links
  )[0];
  const linkedSites = sites.filter(({ identity }) => linkSiteIds.map(({ targetId }) => targetId).includes(identity));

  return (
    <Grid hasGutter sm={12} xl={6} xl2={6}>
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
            )) || <SKEmptyData />}
          </CardBody>
        </Card>
      </GridItem>

      {/*<GridItem>
        <Card isFullHeight>
          <CardTitle>
            <Title headingLevel="h2">{SiteLabels.Hosts}</Title>
          </CardTitle>
          <CardBody>
            {(!!hosts.length && (
              <List isPlain>
                {hosts.map(({ identity, provider, name: hostName }) => (
                  <ListItem key={identity}>{provider ? `${provider} (${hostName})` : hostName}</ListItem>
                ))}
              </List>
            )) || <SKEmptyData />}
          </CardBody>
        </Card>
      </GridItem> */}

      <GridItem sm={12} xl={12} xl2={6}>
        <Card isFullHeight>
          <CardTitle>
            <Title headingLevel="h2">{SiteLabels.Processes}</Title>
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
            )) || <SKEmptyData />}
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};

export default Details;
