import React, { useCallback, useMemo, useRef, useState } from 'react';

import {
    Drawer,
    DrawerActions,
    DrawerCloseButton,
    DrawerContent,
    DrawerHead,
    DrawerPanelBody,
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
import SitesServices from '@pages/Sites/services';

import TopologyGraph from '../components/Topology';
import { TopologyViews } from '../components/topology.enum';
import { TopologySVG } from '../components/Topology.interfaces';
import { TopologyServices } from '../services';
import { QueryTopology } from '../services/services.enum';
import TopologySiteDetails from './Details';

const Topology = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState<number>(0);
    const [svgTopologyComponent, setSvgTopologyComponent] = useState<TopologySVG>();
    const [topologyType, setTopologyType] = useState<string>(TopologyViews.Sites);
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedNode, setSelectedNode] = useState('');

    const drawerRef = useRef<HTMLSpanElement>(null);
    const selectedRef = useRef<string>('');

    const { data: sites, isLoading } = useQuery(QueryTopology.GetSites, SitesServices.fetchSites, {
        refetchInterval,
        onError: handleError,
    });

    const handleExpand = (id: string) => {
        setIsExpanded(selectedRef.current !== id ? !isExpanded : isExpanded);
        setSelectedNode(id);
        selectedRef.current = selectedRef.current !== id ? id : '';
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

    const siteNodes = useMemo(() => (sites ? TopologyServices.getSiteNodes(sites) : []), [sites]);
    const linkSites = useMemo(() => (sites ? TopologyServices.getLinkSites(sites) : []), [sites]);

    const serviceNodes = useMemo(
        () =>
            deployments?.deployments
                ? TopologyServices.getServiceNodes(deployments?.deployments, siteNodes)
                : [],
        [deployments?.deployments, siteNodes],
    );

    const linkServices = useMemo(
        () =>
            deployments?.deploymentLinks
                ? TopologyServices.getLinkServices(deployments?.deploymentLinks)
                : [],
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

    const PanelContent = (
        <DrawerPanelContent>
            <DrawerHead>
                <span tabIndex={isExpanded ? 0 : -1} ref={drawerRef}>
                    {topologyType === 'sites' ? (
                        <TopologySiteDetails id={selectedNode} />
                    ) : (
                        <TopologySiteDetails id={selectedNode} />
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
            <DrawerContent panelContent={PanelContent}>
                <DrawerPanelBody hasNoPadding>
                    <TopologyView
                        viewToolbar={<ViewToolbar />}
                        controlBar={<TopologyControlBar controlButtons={controlButtons} />}
                    >
                        <div ref={panelRef} style={{ width: '100%', height: '100%' }} />
                    </TopologyView>
                </DrawerPanelBody>
            </DrawerContent>
        </Drawer>
    );
};

export default Topology;
