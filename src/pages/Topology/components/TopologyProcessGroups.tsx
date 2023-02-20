import React, { FC, useCallback, useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { GraphEdge, GraphNode } from '@core/components/Graph/Graph.interfaces';
import { ProcessGroupsRoutesPaths } from '@pages/ProcessGroups/ProcessGroups.enum';
import { QueriesProcessGroups } from '@pages/ProcessGroups/services/services.enum';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { RESTApi } from 'API/REST';
import { UPDATE_INTERVAL } from 'config';

import TopologyPanel from './TopologyPanel';
import { TopologyController } from '../services';
import { QueriesTopology } from '../services/services.enum';

const processGroupsQueryParams = {
    filter: 'processGroupRole.external',
};

const TopologyProcessGroups: FC<{ id?: string | null }> = function ({ id }) {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [links, setLinks] = useState<GraphEdge<string>[]>([]);
    const [nodeSelected] = useState<string | null>(id || null);

    const { data: processGroups, isLoading: isLoadingProcessGroups } = useQuery(
        [QueriesProcessGroups.GetProcessGroups],
        () => RESTApi.fetchProcessGroups(processGroupsQueryParams),
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
        (idSelected: string) => {
            navigate(`${ProcessGroupsRoutesPaths.ProcessGroups}/${idSelected}`);
        },
        [navigate],
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
            edges={links}
            onGetSelectedNode={handleGetSelectedNode}
            nodeSelected={nodeSelected}
        />
    );
};

export default TopologyProcessGroups;
