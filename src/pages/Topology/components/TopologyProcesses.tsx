import { ComponentType, FC, startTransition, useCallback, useEffect, useRef, useState } from 'react';

import {
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
  Title
} from '@patternfly/react-core';
import { useSuspenseQueries } from '@tanstack/react-query';

import { RESTApi } from '@API/REST.api';
import { MAX_NODE_COUNT_WITHOUT_AGGREGATION, UPDATE_INTERVAL } from '@config/config';
import { LAYOUT_TOPOLOGY_DEFAULT, LAYOUT_TOPOLOGY_SINGLE_NODE } from '@core/components/Graph/Graph.constants';
import {
  GraphEdge,
  GraphCombo,
  GraphNode,
  GraphReactAdaptorProps,
  GraphReactAdaptorExposedMethods
} from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/ReactAdaptor';
import { ProcessesRoutesPaths, QueriesProcesses } from '@pages/Processes/Processes.enum';
import LoadingPage from '@pages/shared/Loading';

import NodeOrEdgeList from './NodeOrEdgeList';
import AlertToasts, { ToastExposeMethods } from './TopologyToasts';
import TopologyToolbar from './TopologyToolbar';
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

  const [modalType, setModalType] = useState<{ type: 'process' | 'processPair'; id: string } | undefined>();

  const drawerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<GraphReactAdaptorExposedMethods>();
  const toastRef = useRef<ToastExposeMethods>(null);

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

  const handleProcessSelected = useCallback((id?: string) => {
    setItemIdSelected(id);

    if (!id) {
      handleCloseModal();

      return;
    }

    setModalType({ type: 'process', id });
  }, []);

  const handleShowOnlyNeighboursChecked = useCallback((checked: boolean) => {
    if (checked) {
      graphRef.current?.saveNodePositions();
    }

    setShowOnlyNeighbours(checked);
  }, []);

  const handleMoveToNodeSelectedChecked = useCallback((checked: boolean) => {
    setMoveToNodeSelected(checked);
  }, []);

  const handleSelectedLink = useCallback(({ id }: GraphEdge) => {
    setModalType({ type: 'processPair', id });
  }, []);

  const handleSelectedNode = useCallback(({ id }: GraphNode) => {
    setItemIdSelected(id);
    setModalType({ type: 'process', id });
  }, []);

  const handleServiceSelected = useCallback((ids: string[] | undefined) => {
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
    graphRef.current?.saveNodePositions();

    toastRef.current?.addMessage(TopologyLabels.ToastSave);
  }, [serviceIdsSelected]);

  const handleLoadTopology = useCallback(() => {
    const ids = localStorage.getItem(SERVICE_OPTIONS);
    const options = localStorage.getItem(DISPLAY_OPTIONS);

    if (ids) {
      setServiceIdsSelected(ids !== 'undefined' ? JSON.parse(ids) : undefined);
    }

    if (options) {
      setDisplayOptionsSelected(options !== 'undefined' ? JSON.parse(options) : undefined);
    }

    toastRef.current?.addMessage(TopologyLabels.ToastLoad);
  }, []);

  const handleCloseModal = () => {
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

  const onExpand = () => {
    drawerRef.current && drawerRef.current.focus();
  };

  const panelContent = (
    <DrawerPanelContent isResizable minSize="30%">
      <DrawerHead>
        <Title headingLevel="h1">{TopologyLabels.TopologyModalTitle}</Title>
        <DrawerActions>
          <DrawerCloseButton onClick={handleCloseModal} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody style={{ overflow: 'auto' }} hasNoPadding>
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
          <TopologyToolbar
            nodes={nodes}
            onProcessSelected={handleProcessSelected}
            displayOptions={displayOptionsForProcesses}
            onDisplayOptionSelected={handleDisplayOptionSelected}
            defaultDisplayOptionsSelected={displayOptionsSelected}
            nodeIdSelected={nodeIdSelected}
            showOnlyNeighbours={showOnlyNeighbours}
            onShowOnlyNeighboursChecked={handleShowOnlyNeighboursChecked}
            moveToNodeSelected={moveToNodeSelected}
            onMoveToNodeSelectedChecked={handleMoveToNodeSelectedChecked}
            serviceIdsSelected={serviceIdsSelected}
            onServiceSelected={handleServiceSelected}
            onLoadTopology={handleLoadTopology}
            onSaveTopology={handleSaveTopology}
            linkToPage={ProcessesRoutesPaths.Processes}
          />
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
                  onClickNode={handleSelectedNode}
                  onClickEdge={handleSelectedLink}
                />
              </DrawerContentBody>
            </DrawerContent>
          </Drawer>
        </StackItem>
      </Stack>
      <AlertToasts ref={toastRef} />
    </>
  );
};

export default TopologyProcesses;
