import React, { FC, useCallback, useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { GraphEdge, GraphNode } from '@core/components/Graph/Graph.interfaces';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { QueriesSites } from '@pages/Sites/services/services.enum';
import { SitesRoutesPaths } from '@pages/Sites/Sites.enum';
import { RESTApi } from 'API/REST';
import { UPDATE_INTERVAL } from 'config';

import TopologyPanel from './TopologyPanel';
import { TopologyController } from '../services';

const TopologySite: FC<{ id?: string | null }> = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);

    const [nodes, setNodes] = useState<GraphNode[]>();
    const [edges, setEdges] = useState<GraphEdge<string>[]>();

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
        (idSelected: string) => {
            if (idSelected) {
                navigate(`${SitesRoutesPaths.Sites}/${idSelected}`);
            }
        },
        [navigate],
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

    if (!nodes || !edges) {
        return null;
    }

    return <TopologyPanel nodes={nodes} edges={edges} onGetSelectedNode={handleGetSelectedNode} />;
};

export default TopologySite;
