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

import { EMPTY_VALUE_PLACEHOLDER } from '@config/config';
import ResourceIcon from '@core/components/ResourceIcon';
import { SiteResponse } from '@sk-types/REST.interfaces';

import { useSiteDetailsData } from '../hooks/useSiteDetailsData';
import { SitesRoutesPaths, SiteLabels } from '../Sites.enum';

interface DetailsProps {
  site: SiteResponse;
}

const Details: FC<DetailsProps> = function ({ site: { identity: id, nameSpace, siteVersion, platform } }) {
  const { links } = useSiteDetailsData(id);

  return (
    <Grid hasGutter>
      <GridItem>
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
                <DescriptionListTerm>{SiteLabels.Links}</DescriptionListTerm>
                <DescriptionListDescription>
                  <List isPlain>
                    {links.length
                      ? links.map(({ identity, destinationSiteId, destinationSiteName }) => (
                          <ListItem key={identity}>
                            <Flex>
                              <ResourceIcon type="site" />
                              <Link to={`${SitesRoutesPaths.Sites}/${destinationSiteName}@${destinationSiteId}`}>
                                {destinationSiteName}
                              </Link>
                            </Flex>
                          </ListItem>
                        ))
                      : EMPTY_VALUE_PLACEHOLDER}
                  </List>
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};

export default Details;
