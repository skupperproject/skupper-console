import { FC } from 'react';

import {
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
import { Link } from 'react-router-dom';

import { ProcessPairsResponse } from '@API/REST.interfaces';
import ResourceIcon from '@core/components/ResourceIcon';
import { formatByteRate, formatBytes } from '@core/utils/formatBytes';
import { formatLatency } from '@core/utils/formatLatency';
import { ProcessesLabels, ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';

import { TopologyLabels } from '../Topology.enum';
import { TopologyMetrics } from '../Topology.interfaces';

const EdgeDetails: FC<{ data: ProcessPairsResponse[]; metrics: TopologyMetrics | null }> = function ({
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

export default EdgeDetails;
