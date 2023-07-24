import { ChangeEvent, FC, MouseEvent, useCallback, useEffect, useState } from 'react';

import {
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  Stack,
  StackItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem
} from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { PrometheusApi } from '@API/Prometheus.api';
import { RESTApi } from '@API/REST.api';
import { ProcessResponse } from '@API/REST.interfaces';
import { isPrometheusActive, UPDATE_INTERVAL } from '@config/config';
import EmptyData from '@core/components/EmptyData';
import { EDGE_COLOR_DEFAULT, NODE_COLOR_DEFAULT_LABEL } from '@core/components/Graph/Graph.constants';
import { GraphEdge, GraphCombo, GraphNode } from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/GraphReactAdaptor';
import NavigationViewLink from '@core/components/NavigationViewLink';
import { QueriesServices } from '@pages/Addresses/services/services.enum';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { QueriesProcesses } from '@pages/Processes/services/services.enum';
import LoadingPage from '@pages/shared/Loading';
import { QueriesSites } from '@pages/Sites/services/services.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';

import { TopologyController } from '../services';
import { QueriesTopology } from '../services/services.enum';
import { ProcessLegendData } from '../Topology.constant';
import { TopologyLabels } from '../Topology.enum';

const ZOOM_CACHE_KEY = 'process-graphZoom';
const SHOW_SITE_KEY = 'showSite';
const SHOW_LINK_LABEL = 'show-link-label';
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

const TopologyProcesses: FC<{ addressId?: string | null; id: string | undefined }> = function ({
  addressId,
  id: processId
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphEdge[]>([]);
  const [groups, setGroups] = useState<GraphCombo[]>();
  const [isAddressSelectMenuOpen, setIsAddressSelectMenuOpen] = useState<boolean>(false);
  const [isDisplayMenuOpen, setIsDisplayMenuOpen] = useState<boolean>(false);
  const [addressIdSelected, setAddressId] = useState<string | undefined>(addressId || undefined);
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

  const { data: services, isLoading: isLoadingAddresses } = useQuery(
    [QueriesServices.GetAddresses],
    () => RESTApi.fetchAddresses(),
    {
      refetchInterval: UPDATE_INTERVAL
    }
  );

  const { data: sites, isLoading: isLoadingSites } = useQuery([QueriesSites.GetSites], () => RESTApi.fetchSites(), {
    refetchInterval: UPDATE_INTERVAL
  });

  const { data: externalProcesses, isLoading: isLoadingExternalProcesses } = useQuery(
    [QueriesProcesses.GetProcessResult, externalProcessesQueryParams],
    () => RESTApi.fetchProcessesResult(externalProcessesQueryParams),
    {
      refetchInterval: UPDATE_INTERVAL
    }
  );

  const { data: remoteProcesses, isLoading: isLoadingRemoteProcesses } = useQuery(
    [QueriesProcesses.GetProcessResult, remoteProcessesQueryParams],
    () => RESTApi.fetchProcessesResult(remoteProcessesQueryParams),
    {
      refetchInterval: UPDATE_INTERVAL
    }
  );

  const { data: serversByAddress } = useQuery(
    [QueriesServices.GetProcessesByAddress, addressIdSelected],
    () => (addressIdSelected ? RESTApi.fetchServersByAddress(addressIdSelected) : undefined),
    {
      enabled: !!addressIdSelected,
      refetchInterval: UPDATE_INTERVAL
    }
  );

  const { data: processesPairs, isLoading: isLoadingProcessesPairs } = useQuery(
    [QueriesTopology.GetProcessesPairs],
    () => RESTApi.fetchProcessesPairs(),
    {
      refetchInterval: UPDATE_INTERVAL
    }
  );

  const { data: byteRateByProcessPairs } = useQuery(
    [QueriesTopology.GetByteRateByProcessPairs],
    () => PrometheusApi.fetchAllProcessPairsByteRates(),
    {
      enabled: isPrometheusActive && isDisplayOptionActive(SHOW_LINK_LABEL),
      refetchInterval: UPDATE_INTERVAL
    }
  );

  const { data: latencyByProcessPairs } = useQuery(
    [QueriesTopology.GetLatencyByProcessPairs],
    () => PrometheusApi.fetchAllProcessPairsLatencies(),
    {
      enabled: isPrometheusActive && isDisplayOptionActive(SHOW_LINK_LABEL),
      refetchInterval: UPDATE_INTERVAL
    }
  );

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
          navigate(`${ProcessesRoutesPaths.Processes}/${sourceProcess.name}@${sourceProcess.identity}/${idSelected}`);
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

    const isDisplayMetricsActive = isDisplayOptionActive(SHOW_LINK_LABEL);

    return [
      <SelectOption key={SHOW_SITE_KEY} value={SHOW_SITE_KEY}>
        {TopologyLabels.CheckboxShowSite}
      </SelectOption>,
      <SelectOption key={SHOW_LINK_LABEL} value={SHOW_LINK_LABEL}>
        {TopologyLabels.CheckboxShowLabel}
      </SelectOption>,
      <SelectOption key={SHOW_LINK_REVERSE_LABEL} isDisabled={!isDisplayMetricsActive} value={SHOW_LINK_REVERSE_LABEL}>
        {TopologyLabels.CheckboxShowLabelReverse}
      </SelectOption>,
      <SelectOption key={ROTATE_LINK_LABEL} isDisabled={!isDisplayMetricsActive} value={ROTATE_LINK_LABEL}>
        {TopologyLabels.RotateLabel}
      </SelectOption>
    ];
  };

  // This effect is triggered when no services are currently selected
  useEffect(() => {
    const isDisplayMetricsActive = isDisplayOptionActive(SHOW_LINK_LABEL);
    const showLinkLabelReverse = isDisplayOptionActive(SHOW_LINK_REVERSE_LABEL);
    const rotateLabel = isDisplayOptionActive(ROTATE_LINK_LABEL);

    if (
      sites &&
      externalProcesses &&
      remoteProcesses &&
      ((isDisplayMetricsActive && byteRateByProcessPairs && latencyByProcessPairs) ||
        !isDisplayMetricsActive ||
        !isPrometheusActive)
    ) {
      const processes = [...externalProcesses, ...remoteProcesses];
      // Get nodes from site and process groups
      const siteNodes = TopologyController.convertSitesToNodes(sites);
      const processesNodes = TopologyController.convertProcessesToNodes(processes);
      const siteGroups = TopologyController.convertSitesToGroups(processesNodes, siteNodes);

      // Check if no services are selected
      if (processesPairs && !addressIdSelected) {
        let processesLinks = TopologyController.convertProcessPairsToLinks(processesPairs, isDisplayMetricsActive);
        processesLinks = processesLinks.map((pair) => ({
          ...pair,
          labelCfg: { style: { NODE_COLOR_DEFAULT_LABEL } },
          style: { ...pair.style, stroke: EDGE_COLOR_DEFAULT, cursor: 'pointer' }
        }));

        if (isDisplayMetricsActive && byteRateByProcessPairs && latencyByProcessPairs) {
          processesLinks = TopologyController.addMetricsToLinks(
            processesLinks,
            byteRateByProcessPairs,
            latencyByProcessPairs,
            { showLinkLabelReverse, rotateLabel }
          );
        }

        setNodes(processesNodes);
        setLinks(processesLinks);
        setGroups(isDisplayOptionActive(SHOW_SITE_KEY) ? siteGroups : []);
      }
    }
  }, [
    sites,
    externalProcesses,
    processesPairs,
    addressIdSelected,
    remoteProcesses,
    byteRateByProcessPairs,
    latencyByProcessPairs,
    isDisplayOptionActive
  ]);

  // This effect is triggered when one service is currently selected
  useEffect(() => {
    const isDisplayMetricsActive = isDisplayOptionActive(SHOW_LINK_LABEL);
    const showLinkLabelReverse = isDisplayOptionActive(SHOW_LINK_REVERSE_LABEL);
    const rotateLabel = isDisplayOptionActive(ROTATE_LINK_LABEL);

    if (
      sites &&
      externalProcesses &&
      remoteProcesses &&
      ((isDisplayMetricsActive && byteRateByProcessPairs && latencyByProcessPairs) ||
        !isDisplayMetricsActive ||
        !isPrometheusActive)
    ) {
      const processes = [...externalProcesses, ...remoteProcesses];
      // In order to obtain the process pairs for a selected service, we must derive them from the flow pairs associated with the selected service.
      if (addressIdSelected && processesPairs && serversByAddress?.results) {
        const serverIds = serversByAddress.results.map(({ identity }) => identity);
        const processPairsByAddress = processesPairs.filter((pair) => serverIds?.includes(pair.destinationId));

        let processesLinksByAddress = TopologyController.convertProcessPairsToLinks(
          processPairsByAddress,
          isDisplayMetricsActive
        );
        processesLinksByAddress = processesLinksByAddress.map((pair) => ({
          ...pair,
          labelCfg: { style: { NODE_COLOR_DEFAULT_LABEL } },
          style: { ...pair.style, stroke: EDGE_COLOR_DEFAULT },
          cursor: 'pointer'
        }));

        if (isPrometheusActive && isDisplayMetricsActive) {
          processesLinksByAddress = TopologyController.addMetricsToLinks(
            processesLinksByAddress,
            byteRateByProcessPairs,
            latencyByProcessPairs,
            { showLinkLabelReverse, rotateLabel }
          );
        }

        const processIdsFromAddress = [
          ...(processesLinksByAddress?.map(({ source }) => source) || []),
          ...(processesLinksByAddress?.map(({ target }) => target) || [])
        ];

        const filteredProcesses = processes.filter((node) => processIdsFromAddress.includes(node.identity));

        const siteNodes = TopologyController.convertSitesToNodes(sites);
        const processesNodes = TopologyController.convertProcessesToNodes(filteredProcesses);
        const siteGroups = TopologyController.convertSitesToGroups(processesNodes, siteNodes);

        // Set the nodes, links and groups for the topology
        setNodes(processesNodes);
        setLinks(processesLinksByAddress);
        setGroups(isDisplayOptionActive(SHOW_SITE_KEY) ? siteGroups : []);
      }
    }
  }, [
    sites,
    externalProcesses,
    processesPairs,
    addressIdSelected,
    remoteProcesses,
    byteRateByProcessPairs,
    latencyByProcessPairs,
    serversByAddress?.results,
    isDisplayOptionActive
  ]);

  if (
    isLoadingSites ||
    isLoadingRemoteProcesses ||
    isLoadingExternalProcesses ||
    isLoadingRemoteProcesses ||
    isLoadingProcessesPairs ||
    isLoadingAddresses
  ) {
    return <LoadingPage />;
  }

  return (
    <Stack>
      <StackItem>
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <Select
                isOpen={isAddressSelectMenuOpen}
                onSelect={handleSelectAddress}
                onToggle={handleToggleAddressMenu}
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
                onToggle={handleToggleDisplayMenu}
                selections={displayOptionsSelected}
                placeholderText={TopologyLabels.DisplayPlaceholderText}
                isCheckboxSelectionBadgeHidden
              >
                {getDisplayOptions()}
              </Select>
            </ToolbarItem>

            <ToolbarItem alignment={{ default: 'alignRight' }}>
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
        {!nodes.length && <EmptyData />}
        {!!nodes.length && (
          <GraphReactAdaptor
            nodes={nodes}
            edges={links}
            combos={groups}
            onClickCombo={handleGetSelectedGroup}
            onClickNode={handleGetSelectedNode}
            onClickEdge={handleGetSelectedEdge}
            itemSelected={processId}
            legendData={ProcessLegendData}
            onGetZoom={handleSaveZoom}
            onFitScreen={handleFitScreen}
            layout={TopologyController.selectLayoutFromNodes(nodes, 'combo')}
            config={{
              zoom: localStorage.getItem(ZOOM_CACHE_KEY),
              fitScreen: Number(localStorage.getItem(FIT_SCREEN_CACHE_KEY))
            }}
          />
        )}
      </StackItem>
    </Stack>
  );
};

export default TopologyProcesses;
