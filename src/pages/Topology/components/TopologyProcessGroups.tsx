import { FC, Key, useCallback, useRef, useState } from 'react';

import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  AlertProps,
  AlertVariant,
  Button,
  Checkbox,
  Divider,
  Stack,
  StackItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  getUniqueId
} from '@patternfly/react-core';
import { useQueries } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { TOAST_VISIBILITY_TIMEOUT, UPDATE_INTERVAL } from '@config/config';
import { GraphNode, GraphReactAdaptorExposedMethods } from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/ReactAdaptor';
import NavigationViewLink from '@core/components/NavigationViewLink';
import { ProcessGroupsRoutesPaths, QueriesProcessGroups } from '@pages/ProcessGroups/ProcessGroups.enum';
import LoadingPage from '@pages/shared/Loading';

import DisplayResource from './DisplayResources';
import { TopologyController } from '../services';
import { TopologyLabels, QueriesTopology } from '../Topology.enum';

const processGroupsQueryParams = {
  processGroupRole: 'external'
};

const remoteProcessesQueryParams = {
  processGroupRole: 'remote'
};

const TopologyProcessGroups: FC<{ id?: string }> = function ({ id: componentId }) {
  const navigate = useNavigate();

  const [componentIdSelected, setComponentIdSelected] = useState<string | undefined>(componentId);
  const [alerts, setAlerts] = useState<Partial<AlertProps>[]>([]);

  const [showOnlyNeighbours, setShowOnlyNeighbours] = useState(false);
  const [moveToNodeSelected, setMoveToNodeSelected] = useState(false);

  const graphRef = useRef<GraphReactAdaptorExposedMethods>();

  const [{ data: processGroups }, { data: remoteProcessGroups }, { data: processGroupsPairs }] = useQueries({
    queries: [
      {
        queryKey: [QueriesProcessGroups.GetProcessGroups, processGroupsQueryParams],
        queryFn: () => RESTApi.fetchProcessGroups(processGroupsQueryParams),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesProcessGroups.GetRemoteProcessGroup, remoteProcessesQueryParams],
        queryFn: () => RESTApi.fetchProcessGroups(remoteProcessesQueryParams),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesTopology.GetProcessGroupsPairs],
        queryFn: () => RESTApi.fetchProcessGroupsPairs(),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  const addAlert = (title: string, variant: AlertProps['variant'], key: Key) => {
    setAlerts((prevAlerts) => [...prevAlerts, { title, variant, key }]);
  };

  const removeAlert = (key: Key) => {
    setAlerts((prevAlerts) => [...prevAlerts.filter((alert) => alert.key !== key)]);
  };

  const addInfoAlert = useCallback((message: string) => {
    addAlert(message, 'info', getUniqueId());
  }, []);

  const handleSaveTopology = useCallback(() => {
    graphRef?.current?.saveNodePositions();
    addInfoAlert(TopologyLabels.ToastSave);
  }, [addInfoAlert]);

  const handleComponentSelected = useCallback((id?: string) => {
    setComponentIdSelected(id);
  }, []);

  const handleGetSelectedNode = useCallback(
    ({ id: idSelected }: GraphNode) => {
      const component = processGroups?.results.find(({ identity }) => identity === idSelected);

      if (component) {
        navigate(`${ProcessGroupsRoutesPaths.ProcessGroups}/${component.name}@${idSelected}`);
      }
    },
    [navigate, processGroups?.results]
  );

  const handleShowOnlyNeighboursChecked = useCallback((checked: boolean) => {
    if (checked) {
      graphRef?.current?.saveNodePositions();
    }

    setShowOnlyNeighbours(checked);
  }, []);

  const handleMoveToNodeSelectedChecked = useCallback((checked: boolean) => {
    setMoveToNodeSelected(checked);
  }, []);

  if (!processGroups || !processGroupsPairs || !remoteProcessGroups) {
    return <LoadingPage />;
  }

  const nodes = TopologyController.convertProcessGroupsToNodes([
    ...processGroups.results,
    ...remoteProcessGroups.results
  ]);
  const links = TopologyController.convertPairsToEdges(processGroupsPairs);

  let filteredLinks = links;
  let filteredNodes = nodes;

  if (showOnlyNeighbours && componentIdSelected) {
    filteredLinks = links.filter((edge) => edge.source === componentIdSelected || edge.target === componentIdSelected);
    const idsFromService = filteredLinks.flatMap(({ source, target }) => [source, target]);
    filteredNodes = nodes.filter(({ id }) => idsFromService.includes(id));
  }

  return (
    <>
      <Stack>
        <StackItem>
          <Toolbar>
            <ToolbarContent>
              <ToolbarGroup>
                <ToolbarItem>
                  <DisplayResource
                    type={'component'}
                    id={componentIdSelected}
                    onSelect={handleComponentSelected}
                    placeholder={TopologyLabels.DisplayComponentsDefaultLabel}
                  />
                </ToolbarItem>

                <ToolbarItem>
                  <Checkbox
                    label={TopologyLabels.CheckboxShowOnlyNeghbours}
                    isDisabled={!componentIdSelected}
                    isChecked={showOnlyNeighbours}
                    onChange={(_, checked) => {
                      handleShowOnlyNeighboursChecked(checked);
                    }}
                    id="showOnlyNeighboursCheckbox"
                  />
                </ToolbarItem>

                <ToolbarItem>
                  <Checkbox
                    label={TopologyLabels.CheckboxMoveToNodeSelected}
                    isDisabled={!componentIdSelected}
                    isChecked={moveToNodeSelected}
                    onChange={(_, checked) => {
                      handleMoveToNodeSelectedChecked(checked);
                    }}
                    id="moveToNodeSelectedCheckbox"
                  />
                </ToolbarItem>
              </ToolbarGroup>

              <ToolbarItem variant="separator" />

              <ToolbarItem
                spacer={{
                  default: 'spacerSm'
                }}
              >
                <Button onClick={handleSaveTopology} variant="secondary">
                  {TopologyLabels.SaveButton}
                </Button>
              </ToolbarItem>

              <ToolbarGroup align={{ default: 'alignRight' }}>
                <ToolbarItem>
                  <NavigationViewLink
                    link={ProcessGroupsRoutesPaths.ProcessGroups}
                    linkLabel={TopologyLabels.ListView}
                    iconName="listIcon"
                  />
                </ToolbarItem>
              </ToolbarGroup>
            </ToolbarContent>
          </Toolbar>
          <Divider />
        </StackItem>

        <StackItem isFilled>
          <GraphReactAdaptor
            ref={graphRef}
            nodes={filteredNodes}
            edges={filteredLinks}
            onClickNode={handleGetSelectedNode}
            itemSelected={componentIdSelected}
            moveToSelectedNode={!!moveToNodeSelected && !!componentIdSelected}
          />
        </StackItem>
      </Stack>
      <AlertGroup isToast>
        {alerts.map(({ key, title }) => (
          <Alert
            key={key}
            timeout={TOAST_VISIBILITY_TIMEOUT}
            variant={AlertVariant.info}
            title={title}
            actionClose={<AlertActionCloseButton title={title as string} onClose={() => removeAlert(key as Key)} />}
          />
        ))}
      </AlertGroup>
    </>
  );
};

export default TopologyProcessGroups;
