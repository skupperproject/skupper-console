import { ChangeEvent, FC, MouseEvent, useCallback, useEffect, useState } from 'react';

import {
  Checkbox,
  Select,
  SelectOption,
  SelectOptionObject,
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
import { EDGE_COLOR_DEFAULT, NODE_COLOR_DEFAULT } from '@core/components/Graph/Graph.constants';
import { GraphEdge, GraphCombo, GraphNode } from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/GraphReactAdaptor';
import { QueriesAddresses } from '@pages/Addresses/services/services.enum';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { QueriesProcesses } from '@pages/Processes/services/services.enum';
import LoadingPage from '@pages/shared/Loading';
import { QueriesSites } from '@pages/Sites/services/services.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';

import { TopologyController } from '../services';
import { QueriesTopology } from '../services/services.enum';
import { ProcessLegendData } from '../Topology.constant';
import { Labels } from '../Topology.enum';

const ZOOM_CACHE_KEY = 'process-graphZoom';
const SHOW_SITE_KEY = 'showSite';
const SHOW_LINK_LABEL = 'show-link-label';
const SHOW_LINK_REVERSE_LABEL = 'show-reverse-link-label';
const ROTATE_LINK_LABEL = 'show-link-label-rotated';
const FIT_SCREEN_CACHE_KEY = 'process-fitScreen';

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

  const showSiteInitState = localStorage.getItem(SHOW_SITE_KEY);
  const showLinkLabelInitState = localStorage.getItem(SHOW_LINK_LABEL);
  const showLinkLabelReverseInitState = localStorage.getItem(SHOW_LINK_REVERSE_LABEL);
  const showRotateLabel = localStorage.getItem(ROTATE_LINK_LABEL);

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphEdge[]>([]);
  const [groups, setGroups] = useState<GraphCombo[]>();
  const [isAddressSelectMenuOpen, setIsAddressSelectMenuOpen] = useState<boolean>(false);
  const [addressIdSelected, setAddressId] = useState<string | undefined>(addressId || undefined);
  const [showSite, setShowSite] = useState<boolean>(showSiteInitState ? showSiteInitState === 'true' : true);
  const [rotateLabel, setRotateLabel] = useState<boolean>(showRotateLabel ? showRotateLabel === 'true' : true);
  const [showLinkLabel, setShowLinkLabel] = useState<boolean>(
    showLinkLabelInitState ? showLinkLabelInitState === 'true' : false
  );
  const [showLinkLabelReverse, setShowLinkLabelReverse] = useState<boolean>(
    showLinkLabelReverseInitState ? showLinkLabelReverseInitState === 'true' : false
  );

  const { data: addresses, isLoading: isLoadingAddresses } = useQuery(
    [QueriesAddresses.GetAddresses],
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
    [QueriesAddresses.GetProcessesByAddress, addressIdSelected],
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
      enabled: isPrometheusActive && showLinkLabel,
      refetchInterval: UPDATE_INTERVAL
    }
  );

  const { data: latencyByProcessPairs } = useQuery(
    [QueriesTopology.GetLatencyByProcessPairs],
    () => PrometheusApi.fetchAllProcessPairsLatencies(),
    {
      enabled: isPrometheusActive && showLinkLabel,
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
    ({ id, label }: GraphNode) => {
      navigate(`${ProcessesRoutesPaths.Processes}/${label}@${id}`);
    },
    [navigate]
  );

  const handleGetSelectedEdge = useCallback(
    ({ id: linkId, source }: GraphEdge) => {
      if (externalProcesses && remoteProcesses) {
        const processes = [...externalProcesses, ...remoteProcesses];

        const sourceProcess = processes?.find(({ identity }) => identity === source) as ProcessResponse;

        if (sourceProcess) {
          navigate(`${ProcessesRoutesPaths.Processes}/${sourceProcess.name}@${sourceProcess.identity}/${linkId}`);
        }
      }
    },
    [externalProcesses, remoteProcesses, navigate]
  );

  function handleToggleAddressDropdownMenu(isSelectAddressOpen: boolean) {
    setIsAddressSelectMenuOpen(isSelectAddressOpen);
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

  function handleChangeSiteCheck(checked: boolean) {
    setShowSite(checked);
    localStorage.setItem(SHOW_SITE_KEY, `${checked}`);
  }

  function handleChangeProtocolLinkLabelCheck(checked: boolean) {
    setShowLinkLabel(checked);
    localStorage.setItem(SHOW_LINK_LABEL, `${checked}`);

    if (!checked) {
      handleChangeProtocolLinkLabelCheckReverse(checked);
    }
  }

  function handleChangeProtocolLinkLabelCheckReverse(checked: boolean) {
    setShowLinkLabelReverse(checked);
    localStorage.setItem(SHOW_LINK_REVERSE_LABEL, `${checked}`);
  }

  function handleChangeRotateLabelCheck(checked: boolean) {
    setRotateLabel(checked);
    localStorage.setItem(ROTATE_LINK_LABEL, `${checked}`);
  }

  const handleSaveZoom = useCallback((zoomValue: number) => {
    localStorage.setItem(ZOOM_CACHE_KEY, `${zoomValue}`);
  }, []);

  const handleFitScreen = useCallback((flag: boolean) => {
    localStorage.setItem(FIT_SCREEN_CACHE_KEY, `${flag}`);
  }, []);

  const getOptions = useCallback(() => {
    const options = addresses?.map(({ name, identity }, index) => (
      <SelectOption key={index + 1} value={identity}>
        {name}
      </SelectOption>
    ));

    const optionsWithDefault = [<SelectOption key={0} value={Labels.ShowAll} isPlaceholder />, ...(options || [])];

    return optionsWithDefault;
  }, [addresses]);

  // This effect is triggered when no address is currently selected
  useEffect(() => {
    if (
      sites &&
      externalProcesses &&
      remoteProcesses &&
      ((showLinkLabel && byteRateByProcessPairs && latencyByProcessPairs) || !showLinkLabel || !isPrometheusActive)
    ) {
      const processes = [...externalProcesses, ...remoteProcesses];
      // Get nodes from site and process groups
      const siteNodes = TopologyController.convertSitesToNodes(sites);
      const processesNodes = TopologyController.convertProcessesToNodes(processes, siteNodes);
      const siteGroups = TopologyController.convertSitesToGroups(processesNodes, siteNodes);

      // Check if no address is selected
      if (processesPairs && !addressIdSelected) {
        let processesLinks = TopologyController.convertProcessPairsToLinks(processesPairs, showLinkLabel);
        processesLinks = processesLinks.map((pair) => ({
          ...pair,
          labelCfg: { style: { NODE_COLOR_DEFAULT } },
          style: { ...pair.style, stroke: EDGE_COLOR_DEFAULT, cursor: 'pointer' }
        }));

        if (showLinkLabel && byteRateByProcessPairs && latencyByProcessPairs) {
          processesLinks = TopologyController.addMetricsToLinks(
            processesLinks,
            byteRateByProcessPairs,
            latencyByProcessPairs,
            { showLinkLabelReverse, rotateLabel }
          );
        }
        setNodes(processesNodes);
        setLinks(processesLinks);
        setGroups(showSite ? siteGroups : []);
      }
    }
  }, [
    sites,
    externalProcesses,
    processesPairs,
    addressIdSelected,
    remoteProcesses,
    showLinkLabel,
    showSite,
    byteRateByProcessPairs,
    latencyByProcessPairs,
    showLinkLabelReverse,
    rotateLabel
  ]);

  // This effect is triggered when one address is currently selected
  useEffect(() => {
    if (
      sites &&
      externalProcesses &&
      remoteProcesses &&
      ((showLinkLabel && byteRateByProcessPairs && latencyByProcessPairs) || !showLinkLabel || !isPrometheusActive)
    ) {
      const processes = [...externalProcesses, ...remoteProcesses];
      // In order to obtain the process pairs for a selected address, we must derive them from the flow pairs associated with the selected addresses.
      if (addressIdSelected && processesPairs && serversByAddress?.results) {
        const serverIds = serversByAddress.results.map(({ identity }) => identity);
        const processPairsByAddress = processesPairs.filter((pair) => serverIds?.includes(pair.destinationId));

        let processesLinksByAddress = TopologyController.convertProcessPairsToLinks(
          processPairsByAddress,
          showLinkLabel
        );
        processesLinksByAddress = processesLinksByAddress.map((pair) => ({
          ...pair,
          labelCfg: { style: { NODE_COLOR_DEFAULT } },
          style: { ...pair.style, stroke: EDGE_COLOR_DEFAULT },
          cursor: 'pointer'
        }));

        if (isPrometheusActive && showLinkLabel) {
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
        const processesNodes = TopologyController.convertProcessesToNodes(filteredProcesses, siteNodes);
        const siteGroups = TopologyController.convertSitesToGroups(processesNodes, siteNodes);

        // Set the nodes, links and groups for the topology
        setNodes(processesNodes);
        setLinks(processesLinksByAddress);
        setGroups(showSite ? siteGroups : []);
      }
    }
  }, [
    sites,
    externalProcesses,
    processesPairs,
    addressIdSelected,
    remoteProcesses,
    showLinkLabel,
    showSite,
    byteRateByProcessPairs,
    latencyByProcessPairs,
    showLinkLabelReverse,
    rotateLabel,
    serversByAddress?.results
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
    <>
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <Select
              isOpen={isAddressSelectMenuOpen}
              onSelect={handleSelectAddress}
              onToggle={handleToggleAddressDropdownMenu}
              selections={addressIdSelected}
            >
              {getOptions()}
            </Select>
          </ToolbarItem>
          {isPrometheusActive && (
            <>
              <ToolbarItem>
                <Checkbox
                  label={Labels.CheckboxShowSite}
                  isChecked={showSite}
                  onChange={handleChangeSiteCheck}
                  id="show-site-check"
                />

                <Checkbox
                  isDisabled={!showLinkLabel}
                  label={Labels.RotateLabel}
                  isChecked={rotateLabel}
                  onChange={handleChangeRotateLabelCheck}
                  id="rotate-label-check"
                />
              </ToolbarItem>
              <ToolbarItem>
                <Checkbox
                  label={Labels.CheckboxShowLabel}
                  isChecked={showLinkLabel}
                  onChange={handleChangeProtocolLinkLabelCheck}
                  id="show-protocols-check"
                />
                <Checkbox
                  isDisabled={!showLinkLabel}
                  label={Labels.CheckboxShowLabelReverse}
                  isChecked={showLinkLabelReverse}
                  onChange={handleChangeProtocolLinkLabelCheckReverse}
                  id="show-protocols-check-reverse"
                />
              </ToolbarItem>
            </>
          )}
        </ToolbarContent>
      </Toolbar>

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
          config={{
            zoom: localStorage.getItem(ZOOM_CACHE_KEY),
            fitScreen: Number(localStorage.getItem(FIT_SCREEN_CACHE_KEY))
          }}
        />
      )}
    </>
  );
};

export default TopologyProcesses;
