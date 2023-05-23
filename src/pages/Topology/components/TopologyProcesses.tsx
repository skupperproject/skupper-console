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
import { useNavigate } from 'react-router-dom';

import { PrometheusApi } from '@API/Prometheus';
import { RESTApi } from '@API/REST';
import { ProcessResponse } from '@API/REST.interfaces';
import { UPDATE_INTERVAL } from '@config/config';
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
  const showSiteInitState = localStorage.getItem('showSite');
  const showLinkLabelInitState = localStorage.getItem('showLinkLabel');

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphEdge[]>([]);
  const [groups, setGroups] = useState<GraphCombo[]>();
  const [isAddressSelectMenuOpen, setIsAddressSelectMenuOpen] = useState<boolean>(false);
  const [addressIdSelected, setAddressId] = useState<string | undefined>(addressId || undefined);
  const [showSite, setShowSite] = useState<boolean>(showSiteInitState ? showSiteInitState === 'true' : true);
  const [showLinkLabel, setShowLinkLabel] = useState<boolean>(
    showLinkLabelInitState ? showLinkLabelInitState === 'true' : false
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

  const { data: addresses, isLoading: isLoadingAddresses } = useQuery(
    [QueriesAddresses.GetAddresses],
    () => RESTApi.fetchAddresses(),
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
      enabled: showLinkLabel,
      refetchInterval: UPDATE_INTERVAL
    }
  );

  const { data: latencyByProcessPairs } = useQuery(
    [QueriesTopology.GetLatencyByProcessPairs],
    () => PrometheusApi.fetchAllProcessPairsLatencies(),
    {
      enabled: showLinkLabel,
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

    setAddressId(id);
    setIsAddressSelectMenuOpen(false);
  }

  function handleChangeSiteCheck(checked: boolean) {
    setShowSite(checked);
    localStorage.setItem('showSite', `${checked}`);
  }

  function handleChangeProtocolLinkLabelCheck(checked: boolean) {
    setShowLinkLabel(checked);
    localStorage.setItem('showLinkLabel', `${checked}`);
  }

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
      ((showLinkLabel && byteRateByProcessPairs && latencyByProcessPairs) || !showLinkLabel)
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
            latencyByProcessPairs
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
    latencyByProcessPairs
  ]);

  // This effect is triggered when one address is currently selected
  useEffect(() => {
    if (sites && externalProcesses && remoteProcesses) {
      const processes = [...externalProcesses, ...remoteProcesses];

      // In order to obtain the process pairs for a selected address, we must derive them from the flow pairs associated with the selected addresses.
      if (addressIdSelected && processesPairs && serversByAddress) {
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

        if (showLinkLabel) {
          processesLinksByAddress = TopologyController.addMetricsToLinks(
            processesLinksByAddress,
            byteRateByProcessPairs,
            latencyByProcessPairs
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
    serversByAddress?.results,
    serversByAddress
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
          <ToolbarItem>
            <Checkbox
              label={Labels.CheckboxShowSite}
              isChecked={showSite}
              onChange={handleChangeSiteCheck}
              id="show-site-check"
            />
            <Checkbox
              label={Labels.CheckboxShowLabel}
              isChecked={showLinkLabel}
              onChange={handleChangeProtocolLinkLabelCheck}
              id="show-protocols-check"
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <GraphReactAdaptor
        nodes={nodes}
        edges={links}
        combos={groups}
        onClickCombo={handleGetSelectedGroup}
        onClickNode={handleGetSelectedNode}
        onClickEdge={handleGetSelectedEdge}
        itemSelected={processId}
        legendData={ProcessLegendData}
      />
    </>
  );
};

export default TopologyProcesses;
