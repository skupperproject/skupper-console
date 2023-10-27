import { ChangeEvent, ComponentType, FC, MouseEvent, useCallback, useEffect, useState } from 'react';

import { Divider, Stack, StackItem, Toolbar, ToolbarContent, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { Select, SelectOption, SelectVariant, SelectOptionObject } from '@patternfly/react-core/deprecated';
import { useQueries } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { SitePairsResponse } from '@API/REST.interfaces';
import { UPDATE_INTERVAL } from '@config/config';
import { siteNameAndIdSeparator } from '@config/prometheus';
import EmptyData from '@core/components/EmptyData';
import { GraphEdge, GraphNode, GraphReactAdaptorProps } from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/ReactAdaptor';
import NavigationViewLink from '@core/components/NavigationViewLink';
import { QueriesSites, SitesRoutesPaths } from '@pages/Sites/Sites.enum';

import { TopologyController } from '../services';
import { QueriesTopology, TopologyLabels } from '../Topology.enum';

const ZOOM_CACHE_KEY = 'site';
const DISPLAY_OPTIONS = 'display-site-options';
const SHOW_ROUTER_LINKS = 'show-site-router-links';
const SHOW_DATA_LINKS = 'show-site-data-links';
const SHOW_LINK_BYTES = 'show-site-link-bytes';
const SHOW_LINK_BYTERATE = 'show-site-link-byterate';
const SHOW_LINK_LATENCY = 'show-site-link-latency';
const SHOW_LINK_REVERSE_LABEL = 'show-site-reverse-link-label';
const ROTATE_LINK_LABEL = 'show-site-link-label-rotated';

const DEFAULT_DISPLAY_OPTIONS_ENABLED = [SHOW_ROUTER_LINKS];

const TopologySite: FC<{ id?: string | null; GraphComponent?: ComponentType<GraphReactAdaptorProps> }> = function ({
  GraphComponent = GraphReactAdaptor
}) {
  const navigate = useNavigate();

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [isDisplayMenuOpen, setIsDisplayMenuOpen] = useState(false);
  const [displayOptionsSelected, setDisplayOptions] = useState<string[]>(
    localStorage.getItem(DISPLAY_OPTIONS)
      ? JSON.parse(localStorage.getItem(DISPLAY_OPTIONS) || '')
      : DEFAULT_DISPLAY_OPTIONS_ENABLED
  );

  const isDisplayOptionActive = useCallback(
    (option: string) => displayOptionsSelected.includes(option),
    [displayOptionsSelected]
  );

  const addDisplayOptionToSelection = useCallback(
    (selected: string) => [...displayOptionsSelected, selected],
    [displayOptionsSelected]
  );

  const removeDisplayOptionToSelection = useCallback(
    (selected: string) => displayOptionsSelected.filter((option) => option !== selected),
    [displayOptionsSelected]
  );

  const [{ data: sites }, { data: routers }, { data: routerLinks }, { data: sitesPairs }, { data: metrics }] =
    useQueries({
      queries: [
        {
          queryKey: [QueriesSites.GetSites],
          queryFn: () => RESTApi.fetchSites(),
          refetchInterval: UPDATE_INTERVAL
        },
        {
          queryKey: [QueriesSites.GetRouters],
          queryFn: () => RESTApi.fetchRouters(),
          refetchInterval: UPDATE_INTERVAL
        },
        {
          queryKey: [QueriesSites.GetLinks],
          queryFn: () => RESTApi.fetchLinks(),
          refetchInterval: UPDATE_INTERVAL
        },
        {
          queryKey: [QueriesTopology.GetSitesPairs, isDisplayOptionActive(SHOW_DATA_LINKS)],
          queryFn: () => (isDisplayOptionActive(SHOW_DATA_LINKS) ? RESTApi.fetchSitesPairs() : null),
          keepPreviousData: true,
          refetchInterval: UPDATE_INTERVAL
        },
        {
          queryKey: [
            QueriesTopology.GetBytesByProcessPairs,
            isDisplayOptionActive(SHOW_LINK_BYTES),
            isDisplayOptionActive(SHOW_LINK_BYTERATE),
            isDisplayOptionActive(SHOW_LINK_LATENCY),
            isDisplayOptionActive(SHOW_DATA_LINKS)
          ],
          queryFn: () =>
            isDisplayOptionActive(SHOW_DATA_LINKS)
              ? TopologyController.getMetrics({
                  showBytes: isDisplayOptionActive(SHOW_LINK_BYTES),
                  showByteRate: isDisplayOptionActive(SHOW_LINK_BYTERATE),
                  showLatency: isDisplayOptionActive(SHOW_LINK_LATENCY),
                  params: {
                    fetchBytes: { groupBy: 'destSite, sourceSite,direction' },
                    fetchByteRate: { groupBy: 'destSite, sourceSite,direction' },
                    fetchLatency: { groupBy: 'sourceSite, destSite' }
                  }
                })
              : null,
          keepPreviousData: true,
          refetchInterval: UPDATE_INTERVAL
        }
      ]
    });

  const handleGetSelectedNode = useCallback(
    ({ id: idSelected }: GraphNode) => {
      const site = sites?.find(({ identity }) => identity === idSelected);

      navigate(`${SitesRoutesPaths.Sites}/${site?.name}@${idSelected}`);
    },
    [sites, navigate]
  );

  function handleToggleDisplayMenu(openDisplayMenu: boolean) {
    setIsDisplayMenuOpen(openDisplayMenu);
  }

  const handleSelectDisplay = useCallback(
    (_: MouseEvent | ChangeEvent, selection: string | SelectOptionObject) => {
      const selected = selection as string;
      const isSelected = displayOptionsSelected.includes(selected);

      let displayOptions = isSelected
        ? removeDisplayOptionToSelection(selected)
        : addDisplayOptionToSelection(selected);

      if (selected === SHOW_DATA_LINKS) {
        displayOptions = isSelected
          ? [...displayOptions, SHOW_ROUTER_LINKS]
          : displayOptions.filter((option) => option !== SHOW_ROUTER_LINKS);
      }

      if (selected === SHOW_ROUTER_LINKS) {
        displayOptions = isSelected
          ? [...displayOptions, SHOW_DATA_LINKS]
          : displayOptions.filter((option) => option !== SHOW_DATA_LINKS);
      }

      localStorage.setItem(DISPLAY_OPTIONS, JSON.stringify(displayOptions));
      setDisplayOptions(displayOptions);
    },
    [addDisplayOptionToSelection, displayOptionsSelected, removeDisplayOptionToSelection]
  );

  useEffect(() => {
    if (!sites || !routerLinks || !routers) {
      return;
    }

    if (!isDisplayOptionActive(SHOW_DATA_LINKS)) {
      const siteNodes = TopologyController.convertSitesToNodes(sites);
      const siteEdges = TopologyController.convertRouterLinksToEdges(sites, routers, routerLinks);

      setNodes(siteNodes);
      setEdges(siteEdges);

      return;
    }

    if (!sitesPairs) {
      return;
    }

    function updateLabelLinks(prevLinks: GraphEdge[]) {
      return TopologyController.addMetricsToEdges(
        prevLinks.map((link) => ({
          ...link,
          sourceName: `${link.sourceName}${siteNameAndIdSeparator}${link.source}`,
          targetName: `${link.targetName}${siteNameAndIdSeparator}${link.target}`
        })),
        (sitesPairs as SitePairsResponse[]).map((sitePairs) => ({
          ...sitePairs,
          sourceId: `${sitePairs.sourceName}${siteNameAndIdSeparator}${sitePairs.sourceId}`,
          destinationId: `${sitePairs.destinationName}${siteNameAndIdSeparator}${sitePairs.destinationId}`
        })),
        'sourceSite',
        'destSite',
        metrics?.bytesByProcessPairs,
        metrics?.byteRateByProcessPairs,
        metrics?.latencyByProcessPairs,
        {
          showLinkBytes: isDisplayOptionActive(SHOW_LINK_BYTES),
          showLinkByteRate: isDisplayOptionActive(SHOW_LINK_BYTERATE),
          showLinkLatency: isDisplayOptionActive(SHOW_LINK_LATENCY),
          showLinkLabelReverse: isDisplayOptionActive(SHOW_LINK_REVERSE_LABEL),
          rotateLabel: isDisplayOptionActive(ROTATE_LINK_LABEL)
        }
      );
    }

    const siteNodes = TopologyController.convertSitesToNodes(sites);
    const siteEdges = updateLabelLinks(TopologyController.convertPairsToEdges(sitesPairs));

    setNodes(siteNodes);
    setEdges(siteEdges);
  }, [
    sites,
    routers,
    routerLinks,
    sitesPairs,
    isDisplayOptionActive,
    metrics?.bytesByProcessPairs,
    metrics?.byteRateByProcessPairs,
    metrics?.latencyByProcessPairs
  ]);

  const getDisplayOptions = () => [
    <SelectOption key={SHOW_ROUTER_LINKS} value={SHOW_ROUTER_LINKS}>
      {TopologyLabels.CheckBoxShowRouterLinks}
    </SelectOption>,

    <SelectOption key={SHOW_DATA_LINKS} value={SHOW_DATA_LINKS}>
      {TopologyLabels.CheckboxShowDataLinks}
    </SelectOption>,

    <Divider key="display-option-divider" />,
    <SelectOption key={SHOW_LINK_BYTES} value={SHOW_LINK_BYTES} isDisabled={!isDisplayOptionActive(SHOW_DATA_LINKS)}>
      {TopologyLabels.CheckboxShowTotalBytes}
    </SelectOption>,
    <SelectOption
      key={SHOW_LINK_BYTERATE}
      value={SHOW_LINK_BYTERATE}
      isDisabled={!isDisplayOptionActive(SHOW_DATA_LINKS)}
    >
      {TopologyLabels.CheckboxShowCurrentByteRate}
    </SelectOption>,
    <SelectOption
      key={SHOW_LINK_LATENCY}
      value={SHOW_LINK_LATENCY}
      isDisabled={!isDisplayOptionActive(SHOW_DATA_LINKS)}
    >
      {TopologyLabels.CheckboxShowLatency}
    </SelectOption>,
    <SelectOption
      key={SHOW_LINK_REVERSE_LABEL}
      isDisabled={
        !isDisplayOptionActive(SHOW_DATA_LINKS) ||
        (!isDisplayOptionActive(SHOW_LINK_BYTES) &&
          !isDisplayOptionActive(SHOW_LINK_BYTERATE) &&
          !isDisplayOptionActive(SHOW_LINK_LATENCY))
      }
      value={SHOW_LINK_REVERSE_LABEL}
    >
      {TopologyLabels.CheckboxShowLabelReverse}
    </SelectOption>,
    <Divider key="display-data-option-divider" />,
    <SelectOption
      key={ROTATE_LINK_LABEL}
      isDisabled={
        !isDisplayOptionActive(SHOW_DATA_LINKS) ||
        (!isDisplayOptionActive(SHOW_LINK_BYTES) &&
          !isDisplayOptionActive(SHOW_LINK_BYTERATE) &&
          !isDisplayOptionActive(SHOW_LINK_LATENCY))
      }
      value={ROTATE_LINK_LABEL}
    >
      {TopologyLabels.CheckboxRotateLabel}
    </SelectOption>
  ];

  return (
    <Stack>
      {!nodes.length && (
        <StackItem isFilled>
          <EmptyData />
        </StackItem>
      )}
      {!!nodes.length && (
        <>
          <StackItem>
            <Toolbar>
              <ToolbarContent>
                <ToolbarItem>
                  <Select
                    role="display-select"
                    variant={SelectVariant.checkbox}
                    isOpen={isDisplayMenuOpen}
                    onSelect={handleSelectDisplay}
                    onToggle={(_, isOpen) => handleToggleDisplayMenu(isOpen)}
                    selections={displayOptionsSelected}
                    placeholderText={TopologyLabels.DisplayPlaceholderText}
                    isCheckboxSelectionBadgeHidden
                  >
                    {getDisplayOptions()}
                  </Select>
                </ToolbarItem>

                <ToolbarGroup align={{ default: 'alignRight' }}>
                  <ToolbarItem align={{ default: 'alignRight' }}>
                    <NavigationViewLink
                      link={SitesRoutesPaths.Sites}
                      linkLabel={TopologyLabels.ListView}
                      iconName="listIcon"
                    />
                  </ToolbarItem>
                </ToolbarGroup>
              </ToolbarContent>
            </Toolbar>
          </StackItem>

          <StackItem isFilled>
            <GraphComponent
              nodes={nodes}
              edges={edges}
              onClickNode={handleGetSelectedNode}
              saveConfigkey={ZOOM_CACHE_KEY}
            />
          </StackItem>
        </>
      )}
    </Stack>
  );
};

export default TopologySite;
