import React, { useCallback, useMemo, useState } from 'react';

import {
    createTopologyControlButtons,
    defaultControlButtonsOptions,
    TopologyControlBar,
    TopologyView,
} from '@patternfly/react-topology';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { ErrorRoutesPaths } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';

import { TopologyServices } from './services';
import { QueryTopology } from './services/services.enum';
import TopologySites from './Topology';
import { TopologySVG } from './Topology.interfaces';

const Topology = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState(0);
    const [svgTopologyComponent, setSvgTopologyComponent] = useState<TopologySVG>();

    const { data: sites, isLoading } = useQuery(
        QueryTopology.GetSites,
        TopologyServices.fetchSites,
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const { data: deployments, isLoading: isLoadingServices } = useQuery(
        QueryTopology.GetDeployments,
        TopologyServices.fetchDeployments,
        {
            refetchInterval,
            onError: handleError,
        },
    );

    function handleError({ httpStatus }: { httpStatus?: number }) {
        const route = httpStatus ? ErrorRoutesPaths.ErrServer : ErrorRoutesPaths.ErrConnection;

        setRefetchInterval(0);
        navigate(route);
    }

    const siteNodes = useMemo(
        () =>
            sites?.map((node) => ({
                id: node.siteId,
                name: node.siteName,
                x: 0,
                y: 0,
                type: 'site',
                group: sites?.findIndex(({ siteId }) => siteId === node.siteId) || 0,
            })),
        [sites],
    );

    const serviceNodes = useMemo(
        () =>
            deployments?.deployments?.map((node) => ({
                id: node.key,
                name: node.service.address,
                x: 0,
                y: 0,
                type: 'service',
                group: siteNodes?.findIndex(({ id }) => id === node.site.site_id) || 0,
            })),
        [deployments?.deployments, siteNodes],
    );

    const linkSites = useMemo(
        () =>
            sites?.flatMap(({ siteId: sourceId, connected }) => {
                const a = connected.flatMap((targetId) =>
                    // const sourceIndex = sites?.findIndex((site) => site.siteId === sourceId) || 0;
                    // const targetIndex = sites?.findIndex((site) => site.siteId === targetId) || 0;

                    [
                        {
                            source: sourceId,
                            target: targetId,
                            sourceId,
                            targetId,
                            type: 'linkSite',
                        },
                    ],
                );

                const b = (deployments?.deploymentLinks || [])
                    .filter(
                        (deployment) =>
                            deployment.source.site.site_id === sourceId &&
                            deployment.source.site.site_id !== deployment.target.site.site_id,
                    )
                    .flatMap(({ source, target }) =>
                        // const sourceIndex =
                        //     serviceNodes?.findIndex((service) => service.id === source.key) || 0;
                        // const targetIndex =
                        //     serviceNodes?.findIndex((service) => service.id === target.key) || 0;

                        ({
                            source: source.key,
                            target: sourceId,
                            sourceId: source.key,
                            targetId: target.key,
                            type: 'linkSite',
                        }),
                    );

                const c = (deployments?.deploymentLinks || [])
                    .filter(
                        (deployment) =>
                            deployment.target.site.site_id === sourceId &&
                            deployment.source.site.site_id !== deployment.target.site.site_id,
                    )
                    .flatMap(({ source, target }) =>
                        // const sourceIndex =
                        //     serviceNodes?.findIndex((service) => service.id === source.key) || 0;
                        // const targetIndex =
                        //     serviceNodes?.findIndex((service) => service.id === target.key) || 0;

                        ({
                            source: sourceId,
                            target: target.key,
                            sourceId: source.key,
                            targetId: target.key,
                            type: 'linkSite',
                        }),
                    );

                return [...a, ...b, ...c];
            }),
        [deployments, sites],
    );

    // console.log(deployments?.deploymentLinks);

    const linkServices = useMemo(
        () =>
            deployments?.deploymentLinks?.flatMap(({ source, target }) =>
                // const sourceIndex =
                //     serviceNodes?.findIndex((service) => service.id === source.key) || 0;
                // const targetIndex =
                //     serviceNodes?.findIndex((service) => service.id === target.key) || 0;

                ({
                    source:
                        source.site.site_id !== target.site.site_id
                            ? source.site.site_id
                            : source.key,

                    target:
                        source.site.site_id !== target.site.site_id
                            ? target.site.site_id
                            : target.key,
                    sourceId: source.key,
                    targetId: target.key,
                    type: 'linkService',
                }),
            ),
        [deployments?.deploymentLinks],
    );

    // console.log(linkSites);
    const panelRef = useCallback(
        (node) => {
            if (node && linkSites && siteNodes && serviceNodes && linkServices) {
                const topologySitesRef = TopologySites(
                    node,
                    [...siteNodes, ...serviceNodes],
                    [...linkSites, ...linkServices],
                    node.getBoundingClientRect().width,
                    node.getBoundingClientRect().height,
                );

                setSvgTopologyComponent(topologySitesRef);
            }
        },
        [linkServices, linkSites, serviceNodes, siteNodes],
    );

    if (isLoading && isLoadingServices) {
        return <LoadingPage />;
    }

    function handleZoomIn() {
        svgTopologyComponent?.zoomIn();
    }

    function handleZoomOut() {
        svgTopologyComponent?.zoomOut();
    }

    function handleResetView() {
        svgTopologyComponent?.reset();
    }

    const controlButtons = createTopologyControlButtons({
        ...defaultControlButtonsOptions,
        zoomInCallback: handleZoomIn,
        zoomOutCallback: handleZoomOut,
        resetViewCallback: handleResetView,
        fitToScreenHidden: true,
        legendHidden: true,
    });

    return (
        <TopologyView controlBar={<TopologyControlBar controlButtons={controlButtons} />}>
            <div ref={panelRef} style={{ width: '100%', height: '100%' }} />
        </TopologyView>
    );
};

export default Topology;
