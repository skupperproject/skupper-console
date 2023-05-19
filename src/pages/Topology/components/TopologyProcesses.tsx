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

import { RESTApi } from '@API/REST';
import { ProcessResponse } from '@API/REST.interfaces';
import { UPDATE_INTERVAL } from '@config/config';
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

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphEdge[]>([]);
  const [groups, setGroups] = useState<GraphCombo[]>();
  const [isAddressSelectMenuOpen, setIsAddressSelectMenuOpen] = useState<boolean>(false);
  const [addressIdSelected, setAddressId] = useState<string | undefined>(addressId || undefined);
  const [showProtocolLinkLabel, setShowProtocolLinkLabel] = useState(false);

  const { data: sites } = useQuery([QueriesSites.GetSites], () => RESTApi.fetchSites(), {
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

  const { data: processesPairs, isLoading: isLoadingProcessesPairs } = useQuery(
    [QueriesTopology.GetProcessesPairs],
    () => RESTApi.fetchProcessesPairs(),
    {
      refetchInterval: UPDATE_INTERVAL
    }
  );

  const { data: flowPairsByAddress } = useQuery(
    [QueriesTopology.GetFlowPairsByAddressResult, addressIdSelected],
    () => (addressIdSelected ? RESTApi.fetchFlowPairsByAddressResults(addressIdSelected) : undefined),
    {
      enabled: !!addressIdSelected,
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

  function handleChangeProtocolLinkLabelCheck(checked: boolean) {
    setShowProtocolLinkLabel(checked);
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
    if (sites && externalProcesses && remoteProcesses) {
      const processes = [...externalProcesses, ...remoteProcesses];
      // Get nodes from site and process groups
      const siteNodes = TopologyController.convertSitesToNodes(sites);
      const processesNodes = TopologyController.convertProcessesToNodes(processes, siteNodes);
      const siteGroups = TopologyController.convertSitesToGroups(processesNodes, siteNodes);

      // Check if no address is selected
      if (processesPairs && !addressIdSelected) {
        const processesLinks = TopologyController.convertProcessPairsToLinks(processesPairs, showProtocolLinkLabel);

        setNodes(processesNodes);
        setLinks(processesLinks);
        setGroups(siteGroups);
      }
    }
  }, [sites, externalProcesses, processesPairs, addressIdSelected, remoteProcesses, showProtocolLinkLabel]);

  // This effect is triggered when one address is currently selected
  useEffect(() => {
    if (sites && externalProcesses && remoteProcesses) {
      const processes = [...externalProcesses, ...remoteProcesses];

      // In order to obtain the process pairs for a selected address, we must derive them from the flow pairs associated with the selected addresses.
      if (addressIdSelected && flowPairsByAddress) {
        const processesLinksByAddress = TopologyController.convertFlowPairsToLinks(
          flowPairsByAddress,
          showProtocolLinkLabel
        );
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
        setGroups(siteGroups);
      }
    }
  }, [
    sites,
    externalProcesses,
    processesPairs,
    addressIdSelected,
    flowPairsByAddress,
    remoteProcesses,
    showProtocolLinkLabel
  ]);

  if (isLoadingExternalProcesses || isLoadingRemoteProcesses || isLoadingProcessesPairs || isLoadingAddresses) {
    return <LoadingPage />;
  }

  // links in the topology processes view are clickable
  const linksWithStyles = links.map((link) => ({ ...link, style: { cursor: 'pointer' } }));

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
              label={Labels.CheckboxShowProtocolsLabel}
              isChecked={showProtocolLinkLabel}
              onChange={handleChangeProtocolLinkLabelCheck}
              id="show-protocols-check"
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <GraphReactAdaptor
        nodes={nodes}
        edges={linksWithStyles}
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
