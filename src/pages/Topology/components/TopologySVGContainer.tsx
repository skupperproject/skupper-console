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

import serviceSVG from '@assets/service.svg';
import siteSVG from '@assets/site.svg';
import { SiteDataResponse } from 'API/REST.interfaces';

import TopologySiteDetails from '../components/DetailsSite';
import TopologySVG from '../components/TopologySVG';
import { TopologyController } from '../services';
import { TopologyProcesses } from '../services/services.interfaces';
import { Labels, TopologyViews } from '../Topology.enum';
import { TopologyLink, TopologyNode } from '../Topology.interfaces';
import TopologyProcessesDetails from './DetailsProcesses';
import TopologyProcessGroupsDetails from './DetailsProcessGroups';

const TopologySVGContainer: FC<{ sites: SiteDataResponse[]; deployments: TopologyProcesses }> =
    function ({ sites, deployments }) {
        const [topologyGraphInstance, setTopologyGraphInstance] = useState<TopologySVG>();
        const [topologyType, setTopologyType] = useState<string>(TopologyViews.Sites);
        const [areDetailsExpanded, setIsExpandedDetails] = useState(false);
        const [selectedNode, setSelectedNode] = useState('');
        const [topology, setTopology] = useState<{ nodes: TopologyNode[]; links: TopologyLink[] }>({
            nodes: [],
            links: [],
        });

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
            _: React.MouseEvent<HTMLElement, MouseEvent>,
            tabIndex: string | number,
        ) {
            setTopologyType(tabIndex as string);
            setTopologyGraphInstance(undefined);

            handleCloseClick();
        }

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
                {selectedNode && (
                    <DrawerHead>
                        {topologyType === TopologyViews.Sites && (
                            <TopologySiteDetails id={selectedNode} />
                        )}
                        {topologyType === TopologyViews.ProcessGroups && (
                            <TopologyProcessGroupsDetails id={selectedNode} />
                        )}
                        {topologyType === TopologyViews.Processes && (
                            <TopologyProcessesDetails id={selectedNode} />
                        )}
                        <DrawerActions>
                            <DrawerCloseButton onClick={handleCloseClick} />
                        </DrawerActions>
                    </DrawerHead>
                )}
            </DrawerPanelContent>
        );

        // Create Graph
        const panelRef = useCallback(
            ($node: HTMLDivElement | null) => {
                if (
                    $node &&
                    topology.nodes.length &&
                    topology.links.length &&
                    !topologyGraphInstance
                ) {
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

        // Update topology
        useEffect(() => {
            if (topologyGraphInstance && !topologyGraphInstance?.isDragging()) {
                topologyGraphInstance.updateTopology(topology.nodes, topology.links, selectedNode);
            }
        }, [topology, topologyGraphInstance, selectedNode]);

        // Refresh topology data
        const updateNodesAndLinks = useCallback(async () => {
            if (topologyType === TopologyViews.Sites) {
                const siteXML = await xml(siteSVG);
                const nodes = TopologyController.getSiteNodes(sites).map((site) => ({
                    ...site,
                    img: siteXML,
                }));
                const links = TopologyController.getSiteLinks(sites);

                setTopology({ nodes, links });

                return;
            }

            if (topologyType === TopologyViews.ProcessGroups) {
                const siteXML = await xml(serviceSVG);
                const nodes = TopologyController.getProcessGroupNodes(
                    deployments.processGroups,
                ).map((processGroup) => ({
                    ...processGroup,
                    img: siteXML,
                }));
                const links = TopologyController.getProcessGroupNodesLinks(
                    deployments.processGroupsLinks,
                );

                setTopology({ nodes, links });

                return;
            }
            if (topologyType === TopologyViews.Processes) {
                const serviceXML = await xml(serviceSVG);
                const nodesSites = TopologyController.getSiteNodes(sites);

                const nodes = TopologyController.getProcessNodes(
                    deployments.processes,
                    nodesSites,
                ).map((site) => ({ ...site, img: serviceXML }));
                const links = TopologyController.getProcessLinks(deployments.processesLinks);

                setTopology({ nodes, links });
            }
        }, [
            topologyType,
            sites,
            deployments.processes,
            deployments.processesLinks,
            deployments.processGroups,
            deployments.processGroupsLinks,
        ]);

        useEffect(() => {
            updateNodesAndLinks();
        }, [updateNodesAndLinks]);

        return (
            <>
                <Drawer isExpanded={areDetailsExpanded} position="right">
                    <Tabs
                        activeKey={topologyType}
                        isFilled
                        onSelect={handleChangeTopologyType}
                        isBox
                    >
                        <Tab
                            eventKey={TopologyViews.Sites}
                            title={<TabTitleText>{TopologyViews.Sites}</TabTitleText>}
                        />
                        <Tab
                            eventKey={TopologyViews.ProcessGroups}
                            title={<TabTitleText>{TopologyViews.ProcessGroups}</TabTitleText>}
                        />
                        <Tab
                            eventKey={TopologyViews.Processes}
                            title={<TabTitleText>{TopologyViews.Processes}</TabTitleText>}
                        />
                    </Tabs>
                    <DrawerContent
                        panelContent={PanelContentComponent}
                        style={{ overflow: 'hidden' }}
                    >
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
                {topologyType === TopologyViews.Processes && (
                    <Panel className="pf-u-px-md pf-u-py-sm">
                        <Flex>
                            <TextContent>
                                <Text
                                    component={TextVariants.small}
                                >{`${Labels.LegendGroupsItems}:`}</Text>
                            </TextContent>
                            {TopologyController.getSiteNodes(sites).map((node) => (
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
