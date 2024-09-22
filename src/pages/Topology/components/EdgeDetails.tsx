import { FC } from 'react';

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
  Stack,
  StackItem
} from '@patternfly/react-core';
import { Table, Tbody, Td, Tr } from '@patternfly/react-table';
import { Link } from 'react-router-dom';

import { PrometheusLabelsV2 } from '@config/prometheus';
import ResourceIcon from '@core/components/ResourceIcon';
import { formatByteRate, formatBytes } from '@core/utils/formatBytes';
import { formatLatency } from '@core/utils/formatLatency';
import { ProcessesLabels, ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { ProcessPairsResponse } from '@sk-types/REST.interfaces';
import { TopologyMetrics } from '@sk-types/Topology.interfaces';

import { TopologyLabels } from '../Topology.enum';

const EdgeDetails: FC<{ data: ProcessPairsResponse[]; metrics: TopologyMetrics }> = function ({ data, metrics }) {
  const sourceNames = data.map((itemSelected) => itemSelected.sourceName);
  const destinationNames = data.map((itemSelected) => itemSelected.destinationName);

  const bytes = metrics.sourceToDestBytes.reduce(
    (acc, { metric, value }) => {
      const id = `${metric[PrometheusLabelsV2.SourceProcessName]}-to-${metric[PrometheusLabelsV2.DestProcessName]}`;

      if (
        sourceNames.includes(metric[PrometheusLabelsV2.SourceProcessName]) &&
        destinationNames.includes(metric[PrometheusLabelsV2.DestProcessName])
      ) {
        acc[id] = (acc[id] || 0) + Number(value[1]);
      }

      return acc;
    },
    {} as Record<string, number>
  );

  const byteRate = metrics.sourceToDestByteRate.reduce(
    (acc, { metric, value }) => {
      const id = `${metric[PrometheusLabelsV2.SourceProcessName]}-to-${metric[PrometheusLabelsV2.DestProcessName]}`;

      if (
        sourceNames.includes(metric[PrometheusLabelsV2.SourceProcessName]) &&
        destinationNames.includes(metric[PrometheusLabelsV2.DestProcessName])
      ) {
        acc[id] = (acc[id] || 0) + Number(value[1]);
      }

      return acc;
    },
    {} as Record<string, number>
  );

  const latency = metrics.latencyByProcessPairs.reduce(
    (acc, { metric, value }) => {
      const id = `${metric[PrometheusLabelsV2.SourceProcessName]}-to-${metric[PrometheusLabelsV2.DestProcessName]}`;

      if (
        sourceNames.includes(metric[PrometheusLabelsV2.SourceProcessName]) &&
        destinationNames.includes(metric[PrometheusLabelsV2.DestProcessName])
      ) {
        acc[id] = (acc[id] || 0) + Number(value[1]);
      }

      return acc;
    },
    {} as Record<string, number>
  );

  const totalByteRateSum = Object.values(byteRate).reduce((acc, val) => acc + val, 0);
  const totalBytesSum = Object.values(bytes).reduce((acc, val) => acc + val, 0);
  const totalLatencySum = Object.values(latency).reduce((acc, val) => acc + val, 0);

  return (
    <>
      <Card isPlain>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardBody>
          <Table borders={false} variant="compact">
            <Tbody>
              <Tr>
                <Td>
                  <b>{ProcessesLabels.ByteRate}</b>
                </Td>
                <Td>{formatByteRate(totalByteRateSum)}</Td>
              </Tr>

              <Tr>
                <Td>
                  <b>{ProcessesLabels.Latency}</b>
                </Td>
                <Td>{formatLatency(totalLatencySum)}</Td>
              </Tr>

              <Tr>
                <Td>
                  <b>{ProcessesLabels.Bytes}</b>
                </Td>
                <Td>{formatBytes(totalBytesSum)}</Td>
              </Tr>
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      <DataList aria-label="">
        {data.map((itemSelected) => (
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
                            <DescriptionListDescription>{`${formatBytes(bytes[`${itemSelected.sourceName}-to-${itemSelected.destinationName}`] || 0)}`}</DescriptionListDescription>
                          </DescriptionListGroup>
                        )}

                        {!!byteRate && (
                          <DescriptionListGroup>
                            <DescriptionListTerm>{TopologyLabels.CheckboxShowCurrentByteRate}</DescriptionListTerm>
                            <DescriptionListDescription>{`${formatByteRate(byteRate[`${itemSelected.sourceName}-to-${itemSelected.destinationName}`] || 0)}`}</DescriptionListDescription>
                          </DescriptionListGroup>
                        )}

                        {!!latency && (
                          <DescriptionListGroup>
                            <DescriptionListTerm>{TopologyLabels.CheckboxShowLatency}</DescriptionListTerm>
                            <DescriptionListDescription>{`${formatLatency(latency[`${itemSelected.sourceName}-to-${itemSelected.destinationName}`] || 0)}`}</DescriptionListDescription>
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
                          to={`${ProcessesRoutesPaths.Processes}/${itemSelected.sourceName}@${itemSelected.sourceId}/${ProcessesLabels.ProcessPairs}@${itemSelected.identity}`}
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
        ))}
      </DataList>
    </>
  );
};

export default EdgeDetails;
