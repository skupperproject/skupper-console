import { FC, Fragment } from 'react';

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
  FlexItem,
  Stack,
  StackItem,
  Title
} from '@patternfly/react-core';
import { Link } from 'react-router-dom';

import { ProcessPairsResponse, ProcessResponse } from '@API/REST.interfaces';
import ResourceIcon from '@core/components/ResourceIcon';
import SkExposureCell from '@core/components/SkExposureCell';
import { formatByteRate, formatBytes } from '@core/utils/formatBytes';
import { formatLatency } from '@core/utils/formatLatency';
import { ProcessesLabels, ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { ComponentRoutesPaths } from '@pages/ProcessGroups/ProcessGroups.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';

import { TopologyLabels } from '../Topology.enum';
import { NodeOrEdgeListProps, TopologyMetrics } from '../Topology.interfaces';

const NodeOrEdgeList: FC<NodeOrEdgeListProps> = function ({ ids, items, metrics, modalType }) {
  const filteredItems = items.filter(({ identity }) => ids?.includes(identity));

  return (
    <div style={{ height: 0 }}>
      {modalType === 'process' ? (
        <ProcessesGrouped data={filteredItems as ProcessResponse[]} />
      ) : (
        <ProcessesPairsGrouped data={filteredItems as ProcessPairsResponse[]} metrics={metrics} />
      )}
    </div>
  );
};

export default NodeOrEdgeList;

const ProcessesGrouped: FC<{ data: ProcessResponse[] }> = function ({ data }) {
  return (
    <DataList aria-label="">
      {data.map((itemSelected) => {
        const goToLink = `${ProcessesRoutesPaths.Processes}/${itemSelected.name}@${itemSelected.identity}`;

        return (
          <DataListItem key={itemSelected.identity}>
            <DataListItemRow>
              <DataListItemCells
                dataListCells={[
                  <DataListCell key="primary-content">
                    <DescriptionList>
                      <DescriptionListGroup>
                        <DescriptionListDescription>
                          <Title headingLevel="h6">
                            <ResourceIcon type="process" />
                            {itemSelected.name}
                          </Title>
                          <small>
                            {itemSelected.sourceHost}/{itemSelected.hostName}
                          </small>
                        </DescriptionListDescription>
                      </DescriptionListGroup>

                      <DescriptionListGroup>
                        <DescriptionListDescription>
                          <SkExposureCell value={itemSelected.processBinding} />
                        </DescriptionListDescription>
                      </DescriptionListGroup>

                      <DescriptionListGroup>
                        <DescriptionListDescription>
                          <Flex direction={{ default: 'column' }}>
                            <FlexItem>
                              <ResourceIcon type="site" />
                              <Link to={`${SitesRoutesPaths.Sites}/${itemSelected.parentName}@${itemSelected.parent}`}>
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
                  </DataListCell>,
                  <DataListAction
                    key={`actions-${itemSelected.identity}`}
                    aria-labelledby={`full-page-item1 full-page-action-${itemSelected.identity}`}
                    id={`full-page-action-${itemSelected.identity}`}
                    aria-label={`Actions ${itemSelected.identity}`}
                  >
                    <Stack>
                      <StackItem>
                        <Link to={`${goToLink}?type=${ProcessesLabels.Details}`}>
                          {TopologyLabels.TopologyModalAction1}
                        </Link>
                      </StackItem>

                      <StackItem>
                        <Link to={`${goToLink}?type=${ProcessesLabels.ProcessPairs}`}>
                          {TopologyLabels.TopologyModalAction2}
                        </Link>
                      </StackItem>

                      <StackItem>
                        <Link to={`${goToLink}?type=${ProcessesLabels.Overview}`}>
                          {TopologyLabels.TopologyModalAction3}
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
