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
  FlexItem,
  Stack,
  StackItem,
  Title
} from '@patternfly/react-core';
import { Link } from 'react-router-dom';

import { ProcessPairsResponse, ProcessResponse } from '@API/REST.interfaces';
import LinkCell from '@core/components/LinkCell';
import ResourceIcon from '@core/components/ResourceIcon';
import { ProcessesLabels, ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { ComponentRoutesPaths } from '@pages/ProcessGroups/ProcessGroups.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';

import { TopologyLabels } from '../Topology.enum';
import { NodeOrEdgeListProps } from '../Topology.interfaces';

const NodeOrEdgeList: FC<NodeOrEdgeListProps> = function ({ ids, items, modalType }) {
  const filteredItems = items.filter(({ identity }) => ids?.includes(identity));

  return (
    <div style={{ height: 0 }}>
      {modalType === 'process' ? (
        <ProcessesGrouped data={filteredItems as ProcessResponse[]} />
      ) : (
        <ProcessesPairsGrouped data={filteredItems as ProcessPairsResponse[]} />
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
                    <Flex spaceItems={{ default: 'spaceItemsMd' }} direction={{ default: 'column' }}>
                      <FlexItem>
                        <Title headingLevel="h6">
                          <ResourceIcon type="process" />
                          {itemSelected.name}
                        </Title>
                        <small>
                          {itemSelected.sourceHost}/{itemSelected.hostName}
                        </small>
                      </FlexItem>

                      <LinkCell
                        type="site"
                        fitContent={true}
                        value={itemSelected.parentName}
                        data={itemSelected}
                        link={`${SitesRoutesPaths.Sites}/${itemSelected.parentName}@${itemSelected.parent}`}
                      />

                      <LinkCell
                        type="component"
                        fitContent={true}
                        value={itemSelected.groupName}
                        data={itemSelected}
                        link={`${ComponentRoutesPaths.ProcessGroups}/${itemSelected.groupName}@${itemSelected.groupIdentity}`}
                      />

                      {itemSelected?.addresses?.map((service) => (
                        <LinkCell
                          key={service}
                          type="service"
                          fitContent={true}
                          value={service.split('@')[0]}
                          data={service}
                          link={`${ComponentRoutesPaths.ProcessGroups}/${itemSelected.groupName}@${itemSelected.groupIdentity}`}
                        />
                      ))}
                    </Flex>
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

const ProcessesPairsGrouped: FC<{ data: ProcessPairsResponse[] }> = function ({ data }) {
  return (
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

                    <DescriptionListGroup>
                      <DescriptionListTerm>{TopologyLabels.Protocol}</DescriptionListTerm>
                      <DescriptionListDescription>{itemSelected.protocol}</DescriptionListDescription>
                    </DescriptionListGroup>
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
      ))}
    </DataList>
  );
};
