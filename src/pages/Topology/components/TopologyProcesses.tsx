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
import { xml } from 'd3-fetch';
import { useNavigate } from 'react-router-dom';

import serviceSVG from '@assets/service.svg';
import ProcessesController from '@pages/Processes/services';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import SitesController from '@pages/Sites/services';
import { UPDATE_INTERVAL } from 'config';

import { TopologyController } from '../services';
import { QueriesTopology } from '../services/services.enum';
import { Labels } from '../Topology.enum';
import { TopologyLink, TopologyNode } from '../Topology.interfaces';
import TopologyProcessesDetails from './DetailsProcesses';
import TopologyPanel from './TopologyPanel';

const TopologyProcesses = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);
    const [nodes, setNodes] = useState<TopologyNode[]>([]);
    const [links, setLinks] = useState<TopologyLink[]>([]);
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
            const serviceXML = await xml(serviceSVG);
            const nodesSites = TopologyController.getSiteNodes(sites);

            const processesNodes = TopologyController.getProcessNodes(processes, nodesSites).map(
                (site) => ({
                    ...site,
                    img: serviceXML,
                }),
            );

            setNodes(processesNodes);
            setLinks(TopologyController.getProcessLinks(processesLinks));
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
                        {TopologyController.getSiteNodes(sites || []).map((node) => (
                            <Flex key={node.id}>
                                <div
                                    className="pf-u-mr-xs"
                                    style={{
                                        width: 10,
                                        height: 10,
                                        backgroundColor: node.color,
                                    }}
                                />
                                {node.groupName}
                            </Flex>
                        ))}
                    </Flex>
                </PanelMainBody>
            </Panel>
        </>
    );
};

export default TopologyProcesses;
