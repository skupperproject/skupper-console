import React, { FC, useCallback, useEffect, useState } from 'react';

import {
  Checkbox,
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

import { GraphEdge, GraphNode } from '@core/components/Graph/Graph.interfaces';
import { QueriesAddresses } from '@pages/Addresses/services/services.enum';
import { ProcessesRoutesPaths } from '@pages/Processes/Processes.enum';
import { QueriesProcesses } from '@pages/Processes/services/services.enum';
import { QueriesProcessGroups } from '@pages/ProcessGroups/services/services.enum';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { QueriesSites } from '@pages/Sites/services/services.enum';
import { RESTApi } from 'API/REST';
import { UPDATE_INTERVAL } from 'config';

import TopologyPanel from './TopologyPanel';
import { TopologyController } from '../services';
import { QueriesTopology } from '../services/services.enum';
import { colors } from '../Topology.constant';
import { Labels } from '../Topology.enum';

const processesQueryParams = {
  filter: 'processRole.external'
};

const processGroupsQueryParams = {
  filter: 'processGroupRole.external'
};

const TopologyProcesses: FC<{ addressId?: string | null; id?: string | null }> = function ({
  addressId,
  id: processId
}) {
  const navigate = useNavigate();

  const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphEdge<string>[]>([]);
  const [nodeSelected] = useState<string | null>(processId || null);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [addressIdSelected, setAddressId] = useState<string | undefined>(addressId || undefined);
  const [shouldShowProcessGroups, setShouldShowProcessGroups] = useState<boolean>(false);

  const { data: sites } = useQuery([QueriesSites.GetSites], () => RESTApi.fetchSites(), {
    refetchInterval,
    onError: handleError
  });

  const { data: processGroups } = useQuery(
    [QueriesProcessGroups.GetProcessGroups, processGroupsQueryParams],
    () => RESTApi.fetchProcessGroups(processGroupsQueryParams),
    {
      enabled: shouldShowProcessGroups,
      refetchInterval,
      onError: handleError
    }
  );

  const { data: processesRaw, isLoading: isLoadingProcesses } = useQuery(
    [QueriesProcesses.GetProcess, processesQueryParams],
    () => RESTApi.fetchProcesses(processesQueryParams),
    {
      refetchInterval,
      onError: handleError
    }
  );

  const processes = processesRaw?.results;

  const { data: addresses, isLoading: isLoadingAddresses } = useQuery(
    [QueriesAddresses.GetAddresses],
    () => RESTApi.fetchAddresses(),
    {
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

  const { data: processesPairsByAddress, isLoading: isLoadingProcessPairsByAddress } = useQuery(
    [QueriesTopology.GetProcessesPairsByAddress, addressIdSelected],
    () => (addressIdSelected ? RESTApi.fetchFlowPairsByAddress(addressIdSelected) : undefined),
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

  function handleChangeShouldShowProcesses(checked: boolean) {
    setShouldShowProcessGroups(checked);
  }

  const handleGetSelectedNode = useCallback(
    ({ id, name }: { id: string; name: string }) => {
      const idSelected = id.startsWith('pGroup') ? id.split('pGroup')[1] : id;
      navigate(`${ProcessesRoutesPaths.Processes}/${name}@${idSelected}`);
    },
    [navigate]
  );

  const handleGetSelectedEdge = useCallback(
    (edge: GraphEdge) => {
      const sourceId = edge.source.id;
      const destinationId = edge.target.id;
      navigate(`${ProcessesRoutesPaths.Processes}/${sourceId}/${sourceId}-to-${destinationId}`);
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

  // Refresh topology data
  const updateTopologyData = useCallback(async () => {
    if (sites && processesPairs && processes && !(isLoadingProcessPairsByAddress && addressIdSelected)) {
      const processesLinks = TopologyController.getProcessesLinks(processesPairs);

      if (shouldShowProcessGroups && processGroups) {
        const processGroupsNodes = TopologyController.getNodesFromSitesOrProcessGroups(processGroups);

        const processesNodes = TopologyController.getNodesFromProcesses(
          processes.map((process) => ({
            ...process,
            identity: `pGroup${process.identity}`,
            parent: process.groupIdentity
          })),
          processGroupsNodes
        );

        setNodes(processesNodes);

        setLinks(
          TopologyController.getEdgesFromLinks(
            processesLinks.map(({ source, target, key, rate }) => ({
              source: `pGroup${source}`,
              target: `pGroup${target}`,
              rate,
              key
            }))
          )
        );

        return;
      }

      const processesLinksByAddress = processesPairsByAddress?.results
        ? TopologyController.getProcessesLinksByAddress(processesPairsByAddress.results)
        : undefined;

      const siteNodes = TopologyController.getNodesFromSitesOrProcessGroups(sites);
      const processesNodes = TopologyController.getNodesFromProcesses(processes, siteNodes);
      const processesSourcesIds = processesLinksByAddress?.map((p) => p.source) || [];
      const processesTargetIds = processesLinksByAddress?.map((p) => p.target) || [];
      const processesAddressIds = [...processesSourcesIds, ...processesTargetIds];

      const uniqueProcessesLinksByAddress = processesLinksByAddress?.filter(
        (v, i, a) => a.findIndex((v2) => v2.source === v.source && v2.target === v.target) === i
      );

      setNodes(
        uniqueProcessesLinksByAddress
          ? processesNodes.map((node) => {
              if (!processesAddressIds.includes(node.id)) {
                return { ...node, isDisabled: true };
              }

              return node;
            })
          : processesNodes
      );

      setLinks(TopologyController.getEdgesFromLinks(uniqueProcessesLinksByAddress || processesLinks));
    }
  }, [
    sites,
    processes,
    processesPairs,
    processGroups,
    isLoadingProcessPairsByAddress,
    addressIdSelected,
    shouldShowProcessGroups,
    processesPairsByAddress
  ]);

  useEffect(() => {
    updateTopologyData();
  }, [updateTopologyData]);

  if (isLoadingProcesses || isLoadingProcessesPairs || isLoadingAddresses) {
    return <LoadingPage />;
  }

  const options = addresses?.map(({ name, identity }, index) => (
    <SelectOption key={index + 1} value={identity}>
      {name}
    </SelectOption>
  ));

  const optionsWithDefault = [<SelectOption key={0} value={Labels.ShowAll} isPlaceholder />, ...(options || [])];

  return (
    <>
      <Toolbar>
        <ToolbarContent style={{ height: '30px' }}>
          <ToolbarItem>
            <Checkbox
              label={Labels.ShowProcessGroups}
              isChecked={shouldShowProcessGroups}
              onChange={handleChangeShouldShowProcesses}
              id="show_process"
            />
          </ToolbarItem>
          {!shouldShowProcessGroups && (
            <ToolbarItem>
              <Select
                isDisabled={shouldShowProcessGroups}
                isOpen={isOpen}
                onSelect={handleSelect}
                onToggle={handleToggle}
                selections={addressIdSelected}
              >
                {optionsWithDefault}
              </Select>
            </ToolbarItem>
          )}
        </ToolbarContent>
      </Toolbar>

      <TopologyPanel
        nodes={nodes}
        edges={links}
        onGetSelectedNode={handleGetSelectedNode}
        onGetSelectedEdge={handleGetSelectedEdge}
        nodeSelected={nodeSelected}
        options={{ showGroup: true }}
      />

      <Panel>
        <PanelMainBody>
          <Flex>
            <Text>
              <b>{shouldShowProcessGroups ? 'Components: ' : ' Sites: '}</b>
            </Text>
            {(shouldShowProcessGroups ? processGroups : sites)?.map((node, index) => (
              <Flex key={node.identity}>
                <div
                  className="pf-u-mr-xs"
                  style={{
                    width: 10,
                    height: 10,
                    backgroundColor: colors[index]
                  }}
                />
                {node.name}
              </Flex>
            ))}
          </Flex>
        </PanelMainBody>
      </Panel>
    </>
  );
};

export default TopologyProcesses;
