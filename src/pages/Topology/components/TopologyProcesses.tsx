import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
    Divider,
    Flex,
    Panel,
    PanelMainBody,
    Select,
    SelectOption,
    SelectOptionObject,
    Text,
    TextContent,
    TextVariants,
    Toolbar,
    ToolbarContent,
    ToolbarItem,
} from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { GraphEdge, GraphNode } from '@core/components/Graph/Graph.interfaces';
import { AddressesController } from '@pages/Addresses/services';
import { QueriesAddresses } from '@pages/Addresses/services/services.enum';
import ProcessesController from '@pages/Processes/services';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import SitesController from '@pages/Sites/services';
import { UPDATE_INTERVAL } from 'config';

import { TopologyController } from '../services';
import { QueriesTopology } from '../services/services.enum';
import { colors } from '../Topology.constant';
import { Labels } from '../Topology.enum';
import TopologyProcessesDetails from './DetailsProcesses';
import TopologyPanel from './TopologyPanel';

const TopologyProcesses = function () {
    const navigate = useNavigate();

    const topologyRef = useRef<any>();

    const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [links, setLinks] = useState<GraphEdge[]>([]);
    const [nodeSelected, setNodeSelected] = useState<string | null>(null);

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [addressIdSelected, setAddressId] = useState<string>();

    const { data: sites } = useQuery([QueriesTopology.GetSites], SitesController.getSites, {
        refetchInterval,
        onError: handleError,
    });

    const { data: processes, isLoading: isLoadingProcesses } = useQuery(
        [QueriesTopology.GetProcesses],
        ProcessesController.getProcesses,
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: addresses, isLoading: isLoadingAddresses } = useQuery(
        [QueriesAddresses.GetAddresses],
        AddressesController.getAddresses,
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

    function handleGetSelectedNode(id: string) {
        if (id !== nodeSelected) {
            setNodeSelected(id);
        }
    }

    function handleToggle(isSelectAddressOpen: boolean) {
        setIsOpen(isSelectAddressOpen);
    }

    function handleSelect(
        _: React.MouseEvent | React.ChangeEvent,
        selection: string | SelectOptionObject,
        isPlaceholder?: boolean,
    ) {
        const addressId = isPlaceholder ? undefined : (selection as string);

        setAddressId(addressId);
        setIsOpen(false);
        topologyRef?.current?.deselectAll();
    }

    // Refresh topology data
    const updateTopologyData = useCallback(async () => {
        if (
            sites &&
            processes &&
            processesLinks &&
            !(isLoadingProcessLinksByAddress && addressIdSelected)
        ) {
            const siteNodes = await TopologyController.getNodesFromSitesOrProcessGroups(sites);

            const processesNodes = await TopologyController.getNodesFromProcesses(
                processes,
                siteNodes,
            );
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
        isLoadingProcessLinksByAddress,
        sites,
        processes,
        processesLinks,
        addressIdSelected,
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
        <SelectOption key={0} value="Select an address" isPlaceholder />,
        ...(options || []),
    ];

    return (
        <>
            <Toolbar>
                <ToolbarContent>
                    <ToolbarItem>
                        <Select
                            isOpen={isOpen}
                            onSelect={handleSelect}
                            onToggle={handleToggle}
                            selections={addressIdSelected}
                        >
                            {optionsWithDefault}
                        </Select>
                    </ToolbarItem>
                </ToolbarContent>
            </Toolbar>
            <Divider />

            <TopologyPanel
                ref={topologyRef}
                nodes={nodes}
                links={links}
                onGetSelectedNode={handleGetSelectedNode}
                options={{ showGroup: true }}
            >
                {nodeSelected && <TopologyProcessesDetails id={nodeSelected} />}
            </TopologyPanel>

            <Divider />
            <Panel>
                <PanelMainBody>
                    <Flex>
                        <TextContent>
                            <Text
                                component={TextVariants.small}
                            >{`${Labels.LegendGroupsItems}:`}</Text>
                        </TextContent>
                        {sites?.map((node, index) => (
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
