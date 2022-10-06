import React, { useCallback, useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { xml } from 'd3-fetch';
import { useNavigate } from 'react-router-dom';

import siteSVG from '@assets/site.svg';
import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import { UPDATE_INTERVAL } from 'config';

import { TopologyController } from '../services';
import { QueriesTopology } from '../services/services.enum';
import { TopologyLink, TopologyNode } from '../Topology.interfaces';
import TopologySiteDetails from './DetailsSite';
import TopologyPanel from './TopologyPanel';

const TopologySite = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);
    const [topology, setTopology] = useState<{ nodes: TopologyNode[]; links: TopologyLink[] }>({
        nodes: [],
        links: [],
    });
    const [nodeSelected, setNodeSelected] = useState<string>('');

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

    function handleGetSelectedNode(id: string) {
        if (id !== nodeSelected) {
            setNodeSelected(id);
        }
    }

    // Refresh topology data
    const updateNodesAndLinks = useCallback(async () => {
        if (sites) {
            const siteXML = await xml(siteSVG);
            const nodes = TopologyController.getSiteDataNodes(sites).map((site) => ({
                ...site,
                img: siteXML,
            }));
            const links = TopologyController.getSiteEdges(sites);

            setTopology({ nodes, links });
        }
    }, [sites]);

    useEffect(() => {
        updateNodesAndLinks();
    }, [updateNodesAndLinks]);

    if (isLoading) {
        return <LoadingPage />;
    }

    return (
        <TopologyPanel
            nodes={topology.nodes}
            links={topology.links}
            onGetSelectedNode={handleGetSelectedNode}
        >
            <TopologySiteDetails id={nodeSelected} />
        </TopologyPanel>
    );
};

export default TopologySite;
