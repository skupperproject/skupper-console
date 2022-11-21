import React, { useCallback, useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { GraphEdge, GraphNode } from '@core/components/Graph/Graph.interfaces';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import { TopologyController } from '../services';
import { QueriesTopology } from '../services/services.enum';
import TopologySiteDetails from './DetailsSite';
import TopologyPanel from './TopologyPanel';

const TopologySite = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);

    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [links, setLinks] = useState<GraphEdge[]>([]);
    const [nodeSelected, setNodeSelected] = useState<string | null>(null);

    const { data: sites, isLoading: isLoading } = useQuery(
        [QueriesTopology.GetSitesWithLinksCreated],
        TopologyController.getSitesWithLinksCreated,
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
        if (sites) {
            const siteNodes = TopologyController.getNodesFromSitesOrProcessGroups(sites);

            setNodes(siteNodes);
            setLinks(TopologyController.getEdgesFromSitesConnected(sites));
        }
    }, [sites]);

    useEffect(() => {
        updateTopologyData();
    }, [updateTopologyData]);

    if (isLoading) {
        return <LoadingPage />;
    }

    return (
        <TopologyPanel nodes={nodes} links={links} onGetSelectedNode={handleGetSelectedNode}>
            {nodeSelected && <TopologySiteDetails id={nodeSelected} />}
        </TopologyPanel>
    );
};

export default TopologySite;
