import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

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
import { xml } from 'd3-fetch';

import siteSVG from '@assets/server.svg';
import serviceSVG from '@assets/service.svg';
import { Site } from '@pages/Sites/services/services.interfaces';

import TopologyDeploymentDetails from '../components/DetailsDeployment';
import TopologySiteDetails from '../components/DetailsSite';
import TopologySVG from '../components/TopologySVG';
import { TopologyServices } from '../services';
import { Deployments } from '../services/services.interfaces';
import { TopologyViews } from '../Topology.enum';
import { TopologyOverviewLabels } from '../View/Topology.enum';
import { TopologyLink, TopologyNode } from './TopologySVG.interfaces';

const TYPE_SITES = 'sites';
const TopologySVGContainer: FC<{ sites: Site[]; deployments: Deployments }> = function ({
    sites,
    deployments,
}) {
    const [topologyGraphInstance, setTopologyGraphInstance] = useState<TopologySVG>();
    const [topologyType, setTopologyType] = useState<string>(TopologyViews.Sites);
    const [areDetailsExpanded, setIsExpandedDetails] = useState(false);
    const [selectedNode, setSelectedNode] = useState('');
    const [topology, setTopology] = useState<{ nodes: TopologyNode[]; links: TopologyLink[] }>({
        nodes: [],
        links: [],
    });

    const drawerRef = useRef<HTMLSpanElement>(null);
    const selectedRef = useRef<string>('');

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

    const panelRef = useCallback(
        ($node: HTMLDivElement | null) => {
            if ($node && topology.nodes.length && topology.links.length && !topologyGraphInstance) {
                $node.replaceChildren();

                const topologyGraph = new TopologySVG(
                    $node,
                    topology.nodes,
                    topology.links,
                    $node.getBoundingClientRect().width,
                    $node.getBoundingClientRect().height,
                    handleExpand,
                );
                topologyGraph.updateTopology(topology.nodes, topology.links);

                setTopologyGraphInstance(topologyGraph);
            }
        },
        [handleExpand, topology, topologyGraphInstance],
    );

    const updateNodesAndLinks = useCallback(async () => {
        if (topologyType === TYPE_SITES) {
            const siteXML = await xml(siteSVG);
            const nodes = TopologyServices.getNodesSites(sites).map((site) => ({
                ...site,
                img: siteXML,
            }));
            const links = TopologyServices.getLinkSites(sites);

            setTopology({ nodes, links });

            return;
        }

        const serviceXML = await xml(serviceSVG);
        const nodesSites = TopologyServices.getNodesSites(sites);

        const nodes = TopologyServices.getServiceNodes(deployments.deployments, nodesSites).map(
            (site) => ({ ...site, img: serviceXML }),
        );
        const links = TopologyServices.getLinkServices(deployments.deploymentLinks);

        setTopology({ nodes, links });
    }, [deployments?.deploymentLinks, deployments?.deployments, sites, topologyType]);

    useEffect(() => {
        updateNodesAndLinks();
    }, [updateNodesAndLinks]);

    useEffect(() => {
        if (topologyGraphInstance && !topologyGraphInstance?.isDragging()) {
            topologyGraphInstance.updateTopology(topology.nodes, topology.links, selectedNode);
        }
    }, [topology, topologyGraphInstance, selectedNode]);

    const controlButtonsComponent = createTopologyControlButtons({
        ...defaultControlButtonsOptions,
        zoomInCallback: handleZoomIn,
        zoomOutCallback: handleZoomOut,
        resetViewCallback: handleResetView,
        fitToScreenHidden: true,
        legendHidden: true,
    });

    const PanelContentComponent = (
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
                <DrawerContent panelContent={PanelContentComponent} style={{ overflow: 'hidden' }}>
                    <DrawerPanelBody hasNoPadding>
                        <TopologyView
                            controlBar={
                                <TopologyControlBar controlButtons={controlButtonsComponent} />
                            }
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
                        {topology.nodes?.map((node) => (
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

export default TopologySVGContainer;
