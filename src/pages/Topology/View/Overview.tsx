import React, { useCallback, useMemo, useRef, useState } from 'react';

import {
    Divider,
    Drawer,
    DrawerActions,
    DrawerCloseButton,
    DrawerContent,
    DrawerHead,
    DrawerPanelBody,
    DrawerPanelContent,
    Flex,
    Panel,
    Radio,
    Text,
    TextContent,
    TextVariants,
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
import { UPDATE_INTERVAL } from 'config';

import TopologyDeploymentDetails from '../components/DetailsDeployment';
import TopologySiteDetails from '../components/DetailsSite';
import TopologyGraph from '../components/Topology';
import { TopologyViews } from '../components/Topology.enum';
import { TopologySVG } from '../components/Topology.interfaces';
import { TopologyServices } from '../services';
import { QueryTopology } from '../services/services.enum';
import { TopologyOverviewLabels } from './Overview.enum';

const Topology = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);
    const [svgTopologyComponentRef, setSvgTopologyComponentRef] = useState<TopologySVG>(null);
    const [topologyType, setTopologyType] = useState<string>(TopologyViews.Sites);
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedNode, setSelectedNode] = useState('');

    const drawerRef = useRef<HTMLSpanElement>(null);
    const selectedRef = useRef<string>('');

    const { data: sites, isLoading } = useQuery(QueryTopology.GetSites, SitesServices.fetchSites, {
        refetchInterval,
        onError: handleError,
    });

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

    const handleExpand = useCallback(
        (id: string) => {
            let shouldOpen = false;

            if (selectedRef.current !== id) {
                shouldOpen = true;
            }

            if (selectedRef.current === id) {
                shouldOpen = isExpanded === false ? true : false;
            }

            setIsExpanded(shouldOpen);
            setSelectedNode(id);
            selectedRef.current = selectedRef.current !== id ? id : '';
        },
        [isExpanded],
    );

    const handleCloseClick = () => {
        setIsExpanded(false);
        setSelectedNode('');
        selectedRef.current = '';
    };

    function handleZoomIn() {
        svgTopologyComponentRef?.zoomIn();
    }

    function handleZoomOut() {
        svgTopologyComponentRef?.zoomOut();
    }

    function handleResetView() {
        svgTopologyComponentRef?.reset();
    }

    function handleChangeTopologyType(_: boolean, event: React.FormEvent<HTMLInputElement>) {
        const { value } = event.currentTarget;
        setTopologyType(value);
        handleCloseClick();
    }

    const nodesSites = useMemo(() => (sites ? TopologyServices.getNodesSites(sites) : []), [sites]);
    const linkSites = useMemo(() => (sites ? TopologyServices.getLinkSites(sites) : []), [sites]);

    const serviceNodes = useMemo(
        () =>
            deployments?.deployments
                ? TopologyServices.getServiceNodes(deployments?.deployments, nodesSites)
                : [],
        [deployments?.deployments, nodesSites],
    );

    const linkServices = useMemo(
        () =>
            deployments?.deploymentLinks
                ? TopologyServices.getLinkServices(deployments?.deploymentLinks)
                : [],
        [deployments?.deploymentLinks],
    );

    const nodes = topologyType === 'sites' ? nodesSites : serviceNodes;
    const links = topologyType === 'sites' ? linkSites : linkServices;

    const panelRef = useCallback(
        async ($node: HTMLDivElement | null) => {
            if (
                $node &&
                linkSites &&
                nodesSites &&
                serviceNodes &&
                linkServices &&
                !svgTopologyComponentRef?.isDragging()
            ) {
                $node.replaceChildren();
                const topologySitesRef = await TopologyGraph(
                    $node,
                    nodes,
                    links,
                    $node.getBoundingClientRect().width,
                    $node.getBoundingClientRect().height,
                    handleExpand,
                );

                setSvgTopologyComponentRef(topologySitesRef);
            }
        },
        [nodes, links, topologyType],
    );

    if (isLoading && isLoadingServices) {
        return <LoadingPage />;
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
                {selectedNode && (
                    <span tabIndex={isExpanded ? 0 : -1} ref={drawerRef}>
                        {topologyType === 'sites' ? (
                            <TopologySiteDetails id={selectedNode} />
                        ) : (
                            <TopologyDeploymentDetails id={selectedNode} />
                        )}
                    </span>
                )}
                <DrawerActions>
                    <DrawerCloseButton onClick={handleCloseClick} />
                </DrawerActions>
            </DrawerHead>
        </DrawerPanelContent>
    );

    return (
        <>
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
            <Divider />
            {topologyType !== 'sites' && (
                <Panel className="pf-u-px-md pf-u-py-sm">
                    <Flex>
                        <TextContent>
                            <Text
                                component={TextVariants.small}
                            >{`${TopologyOverviewLabels.LegendGroupsItems}:`}</Text>
                        </TextContent>{' '}
                        {nodes?.map((node) => (
                            <span key={node.id}>
                                <div
                                    style={{
                                        display: 'inline-block',
                                        width: 20,
                                        height: 10,
                                        backgroundColor: node.color,
                                    }}
                                />{' '}
                                {node.groupName}
                            </span>
                        ))}
                    </Flex>
                </Panel>
            )}
        </>
    );
};

export default Topology;
