import React, { FC, useCallback, useEffect, useState } from 'react';

import {
  Flex,
  Panel,
  PanelMainBody,
  Select,
  SelectOption,
  SelectOptionObject,
  Text,
  Toolbar,
  ToolbarContent,
  ToolbarItem
} from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { RESTApi } from '@API/REST';
import { UPDATE_INTERVAL } from '@config/config';
import { nodeColors } from '@core/components/Graph/Graph.constants';
import { GraphEdge, GraphGroup, GraphNode } from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/GraphReactAdaptor';
import { QueriesAddresses } from '@pages/Addresses/services/services.enum';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { QueriesProcesses } from '@pages/Processes/services/services.enum';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
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

  const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphEdge<string>[]>([]);
  const [groups, setGroups] = useState<GraphGroup[]>();

  const [nodeSelected] = useState<string | undefined>(processId);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [addressIdSelected, setAddressId] = useState<string | undefined>(addressId || undefined);

  const { data: sites } = useQuery([QueriesSites.GetSites], () => RESTApi.fetchSites(), {
    refetchInterval,
    onError: handleError
  });

  const { data: processes, isLoading: isLoadingProcesses } = useQuery(
    [QueriesProcesses.GetProcessResult, processesQueryParams],
    () => RESTApi.fetchProcessesResult(processesQueryParams),
    {
      refetchInterval,
      onError: handleError
    }
  );

  const { data: addresses, isLoading: isLoadingAddresses } = useQuery(
    [QueriesAddresses.GetAddresses],
    () => RESTApi.fetchAddresses(),
    {
      refetchInterval,
      onError: handleError
    }
  );

  const { data: processesPairs, isLoading: isLoadingProcessesPairs } = useQuery(
    [QueriesTopology.GetProcessesPairs],
    () => RESTApi.fetchProcessesPairs(),
    {
      refetchInterval,
      onError: handleError
    }
  );

  const { data: flowPairsByAddress } = useQuery(
    [QueriesTopology.GetFlowPairsByAddressResult, addressIdSelected],
    () => (addressIdSelected ? RESTApi.fetchFlowPairsByAddressResults(addressIdSelected) : undefined),
    {
      enabled: !!addressIdSelected,
      refetchInterval,
      onError: handleError
    }
  );

  function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
    const route = httpStatus ? ErrorRoutesPaths.error[httpStatus] : ErrorRoutesPaths.ErrConnection;

    setRefetchInterval(0);
    navigate(route);
  }

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

  function handleSelect(
    _: React.MouseEvent | React.ChangeEvent,
    selection: string | SelectOptionObject,
    isPlaceholder?: boolean
  ) {
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

      <Panel>
        <PanelMainBody>
          <Flex>
            <Text>
              <b>{Labels.LegendGroupsItems}:</b>
            </Text>
            {groups?.map(({ id, name }, index) => (
              <Flex key={id}>
                <div
                  className="pf-u-mr-xs"
                  style={{
                    width: 10,
                    height: 10,
                    backgroundColor: nodeColors[index]
                  }}
                />
                {name}
              </Flex>
            ))}
          </Flex>
        </PanelMainBody>
      </Panel>
    </>
  );
};

export default TopologyProcesses;
