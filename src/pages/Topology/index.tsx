import React, { useCallback, useMemo, useState } from 'react';

import { Radio } from '@patternfly/react-core';
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
import { TopologyViews } from './topology.enum';
import { TopologySVG } from './Topology.interfaces';

const Topology = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState<number>(0);
    const [svgTopologyComponent, setSvgTopologyComponent] = useState<TopologySVG>();
    const [topologyType, setTopologyType] = useState<string>(TopologyViews.Sites);

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

    function handleChangeTopologyType(_: boolean, event: React.FormEvent<HTMLInputElement>) {
        const { value } = event.currentTarget;
        setTopologyType(value);
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

    const linkSites = useMemo(
        () =>
            sites?.flatMap(({ siteId: sourceId, connected }) =>
                connected.flatMap((targetId) => [
                    {
                        source: sourceId,
                        target: targetId,
                        type: 'linkSite',
                    },
                ]),
            ),
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

    const linkServices = useMemo(
        () =>
            deployments?.deploymentLinks?.flatMap(({ source, target }) => ({
                source: source.key,
                target: target.key,
                type: 'linkService',
            })),
        [deployments?.deploymentLinks],
    );

    const panelRef = useCallback(
        async (node: HTMLDivElement) => {
            if (node && linkSites && siteNodes && serviceNodes && linkServices) {
                node.replaceChildren();

                const nodes = topologyType === 'sites' ? siteNodes : serviceNodes;
                const links = topologyType === 'sites' ? linkSites : linkServices;

                const topologySitesRef = TopologySites(
                    node,
                    nodes,
                    links,
                    node.getBoundingClientRect().width,
                    node.getBoundingClientRect().height,
                );

                setSvgTopologyComponent(await topologySitesRef);
            }
        },
        [linkServices, linkSites, serviceNodes, siteNodes, topologyType],
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

    const ViewToolbar = function () {
        return (
            <>
                <Radio
                    className="pf-u-mr-md"
                    isChecked={topologyType === TopologyViews.Sites}
                    name={TopologyViews.Sites}
                    onChange={handleChangeTopologyType}
                    label={TopologyViews.Sites}
                    id={TopologyViews.Sites}
                    value={TopologyViews.Sites}
                />
                <Radio
                    isChecked={topologyType === TopologyViews.Deployments}
                    name={TopologyViews.Deployments}
                    onChange={handleChangeTopologyType}
                    label={TopologyViews.Deployments}
                    id={TopologyViews.Deployments}
                    value={TopologyViews.Deployments}
                />
            </>
        );
    };

    return (
        <TopologyView
            viewToolbar={<ViewToolbar />}
            controlBar={<TopologyControlBar controlButtons={controlButtons} />}
        >
            <div ref={panelRef} style={{ width: '100%', height: '100%' }} />
        </TopologyView>
    );
};

export default Topology;
