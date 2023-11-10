import { ComponentType, FC, startTransition, useCallback, useEffect, useState } from 'react';

import { Stack, StackItem, Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { ProcessResponse } from '@API/REST.interfaces';
import { UPDATE_INTERVAL } from '@config/config';
import EmptyData from '@core/components/EmptyData';
import { GraphEdge, GraphCombo, GraphNode, GraphReactAdaptorProps } from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/ReactAdaptor';
import NavigationViewLink from '@core/components/NavigationViewLink';
import { ProcessesLabels, ProcessesRoutesPaths, QueriesProcesses } from '@pages/Processes/Processes.enum';
import { SitesRoutesPaths, QueriesSites } from '@pages/Sites/Sites.enum';

import DisplaySelect from './DisplaySelect';
import DisplayServices from './DisplayServices';
import { TopologyController } from '../services';
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

const ZOOM_CACHE_KEY = 'process';
const DISPLAY_OPTIONS = 'display-options';
const SERVICE_OPTIONS = 'service-options';
const DEFAULT_DISPLAY_OPTIONS_ENABLED = [SHOW_SITE_KEY];

const externalProcessesQueryParams = {
  processRole: 'external'
};

const remoteProcessesQueryParams = {
  processRole: 'remote'
};

const TopologyProcesses: FC<{
  serviceId?: string;
  id?: string;
  GraphComponent?: ComponentType<GraphReactAdaptorProps>;
}> = function ({ serviceId, id: processId, GraphComponent = GraphReactAdaptor }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphEdge[]>([]);
  const [groups, setGroups] = useState<GraphCombo[]>([]);
  const [serviceIdSelected, setServiceIdSelected] = useState<string[] | undefined>(
    serviceId
      ? [serviceId]
      : localStorage.getItem(SERVICE_OPTIONS)
      ? JSON.parse(localStorage.getItem(SERVICE_OPTIONS) || '')
      : undefined
  );
  const [displayOptionsSelected, setDisplayOptions] = useState<string[]>(
    localStorage.getItem(DISPLAY_OPTIONS)
      ? JSON.parse(localStorage.getItem(DISPLAY_OPTIONS) || '')
      : DEFAULT_DISPLAY_OPTIONS_ENABLED
  );

  const isDisplayOptionActive = useCallback(
    (option: string) => displayOptionsSelected.includes(option),
    [displayOptionsSelected]
  );

  const [{ data: sites }, { data: externalProcesses }, { data: remoteProcesses }, { data: processesPairs }] =
    useQueries({
      queries: [
        {
          queryKey: [QueriesSites.GetSites],
          queryFn: () => RESTApi.fetchSites(),
          refetchInterval: UPDATE_INTERVAL
        },
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
        params: {
          fetchBytes: { groupBy: 'destProcess, sourceProcess,direction' },
          fetchByteRate: { groupBy: 'destProcess, sourceProcess,direction' },
          fetchLatency: { groupBy: 'sourceProcess, destProcess' }
        }
      }),
    refetchInterval: UPDATE_INTERVAL
  });

  const handleGetSelectedGroup = useCallback(
    ({ id, label }: GraphCombo) => {
      navigate(`${SitesRoutesPaths.Sites}/${label}@${id}`);
    },
    [navigate]
  );

  const handleGetSelectedNode = useCallback(
    ({ id: idSelected }: GraphNode) => {
      if (externalProcesses && remoteProcesses) {
        const processes = [...externalProcesses, ...remoteProcesses];
        const process = processes.find(({ identity }) => identity === idSelected);

        navigate(`${ProcessesRoutesPaths.Processes}/${process?.name}@${idSelected}`);
      }
    },
    [navigate, externalProcesses, remoteProcesses]
  );

  const handleGetSelectedEdge = useCallback(
    ({ id: idSelected }: GraphEdge) => {
      if (externalProcesses && remoteProcesses) {
        const [sourceId] = idSelected.split('-to-');
        const processes = [...externalProcesses, ...remoteProcesses];

        const sourceProcess = processes?.find(({ identity }) => identity === sourceId) as ProcessResponse;
        const protocol = processesPairs?.find(({ identity }) => identity === idSelected)?.protocol;

        if (sourceProcess) {
          navigate(
            `${ProcessesRoutesPaths.Processes}/${sourceProcess.name}@${sourceProcess.identity}/${ProcessesLabels.ProcessPairs}@${idSelected}@${protocol}`
          );
        }
      }
    },
    [navigate, externalProcesses, remoteProcesses, processesPairs]
  );

  const handleDisplaySelect = useCallback((idSelected: string[]) => {
    startTransition(() => {
      setDisplayOptions(idSelected);
    });

    localStorage.setItem(DISPLAY_OPTIONS, JSON.stringify(idSelected));
  }, []);

  const handleServiceSelect = useCallback(
    (idSelected: string[]) => {
      searchParams.delete('serviceId');
      let params = Object.fromEntries([...searchParams]);

      if (idSelected.length === 1) {
        params = { ...params, serviceId: idSelected[0] };
      }

      setSearchParams(params);
      setServiceIdSelected(idSelected);
      localStorage.setItem(SERVICE_OPTIONS, JSON.stringify(idSelected));
    },
    [searchParams, setSearchParams]
  );

  useEffect(() => {
    if (!sites || !externalProcesses || !remoteProcesses || !processesPairs) {
      return;
    }

    function addLabelsToEdges(prevLinks: GraphEdge[]) {
      const protocolPairsMap = (processesPairs || []).reduce(
        (acc, { sourceId, destinationId, protocol }) => {
          acc[`${sourceId}${destinationId}`] = protocol || '';

          return acc;
        },
        {} as Record<string, string>
      );

      return TopologyController.addMetricsToEdges(
        prevLinks,
        'sourceProcess',
        'destProcess',
        protocolPairsMap,
        metrics?.bytesByProcessPairs,
        metrics?.byteRateByProcessPairs,
        metrics?.latencyByProcessPairs,
        {
          showLinkBytes: isDisplayOptionActive(SHOW_LINK_BYTES),
          showLinkProtocol: isDisplayOptionActive(SHOW_LINK_PROTOCOL),
          showLinkByteRate: isDisplayOptionActive(SHOW_LINK_BYTERATE),
          showLinkLatency: isDisplayOptionActive(SHOW_LINK_LATENCY),
          showLinkLabelReverse: isDisplayOptionActive(SHOW_LINK_REVERSE_LABEL),
          rotateLabel: isDisplayOptionActive(ROTATE_LINK_LABEL)
        }
      );
    }

    let pPairs = processesPairs;
    let processes = [...externalProcesses, ...remoteProcesses];

    if (serviceIdSelected?.length) {
      const serverIds = processes
        // the format of one address is  serviceName@seviceId
        .filter(
          ({ addresses }) =>
            addresses?.map((address) => address.split('@')[1]).some((address) => serviceIdSelected?.includes(address))
        )
        .map(({ identity }) => identity);
      pPairs = pPairs.filter((pair) => serverIds?.includes(pair.destinationId));

      const processIdsFromService = pPairs?.flatMap(({ sourceId, destinationId }) => [sourceId, destinationId]);
      processes = processes.filter(({ identity }) => processIdsFromService.includes(identity));
    }

    const processesNodes = TopologyController.convertProcessesToNodes(processes);
    const siteNodes = TopologyController.convertSitesToNodes(sites);
    const siteGroups = TopologyController.convertSitesToGroups(processesNodes, siteNodes);
    const edges = addLabelsToEdges(TopologyController.convertPairsToEdges(pPairs))
      //notify the user that the edge is clickable
      .map((edge) => ({
        ...edge,
        style: { cursor: 'pointer' }
      }));

    setNodes(
      processesNodes.map((node) => ({
        ...node,
        persistPositionKey: serviceIdSelected ? `${node.id}-${serviceIdSelected}` : node.id
      }))
    );
    setLinks(edges);
    setGroups(isDisplayOptionActive(SHOW_SITE_KEY) ? siteGroups : []);
  }, [
    sites,
    externalProcesses,
    processesPairs,
    remoteProcesses,
    isDisplayOptionActive,
    serviceIdSelected,
    metrics?.bytesByProcessPairs,
    metrics?.byteRateByProcessPairs,
    metrics?.latencyByProcessPairs
  ]);

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

  const TopologyToolbar = (
    <Toolbar>
      <ToolbarContent>
        <ToolbarItem>
          <DisplayServices serviceId={serviceIdSelected} onSelect={handleServiceSelect} />
        </ToolbarItem>

        <ToolbarItem>
          <DisplaySelect
            options={displayOptions}
            onSelect={handleDisplaySelect}
            defaultSelected={displayOptionsSelected}
          />
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

  return (
    <Stack data-testid="sk-topology-processes">
      <StackItem>{TopologyToolbar}</StackItem>
      <StackItem isFilled>
        {!!nodes.length && (
          <GraphComponent
            nodes={nodes}
            edges={links}
            combos={groups}
            itemSelected={processId}
            saveConfigkey={ZOOM_CACHE_KEY}
            onClickCombo={handleGetSelectedGroup}
            onClickNode={handleGetSelectedNode}
            onClickEdge={handleGetSelectedEdge}
          />
        )}

        {!nodes.length && <EmptyData />}
      </StackItem>
    </Stack>
  );
};

export default TopologyProcesses;
