import React, { useCallback, useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { GraphEdge, GraphNode } from '@core/components/Graph/Graph.interfaces';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { QueriesSites } from '@pages/Sites/services/services.enum';
import { RESTApi } from 'API/REST';
import { UPDATE_INTERVAL } from 'config';

import TopologySiteDetails from './DetailsSite';
import TopologyPanel from './TopologyPanel';
import { TopologyController } from '../services';

const TopologySite = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);

    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [edges, setEdges] = useState<GraphEdge[]>([]);
    const [nodeSelected, setNodeSelected] = useState<string | null>(null);

    const { data: sites, isLoading: isLoadingSites } = useQuery(
        [QueriesSites.GetSites],
        () => RESTApi.fetchSites(),
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: routers, isLoading: isLoadingRouters } = useQuery(
        [QueriesSites.GetRouters],
        () => RESTApi.fetchRouters(),
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: links, isLoading: isLoadingLinks } = useQuery(
        [QueriesSites.GetLinks],
        () => RESTApi.fetchLinks(),
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
        if (sites && routers && links) {
            const sitesWithLinks = TopologyController.getSitesWithLinksCreated(
                sites,
                routers,
                links,
            );

            const siteNodes = TopologyController.getNodesFromSitesOrProcessGroups(sites);

            setNodes(siteNodes);
            setEdges(TopologyController.getEdgesFromSitesConnected(sitesWithLinks));
        }
    }, [links, routers, sites]);

    useEffect(() => {
        updateTopologyData();
    }, [updateTopologyData]);

    if (isLoadingSites || isLoadingLinks || isLoadingRouters) {
        return <LoadingPage />;
    }

    return (
        <TopologyPanel nodes={nodes} links={edges} onGetSelectedNode={handleGetSelectedNode}>
            {nodeSelected && <TopologySiteDetails id={nodeSelected} />}
        </TopologyPanel>
    );
};

export default TopologySite;
