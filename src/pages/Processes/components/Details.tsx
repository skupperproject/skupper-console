import { FC, ReactElement } from 'react';

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
  Title,
  Tooltip,
  Truncate
} from '@patternfly/react-core';
import { Link } from 'react-router-dom';

import { DEFAULT_COMPLEX_STRING_SEPARATOR, EMPTY_VALUE_SYMBOL } from '../../../config/app';
import { Labels } from '../../../config/labels';
import ResourceIcon from '../../../core/components/ResourceIcon';
import { formatLocalizedDateTime } from '../../../core/utils/formatLocalizedDateTime';
import { ProcessResponse } from '../../../types/REST.interfaces';
import { ComponentRoutesPaths } from '../../Components/Components.enum';
import { ServicesRoutesPaths } from '../../Services/Services.enum';
import { SitesRoutesPaths } from '../../Sites/Sites.enum';

interface DetailsProps {
  process: ProcessResponse;
  title?: string | ReactElement;
}

const Details: FC<DetailsProps> = function ({ process, title }) {
  const {
    parent,
    parentName,
    imageName,
    groupName,
    groupIdentity,
    sourceHost,
    hostName,
    startTime,
    processBinding,
    services
  } = process;

  return (
    <Card>
      {title && (
        <CardTitle>
          <Title headingLevel="h1">{title}</Title>
        </CardTitle>
      )}
      <CardBody>
        <DescriptionList>
          <Grid hasGutter>
            <GridItem span={6}>
              <DescriptionListGroup>
                <DescriptionListTerm>{Labels.Site}</DescriptionListTerm>
                <DescriptionListDescription>
                  <ResourceIcon type="site" />
                  <Link to={`${SitesRoutesPaths.Sites}/${parentName}@${parent}`}>{parentName}</Link>
                </DescriptionListDescription>
              </DescriptionListGroup>
            </GridItem>
            <GridItem span={6}>
              <DescriptionListGroup>
                <DescriptionListTerm>{Labels.Component}</DescriptionListTerm>
                <DescriptionListDescription>
                  <ResourceIcon type="component" />
                  <Link to={`${ComponentRoutesPaths.Components}/${groupName}@${groupIdentity}`}>{groupName}</Link>
                </DescriptionListDescription>
              </DescriptionListGroup>
            </GridItem>

            <GridItem span={6}>
              <DescriptionListGroup>
                <DescriptionListTerm>{Labels.SourceIP}</DescriptionListTerm>
                <DescriptionListDescription>{sourceHost || EMPTY_VALUE_SYMBOL}</DescriptionListDescription>
              </DescriptionListGroup>
            </GridItem>

            <GridItem span={6}>
              <DescriptionListGroup>
                <DescriptionListTerm>{Labels.Node}</DescriptionListTerm>
                <DescriptionListDescription>{hostName || EMPTY_VALUE_SYMBOL}</DescriptionListDescription>
              </DescriptionListGroup>
            </GridItem>

            <GridItem span={6}>
              <DescriptionListGroup>
                <DescriptionListTerm>{Labels.Created}</DescriptionListTerm>
                <DescriptionListDescription>{formatLocalizedDateTime(startTime)}</DescriptionListDescription>
              </DescriptionListGroup>
            </GridItem>

            <GridItem span={6}>
              <DescriptionListGroup>
                <DescriptionListTerm>{Labels.Image}</DescriptionListTerm>
                <DescriptionListDescription>
                  <Tooltip content={imageName}>
                    <Truncate content={imageName || EMPTY_VALUE_SYMBOL} trailingNumChars={10} position={'middle'} />
                  </Tooltip>
                </DescriptionListDescription>
              </DescriptionListGroup>
            </GridItem>

            <GridItem span={6}>
              <DescriptionListGroup>
                <DescriptionListTerm>{Labels.BindingState}</DescriptionListTerm>
                <DescriptionListDescription>{processBinding}</DescriptionListDescription>
              </DescriptionListGroup>
            </GridItem>

            {!!services?.length && (
              <GridItem span={6}>
                <DescriptionListGroup>
                  <DescriptionListTerm>{Labels.RoutingKeys}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Flex>
                      {services.map((service) => (
                        <div key={service}>
                          <ResourceIcon type="service" />
                          <Link to={`${ServicesRoutesPaths.Services}/${service}`}>
                            {service.split(DEFAULT_COMPLEX_STRING_SEPARATOR)[0]}
                          </Link>
                        </div>
                      ))}
                    </Flex>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </GridItem>
            )}
          </Grid>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

export default Details;
