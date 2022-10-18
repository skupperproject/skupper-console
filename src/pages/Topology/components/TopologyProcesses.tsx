import React, { useCallback, useEffect, useState } from 'react';

import {
    Divider,
    Flex,
    Panel,
    PanelMainBody,
    Text,
    TextContent,
    TextVariants,
} from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { GraphEdge, GraphNode } from '@core/components/Graph/Graph.interfaces';
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
    const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [links, setLinks] = useState<GraphEdge[]>([]);
    const [nodeSelected, setNodeSelected] = useState<string | null>(null);

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

    const { data: processesLinks, isLoading: isLoadingProcessesLInks } = useQuery(
        [QueriesTopology.GetProcessesLinks],
        TopologyController.getProcessesLinks,
        {
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

    // Refresh topology data
    const updateTopologyData = useCallback(async () => {
        if (sites && processes && processesLinks) {
            const siteNodes = await TopologyController.getNodesFromSitesOrProcessGroups(sites);

            const processesNodes = await TopologyController.getNodesFromProcesses(
                processes,
                siteNodes,
            );

            setNodes(processesNodes);
            setLinks(TopologyController.getEdgesFromLinks(processesLinks));
        }
    }, [sites, processes, processesLinks]);

    useEffect(() => {
        updateTopologyData();
    }, [updateTopologyData]);

    if (isLoadingProcesses || isLoadingProcessesLInks) {
        return <LoadingPage />;
    }

    return (
        <>
            <TopologyPanel nodes={nodes} links={links} onGetSelectedNode={handleGetSelectedNode}>
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
