import { FC, Fragment } from 'react';

import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Link } from 'react-router-dom';

import { PrometheusLabelsV2 } from '@config/prometheus';
import ResourceIcon from '@core/components/ResourceIcon';
import SkExposedCell from '@core/components/SkExposedCell';
import { ellipsisInTheMiddle } from '@core/utils/EllipsisInTheMiddle';
import { formatByteRate, formatBytes } from '@core/utils/formatBytes';
import { ProcessesLabels, ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { ComponentRoutesPaths } from '@pages/ProcessGroups/ProcessGroups.enum';
import { MetricsLabels } from '@pages/shared/Metrics/Metrics.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';
import { ProcessResponse } from '@sk-types/REST.interfaces';
import { TopologyMetrics } from '@sk-types/Topology.interfaces';

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
    if (names.includes(metric[PrometheusLabelsV2.SourceProcess])) {
      acc.totalBytesOut[metric[PrometheusLabelsV2.SourceProcess]] =
        (acc.totalBytesOut[metric[PrometheusLabelsV2.SourceProcess]] || 0) + Number(value[1]);
    }

    if (names.includes(metric[PrometheusLabelsV2.DestProcess])) {
      acc.totalBytesIn[metric[PrometheusLabelsV2.DestProcess]] =
        (acc.totalBytesIn[metric[PrometheusLabelsV2.DestProcess]] || 0) + Number(value[1]);
    }

    return acc;
  }, initialTotals);

  const byteRate = metrics?.sourceToDestByteRate.reduce((acc, { metric, value }) => {
    if (names.includes(metric[PrometheusLabelsV2.SourceProcess])) {
      acc.totalByteRateOut[metric[PrometheusLabelsV2.SourceProcess]] =
        (acc.totalByteRateOut[metric[PrometheusLabelsV2.SourceProcess]] || 0) + Number(value[1]);
    }

    if (names.includes(metric[PrometheusLabelsV2.DestProcess])) {
      acc.totalByteRateIn[metric[PrometheusLabelsV2.DestProcess]] =
        (acc.totalByteRateIn[metric[PrometheusLabelsV2.DestProcess]] || 0) + Number(value[1]);
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
          <CardTitle>Summary</CardTitle>
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
                <StackItem key={itemSelected.identity} className="pf-u-v5-mb-md">
                  <Card isFlat>
                    <CardBody>
                      <Flex>
                        <FlexItem>
                          <Title headingLevel="h3" title={itemSelected.name}>
                            <ResourceIcon type="process" />
                            {ellipsisInTheMiddle(itemSelected.name, { rightPartLength: 10 })}
                          </Title>
                        </FlexItem>
                        <FlexItem>
                          <SkExposedCell value={itemSelected.processBinding} />
                        </FlexItem>
                      </Flex>

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
                                  to={`${ComponentRoutesPaths.ProcessGroups}/${itemSelected.groupName}@${itemSelected.groupIdentity}`}
                                >
                                  {itemSelected.groupName}
                                </Link>
                              </FlexItem>

                              <FlexItem>
                                {itemSelected?.addresses?.map((service) => (
                                  <Fragment key={service}>
                                    <ResourceIcon type="service" />
                                    <Link
                                      to={`${ComponentRoutesPaths.ProcessGroups}/${itemSelected.groupName}@${itemSelected.groupIdentity}`}
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
