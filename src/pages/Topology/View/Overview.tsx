import React, { useCallback, useEffect, useRef, useState } from 'react';

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
    Tab,
    Tabs,
    TabTitleText,
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
import { QueryObserverSuccessResult, useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { ErrorRoutesPaths, HttpStatusErrors } from '@pages/shared/Errors/errors.constants';
import LoadingPage from '@pages/shared/Loading';
import SitesServices from '@pages/Sites/services';
import { SiteResponse } from 'API/REST.interfaces';
import { UPDATE_INTERVAL } from 'config';

import TopologyDeploymentDetails from '../components/DetailsDeployment';
import TopologySiteDetails from '../components/DetailsSite';
import TopologyGraph from '../components/Topology';
import { TopologyViews } from '../components/Topology.enum';
import { TopologyServices } from '../services';
import { QueryTopology } from '../services/services.enum';
import { TopologyOverviewLabels } from './Overview.enum';

const TYPE_SITES = 'sites';
const TopologyContent = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);
    const [topologyGraphInstance, setTopologyGraphInstance] = useState<TopologyGraph>();
    const [topologyType, setTopologyType] = useState<string>(TopologyViews.Sites);
    const [areDetailsExpanded, setIsExpandedDetails] = useState(false);
    const [selectedNode, setSelectedNode] = useState('');

    const drawerRef = useRef<HTMLSpanElement>(null);
    const selectedRef = useRef<string>('');

    const { data: sites, isLoading: isLoadingSites } = useQuery(
        QueryTopology.GetSites,
        SitesServices.fetchSites,
        {
            initialData: [],
            refetchInterval,
            onError: handleError,
        },
    ) as QueryObserverSuccessResult<SiteResponse[]>;

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
                shouldOpen = areDetailsExpanded === false ? true : false;
            }

            setIsExpandedDetails(shouldOpen);
            setSelectedNode(id);
            selectedRef.current = selectedRef.current !== id ? id : '';
        },
        [areDetailsExpanded],
    );

    function handleCloseClick() {
        setIsExpandedDetails(false);
        setSelectedNode('');
        selectedRef.current = '';
    }

    function handleZoomIn() {
        topologyGraphInstance?.zoomIn();
    }

    function handleZoomOut() {
        topologyGraphInstance?.zoomOut();
    }

    function handleResetView() {
        topologyGraphInstance?.reset();
    }

    function handleChangeTopologyType(
        event: React.MouseEvent<HTMLElement, MouseEvent>,
        tabIndex: string | number,
    ) {
        setTopologyType(tabIndex as string);
        setTopologyGraphInstance(undefined);

        handleCloseClick();
    }

    const nodesSites = useCallback(() => TopologyServices.getNodesSites(sites), [sites]);
    const linkSites = useCallback(() => TopologyServices.getLinkSites(sites), [sites]);

    const servicesNodes = useCallback(
        () =>
            deployments?.deployments
                ? TopologyServices.getServiceNodes(deployments?.deployments, nodesSites())
                : [],
        [deployments?.deployments, nodesSites],
    );

    const servicesLinks = useCallback(
        () =>
            deployments?.deploymentLinks
                ? TopologyServices.getLinkServices(deployments?.deploymentLinks)
                : [],
        [deployments?.deploymentLinks],
    );

    const nodes = topologyType === TYPE_SITES ? nodesSites() : servicesNodes();
    const links = topologyType === TYPE_SITES ? linkSites() : servicesLinks();

    useEffect(() => {
        if (topologyGraphInstance && !topologyGraphInstance?.isDragging()) {
            topologyGraphInstance.updateTopology(nodes, links);
        }
    }, [links, nodes, topologyGraphInstance]);

    const panelRef = useCallback(
        ($node: HTMLDivElement | null) => {
            if ($node && nodes.length && links.length && !topologyGraphInstance) {
                $node.replaceChildren();

                const topologyGraph = new TopologyGraph(
                    $node,
                    nodes,
                    links,
                    $node.getBoundingClientRect().width,
                    $node.getBoundingClientRect().height,
                    handleExpand,
                );
                topologyGraph.updateTopology(nodes, links);

                setTopologyGraphInstance(topologyGraph);
            }
        },
        [handleExpand, links, nodes, topologyGraphInstance],
    );

    if (isLoadingSites || isLoadingServices) {
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

    const PanelContent = (
        <DrawerPanelContent>
            <DrawerHead>
                {selectedNode && (
                    <span ref={drawerRef}>
                        {topologyType === TYPE_SITES ? (
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
            <Drawer isExpanded={areDetailsExpanded} position="right">
                <Tabs activeKey={topologyType} isFilled onSelect={handleChangeTopologyType} isBox>
                    <Tab eventKey={TYPE_SITES} title={<TabTitleText>Sites</TabTitleText>} />
                    <Tab
                        eventKey={'deployements'}
                        title={<TabTitleText>Deployments</TabTitleText>}
                    />
                </Tabs>
                <DrawerContent panelContent={PanelContent} style={{ overflow: 'hidden' }}>
                    <DrawerPanelBody hasNoPadding>
                        <TopologyView
                            controlBar={<TopologyControlBar controlButtons={controlButtons} />}
                        >
                            <div ref={panelRef} style={{ width: '100%', height: '100%' }} />
                        </TopologyView>
                    </DrawerPanelBody>
                </DrawerContent>
            </Drawer>
            <Divider />
            {topologyType !== TYPE_SITES && (
                <Panel className="pf-u-px-md pf-u-py-sm">
                    <Flex>
                        <TextContent>
                            <Text
                                component={TextVariants.small}
                            >{`${TopologyOverviewLabels.LegendGroupsItems}:`}</Text>
                        </TextContent>{' '}
                        {nodesSites()?.map((node) => (
                            <Flex key={node.id}>
                                <div
                                    className="pf-u-mr-xs"
                                    style={{
                                        width: 10,
                                        height: 10,
                                        backgroundColor: node.color,
                                    }}
                                />
                                {node.groupName}
                            </Flex>
                        ))}
                    </Flex>
                </Panel>
            )}
        </>
    );
};

export default TopologyContent;
