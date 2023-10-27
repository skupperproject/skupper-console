import { ChangeEvent, ComponentType, FC, MouseEvent, useCallback, useEffect, useState } from 'react';

import { Divider, Stack, StackItem, Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import { Select, SelectOption, SelectVariant, SelectOptionObject } from '@patternfly/react-core/deprecated';
import { useQueries } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { ProcessPairsResponse, ProcessResponse } from '@API/REST.interfaces';
import { UPDATE_INTERVAL } from '@config/config';
import EmptyData from '@core/components/EmptyData';
import { GraphEdge, GraphCombo, GraphNode, GraphReactAdaptorProps } from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/ReactAdaptor';
import NavigationViewLink from '@core/components/NavigationViewLink';
import { ProcessesLabels, ProcessesRoutesPaths, QueriesProcesses } from '@pages/Processes/Processes.enum';
import { QueriesServices } from '@pages/Services/Services.enum';
import { SitesRoutesPaths, QueriesSites } from '@pages/Sites/Sites.enum';

import { TopologyController } from '../services';
import { TopologyLabels, QueriesTopology } from '../Topology.enum';

const ZOOM_CACHE_KEY = 'process';
const SHOW_SITE_KEY = 'showSite';
const SHOW_LINK_PROTOCOL = 'show-link-protocol';
const SHOW_LINK_BYTES = 'show-link-bytes';
const SHOW_LINK_BYTERATE = 'show-link-byterate';
const SHOW_LINK_LATENCY = 'show-link-latency';
const SHOW_LINK_REVERSE_LABEL = 'show-reverse-link-label';
const DISPLAY_OPTIONS = 'display-options';
const DEFAULT_DISPLAY_OPTIONS_ENABLED = [SHOW_SITE_KEY];

const ROTATE_LINK_LABEL = 'show-link-label-rotated';
const FILTER_BY_SERVICE_MAX_HEIGHT = 400;

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
  const [isServiceSelectMenuOpen, setIsServiceSelectMenuOpen] = useState(false);
  const [isDisplayMenuOpen, setIsDisplayMenuOpen] = useState(false);
  const [serviceIdSelected, setServiceIdSelected] = useState(serviceId);
  const [displayOptionsSelected, setDisplayOptions] = useState<string[]>(
    localStorage.getItem(DISPLAY_OPTIONS)
      ? JSON.parse(localStorage.getItem(DISPLAY_OPTIONS) || '')
      : DEFAULT_DISPLAY_OPTIONS_ENABLED
  );

  const isDisplayOptionActive = useCallback(
    (option: string) => displayOptionsSelected.includes(option),
    [displayOptionsSelected]
  );

  const addDisplayOptionToSelection = useCallback(
    (selected: string) => [...displayOptionsSelected, selected],
    [displayOptionsSelected]
  );

  const removeDisplayOptionToSelection = useCallback(
    (selected: string) => displayOptionsSelected.filter((option) => option !== selected),
    [displayOptionsSelected]
  );

  const [
    { data: services },
    { data: sites },
    { data: externalProcesses },
    { data: remoteProcesses },
    { data: processesPairs },
    { data: serversByService },
    { data: metrics }
  ] = useQueries({
    queries: [
      {
        queryKey: [QueriesServices.GetServices],
        queryFn: () => RESTApi.fetchServices()
      },
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
      },
      {
        queryKey: [QueriesServices.GetProcessesByService, serviceIdSelected],
        queryFn: () => (serviceIdSelected ? RESTApi.fetchServersByService(serviceIdSelected) : null),
        keepPreviousData: true,
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
            params: {
              fetchBytes: { groupBy: 'destProcess, sourceProcess,direction' },
              fetchByteRate: { groupBy: 'destProcess, sourceProcess,direction' },
              fetchLatency: { groupBy: 'sourceProcess, destProcess' }
            }
          }),
        keepPreviousData: true,
        refetchInterval: UPDATE_INTERVAL
      }
    ]
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

  function handleToggleServiceMenu(openServiceMenu: boolean) {
    setIsServiceSelectMenuOpen(openServiceMenu);
  }

  function handleToggleDisplayMenu(openDisplayMenu: boolean) {
    setIsDisplayMenuOpen(openDisplayMenu);
  }

  function handleSelectService(
    _: MouseEvent | ChangeEvent,
    selection: string | SelectOptionObject,
    isPlaceholder?: boolean
  ) {
    const id = isPlaceholder ? undefined : (selection as string);

    searchParams.delete('serviceId');
    let params = Object.fromEntries([...searchParams]);

    if (id) {
      params = { ...params, serviceId: id };
    }

    setServiceIdSelected(id);
    setIsServiceSelectMenuOpen(false);
    setSearchParams(params);
  }

  function handleFilterService(_: ChangeEvent<HTMLInputElement> | null, value: string) {
    const options = getOptions();

    if (!value) {
      return options;
    }

    return options
      .filter((element) =>
        element.props.children
          ? element.props.children.toString().toLowerCase().includes(value.toLowerCase())
          : undefined
      )
      .filter(Boolean);
  }

  const handleSelectDisplay = useCallback(
    (_: MouseEvent | ChangeEvent, selection: string | SelectOptionObject) => {
      const selected = selection as string;
      const isSelected = displayOptionsSelected.includes(selected);

      const displayOptions = isSelected
        ? removeDisplayOptionToSelection(selected)
        : addDisplayOptionToSelection(selected);

      localStorage.setItem(DISPLAY_OPTIONS, JSON.stringify(displayOptions));
      setDisplayOptions(displayOptions);
    },
    [addDisplayOptionToSelection, displayOptionsSelected, removeDisplayOptionToSelection]
  );

  const getOptions = useCallback(() => {
    const options = (services?.results || []).map(({ name, identity }, index) => (
      <SelectOption key={index + 1} value={identity}>
        {name}
      </SelectOption>
    ));

    const optionsWithDefault = [
      <SelectOption key={0} value={TopologyLabels.ShowAll} isPlaceholder />,
      ...(options || [])
    ];

    return optionsWithDefault;
  }, [services?.results]);

  const getDisplayOptions = () => [
    <SelectOption key={SHOW_SITE_KEY} value={SHOW_SITE_KEY}>
      {TopologyLabels.CheckboxShowSite}
    </SelectOption>,
    <SelectOption key={SHOW_LINK_PROTOCOL} value={SHOW_LINK_PROTOCOL}>
      {TopologyLabels.CheckboxShowProtocol}
    </SelectOption>,
    <SelectOption key={SHOW_LINK_BYTES} value={SHOW_LINK_BYTES}>
      {TopologyLabels.CheckboxShowTotalBytes}
    </SelectOption>,
    <SelectOption key={SHOW_LINK_BYTERATE} value={SHOW_LINK_BYTERATE}>
      {TopologyLabels.CheckboxShowCurrentByteRate}
    </SelectOption>,
    <SelectOption key={SHOW_LINK_LATENCY} value={SHOW_LINK_LATENCY}>
      {TopologyLabels.CheckboxShowLatency}
    </SelectOption>,
    <SelectOption
      key={SHOW_LINK_REVERSE_LABEL}
      isDisabled={
        !isDisplayOptionActive(SHOW_LINK_BYTES) &&
        !isDisplayOptionActive(SHOW_LINK_BYTERATE) &&
        !isDisplayOptionActive(SHOW_LINK_LATENCY)
      }
      value={SHOW_LINK_REVERSE_LABEL}
    >
      {TopologyLabels.CheckboxShowLabelReverse}
    </SelectOption>,
    <Divider key="display-option-divider" />,
    <SelectOption
      key={ROTATE_LINK_LABEL}
      isDisabled={
        !isDisplayOptionActive(SHOW_LINK_BYTES) &&
        !isDisplayOptionActive(SHOW_LINK_PROTOCOL) &&
        !isDisplayOptionActive(SHOW_LINK_BYTERATE) &&
        !isDisplayOptionActive(SHOW_LINK_LATENCY)
      }
      value={ROTATE_LINK_LABEL}
    >
      {TopologyLabels.CheckboxRotateLabel}
    </SelectOption>
  ];

  useEffect(() => {
    if (!sites || !externalProcesses || !remoteProcesses || !processesPairs) {
      return;
    }

    if (serviceIdSelected && !serversByService?.results) {
      return;
    }

    function updateLabelLinks(prevLinks: GraphEdge[]) {
      return TopologyController.addMetricsToEdges(
        prevLinks,
        processesPairs as ProcessPairsResponse[],
        'sourceProcess',
        'destProcess',
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

    if (serviceIdSelected && serversByService?.results) {
      const serverIds = serversByService.results.map(({ identity }) => identity);
      pPairs = pPairs.filter((pair) => serverIds?.includes(pair.destinationId));

      const processIdsFromService = pPairs?.flatMap(({ sourceId, destinationId }) => [sourceId, destinationId]);
      processes = processes.filter(({ identity }) => processIdsFromService.includes(identity));
    }

    const processesNodes = TopologyController.convertProcessesToNodes(processes);
    const siteNodes = TopologyController.convertSitesToNodes(sites);
    const siteGroups = TopologyController.convertSitesToGroups(processesNodes, siteNodes);
    const processesLinks = TopologyController.convertPairsToEdges(pPairs);

    setNodes(
      processesNodes.map((node) => ({
        ...node,
        persistPositionKey: serviceIdSelected ? `${node.id}-${serviceIdSelected}` : node.id
      }))
    );
    setLinks(updateLabelLinks(processesLinks));
    setGroups(isDisplayOptionActive(SHOW_SITE_KEY) ? siteGroups : []);
  }, [
    sites,
    externalProcesses,
    processesPairs,
    remoteProcesses,
    isDisplayOptionActive,
    serversByService?.results,
    serviceIdSelected,
    metrics?.bytesByProcessPairs,
    metrics?.byteRateByProcessPairs,
    metrics?.latencyByProcessPairs
  ]);

  return (
    <Stack data-testid="sk-topology-processes">
      {!nodes.length && (
        <StackItem isFilled>
          <EmptyData />
        </StackItem>
      )}
      {!!nodes.length && (
        <>
          <StackItem>
            <Toolbar>
              <ToolbarContent>
                <ToolbarItem>
                  <Select
                    role="service-select"
                    isOpen={isServiceSelectMenuOpen}
                    onSelect={handleSelectService}
                    onToggle={(_, isOpen) => handleToggleServiceMenu(isOpen)}
                    selections={serviceIdSelected}
                    hasInlineFilter
                    inlineFilterPlaceholderText={TopologyLabels.ServiceFilterPlaceholderText}
                    onFilter={handleFilterService}
                    maxHeight={FILTER_BY_SERVICE_MAX_HEIGHT}
                  >
                    {getOptions()}
                  </Select>
                </ToolbarItem>

                <ToolbarItem>
                  <Select
                    role="display-select"
                    variant={SelectVariant.checkbox}
                    isOpen={isDisplayMenuOpen}
                    onSelect={handleSelectDisplay}
                    onToggle={(_, isOpen) => handleToggleDisplayMenu(isOpen)}
                    selections={displayOptionsSelected}
                    placeholderText={TopologyLabels.DisplayPlaceholderText}
                    isCheckboxSelectionBadgeHidden
                  >
                    {getDisplayOptions()}
                  </Select>
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
          </StackItem>

          <StackItem isFilled>
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
          </StackItem>
        </>
      )}
    </Stack>
  );
};

export default TopologyProcesses;
