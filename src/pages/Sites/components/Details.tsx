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

import { Labels } from '../../../config/labels';
import { SiteResponse } from '../../../types/REST.interfaces';

interface DetailsProps {
  site: SiteResponse;
}

const Details: FC<DetailsProps> = function ({ site: { nameSpace, siteVersion, platform, routerCount } }) {
  return (
    <Grid hasGutter>
      <GridItem>
        <Card>
          <CardTitle>
            <Title headingLevel="h2">{Labels.Details}</Title>
          </CardTitle>
          <CardBody>
            <DescriptionList>
              <DescriptionListGroup>
                <DescriptionListTerm>{Labels.Namespace}</DescriptionListTerm>
                <DescriptionListDescription>{nameSpace}</DescriptionListDescription>
                <DescriptionListTerm>{Labels.Platform}</DescriptionListTerm>
                <DescriptionListDescription>{platform}</DescriptionListDescription>
                <DescriptionListTerm>{Labels.SiteVersion}</DescriptionListTerm>
                <DescriptionListDescription>{siteVersion}</DescriptionListDescription>
                <DescriptionListTerm>{Labels.HA}</DescriptionListTerm>
                <DescriptionListDescription>{routerCount > 1 ? Labels.YES : Labels.NO}</DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
};

export default Details;
