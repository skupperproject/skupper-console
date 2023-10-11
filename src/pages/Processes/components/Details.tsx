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
  Label,
  Title,
  Tooltip,
  Truncate
} from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import ResourceIcon from '@core/components/ResourceIcon';
import { timeAgo } from '@core/utils/timeAgo';
import { ProcessGroupsRoutesPaths } from '@pages/ProcessGroups/ProcessGroups.enum';
import { ServicesRoutesPaths } from '@pages/Services/Services.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';
import { ProcessResponse } from 'API/REST.interfaces';

import { ProcessesLabels, QueriesProcesses } from '../Processes.enum';

const Details: FC<{ process: ProcessResponse; title?: string | JSX.Element }> = function ({
  process,
  title = ProcessesLabels.Details
}) {
  const {
    identity: processId,
    parent,
    parentName,
    imageName,
    groupName,
    groupIdentity,
    sourceHost,
    hostName,
    startTime,
    processBinding
  } = process;

  const { data: services } = useQuery([QueriesProcesses.GetServicesByProcessId, processId], () =>
    RESTApi.fetchServicesByProcess(processId)
  );

  return (
    <Card>
      <CardTitle>
        <Title headingLevel="h2">{title}</Title>
      </CardTitle>
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
                  <Link to={`${ProcessGroupsRoutesPaths.ProcessGroups}/${groupName}@${groupIdentity}`}>
                    {groupName}
                  </Link>
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
                <DescriptionListDescription>{hostName}</DescriptionListDescription>
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
                  <Tooltip content={imageName || ''}>
                    <Truncate content={imageName || ''} trailingNumChars={10} position={'middle'} />
                  </Tooltip>
                </DescriptionListDescription>
              </DescriptionListGroup>
            </GridItem>

            <GridItem span={6}>
              <DescriptionListGroup>
                <DescriptionListTerm>{ProcessesLabels.ExposedTitle}</DescriptionListTerm>
                <DescriptionListDescription>
                  {processBinding === 'bound' ? (
                    <Label color="blue">{ProcessesLabels.IsExposed}</Label>
                  ) : (
                    <Label color="gold">{ProcessesLabels.IsNotExposed}</Label>
                  )}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </GridItem>

            {!!services?.length && (
              <GridItem span={6}>
                <DescriptionListGroup>
                  <DescriptionListTerm>{ProcessesLabels.Services}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Flex>
                      {services.map((service) => (
                        <div key={service.identity}>
                          <ResourceIcon type="service" />
                          <Link
                            to={`${ServicesRoutesPaths.Services}/${service.name}@${service.identity}@${service.protocol}`}
                          >
                            {service.name}
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
