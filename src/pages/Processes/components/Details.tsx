import { FC } from 'react';

import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  Grid,
  GridItem,
  Tooltip,
  Truncate
} from '@patternfly/react-core';
import { Link } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import SkExposedCell from '@core/components/SkExposedCell';
import { timeAgo } from '@core/utils/timeAgo';
import { ComponentRoutesPaths } from '@pages/ProcessGroups/Components.enum';
import { ServicesRoutesPaths } from '@pages/Services/Services.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';
import { ProcessResponse } from '@sk-types/REST.interfaces';

import { ProcessesLabels } from '../Processes.enum';

interface DetailsProps {
  process: ProcessResponse;
  title?: string | JSX.Element;
}

const Details: FC<DetailsProps> = function ({ process }) {
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
    addresses
  } = process;

  return (
    <Card>
      <CardBody>
        <DescriptionList>
          <Grid hasGutter>
            <GridItem span={6}>
              <DescriptionListGroup>
                <DescriptionListTerm>{ProcessesLabels.Site}</DescriptionListTerm>
                <DescriptionListDescription>
                  <ResourceIcon type="site" />
                  <Link to={`${SitesRoutesPaths.Sites}/${parentName}@${parent}`}>{parentName}</Link>
                </DescriptionListDescription>
              </DescriptionListGroup>
            </GridItem>
            <GridItem span={6}>
              <DescriptionListGroup>
                <DescriptionListTerm>{ProcessesLabels.ProcessGroup}</DescriptionListTerm>
                <DescriptionListDescription>
                  <ResourceIcon type="component" />
                  <Link to={`${ComponentRoutesPaths.Components}/${groupName}@${groupIdentity}`}>{groupName}</Link>
                </DescriptionListDescription>
              </DescriptionListGroup>
            </GridItem>

            <GridItem span={6}>
              <DescriptionListGroup>
                <DescriptionListTerm>{ProcessesLabels.SourceIP}</DescriptionListTerm>
                <DescriptionListDescription>{sourceHost}</DescriptionListDescription>
              </DescriptionListGroup>
            </GridItem>

            <GridItem span={6}>
              <DescriptionListGroup>
                <DescriptionListTerm>{ProcessesLabels.Host}</DescriptionListTerm>
                <DescriptionListDescription>{hostName || '-'}</DescriptionListDescription>
              </DescriptionListGroup>
            </GridItem>

            <GridItem span={6}>
              <DescriptionListGroup>
                <DescriptionListTerm>{ProcessesLabels.Created}</DescriptionListTerm>
                <DescriptionListDescription>{timeAgo(startTime)}</DescriptionListDescription>
              </DescriptionListGroup>
            </GridItem>

            <GridItem span={6}>
              <DescriptionListGroup>
                <DescriptionListTerm>{ProcessesLabels.Image}</DescriptionListTerm>
                <DescriptionListDescription>
                  <Tooltip content={imageName}>
                    <Truncate content={imageName || '-'} trailingNumChars={10} position={'middle'} />
                  </Tooltip>
                </DescriptionListDescription>
              </DescriptionListGroup>
            </GridItem>

            <GridItem span={6}>
              <DescriptionListGroup>
                <DescriptionListTerm>{ProcessesLabels.ExposedTitle}</DescriptionListTerm>
                <DescriptionListDescription>
                  <SkExposedCell value={processBinding} />
                </DescriptionListDescription>
              </DescriptionListGroup>
            </GridItem>

            {!!addresses?.length && (
              <GridItem span={6}>
                <DescriptionListGroup>
                  <DescriptionListTerm>{ProcessesLabels.Services}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Flex>
                      {addresses.map((service) => (
                        <div key={service}>
                          <ResourceIcon type="service" />
                          <Link to={`${ServicesRoutesPaths.Services}/${service}`}>{service.split('@')[0]}</Link>
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
