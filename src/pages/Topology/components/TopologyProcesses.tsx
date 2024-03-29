import { ComponentType, FC, Key, startTransition, useCallback, useEffect, useRef, useState } from 'react';

import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  AlertProps,
  AlertVariant,
  Button,
  Checkbox,
  Divider,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Stack,
  StackItem,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
  getUniqueId
} from '@patternfly/react-core';
import { QuestionCircleIcon } from '@patternfly/react-icons';
import { useSuspenseQueries } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { MAX_NODE_COUNT_WITHOUT_AGGREGATION, TOAST_VISIBILITY_TIMEOUT, UPDATE_INTERVAL } from '@config/config';
import { LAYOUT_TOPOLOGY_DEFAULT, LAYOUT_TOPOLOGY_SINGLE_NODE } from '@core/components/Graph/Graph.constants';
import {
  GraphEdge,
  GraphCombo,
  GraphNode,
  GraphReactAdaptorProps,
  GraphReactAdaptorExposedMethods
} from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/ReactAdaptor';
import NavigationViewLink from '@core/components/NavigationViewLink';
import { ProcessesLabels, ProcessesRoutesPaths, QueriesProcesses } from '@pages/Processes/Processes.enum';
import LoadingPage from '@pages/shared/Loading';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';

import DisplayOptions from './DisplayOptions';
import DisplayResources from './DisplayResources';
import DisplayServices from './DisplayServices';
import NodeOrEdgeList from './NodeOrEdgeList';
import { TopologyController, groupNodes, groupEdges as groupEdges } from '../services';
import {
  ROTATE_LINK_LABEL,
  SHOW_LINK_BYTERATE,
  SHOW_LINK_BYTES,
  SHOW_LINK_LATENCY,
  SHOW_LINK_PROTOCOL,
  SHOW_LINK_REVERSE_LABEL,
  SHOW_SITE_KEY,
  displayOptionsForProcesses
} from '../Topology.constants';
import { TopologyLabels, QueriesTopology } from '../Topology.enum';
import { NodeOrEdgeListProps } from '../Topology.interfaces';

const DISPLAY_OPTIONS = 'display-options';
const SERVICE_OPTIONS = 'service-options';
const DEFAULT_DISPLAY_OPTIONS_ENABLED = [SHOW_SITE_KEY];

const processesQueryParams = {
  processRole: ['remote', 'external'],
  endTime: 0
};

const metricQueryParams = {
  fetchBytes: { groupBy: 'destProcess, sourceProcess, direction' },
  fetchByteRate: { groupBy: 'destProcess, sourceProcess, direction' },
  fetchLatency: { groupBy: 'sourceProcess, destProcess' }
};

const TopologyProcesses: FC<{
  serviceIds?: string[];
  id?: string;
  GraphComponent?: ComponentType<GraphReactAdaptorProps>;
  ModalComponent?: ComponentType<NodeOrEdgeListProps>;
}> = function ({ serviceIds, id: itemId, GraphComponent = GraphReactAdaptor, ModalComponent = NodeOrEdgeList }) {
  const navigate = useNavigate();
  const configuration =
    TopologyController.loadDisplayOptionsFromLocalStorage(DISPLAY_OPTIONS) || DEFAULT_DISPLAY_OPTIONS_ENABLED;

  const [nodes, setNodes] = useState<GraphNode[] | undefined>();
  const [links, setLinks] = useState<GraphEdge[]>([]);
  const [groups, setGroups] = useState<GraphCombo[]>([]);

  const [itemIdSelected, setItemIdSelected] = useState<string | undefined>(itemId); //process or link id
  const [serviceIdsSelected, setServiceIdsSelected] = useState<string[] | undefined>(serviceIds);
  const [showOnlyNeighbours, setShowOnlyNeighbours] = useState(false);
  const [moveToNodeSelected, setMoveToNodeSelected] = useState(false);

  const [displayOptionsSelected, setDisplayOptionsSelected] = useState<string[]>(configuration);

  const [alerts, setAlerts] = useState<Partial<AlertProps>[]>([]);
  const [modalType, setModalType] = useState<{ type: 'process' | 'processPair'; id: string } | undefined>();

  const drawerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<GraphReactAdaptorExposedMethods>();

  const isDisplayOptionActive = useCallback(
    (option: string) => displayOptionsSelected.includes(option),
    [displayOptionsSelected]
  );

  const [{ data: processes }, { data: processesPairs }, { data: metrics }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [QueriesProcesses.GetProcessResult, processesQueryParams],
        queryFn: () => RESTApi.fetchProcessesResult(processesQueryParams),
        refetchInterval: UPDATE_INTERVAL
      },

      {
        queryKey: [QueriesTopology.GetProcessesPairs],
        queryFn: () => RESTApi.fetchProcessesPairsResult(),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [
          QueriesTopology.GetBytesByProcessPairs,
          isDisplayOptionActive(SHOW_LINK_BYTES),
          isDisplayOptionActive(SHOW_LINK_BYTERATE),
          isDisplayOptionActive(SHOW_LINK_LATENCY)
        ],
        queryFn: () =>
          TopologyController.getMetrics({
            showBytes: isDisplayOptionActive(SHOW_LINK_BYTES),
            showByteRate: isDisplayOptionActive(SHOW_LINK_BYTERATE),
            showLatency: isDisplayOptionActive(SHOW_LINK_LATENCY),
            params: metricQueryParams
          }),
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

  const handleResourceSelected = useCallback((id?: string) => {
    setItemIdSelected(id);
    setModalType(undefined);
  }, []);

  const handleShowOnlyNeighboursChecked = useCallback((checked: boolean) => {
    if (checked) {
      graphRef?.current?.saveNodePositions();
    }

    setShowOnlyNeighbours(checked);
  }, []);

  const handleMoveToNodeSelectedChecked = useCallback((checked: boolean) => {
    setMoveToNodeSelected(checked);
  }, []);

  const handleGetSelectedSite = useCallback(
    ({ id, label }: GraphCombo) => {
      navigate(`${SitesRoutesPaths.Sites}/${label}@${id}`);
    },
    [navigate]
  );

  const handleGetSelectedEdge = useCallback(
    ({
      id,
      sourceName,
      sourceId,
      metrics: { protocol }
    }: {
      id: string;
      sourceName: string;
      sourceId: string;
      metrics: { protocol: string };
    }) => {
      if (id.split('~').length > 1) {
        setModalType({ type: 'processPair', id });

        return;
      }

      navigate(
        `${ProcessesRoutesPaths.Processes}/${sourceName}@${sourceId}/${ProcessesLabels.ProcessPairs}@${id}@${protocol}`
      );
    },
    [navigate]
  );

  const handleGetSelectedNode = useCallback(
    ({ id, label }: { id: string; label: string }) => {
      if (id.split('~').length > 1) {
        setItemIdSelected(id);
        setModalType({ type: 'process', id });

        return;
      }

      navigate(`${ProcessesRoutesPaths.Processes}/${label}@${id}`);
    },
    [navigate]
  );

  const handleServiceSelected = useCallback((ids: string[]) => {
    setItemIdSelected(undefined);
    setModalType(undefined);
    setServiceIdsSelected(ids);
  }, []);

  const handleDisplayOptionSelected = useCallback((options: string[]) => {
    startTransition(() => {
      setDisplayOptionsSelected(options);
    });

    localStorage.setItem(DISPLAY_OPTIONS, JSON.stringify(options));
  }, []);

  const handleSaveTopology = useCallback(() => {
    localStorage.setItem(SERVICE_OPTIONS, JSON.stringify(serviceIdsSelected));
    graphRef?.current?.saveNodePositions();

    addInfoAlert(TopologyLabels.ToastSave);
  }, [addInfoAlert, serviceIdsSelected]);

  const handleLoadTopology = useCallback(() => {
    const ids = localStorage.getItem(SERVICE_OPTIONS);
    const options = localStorage.getItem(DISPLAY_OPTIONS);

    if (ids) {
      setServiceIdsSelected(ids !== 'undefined' ? JSON.parse(ids) : undefined);
    }

    if (options) {
      setDisplayOptionsSelected(options !== 'undefined' ? JSON.parse(options) : undefined);
    }

    addInfoAlert(TopologyLabels.ToastLoad);
  }, [addInfoAlert]);

  const handleCloseClick = () => {
    setItemIdSelected(undefined);
    setModalType(undefined);
  };

  useEffect(() => {
    const options = {
      showLinkBytes: isDisplayOptionActive(SHOW_LINK_BYTES),
      showLinkProtocol: isDisplayOptionActive(SHOW_LINK_PROTOCOL),
      showLinkByteRate: isDisplayOptionActive(SHOW_LINK_BYTERATE),
      showLinkLatency: isDisplayOptionActive(SHOW_LINK_LATENCY),
      showLinkLabelReverse: isDisplayOptionActive(SHOW_LINK_REVERSE_LABEL),
      rotateLabel: isDisplayOptionActive(ROTATE_LINK_LABEL)
    };

    function addMetricsToEdges(edges: GraphEdge[]) {
      const protocolByProcessPairsMap = (processesPairs || []).reduce(
        (acc, { sourceId, destinationId, protocol }) => {
          acc[`${sourceId}${destinationId}`] = protocol || '';

          return acc;
        },
        {} as Record<string, string>
      );

      return TopologyController.addMetricsToEdges(
        edges,
        'sourceProcess',
        'destProcess',
        protocolByProcessPairsMap,
        metrics?.bytesByProcessPairs,
        metrics?.byteRateByProcessPairs,
        metrics?.latencyByProcessPairs
      );
    }

    let pPairs = processesPairs;
    let p = processes;

    if (serviceIdsSelected) {
      const serverIds = p
        // the format of one address is  serviceName@seviceId@protocol
        .filter(({ addresses }) =>
          addresses?.map((address) => address.split('@')[1]).some((address) => serviceIdsSelected.includes(address))
        )
        .map(({ identity }) => identity);

      pPairs = pPairs.filter((pair) => serverIds.includes(pair.destinationId));

      const processIdsFromService = pPairs?.flatMap(({ sourceId, destinationId }) => [sourceId, destinationId]);
      p = p.filter(({ identity }) => processIdsFromService.includes(identity));
    }
    let processNodes = TopologyController.convertProcessesToNodes(p);
    let processPairEdges = addMetricsToEdges(TopologyController.convertPairsToEdges(pPairs));

    if (processNodes.length > MAX_NODE_COUNT_WITHOUT_AGGREGATION) {
      processNodes = groupNodes(processNodes);
      processPairEdges = groupEdges(processNodes, processPairEdges);
    }
    const nodeGroups = isDisplayOptionActive(SHOW_SITE_KEY)
      ? TopologyController.getNodeGroupsFromNodes(processNodes)
      : [];
    processPairEdges = TopologyController.configureEdges(processPairEdges, options);

    setNodes(
      processNodes.map((node) => ({
        ...node,
        persistPositionKey: serviceIdsSelected?.length ? `${node.id}-${serviceIdsSelected}` : node.id
      }))
    );
    setLinks(
      processPairEdges.map((edge) => ({
        ...edge,
        style: { cursor: 'pointer' }
      }))
    );
    setGroups(nodeGroups);
  }, [
    processes,
    processesPairs,
    isDisplayOptionActive,
    serviceIdsSelected,
    metrics?.bytesByProcessPairs,
    metrics?.byteRateByProcessPairs,
    metrics?.latencyByProcessPairs,
    showOnlyNeighbours,
    itemIdSelected
  ]);

  if (!nodes) {
    return <LoadingPage />;
  }

  const displayOptions = displayOptionsForProcesses.map((option) => {
    if (option.key === SHOW_LINK_REVERSE_LABEL) {
      return {
        ...option,
        isDisabled: () =>
          !isDisplayOptionActive(SHOW_LINK_BYTES) &&
          !isDisplayOptionActive(SHOW_LINK_BYTERATE) &&
          !isDisplayOptionActive(SHOW_LINK_LATENCY)
      };
    }

    if (option.key === ROTATE_LINK_LABEL) {
      return {
        ...option,
        isDisabled: () =>
          !isDisplayOptionActive(SHOW_LINK_BYTES) &&
          !isDisplayOptionActive(SHOW_LINK_PROTOCOL) &&
          !isDisplayOptionActive(SHOW_LINK_BYTERATE) &&
          !isDisplayOptionActive(SHOW_LINK_LATENCY)
      };
    }

    return option;
  });

  const nodeIdSelected = nodes.find(
    ({ id }) => id.split('~').includes(itemIdSelected || '') || itemIdSelected === id
  )?.id;

  let filteredLinks = links;
  let filteredNodes = nodes;
  let filteredCombos = groups;

  if (showOnlyNeighbours && itemIdSelected) {
    filteredLinks = links.filter((edge) => edge.source === itemIdSelected || edge.target === itemIdSelected);
    const idsFromService = filteredLinks.flatMap(({ source, target }) => [source, target]);
    filteredNodes = nodes.filter(({ id }) => idsFromService.includes(id));

    const comboIdsFromNodes = filteredNodes.flatMap(({ comboId }) => comboId || []);
    filteredCombos = groups.filter(({ id }) => comboIdsFromNodes.includes(id));
  }

  const TopologyToolbar = (
    <Toolbar>
      <ToolbarContent>
        <ToolbarItem>
          <DisplayOptions
            options={displayOptions}
            onSelect={handleDisplayOptionSelected}
            defaultSelected={displayOptionsSelected}
          />
        </ToolbarItem>

        <ToolbarItem variant="separator" />

        <ToolbarGroup>
          <ToolbarItem>
            <DisplayResources
              id={nodeIdSelected}
              onSelect={handleResourceSelected}
              placeholder={TopologyLabels.DisplayProcessesDefaultLabel}
              options={nodes.map((node) => ({ name: node.label, identity: node.id }))}
            />
          </ToolbarItem>

          <ToolbarItem>
            <Checkbox
              label={TopologyLabels.CheckboxShowOnlyNeghbours}
              isDisabled={!nodeIdSelected}
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
              isDisabled={!nodeIdSelected || showOnlyNeighbours}
              isChecked={moveToNodeSelected}
              onChange={(_, checked) => {
                handleMoveToNodeSelectedChecked(checked);
              }}
              id="moveToNodeSelectedCheckbox"
            />
          </ToolbarItem>
        </ToolbarGroup>

        <ToolbarItem variant="separator" />

        <ToolbarGroup>
          <ToolbarItem>
            <DisplayServices serviceIds={serviceIdsSelected} onSelect={handleServiceSelected} />
          </ToolbarItem>

          <ToolbarItem>
            <Button onClick={handleLoadTopology} variant="secondary">
              {TopologyLabels.LoadButton}
            </Button>
            <Tooltip content={TopologyLabels.DescriptionButton}>
              <Button variant="plain">
                <QuestionCircleIcon />
              </Button>
            </Tooltip>
          </ToolbarItem>
        </ToolbarGroup>

        <ToolbarItem variant="separator" />

        <ToolbarItem>
          <Button onClick={handleSaveTopology} variant="secondary">
            {TopologyLabels.SaveButton}
          </Button>
        </ToolbarItem>

        <ToolbarItem align={{ default: 'alignRight' }}>
          <NavigationViewLink
            link={ProcessesRoutesPaths.Processes}
            linkLabel={TopologyLabels.ListView}
            iconName="listIcon"
          />
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );

  const onExpand = () => {
    drawerRef.current && drawerRef.current.focus();
  };

  const panelContent = (
    <DrawerPanelContent isResizable minSize="35%">
      <DrawerHead>
        <Title headingLevel="h1">{TopologyLabels.TopologyModalTitle}</Title>
        <DrawerActions>
          <DrawerCloseButton onClick={handleCloseClick} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody style={{ overflow: 'auto' }}>
        {modalType?.type && (
          <ModalComponent
            ids={modalType?.id}
            items={modalType?.type === 'process' ? processes : processesPairs}
            modalType={modalType.type}
          />
        )}
      </DrawerPanelBody>
    </DrawerPanelContent>
  );

  return (
    <>
      <Stack data-testid="sk-topology-processes">
        <StackItem>
          {TopologyToolbar}
          <Divider />
        </StackItem>
        <StackItem isFilled>
          <Drawer isExpanded={!!modalType?.id} onExpand={onExpand}>
            <DrawerContent panelContent={panelContent}>
              <DrawerContentBody>
                <GraphComponent
                  ref={graphRef}
                  nodes={filteredNodes}
                  edges={filteredLinks}
                  combos={filteredCombos}
                  itemSelected={nodeIdSelected}
                  layout={showOnlyNeighbours && nodeIdSelected ? LAYOUT_TOPOLOGY_SINGLE_NODE : LAYOUT_TOPOLOGY_DEFAULT}
                  moveToSelectedNode={moveToNodeSelected && !!nodeIdSelected && !showOnlyNeighbours}
                  onClickCombo={handleGetSelectedSite}
                  onClickNode={handleGetSelectedNode}
                  onClickEdge={handleGetSelectedEdge}
                />
              </DrawerContentBody>
            </DrawerContent>
          </Drawer>
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

export default TopologyProcesses;
