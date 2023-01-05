import React, { useCallback, useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { GraphEdge, GraphNode } from '@core/components/Graph/Graph.interfaces';
import { QueriesProcessGroups } from '@pages/ProcessGroups/services/services.enum';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { RESTApi } from 'API/REST';
import { UPDATE_INTERVAL } from 'config';

import { TopologyController } from '../services';
import { QueriesTopology } from '../services/services.enum';
import TopologyProcessGroupsDetails from './DetailsProcessGroups';
import TopologyPanel from './TopologyPanel';

const TopologyProcessGroups = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [links, setLinks] = useState<GraphEdge[]>([]);
    const [nodeSelected, setNodeSelected] = useState<string | null>(null);

    const { data: processGroups, isLoading: isLoadingProcessGroups } = useQuery(
        [QueriesProcessGroups.GetProcessGroups],
        () => RESTApi.fetchProcessGroups(),
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: processGroupsPairs, isLoading: isLoadingProcessGroupsPairs } = useQuery(
        [QueriesTopology.GetProcessGroupsLinks],
        () => RESTApi.fetchProcessgroupsPairs(),
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

    const handleGetSelectedNode = useCallback(
        (id: string) => {
            if (id !== nodeSelected) {
                setNodeSelected(id);
            }
        },
        [nodeSelected],
    );
    // Refresh topology data
    const updateTopologyData = useCallback(async () => {
        if (processGroups && processGroupsPairs) {
            const processGroupsLinks = TopologyController.getProcessGroupsLinks(processGroupsPairs);

            const processGroupsNodes =
                TopologyController.getNodesFromSitesOrProcessGroups(processGroups);

            processGroupsLinks;

            setNodes(processGroupsNodes);
            setLinks(TopologyController.getEdgesFromLinks(processGroupsLinks));
        }
    }, [processGroups, processGroupsPairs]);

    useEffect(() => {
        updateTopologyData();
    }, [updateTopologyData]);

    if (isLoadingProcessGroups || isLoadingProcessGroupsPairs) {
        return <LoadingPage />;
    }

    return (
        <TopologyPanel
            nodes={nodes}
            links={links}
            onGetSelectedNode={handleGetSelectedNode}
            options={{ shouldOpenDetails: !!nodeSelected }}
        >
            {nodeSelected && <TopologyProcessGroupsDetails id={nodeSelected} />}
        </TopologyPanel>
    );
};

export default TopologyProcessGroups;
