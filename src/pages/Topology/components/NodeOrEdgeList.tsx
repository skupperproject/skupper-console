import { FC, Fragment } from 'react';

import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  DataList,
  DataListAction,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
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

import { FlowDirection } from '@API/REST.enum';
import { ProcessPairsResponse, ProcessResponse } from '@API/REST.interfaces';
import ResourceIcon from '@core/components/ResourceIcon';
import SkExposureCell from '@core/components/SkExposureCell';
import { ellipsisInTheMiddle } from '@core/utils/EllipsisInTheMiddle';
import { formatByteRate, formatBytes } from '@core/utils/formatBytes';
import { formatLatency } from '@core/utils/formatLatency';
import { ProcessesLabels, ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { ComponentRoutesPaths } from '@pages/ProcessGroups/ProcessGroups.enum';
import { MetricsLabels } from '@pages/shared/Metrics/Metrics.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';

import { TopologyLabels } from '../Topology.enum';
import { NodeOrEdgeListProps, TopologyMetrics } from '../Topology.interfaces';

const NodeOrEdgeList: FC<NodeOrEdgeListProps> = function ({ ids, items, metrics, modalType }) {
  const filteredItems = items.filter(({ identity }) => ids?.includes(identity));

  return (
    <div style={{ height: 0 }}>
      {modalType === 'process' ? (
        <ProcessesGrouped data={filteredItems as ProcessResponse[]} metrics={metrics} />
      ) : (
        <ProcessesPairsGrouped data={filteredItems as ProcessPairsResponse[]} metrics={metrics} />
      )}
    </div>
  );
};

export default NodeOrEdgeList;

type Totals = {
  totalBytesIn: Record<string, number>;
  totalBytesOut: Record<string, number>;
  totalByteRateIn: Record<string, number>;
  totalByteRateOut: Record<string, number>;
};

const ProcessesGrouped: FC<{ data: ProcessResponse[]; metrics: TopologyMetrics }> = function ({ data, metrics }) {
  const names = data.map((itemSelected) => itemSelected.name);

  const initialTotals: Totals = {
    totalBytesIn: {},
    totalBytesOut: {},
    totalByteRateIn: {},
    totalByteRateOut: {}
  };

  const bytes = metrics?.bytesByProcessPairs.reduce((acc, { metric, value }) => {
    if (names.includes(metric.sourceProcess) && metric.direction === FlowDirection.Incoming) {
      acc.totalBytesOut[metric.sourceProcess] = (acc.totalBytesOut[metric.sourceProcess] || 0) + Number(value[1]);
    }

    if (names.includes(metric.destProcess) && metric.direction === FlowDirection.Incoming) {
      acc.totalBytesIn[metric.destProcess] = (acc.totalBytesIn[metric.destProcess] || 0) + Number(value[1]);
    }

    return acc;
  }, initialTotals);

  const byteRates = metrics?.byteRateByProcessPairs.reduce((acc, { metric, value }) => {
    if (names.includes(metric.sourceProcess) && metric.direction === FlowDirection.Incoming) {
      acc.totalByteRateOut[metric.sourceProcess] = (acc.totalByteRateOut[metric.sourceProcess] || 0) + Number(value[1]);
    }

    if (names.includes(metric.destProcess) && metric.direction === FlowDirection.Incoming) {
      acc.totalByteRateIn[metric.destProcess] = (acc.totalByteRateIn[metric.destProcess] || 0) + Number(value[1]);
    }

    return acc;
  }, initialTotals);

  const byteRateInValues = Object.values(byteRates.totalByteRateIn);
  const byteRateOutValues = Object.values(byteRates.totalByteRateOut);

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
                          <SkExposureCell value={itemSelected.processBinding} />
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
                            <Td>{formatBytes(byteRates?.totalByteRateIn[itemSelected.name] || 0)}</Td>
                            <Td>{formatBytes(byteRates?.totalByteRateOut[itemSelected.name] || 0)}</Td>
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

const ProcessesPairsGrouped: FC<{ data: ProcessPairsResponse[]; metrics: TopologyMetrics | null }> = function ({
  data,
  metrics
}) {
  return (
    <DataList aria-label="">
      {data.map((itemSelected) => {
        const sourceName = itemSelected.sourceName;
        const destinationName = itemSelected.destinationName;

        let bytes = 0;
        metrics?.bytesByProcessPairs.forEach(({ metric, value }) => {
          if (metric.sourceProcess === sourceName && metric.destProcess === destinationName) {
            bytes = Number(value[1]);
          }

          return metric;
        });

        let byteRate = 0;
        metrics?.byteRateByProcessPairs.forEach(({ metric, value }) => {
          if (metric.sourceProcess === sourceName && metric.destProcess === destinationName) {
            byteRate = Number(value[1]);
          }

          return metric;
        });

        let latency = 0;
        metrics?.latencyByProcessPairs.forEach(({ metric, value }) => {
          if (metric.sourceProcess === sourceName && metric.destProcess === destinationName) {
            latency = Number(value[1]);
          }

          return metric;
        });

        return (
          <DataListItem key={itemSelected.identity}>
            <DataListItemRow>
              <DataListItemCells
                dataListCells={[
                  <DataListCell key="primary-content">
                    <DescriptionList>
                      <DescriptionListGroup>
                        <DescriptionListTerm>{TopologyLabels.Source}</DescriptionListTerm>
                        <DescriptionListDescription>
                          <ResourceIcon type="process" />
                          <Link
                            to={`${ProcessesRoutesPaths.Processes}/${itemSelected?.sourceName}@${itemSelected?.sourceId}`}
                          >
                            {itemSelected.sourceName}
                          </Link>
                        </DescriptionListDescription>
                      </DescriptionListGroup>

                      <DescriptionListGroup>
                        <DescriptionListTerm>{TopologyLabels.Destination}</DescriptionListTerm>
                        <DescriptionListDescription>
                          <ResourceIcon type="process" />
                          <Link
                            to={`${ProcessesRoutesPaths.Processes}/${itemSelected?.destinationName}@${itemSelected?.destinationId}`}
                          >
                            {itemSelected.destinationName}
                          </Link>
                        </DescriptionListDescription>
                      </DescriptionListGroup>

                      {!!itemSelected.protocol && (
                        <DescriptionListGroup>
                          <DescriptionListTerm>{TopologyLabels.Protocol}</DescriptionListTerm>
                          <DescriptionListDescription>{itemSelected.protocol}</DescriptionListDescription>
                        </DescriptionListGroup>
                      )}

                      <Flex>
                        {!!bytes && (
                          <DescriptionListGroup>
                            <DescriptionListTerm>{TopologyLabels.CheckboxShowTotalBytes}</DescriptionListTerm>
                            <DescriptionListDescription>{`${formatBytes(bytes)}`}</DescriptionListDescription>
                          </DescriptionListGroup>
                        )}

                        {!!byteRate && (
                          <DescriptionListGroup>
                            <DescriptionListTerm>{TopologyLabels.CheckboxShowCurrentByteRate}</DescriptionListTerm>
                            <DescriptionListDescription>{`${formatByteRate(byteRate)}`}</DescriptionListDescription>
                          </DescriptionListGroup>
                        )}

                        {!!latency && (
                          <DescriptionListGroup>
                            <DescriptionListTerm>{TopologyLabels.CheckboxShowLatency}</DescriptionListTerm>
                            <DescriptionListDescription>{`${formatLatency(latency)}`}</DescriptionListDescription>
                          </DescriptionListGroup>
                        )}
                      </Flex>
                    </DescriptionList>
                  </DataListCell>,
                  <DataListAction
                    key={`actions-${itemSelected.identity}`}
                    id={`full-page-action-${itemSelected.identity}`}
                    aria-labelledby={`full-page-item1 full-page-action-${itemSelected.identity}`}
                    aria-label={`Actions ${itemSelected.identity}`}
                  >
                    <Stack>
                      <StackItem>
                        <Link
                          to={`${ProcessesRoutesPaths.Processes}/${itemSelected.sourceName}@${itemSelected.sourceId}/${ProcessesLabels.ProcessPairs}@${itemSelected.identity}@${itemSelected.protocol}`}
                        >
                          {TopologyLabels.TopologyModalAction2}
                        </Link>
                      </StackItem>
                    </Stack>
                  </DataListAction>
                ]}
              />
            </DataListItemRow>
          </DataListItem>
        );
      })}
    </DataList>
  );
};
