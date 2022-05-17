import React, { useCallback, useMemo, useRef, useState } from 'react';

import {
    Drawer,
    DrawerActions,
    DrawerCloseButton,
    DrawerContent,
    DrawerContentBody,
    DrawerHead,
    DrawerPanelContent,
    Radio,
} from '@patternfly/react-core';
import {
    createTopologyControlButtons,
    defaultControlButtonsOptions,
    TopologyControlBar,
    TopologyView,
} from '@patternfly/react-topology';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';

import TopologySiteDetails from '../components/Details';
import TopologyGraph from '../components/Topology';
import { TopologyViews } from '../components/topology.enum';
import { TopologySVG } from '../components/Topology.interfaces';
import { TopologyServices } from '../services';
import { QueryTopology } from '../services/services.enum';

const Topology = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState<number>(0);
    const [svgTopologyComponent, setSvgTopologyComponent] = useState<TopologySVG>();
    const [topologyType, setTopologyType] = useState<string>(TopologyViews.Sites);
    const [isExpanded, setIsExpanded] = useState(false);

    const drawerRef = useRef<HTMLSpanElement>(null);
    const selected = useRef<any>(null);

    const { data: sites, isLoading } = useQuery(
        QueryTopology.GetSites,
        TopologyServices.fetchSites,
        {
            refetchInterval,
            onError: handleError,
        },
    );

    const handleExpand = (id: string) => {
        setIsExpanded(selected.current !== id ? !isExpanded : isExpanded);
        selected.current = selected.current !== id ? id : '';
    };

    const handleCloseClick = () => {
        setIsExpanded(false);
    };

    const { data: deployments, isLoading: isLoadingServices } = useQuery(
        QueryTopology.GetDeployments,
        TopologyServices.fetchDeployments,
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

    function handleChangeTopologyType(_: boolean, event: React.FormEvent<HTMLInputElement>) {
        const { value } = event.currentTarget;
        setTopologyType(value);
    }

    const siteNodes = useMemo(
        () =>
            sites?.map((node) => {
                const positions = localStorage.getItem(node.siteId);
                const fx = positions ? JSON.parse(positions).fx : null;
                const fy = positions ? JSON.parse(positions).fy : null;

                return {
                    id: node.siteId,
                    name: node.siteName,
                    x: fx || 0,
                    y: fy || 0,
                    fx,
                    fy,
                    type: 'site',
                    group: sites?.findIndex(({ siteId }) => siteId === node.siteId) || 0,
                };
            }),
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
            deployments?.deployments?.map((node) => {
                const positions = localStorage.getItem(node.key);
                const fx = positions ? JSON.parse(positions).fx : null;
                const fy = positions ? JSON.parse(positions).fy : null;

                return {
                    id: node.key,
                    name: node.service.address,
                    x: fx || 0,
                    y: fy || 0,
                    fx,
                    fy,
                    type: 'service',
                    group: siteNodes?.findIndex(({ id }) => id === node.site.site_id) || 0,
                };
            }),
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

                const topologySitesRef = TopologyGraph(
                    node,
                    nodes,
                    links,
                    node.getBoundingClientRect().width,
                    node.getBoundingClientRect().height,
                    handleExpand,
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

    const panelContent = (
        <DrawerPanelContent>
            <DrawerHead>
                <span tabIndex={isExpanded ? 0 : -1} ref={drawerRef}>
                    {topologyType === 'sites' ? (
                        <TopologySiteDetails
                            site={sites?.find(({ siteId }) => siteId === selected.current)}
                        />
                    ) : (
                        <TopologySiteDetails
                            site={sites?.find(({ siteId }) => siteId === selected.current)}
                        />
                    )}
                </span>
                <DrawerActions>
                    <DrawerCloseButton onClick={handleCloseClick} />
                </DrawerActions>
            </DrawerHead>
        </DrawerPanelContent>
    );

    return (
        <Drawer isExpanded={isExpanded} position="right">
            <DrawerContent panelContent={panelContent}>
                <DrawerContentBody>
                    <TopologyView
                        viewToolbar={<ViewToolbar />}
                        controlBar={<TopologyControlBar controlButtons={controlButtons} />}
                    >
                        <div ref={panelRef} style={{ width: '100%', height: '100%' }} />
                    </TopologyView>
                </DrawerContentBody>
            </DrawerContent>
        </Drawer>
    );
};

export default Topology;
