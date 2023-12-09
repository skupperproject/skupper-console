import { FC, useCallback } from 'react';

import {
  DataList,
  DataListAction,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Flex,
  FlexItem,
  Modal,
  Stack,
  StackItem,
  Text,
  Title
} from '@patternfly/react-core';
import { Link } from 'react-router-dom';

import { ProcessPairsResponse, ProcessResponse } from '@API/REST.interfaces';
import LinkCell from '@core/components/LinkCell';
import { ProcessesLabels, ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { ProcessGroupsRoutesPaths } from '@pages/ProcessGroups/ProcessGroups.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';

import { TopologyLabels } from '../Topology.enum';
import { TopologyModalProps } from '../Topology.interfaces';

const TopologyModal: FC<TopologyModalProps> = function ({ ids, items, modalType, onClose }) {
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const idsArray = ids?.split('~');

  let Body = null;
  const itemsSelected = items.filter(({ identity }) => idsArray?.includes(identity));

  if (modalType === 'process') {
    const processesSelected = itemsSelected as ProcessResponse[];

    Body = (
      <DataList aria-label="">
        {processesSelected.map((itemSelected) => {
          const goToLink = `${ProcessesRoutesPaths.Processes}/${itemSelected?.name}@${itemSelected?.identity}`;

          return (
            <DataListItem key={itemSelected.name}>
              <DataListItemRow>
                <DataListItemCells
                  dataListCells={[
                    <DataListCell key="primary-content">
                      <Flex spaceItems={{ default: 'spaceItemsMd' }} direction={{ default: 'column' }}>
                        <FlexItem>
                          <Title headingLevel="h4">{itemSelected.name}</Title>
                          <small>
                            {itemSelected.sourceHost}/{itemSelected.hostName}
                          </small>
                        </FlexItem>
                        <Flex spaceItems={{ default: 'spaceItemsMd' }}>
                          <FlexItem>
                            <LinkCell
                              type="site"
                              fitContent={true}
                              value={itemSelected.parentName}
                              data={itemSelected}
                              link={`${SitesRoutesPaths.Sites}/${itemSelected.parentName}@${itemSelected.parent}`}
                            />
                          </FlexItem>
                          <FlexItem>
                            <LinkCell
                              type="component"
                              fitContent={true}
                              value={itemSelected.groupName}
                              data={itemSelected}
                              link={`${ProcessGroupsRoutesPaths.ProcessGroups}/${itemSelected.groupName}@${itemSelected.groupIdentity}`}
                            />
                          </FlexItem>
                        </Flex>
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
  }

  if (modalType === 'processPair') {
    const processesPairSelected = itemsSelected as ProcessPairsResponse[];

    Body = (
      <DataList aria-label="">
        {processesPairSelected.map((itemSelected) => (
          <DataListItem key={itemSelected.sourceName}>
            <DataListItemRow>
              <DataListItemCells
                dataListCells={[
                  <DataListCell key="primary-content">
                    <Flex spaceItems={{ default: 'spaceItemsMd' }} direction={{ default: 'column' }}>
                      <FlexItem>
                        <Title headingLevel="h3">
                          <small>From</small>{' '}
                          <Link
                            to={`${ProcessesRoutesPaths.Processes}/${itemSelected?.sourceName}@${itemSelected?.sourceId}`}
                          >
                            {itemSelected.sourceName}
                          </Link>
                        </Title>
                        <Title headingLevel="h3">
                          <small>to</small>{' '}
                          <Link
                            to={`${ProcessesRoutesPaths.Processes}/${itemSelected?.destinationName}@${itemSelected?.destinationId}`}
                          >
                            {itemSelected.destinationName}
                          </Link>
                        </Title>
                      </FlexItem>
                      <Flex spaceItems={{ default: 'spaceItemsMd' }}>
                        <FlexItem>
                          <Text> Protocol: {itemSelected.protocol}</Text>
                        </FlexItem>
                      </Flex>
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
  }

  return (
    <Modal
      aria-label="Topology Modal"
      variant="medium"
      isOpen={!!modalType}
      onClose={handleClose}
      header={<Title headingLevel="h1">{TopologyLabels.TopologyModalTitle}</Title>}
    >
      {Body}
    </Modal>
  );
};

export default TopologyModal;
