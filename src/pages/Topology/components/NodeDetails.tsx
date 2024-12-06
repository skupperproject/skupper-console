import { FC, Fragment } from 'react';

import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Flex,
  FlexItem,
  Label,
  Split,
  SplitItem,
  Stack,
  StackItem
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Link } from 'react-router-dom';

import { PrometheusLabelsV2 } from '../../../config/prometheus';
import ResourceIcon from '../../../core/components/ResourceIcon';
import { ellipsisInTheMiddle } from '../../../core/utils/EllipsisInTheMiddle';
import { formatByteRate, formatBytes } from '../../../core/utils/formatBytes';
import { ProcessResponse } from '../../../types/REST.interfaces';
import { TopologyMetrics } from '../../../types/Topology.interfaces';
import { ProcessesLabels, ProcessesRoutesPaths } from '../../Processes/Processes.enum';
import { ComponentRoutesPaths } from '../../ProcessGroups/Components.enum';
import { MetricsLabels } from '../../shared/Metrics/Metrics.enum';
import { SitesRoutesPaths } from '../../Sites/Sites.enum';
import { TopologyLabels } from '../Topology.enum';

type Totals = {
  totalBytesIn: Record<string, number>;
  totalBytesOut: Record<string, number>;
  totalByteRateIn: Record<string, number>;
  totalByteRateOut: Record<string, number>;
};

const NodeDetails: FC<{ data: ProcessResponse[]; metrics: TopologyMetrics }> = function ({ data, metrics }) {
  const names = data.map((itemSelected) => itemSelected.name);

  const initialTotals: Totals = {
    totalBytesIn: {},
    totalBytesOut: {},
    totalByteRateIn: {},
    totalByteRateOut: {}
  };

  const bytes = metrics?.sourceToDestBytes.reduce((acc, { metric, value }) => {
    if (names.includes(metric[PrometheusLabelsV2.SourceProcessName])) {
      acc.totalBytesOut[metric[PrometheusLabelsV2.SourceProcessName]] =
        (acc.totalBytesOut[metric[PrometheusLabelsV2.SourceProcessName]] || 0) + Number(value[1]);
    }

    if (names.includes(metric[PrometheusLabelsV2.DestProcessName])) {
      acc.totalBytesIn[metric[PrometheusLabelsV2.DestProcessName]] =
        (acc.totalBytesIn[metric[PrometheusLabelsV2.DestProcessName]] || 0) + Number(value[1]);
    }

    return acc;
  }, initialTotals);

  const byteRate = metrics?.sourceToDestByteRate.reduce((acc, { metric, value }) => {
    if (names.includes(metric[PrometheusLabelsV2.SourceProcessName])) {
      acc.totalByteRateOut[metric[PrometheusLabelsV2.SourceProcessName]] =
        (acc.totalByteRateOut[metric[PrometheusLabelsV2.SourceProcessName]] || 0) + Number(value[1]);
    }

    if (names.includes(metric[PrometheusLabelsV2.DestProcessName])) {
      acc.totalByteRateIn[metric[PrometheusLabelsV2.DestProcessName]] =
        (acc.totalByteRateIn[metric[PrometheusLabelsV2.DestProcessName]] || 0) + Number(value[1]);
    }

    return acc;
  }, initialTotals);

  const byteRateInValues = Object.values(byteRate.totalByteRateIn);
  const byteRateOutValues = Object.values(byteRate.totalByteRateOut);

  const totalBytesInSum = Object.values(bytes.totalBytesIn).reduce((acc, val) => acc + val, 0);
  const totalBytesOutSum = Object.values(bytes.totalBytesOut).reduce((acc, val) => acc + val, 0);
  const totalByteRateInSum = byteRateInValues.reduce((acc, val) => acc + val, 0);
  const totalByteRateOutSum = byteRateOutValues.reduce((acc, val) => acc + val, 0);

  const avgByteRateInSum = totalByteRateInSum / (byteRateInValues.length || 1);
  const avgByteRateOutSum = totalByteRateOutSum / (byteRateOutValues.length || 1);

  return (
    <>
      <Card isPlain>
        <CardHeader>
          <CardTitle>{TopologyLabels.Summary}</CardTitle>
        </CardHeader>
        <CardBody>
          <Table borders={false} variant="compact">
            <Thead noWrap>
              <Tr>
                <Th aria-label="metric" />
                <Th>{MetricsLabels.TrafficReceived}</Th>
                <Th>{MetricsLabels.TrafficSent}</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>
                  <b>{ProcessesLabels.ByteRate}</b>
                </Td>
                <Td>{formatByteRate(totalByteRateInSum)}</Td>
                <Td>{formatByteRate(totalByteRateOutSum)}</Td>
              </Tr>

              <Tr>
                <Td>
                  <b>Avg. {ProcessesLabels.ByteRate}</b>
                </Td>
                <Td>{formatByteRate(avgByteRateInSum)}</Td>
                <Td>{formatByteRate(avgByteRateOutSum)}</Td>
              </Tr>

              <Tr>
                <Td>
                  <b>{ProcessesLabels.Bytes}</b>
                </Td>
                <Td>{formatBytes(totalBytesInSum)}</Td>
                <Td>{formatBytes(totalBytesOutSum)}</Td>
              </Tr>
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      <Card isPlain>
        <CardBody>
          <Stack hasGutter>
            {data.map((itemSelected) => {
              const goToLink = `${ProcessesRoutesPaths.Processes}/${itemSelected.name}@${itemSelected.identity}`;

              return (
                <StackItem key={itemSelected.identity}>
                  <Card>
                    <CardHeader>
                      <Flex>
                        <FlexItem>
                          <CardTitle title={itemSelected.name}>
                            <ResourceIcon type="process" />
                            {ellipsisInTheMiddle(itemSelected.name, { rightPartLength: 10 })}
                          </CardTitle>
                        </FlexItem>
                        <FlexItem>
                          <Label variant="outline" color="teal">
                            {itemSelected.processBinding}
                          </Label>
                        </FlexItem>
                      </Flex>
                    </CardHeader>

                    <CardBody>
                      <Table borders={false} variant="compact">
                        <Thead noWrap>
                          <Tr>
                            <Th aria-label="metric" />
                            <Th>{MetricsLabels.TrafficReceived}</Th>
                            <Th>{MetricsLabels.TrafficSent}</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          <Tr>
                            <Th>
                              <b>{ProcessesLabels.ByteRate}</b>
                            </Th>
                            <Td>{formatBytes(byteRate?.totalByteRateIn[itemSelected.name] || 0)}</Td>
                            <Td>{formatBytes(byteRate?.totalByteRateOut[itemSelected.name] || 0)}</Td>
                          </Tr>
                          <Tr>
                            <Th>
                              <b>{ProcessesLabels.Bytes}</b>
                            </Th>
                            <Td>{formatBytes(bytes?.totalBytesIn[itemSelected.name] || 0)}</Td>
                            <Td>{formatBytes(bytes?.totalBytesOut[itemSelected.name] || 0)}</Td>
                          </Tr>
                        </Tbody>
                      </Table>

                      <DescriptionList>
                        <DescriptionListGroup />
                        <DescriptionListGroup>
                          <DescriptionListTerm>Resources</DescriptionListTerm>

                          <DescriptionListDescription>
                            <Flex direction={{ default: 'column' }}>
                              <FlexItem>
                                <ResourceIcon type="site" />
                                <Link
                                  to={`${SitesRoutesPaths.Sites}/${itemSelected.parentName}@${itemSelected.parent}`}
                                >
                                  {itemSelected.parentName}
                                </Link>
                              </FlexItem>

                              <FlexItem>
                                <ResourceIcon type="component" />
                                <Link
                                  to={`${ComponentRoutesPaths.Components}/${itemSelected.groupName}@${itemSelected.groupIdentity}`}
                                >
                                  {itemSelected.groupName}
                                </Link>
                              </FlexItem>

                              <FlexItem>
                                {itemSelected?.addresses?.map((service) => (
                                  <Fragment key={service}>
                                    <ResourceIcon type="service" />
                                    <Link
                                      to={`${ComponentRoutesPaths.Components}/${itemSelected.groupName}@${itemSelected.groupIdentity}`}
                                    >
                                      {service.split('@')[0]}
                                    </Link>
                                  </Fragment>
                                ))}
                              </FlexItem>
                            </Flex>
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                      </DescriptionList>
                    </CardBody>

                    <Divider />

                    <CardFooter>
                      <Split hasGutter>
                        <SplitItem>
                          <Link to={`${goToLink}?type=${ProcessesLabels.Details}`}>
                            {TopologyLabels.TopologyModalAction1}
                          </Link>
                        </SplitItem>

                        <SplitItem>
                          <Link to={`${goToLink}?type=${ProcessesLabels.ProcessPairs}`}>
                            {TopologyLabels.TopologyModalAction2}
                          </Link>
                        </SplitItem>

                        <SplitItem>
                          <Link to={`${goToLink}?type=${ProcessesLabels.Overview}`}>
                            {TopologyLabels.TopologyModalAction3}
                          </Link>
                        </SplitItem>
                      </Split>
                    </CardFooter>
                  </Card>
                </StackItem>
              );
            })}
          </Stack>
        </CardBody>
      </Card>
    </>
  );
};

export default NodeDetails;
