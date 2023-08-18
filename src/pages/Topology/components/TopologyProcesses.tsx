import { ChangeEvent, FC, MouseEvent, useCallback, useEffect, useState } from 'react';

import { Divider, Stack, StackItem, Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import { Select, SelectOption, SelectVariant, SelectOptionObject } from '@patternfly/react-core/deprecated';
import { useQueries } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { PrometheusApi } from '@API/Prometheus.api';
import { RESTApi } from '@API/REST.api';
import { ProcessResponse } from '@API/REST.interfaces';
import { isPrometheusActive, UPDATE_INTERVAL } from '@config/config';
import EmptyData from '@core/components/EmptyData';
import { GraphEdge, GraphCombo, GraphNode } from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/GraphReactAdaptor';
import NavigationViewLink from '@core/components/NavigationViewLink';
import { QueriesServices } from '@pages/Addresses/services/services.enum';
import { ProcessesLabels, ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { QueriesProcesses } from '@pages/Processes/services/services.enum';
import { QueriesSites } from '@pages/Sites/services/services.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';

import { TopologyController } from '../services';
import { QueriesTopology } from '../services/services.enum';
import { TopologyLabels } from '../Topology.enum';

const ZOOM_CACHE_KEY = 'process-graphZoom';
const SHOW_SITE_KEY = 'showSite';
const SHOW_LINK_PROTOCOL = 'show-link-protocol';
const SHOW_LINK_BYTES = 'show-link-bytes';
const SHOW_LINK_BYTERATE = 'show-link-byterate';
const SHOW_LINK_LATENCY = 'show-link-latency';
const SHOW_LINK_REVERSE_LABEL = 'show-reverse-link-label';
const DISPLAY_OPTIONS = 'display-options';
const DEFAULT_DISPLAY_OPTIONS_ENABLED = [SHOW_SITE_KEY];

const ROTATE_LINK_LABEL = 'show-link-label-rotated';
const FIT_SCREEN_CACHE_KEY = 'process-fitScreen';
const FILTER_BY_ADDRESS_MAX_HEIGHT = 400;

const externalProcessesQueryParams = {
  processRole: 'external'
};

const remoteProcessesQueryParams = {
  processRole: 'remote'
};

const TopologyProcesses: FC<{ addressId?: string; id?: string }> = function ({ addressId, id: processId }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphEdge[]>([]);
  const [groups, setGroups] = useState<GraphCombo[]>([]);
  const [isAddressSelectMenuOpen, setIsAddressSelectMenuOpen] = useState(false);
  const [isDisplayMenuOpen, setIsDisplayMenuOpen] = useState(false);
  const [addressIdSelected, setAddressId] = useState(addressId);
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
    { data: serversByAddress },
    { data: bytesByProcessPairs },
    { data: byteRateByProcessPairs },
    { data: latencyByProcessPairs }
  ] = useQueries({
    queries: [
      {
        queryKey: [QueriesServices.GetAddresses],
        queryFn: () => RESTApi.fetchAddresses()
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
        queryFn: () => RESTApi.fetchProcessesPairs(),
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesServices.GetProcessesByAddress, addressIdSelected],
        queryFn: () => (addressIdSelected ? RESTApi.fetchServersByAddress(addressIdSelected) : null),
        keepPreviousData: true,

        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesTopology.GetBytesByProcessPairs],
        queryFn: () =>
          isPrometheusActive && isDisplayOptionActive(SHOW_LINK_BYTES) ? PrometheusApi.fetchAllProcessPairsBytes() : [],
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesTopology.GetByteRateByProcessPairs],
        queryFn: () =>
          isPrometheusActive && isDisplayOptionActive(SHOW_LINK_BYTERATE)
            ? PrometheusApi.fetchAllProcessPairsByteRates()
            : [],
        refetchInterval: UPDATE_INTERVAL
      },
      {
        queryKey: [QueriesTopology.GetLatencyByProcessPairs],
        queryFn: () =>
          isPrometheusActive && isDisplayOptionActive(SHOW_LINK_LATENCY)
            ? PrometheusApi.fetchAllProcessPairsLatencies()
            : [],
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

        if (sourceProcess) {
          navigate(
            `${ProcessesRoutesPaths.Processes}/${sourceProcess.name}@${sourceProcess.identity}/${ProcessesLabels.ProcessPairs}@${idSelected}`
          );
        }
      }
    },
    [navigate, externalProcesses, remoteProcesses]
  );

  function handleToggleAddressMenu(openAddressMenu: boolean) {
    setIsAddressSelectMenuOpen(openAddressMenu);
  }

  function handleToggleDisplayMenu(openDisplayMenu: boolean) {
    setIsDisplayMenuOpen(openDisplayMenu);
  }

  function handleSelectAddress(
    _: MouseEvent | ChangeEvent,
    selection: string | SelectOptionObject,
    isPlaceholder?: boolean
  ) {
    const id = isPlaceholder ? undefined : (selection as string);

    searchParams.delete('addressId');
    let params = Object.fromEntries([...searchParams]);

    if (id) {
      params = { ...params, addressId: id };
    }

    setAddressId(id);
    setIsAddressSelectMenuOpen(false);
    setSearchParams(params);
  }

  function handleFilterAddress(_: ChangeEvent<HTMLInputElement> | null, value: string) {
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

  const handleSaveZoom = useCallback((zoomValue: number) => {
    localStorage.setItem(ZOOM_CACHE_KEY, `${zoomValue}`);
  }, []);

  const handleFitScreen = useCallback((flag: boolean) => {
    localStorage.setItem(FIT_SCREEN_CACHE_KEY, `${flag}`);
  }, []);

  const getOptions = useCallback(() => {
    if (!services?.results) {
      return [];
    }

    const options = services.results.map(({ name, identity }, index) => (
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

  const getDisplayOptions = () => {
    if (!isPrometheusActive) {
      return [<SelectOption key={'show-site'} value={TopologyLabels.CheckboxShowSite} />];
    }

    return [
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
        {TopologyLabels.RotateLabel}
      </SelectOption>
    ];
  };

  useEffect(() => {
    if (!sites || !externalProcesses || !remoteProcesses || !processesPairs) {
      return;
    }

    if (addressIdSelected && !serversByAddress?.results) {
      return;
    }

    function updateLabelLinks(prevLinks: GraphEdge[]) {
      return TopologyController.addMetricsToLinks(
        prevLinks,
        processesPairs,
        bytesByProcessPairs,
        byteRateByProcessPairs,
        latencyByProcessPairs,
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

    if (addressIdSelected && serversByAddress?.results) {
      const serverIds = serversByAddress.results.map(({ identity }) => identity);
      pPairs = pPairs.filter((pair) => serverIds?.includes(pair.destinationId));

      const processIdsFromAddress = pPairs?.flatMap(({ sourceId, destinationId }) => [sourceId, destinationId]);
      processes = processes.filter((node) => processIdsFromAddress.includes(node.identity));
    }

    const processesNodes = TopologyController.convertProcessesToNodes(processes);
    const siteNodes = TopologyController.convertSitesToNodes(sites);
    const siteGroups = TopologyController.convertSitesToGroups(processesNodes, siteNodes);
    const processesLinks = TopologyController.convertProcessPairsToLinks(pPairs);

    setNodes(processesNodes);
    setLinks(updateLabelLinks(processesLinks));
    setGroups(isDisplayOptionActive(SHOW_SITE_KEY) ? siteGroups : []);
  }, [
    sites,
    externalProcesses,
    processesPairs,
    remoteProcesses,
    isDisplayOptionActive,
    serversByAddress?.results,
    addressIdSelected,
    bytesByProcessPairs,
    byteRateByProcessPairs,
    latencyByProcessPairs
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
                    isOpen={isAddressSelectMenuOpen}
                    onSelect={handleSelectAddress}
                    onToggle={(_, isOpen) => handleToggleAddressMenu(isOpen)}
                    selections={addressIdSelected}
                    hasInlineFilter
                    inlineFilterPlaceholderText={TopologyLabels.AddressFilterPlaceholderText}
                    onFilter={handleFilterAddress}
                    maxHeight={FILTER_BY_ADDRESS_MAX_HEIGHT}
                  >
                    {getOptions()}
                  </Select>
                </ToolbarItem>

                <ToolbarItem>
                  <Select
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
            <GraphReactAdaptor
              nodes={nodes}
              edges={links}
              combos={groups}
              itemSelected={processId}
              fitScreen={Number(localStorage.getItem(FIT_SCREEN_CACHE_KEY))}
              zoom={Number(localStorage.getItem(ZOOM_CACHE_KEY))}
              onClickCombo={handleGetSelectedGroup}
              onClickNode={handleGetSelectedNode}
              onClickEdge={handleGetSelectedEdge}
              onGetZoom={handleSaveZoom}
              onFitScreen={handleFitScreen}
            />
          </StackItem>
        </>
      )}
    </Stack>
  );
};

export default TopologyProcesses;
