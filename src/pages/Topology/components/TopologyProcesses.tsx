import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

import {
    Checkbox,
    Divider,
    Flex,
    Panel,
    PanelMainBody,
    Select,
    SelectOption,
    SelectOptionObject,
    Toolbar,
    ToolbarContent,
    ToolbarItem,
} from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { GraphEdge, GraphNode } from '@core/components/Graph/Graph.interfaces';
import { QueriesAddresses } from '@pages/Addresses/services/services.enum';
import { QueriesProcesses } from '@pages/Processes/services/services.enum';
import { QueriesProcessGroups } from '@pages/ProcessGroups/services/services.enum';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { QueriesSites } from '@pages/Sites/services/services.enum';
import { RESTApi } from 'API/REST';
import { UPDATE_INTERVAL } from 'config';

import { TopologyController } from '../services';
import { QueriesTopology } from '../services/services.enum';
import { colors } from '../Topology.constant';
import { Labels } from '../Topology.enum';
import TopologyProcessesDetails from './DetailsProcesses';
import TopologyPanel from './TopologyPanel';

const TopologyProcesses: FC<{ addressId?: string | null; processId?: string | null }> = function ({
    addressId,
    processId,
}) {
    const navigate = useNavigate();

    const topologyRef = useRef<{ deselectAll: () => void } | null>(null);

    const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [links, setLinks] = useState<GraphEdge[]>([]);
    const [nodeSelected, setNodeSelected] = useState<string | null>(processId || null);

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [addressIdSelected, setAddressId] = useState<string | undefined>(addressId || undefined);
    const [shouldShowProcessGroups, setShouldShowProcessGroups] = useState<boolean>(false);

    const { data: sites } = useQuery([QueriesSites.GetSites], () => RESTApi.fetchSites(), {
        refetchInterval,
        onError: handleError,
    });

    const { data: processGroups } = useQuery(
        [QueriesProcessGroups.GetProcessGroups],
        () => RESTApi.fetchProcessGroups(),
        {
            enabled: shouldShowProcessGroups,
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: processes, isLoading: isLoadingProcesses } = useQuery(
        [QueriesProcesses.GetProcess],
        () => RESTApi.fetchProcesses(),
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: addresses, isLoading: isLoadingAddresses } = useQuery(
        [QueriesAddresses.GetAddresses],
        () => RESTApi.fetchAddresses(),
        {
            onError: handleError,
        },
    );

    const { data: processesLinks, isLoading: isLoadingProcessesLInks } = useQuery(
        [QueriesTopology.GetProcessesLinks],
        TopologyController.getProcessesLinks,
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: processesLinksByAddress, isLoading: isLoadingProcessLinksByAddress } = useQuery(
        [QueriesTopology.GetProcessesLinksByAddress, addressIdSelected],
        () =>
            addressIdSelected
                ? TopologyController.getProcessesLinksByAddress(addressIdSelected)
                : undefined,
        {
            enabled: !!addressIdSelected,
            refetchInterval,
            onError: handleError,
        },
    );

    function handleError({ httpStatus }: { httpStatus?: HttpStatusErrors }) {
        const route = httpStatus
            ? ErrorRoutesPaths.error[httpStatus]
            : ErrorRoutesPaths.ErrConnection;

        setRefetchInterval(0);
        navigate(route);
    }

    function handleChangeShouldShowProcesses(checked: boolean) {
        setShouldShowProcessGroups(checked);
    }

    const handleGetSelectedNode = useCallback(
        (id: string) => {
            if (id !== nodeSelected) {
                setNodeSelected(id);
            }
        },
        [nodeSelected],
    );

    function handleToggle(isSelectAddressOpen: boolean) {
        setIsOpen(isSelectAddressOpen);
    }

    function handleSelect(
        _: React.MouseEvent | React.ChangeEvent,
        selection: string | SelectOptionObject,
        isPlaceholder?: boolean,
    ) {
        const id = isPlaceholder ? undefined : (selection as string);

        setAddressId(id);
        setIsOpen(false);
        topologyRef?.current?.deselectAll();
    }

    // Refresh topology data
    const updateTopologyData = useCallback(async () => {
        if (
            sites &&
            processesLinks &&
            processes &&
            !(isLoadingProcessLinksByAddress && addressIdSelected)
        ) {
            if (shouldShowProcessGroups && processGroups) {
                const processGroupsNodes =
                    TopologyController.getNodesFromSitesOrProcessGroups(processGroups);

                const processesNodes = TopologyController.getNodesFromProcesses(
                    processes.map((process) => ({
                        ...process,
                        identity: `pGroup${process.identity}`,
                        parent: process.groupIdentity,
                    })),
                    processGroupsNodes,
                );

                setNodes(processesNodes);
                setLinks(
                    TopologyController.getEdgesFromLinks(
                        processesLinks.map(({ source, target, key }) => ({
                            source: `pGroup${source}`,
                            target: `pGroup${target}`,
                            key,
                        })),
                    ),
                );

                return;
            }

            const siteNodes = TopologyController.getNodesFromSitesOrProcessGroups(sites);
            const processesNodes = TopologyController.getNodesFromProcesses(processes, siteNodes);
            const processesSourcesIds = processesLinksByAddress?.map((p) => p.source) || [];
            const processesTargetIds = processesLinksByAddress?.map((p) => p.target) || [];
            const processesAddress = [...processesSourcesIds, ...processesTargetIds];

            const uniqueProcessesLinksByAddress = processesLinksByAddress?.filter(
                (v, i, a) =>
                    a.findIndex((v2) => v2.source === v.source && v2.target === v.target) === i,
            );

            setNodes(
                uniqueProcessesLinksByAddress
                    ? processesNodes.map((node) => {
                          if (!processesAddress.includes(node.id)) {
                              return { ...node, isDisabled: true };
                          }

                          return node;
                      })
                    : processesNodes,
            );

            setLinks(
                TopologyController.getEdgesFromLinks(
                    uniqueProcessesLinksByAddress || processesLinks,
                ),
            );
        }
    }, [
        sites,
        processes,
        processesLinks,
        processGroups,
        isLoadingProcessLinksByAddress,
        addressIdSelected,
        shouldShowProcessGroups,
        processesLinksByAddress,
    ]);

    useEffect(() => {
        updateTopologyData();
    }, [updateTopologyData]);

    if (isLoadingProcesses || isLoadingProcessesLInks || isLoadingAddresses) {
        return <LoadingPage />;
    }

    const options = addresses?.map(({ name, identity, currentFlows }, index) => (
        <SelectOption key={index + 1} value={identity} isDisabled={!currentFlows}>
            {name}
        </SelectOption>
    ));

    const optionsWithDefault = [
        <SelectOption key={0} value={Labels.ShowAll} isPlaceholder />,
        ...(options || []),
    ];

    return (
        <>
            <Toolbar>
                <ToolbarContent>
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
                                disabled={shouldShowProcessGroups}
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
            <Divider />

            <TopologyPanel
                ref={topologyRef}
                nodes={nodes}
                links={links}
                onGetSelectedNode={handleGetSelectedNode}
                options={{ showGroup: true, shouldOpenDetails: !!nodeSelected }}
            >
                {nodeSelected && <TopologyProcessesDetails id={nodeSelected} />}
            </TopologyPanel>

            <Divider />
            <Panel>
                <PanelMainBody>
                    <Flex>
                        {(shouldShowProcessGroups ? processGroups : sites)?.map((node, index) => (
                            <Flex key={node.identity}>
                                <div
                                    className="pf-u-mr-xs"
                                    style={{
                                        width: 10,
                                        height: 10,
                                        backgroundColor: colors[index],
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
