import React, { useCallback, useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { xml } from 'd3-fetch';
import { useNavigate } from 'react-router-dom';

import serviceSVG from '@assets/service.svg';
import ProcessGroupsController from '@pages/ProcessGroups/services';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import { TopologyController } from '../services';
import { QueriesTopology } from '../services/services.enum';
import { TopologyEdges, TopologyNode } from '../Topology.interfaces';
import TopologyProcessGroupsDetails from './DetailsProcessGroups';
import TopologyPanel from './TopologyPanel';

const TopologyProcessGroups = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);
    const [nodes, setNodes] = useState<TopologyNode[]>([]);
    const [links, setLinks] = useState<TopologyEdges[]>([]);
    const [nodeSelected, setNodeSelected] = useState<string | null>(null);

    const { data: processGroups, isLoading: isLoadingProcessGroups } = useQuery(
        [QueriesTopology.GetProcessGroups],
        ProcessGroupsController.getProcessGroups,
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: processGroupsLinks, isLoading: isLoadingProcessGroupsLinks } = useQuery(
        [QueriesTopology.GetProcessGroupsLinks],
        TopologyController.getProcessGroupsLinks,
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
        if (processGroups && processGroupsLinks) {
            const siteXML = await xml(serviceSVG);
            const processGroupsNodes = TopologyController.getProcessGroupNodes(processGroups).map(
                (processGroup) => ({
                    ...processGroup,
                    img: siteXML,
                }),
            );

            setNodes(processGroupsNodes);
            setLinks(TopologyController.getProcessGroupNodesEdges(processGroupsLinks));
        }
    }, [processGroups, processGroupsLinks]);

    useEffect(() => {
        updateTopologyData();
    }, [updateTopologyData]);

    if (isLoadingProcessGroups || isLoadingProcessGroupsLinks) {
        return <LoadingPage />;
    }

    return (
        <TopologyPanel nodes={nodes} links={links} onGetSelectedNode={handleGetSelectedNode}>
            {nodeSelected && <TopologyProcessGroupsDetails id={nodeSelected} />}
        </TopologyPanel>
    );
};

export default TopologyProcessGroups;
