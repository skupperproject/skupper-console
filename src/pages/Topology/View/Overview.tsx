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
import { TopologyServices } from '../services';
import { QueryTopology } from '../services/services.enum';
import { TopologyOverviewLabels } from './Overview.enum';

const TopologyContent = function () {
    const navigate = useNavigate();
    const [refetchInterval, setRefetchInterval] = useState<number>(UPDATE_INTERVAL);
    const [topologyGraphInstance, setTopologyGraphInstance] = useState<TopologyGraph>();
    const [topologyType, setTopologyType] = useState<string>(TopologyViews.Sites);
    const [areDetailsExpanded, setIsExpandedDetails] = useState(false);
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
                shouldOpen = areDetailsExpanded === false ? true : false;
            }

            setIsExpandedDetails(shouldOpen);
            setSelectedNode(id);
            selectedRef.current = selectedRef.current !== id ? id : '';
        },
        [areDetailsExpanded],
    );

    const handleCloseClick = () => {
        setIsExpandedDetails(false);
        setSelectedNode('');
        selectedRef.current = '';
    };

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
        ($node: HTMLDivElement | null) => {
            if ($node && nodes && links && !topologyGraphInstance?.isDragging()) {
                if (topologyGraphInstance) {
                    topologyGraphInstance.updateTopology(nodes, links);
                } else {
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
            }
        },
        [handleExpand, links, nodes, topologyGraphInstance],
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
        return <div />;
    };

    const PanelContent = (
        <DrawerPanelContent>
            <DrawerHead>
                {selectedNode && (
                    <span ref={drawerRef}>
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
            <Drawer isExpanded={areDetailsExpanded} position="right">
                <Tabs activeKey={topologyType} isFilled onSelect={handleChangeTopologyType} isBox>
                    <Tab eventKey={'sites'} title={<TabTitleText>Sites</TabTitleText>} />
                    <Tab
                        eventKey={'deployements'}
                        title={<TabTitleText>Deployments</TabTitleText>}
                    />
                </Tabs>
                <DrawerContent panelContent={PanelContent} style={{ overflow: 'hidden' }}>
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
                        {nodesSites?.map((node) => (
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

export default TopologyContent;
