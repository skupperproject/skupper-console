import { FC } from 'react';

import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  Title
} from '@patternfly/react-core';

import { SiteResponse } from '@sk-types/REST.interfaces';

import { SiteLabels } from '../Sites.enum';

interface DetailsProps {
  site: SiteResponse;
}

const Details: FC<DetailsProps> = function ({ site: { nameSpace, siteVersion, platform, routerCount } }) {
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
                <DescriptionListTerm>{SiteLabels.HA}</DescriptionListTerm>
                <DescriptionListDescription>
                  {routerCount > 1 ? SiteLabels.YES : SiteLabels.NO}
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
