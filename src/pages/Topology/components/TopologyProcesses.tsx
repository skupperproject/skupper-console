import { ComponentType, FC, Key, startTransition, useCallback, useEffect, useRef, useState } from 'react';

import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  AlertProps,
  AlertVariant,
  Button,
  Divider,
  Stack,
  StackItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
  getUniqueId
} from '@patternfly/react-core';
import { QuestionCircleIcon } from '@patternfly/react-icons';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { MAX_NODE_COUNT_WITHOUT_AGGREGATION, UPDATE_INTERVAL } from '@config/config';
import {
  GraphEdge,
  GraphCombo,
  GraphNode,
  GraphReactAdaptorProps,
  GraphReactAdaptorExposedMethods
} from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/ReactAdaptor';
import NavigationViewLink from '@core/components/NavigationViewLink';
import { ProcessesRoutesPaths, QueriesProcesses } from '@pages/Processes/Processes.enum';
import LoadingPage from '@pages/shared/Loading';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';

import DisplayOptions from './DisplayOptions';
import DisplayResource from './DisplayResources';
import DisplayServices from './DisplayServices';
import TopologyModal from './TopologyModal';
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
import { TopologyModalProps } from '../Topology.interfaces';

const DISPLAY_OPTIONS = 'display-options';
const SERVICE_OPTIONS = 'service-options';
const DEFAULT_DISPLAY_OPTIONS_ENABLED = [SHOW_SITE_KEY];

const externalProcessesQueryParams = {
  processRole: 'external'
};

const remoteProcessesQueryParams = {
  processRole: 'remote'
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
  ModalComponent?: ComponentType<TopologyModalProps>;
}> = function ({ serviceIds, id: itemId, GraphComponent = GraphReactAdaptor, ModalComponent = TopologyModal }) {
  const navigate = useNavigate();
  const configuration =
    TopologyController.loadDisplayOptionsFromLocalStorage(DISPLAY_OPTIONS) || DEFAULT_DISPLAY_OPTIONS_ENABLED;

  const [nodes, setNodes] = useState<GraphNode[] | undefined>();
  const [links, setLinks] = useState<GraphEdge[]>([]);
  const [groups, setGroups] = useState<GraphCombo[]>([]);

  const [itemIdSelected, setItemIdSelected] = useState<string | undefined>(itemId); //process or link id
  const [serviceIdsSelected, setServiceIdsSelected] = useState<string[] | undefined>(serviceIds);
  const [displayOptionsSelected, setDisplayOptionsSelected] = useState<string[]>(configuration);

  const [alerts, setAlerts] = useState<Partial<AlertProps>[]>([]);
  const [modalType, setModalType] = useState<{ type: 'process' | 'processPair'; id: string } | undefined>();

  const graphRef = useRef<GraphReactAdaptorExposedMethods>();

  const [{ data: externalProcesses }, { data: remoteProcesses }, { data: processesPairs }] = useQueries({
    queries: [
      {
        queryKey: [QueriesProcesses.GetProcessResult, externalProcessesQueryParams],
        queryFn: () => RESTApi.fetchProcessesResult(externalProcessesQueryParams),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesProcesses.GetProcessResult, remoteProcessesQueryParams],
        queryFn: () => RESTApi.fetchProcessesResult(remoteProcessesQueryParams),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesTopology.GetProcessesPairs],
        queryFn: () => RESTApi.fetchProcessesPairsResult(),
        refetchInterval: UPDATE_INTERVAL
      }
    ]
  });

  const isDisplayOptionActive = useCallback(
    (option: string) => displayOptionsSelected.includes(option),
    [displayOptionsSelected]
  );
  const { data: metrics } = useQuery({
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
  }, []);

  const handleGetSelectedSite = useCallback(
    ({ id, label }: GraphCombo) => {
      navigate(`${SitesRoutesPaths.Sites}/${label}@${id}`);
    },
    [navigate]
  );

  const handleGetSelectedEdge = useCallback(({ id }: { id: string }) => {
    setModalType({ type: 'processPair', id });
  }, []);

  const handleGetSelectedNode = useCallback(({ id }: { id: string }) => {
    setModalType({ type: 'process', id });
  }, []);

  const handleDisplayOptionSelected = useCallback((options: string[]) => {
    startTransition(() => {
      setDisplayOptionsSelected(options);
    });

    localStorage.setItem(DISPLAY_OPTIONS, JSON.stringify(options));
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalType(undefined);
  }, []);

  const handleServiceSelected = useCallback((ids: string[]) => {
    setItemIdSelected(undefined);
    setServiceIdsSelected(ids);
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

  useEffect(() => {
    if (!externalProcesses || !remoteProcesses || !processesPairs) {
      return;
    }

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
    let processes = [...externalProcesses, ...remoteProcesses];

    if (serviceIdsSelected) {
      const serverIds = processes
        // the format of one address is  serviceName@seviceId
        .filter(
          ({ addresses }) =>
            addresses?.map((address) => address.split('@')[1]).some((address) => serviceIdsSelected.includes(address))
        )
        .map(({ identity }) => identity);

      pPairs = pPairs.filter((pair) => serverIds?.includes(pair.destinationId));

      const processIdsFromService = pPairs?.flatMap(({ sourceId, destinationId }) => [sourceId, destinationId]);
      processes = processes.filter(({ identity }) => processIdsFromService.includes(identity));
    }
    let processNodes = TopologyController.convertProcessesToNodes(processes);
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
    externalProcesses,
    processesPairs,
    remoteProcesses,
    isDisplayOptionActive,
    serviceIdsSelected,
    metrics?.bytesByProcessPairs,
    metrics?.byteRateByProcessPairs,
    metrics?.latencyByProcessPairs
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

  const nodeIdSelected = nodes.find(({ id }) => id.split('~').includes(itemIdSelected || '') || itemIdSelected === id)
    ?.id;

  const TopologyToolbar = (
    <Toolbar>
      <ToolbarContent>
        <ToolbarItem>
          <DisplayServices serviceIds={serviceIdsSelected} onSelect={handleServiceSelected} />
        </ToolbarItem>

        <ToolbarItem>
          <DisplayResource
            id={nodeIdSelected}
            onSelect={handleResourceSelected}
            data={nodes.map((node) => ({ name: node.label, identity: node.id }))}
          />
        </ToolbarItem>

        <ToolbarItem>
          <DisplayOptions
            options={displayOptions}
            onSelect={handleDisplayOptionSelected}
            defaultSelected={displayOptionsSelected}
          />
        </ToolbarItem>

        <ToolbarItem variant="separator" />

        <ToolbarGroup>
          <ToolbarItem
            spacer={{
              default: 'spacerSm'
            }}
          >
            <Button isDisabled={!!itemIdSelected} onClick={handleSaveTopology}>
              {TopologyLabels.SaveButton}
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button isDisabled={!!itemIdSelected} onClick={handleLoadTopology}>
              {TopologyLabels.LoadButton}
            </Button>
            <Tooltip content={TopologyLabels.DescriptionButton}>
              <Button variant="plain">
                <QuestionCircleIcon />
              </Button>
            </Tooltip>
          </ToolbarItem>
        </ToolbarGroup>

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

  return (
    <>
      <Stack data-testid="sk-topology-processes">
        <StackItem>
          {TopologyToolbar}
          <Divider />
        </StackItem>
        <StackItem isFilled>
          <GraphComponent
            ref={graphRef}
            nodes={nodes}
            edges={links}
            combos={groups}
            itemSelected={nodeIdSelected}
            onClickCombo={handleGetSelectedSite}
            onClickNode={handleGetSelectedNode}
            onClickEdge={handleGetSelectedEdge}
          />
        </StackItem>
      </Stack>
      <AlertGroup isToast>
        {alerts.map(({ key, title }) => (
          <Alert
            key={key}
            timeout={2000}
            variant={AlertVariant.info}
            title={title}
            actionClose={<AlertActionCloseButton title={title as string} onClose={() => removeAlert(key as Key)} />}
          />
        ))}
      </AlertGroup>
      <ModalComponent
        ids={modalType?.id}
        items={
          modalType?.type === 'process'
            ? [...(remoteProcesses || []), ...(externalProcesses || [])]
            : processesPairs || []
        }
        modalType={modalType?.type}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default TopologyProcesses;
