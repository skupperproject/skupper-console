import React, { FC } from 'react';

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
  Title
} from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import ResourceIcon from '@core/components/ResourceIcon';
import { AddressesRoutesPaths } from '@pages/Addresses/Addresses.enum';
import { ProcessGroupsRoutesPaths } from '@pages/ProcessGroups/ProcessGroups.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';
import { RESTApi } from 'API/REST';
import { ProcessResponse } from 'API/REST.interfaces';

import { ProcessesLabels } from '../Processes.enum';
import { QueriesProcesses } from '../services/services.enum';

const ProcessDescription: FC<{ process: ProcessResponse; title: string | JSX.Element }> = function ({
  process,
  title
}) {
  const { identity, parent, parentName, imageName, groupName, groupIdentity, sourceHost, hostName } =
    process as ProcessResponse;

  const { data: addresses } = useQuery([QueriesProcesses.GetAddressesByProcessId, identity], () =>
    RESTApi.fetchAddressesByProcess(identity)
  );

  if (!addresses) {
    return null;
  }

  return (
    <Card isFullHeight isRounded>
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
                  <Link to={`${SitesRoutesPaths.Sites}/${parent}`}>{parentName}</Link>
                </DescriptionListDescription>
              </DescriptionListGroup>
            </GridItem>
            <GridItem span={6}>
              <DescriptionListGroup>
                <DescriptionListTerm>{ProcessesLabels.ProcessGroup}</DescriptionListTerm>
                <DescriptionListDescription>
                  <ResourceIcon type="service" />
                  <Link to={`${ProcessGroupsRoutesPaths.ProcessGroups}/${groupIdentity}`}>{groupName}</Link>
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
                <DescriptionListTerm>{ProcessesLabels.Image}</DescriptionListTerm>
                <DescriptionListDescription>{imageName}</DescriptionListDescription>
              </DescriptionListGroup>
            </GridItem>

            {!!addresses.length && (
              <GridItem span={6}>
                <DescriptionListGroup>
                  <DescriptionListTerm>{ProcessesLabels.Addresses}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Flex>
                      {addresses.map((address) => (
                        <div key={address.identity}>
                          <ResourceIcon type="address" />
                          <Link
                            to={`${AddressesRoutesPaths.Addresses}/${address.name}@${address.identity}@${address.protocol}`}
                          >
                            {address.name}
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

export default ProcessDescription;
