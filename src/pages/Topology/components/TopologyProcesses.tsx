import { ChangeEvent, FC, MouseEvent, useCallback, useEffect, useState } from 'react';

import { Select, SelectOption, SelectOptionObject, Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { RESTApi } from '@API/REST';
import { UPDATE_INTERVAL } from '@config/config';
import { GraphEdge, GraphGroup, GraphNode } from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/GraphReactAdaptor';
import { QueriesAddresses } from '@pages/Addresses/services/services.enum';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { QueriesProcesses } from '@pages/Processes/services/services.enum';
import LoadingPage from '@pages/shared/Loading';
import { QueriesSites } from '@pages/Sites/services/services.enum';

import { TopologyController } from '../services';
import { QueriesTopology } from '../services/services.enum';
import { Labels } from '../Topology.enum';

const processesQueryParams = {
  filter: 'processRole.external'
};

const TopologyProcesses: FC<{ addressId?: string | null; id: string | undefined }> = function ({
  addressId,
  id: processId
}) {
  const navigate = useNavigate();

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphEdge<string>[]>([]);
  const [groups, setGroups] = useState<GraphGroup[]>();

  const [nodeSelected] = useState<string | undefined>(processId);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [addressIdSelected, setAddressId] = useState<string | undefined>(addressId || undefined);

  const { data: sites } = useQuery([QueriesSites.GetSites], () => RESTApi.fetchSites(), {
    refetchInterval: UPDATE_INTERVAL
  });

  const { data: processes, isLoading: isLoadingProcesses } = useQuery(
    [QueriesProcesses.GetProcessResult, processesQueryParams],
    () => RESTApi.fetchProcessesResult(processesQueryParams),
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

  const handleGetSelectedNode = useCallback(
    ({ id, name }: { id: string; name: string }) => {
      navigate(`${ProcessesRoutesPaths.Processes}/${name}@${id}`);
    },
    [navigate]
  );

  const handleGetSelectedEdge = useCallback(
    (edge: GraphEdge) => {
      const sourceName = edge.source.name;
      const sourceId = edge.source.id;
      const destinationId = edge.target.id;
      navigate(`${ProcessesRoutesPaths.Processes}/${sourceName}@${sourceId}/${sourceId}-to-${destinationId}`);
    },
    [navigate]
  );

  function handleToggle(isSelectAddressOpen: boolean) {
    setIsOpen(isSelectAddressOpen);
  }

  function handleSelect(_: MouseEvent | ChangeEvent, selection: string | SelectOptionObject, isPlaceholder?: boolean) {
    const id = isPlaceholder ? undefined : (selection as string);

    setAddressId(id);
    setIsOpen(false);
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
    if (sites && processes) {
      // Get nodes from site and process groups
      const siteNodes = TopologyController.getNodesFromSitesOrProcessGroups(sites);
      const processesNodes = TopologyController.getNodesFromProcesses(processes, siteNodes);
      const processGroups = TopologyController.getGroupsFromProcesses(processesNodes);

      // Check if no address is selected
      if (processesPairs && !addressIdSelected) {
        const processesLinks = TopologyController.getProcessesLinksFromProcessPairs(processesPairs);

        setNodes(processesNodes);
        setLinks(TopologyController.getEdgesFromLinks(processesLinks));
        setGroups(processGroups);
      }
    }
  }, [sites, processes, processesPairs, addressIdSelected]);

  // This effect is triggered when one address is currently selected
  useEffect(() => {
    if (sites && processes) {
      // Get nodes from site and process groups
      const siteNodes = TopologyController.getNodesFromSitesOrProcessGroups(sites);
      const processesNodes = TopologyController.getNodesFromProcesses(processes, siteNodes);
      const processGroups = TopologyController.getGroupsFromProcesses(processesNodes);

      if (addressIdSelected && flowPairsByAddress) {
        // Get links between processes in the selected address
        const processesLinksByAddress = TopologyController.getProcessesLinksFromFlowPairs(flowPairsByAddress);

        // Merge all process IDs in the selected address
        const processIdsFromAddress = [
          ...(processesLinksByAddress?.map(({ source }) => source) || []),
          ...(processesLinksByAddress?.map(({ target }) => target) || [])
        ];

        // Disable all processes that are not part of the selected address
        const nodesFiltered = processesNodes.map((node) => {
          if (!processIdsFromAddress.includes(node.id)) {
            return { ...node, isDisabled: true };
          }

          return node;
        });

        // Set the nodes, links and groups for the topology
        setNodes(nodesFiltered);
        setLinks(TopologyController.getEdgesFromLinks(processesLinksByAddress));
        setGroups(processGroups);
      }
    }
  }, [sites, processes, processesPairs, addressIdSelected, flowPairsByAddress]);

  if (isLoadingProcesses || isLoadingProcessesPairs || isLoadingAddresses) {
    return <LoadingPage />;
  }

  return (
    <>
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <Select isOpen={isOpen} onSelect={handleSelect} onToggle={handleToggle} selections={addressIdSelected}>
              {getOptions()}
            </Select>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <GraphReactAdaptor
        nodes={nodes}
        edges={links}
        groups={groups}
        onClickNode={handleGetSelectedNode}
        onClickEdge={handleGetSelectedEdge}
        nodeSelected={nodeSelected}
      />
    </>
  );
};

export default TopologyProcesses;
