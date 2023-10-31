import { ComponentType, FC, startTransition, useCallback, useEffect, useState } from 'react';

import { Stack, StackItem, Toolbar, ToolbarContent, ToolbarGroup, ToolbarItem } from '@patternfly/react-core';
import { keepPreviousData, useQueries } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { UPDATE_INTERVAL } from '@config/config';
import { siteNameAndIdSeparator } from '@config/prometheus';
import EmptyData from '@core/components/EmptyData';
import { GraphEdge, GraphNode, GraphReactAdaptorProps } from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/ReactAdaptor';
import NavigationViewLink from '@core/components/NavigationViewLink';
import { QueriesSites, SitesRoutesPaths } from '@pages/Sites/Sites.enum';

import DisplaySelect from './DisplaySelect';
import { TopologyController } from '../services';
import {
  displayOptionsForSites,
  ROTATE_LINK_LABEL,
  SHOW_DATA_LINKS,
  SHOW_LINK_BYTERATE,
  SHOW_LINK_BYTES,
  SHOW_LINK_LATENCY,
  SHOW_LINK_REVERSE_LABEL,
  SHOW_ROUTER_LINKS
} from '../Topology.constants';
import { QueriesTopology, TopologyLabels } from '../Topology.enum';

const ZOOM_CACHE_KEY = 'site';
const DISPLAY_OPTIONS = 'display-site-options';
const DEFAULT_DISPLAY_OPTIONS_ENABLED = [SHOW_ROUTER_LINKS];

const TopologySite: FC<{ id?: string | null; GraphComponent?: ComponentType<GraphReactAdaptorProps> }> = function ({
  GraphComponent = GraphReactAdaptor
}) {
  const navigate = useNavigate();

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [displayOptionsSelected, setDisplayOptions] = useState<string[]>(
    localStorage.getItem(DISPLAY_OPTIONS)
      ? JSON.parse(localStorage.getItem(DISPLAY_OPTIONS) || '')
      : DEFAULT_DISPLAY_OPTIONS_ENABLED
  );

  const isDisplayOptionActive = useCallback(
    (option: string) => displayOptionsSelected.includes(option),
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
          placeholderData: keepPreviousData,
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
          placeholderData: keepPreviousData,
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

  const handleDisplaySelect = useCallback((selectedOptions: string[]) => {
    startTransition(() => {
      setDisplayOptions(selectedOptions);
      localStorage.setItem(DISPLAY_OPTIONS, JSON.stringify(selectedOptions));
    });
  }, []);

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

    function addLabelsToEdges(prevLinks: GraphEdge[]) {
      return TopologyController.addMetricsToEdges(
        prevLinks.map((link) => ({
          ...link,
          sourceName: getPrometheusSiteLabel(link.sourceName, link.source),
          targetName: getPrometheusSiteLabel(link.targetName, link.target)
        })),
        'sourceSite',
        'destSite',
        undefined, // no need to retrieve protocols
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
    const siteEdges = addLabelsToEdges(TopologyController.convertPairsToEdges(sitesPairs));

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

  const displayOptions = displayOptionsForSites.map((option) => {
    if (option.key === SHOW_LINK_BYTES || option.key === SHOW_LINK_BYTERATE || option.key === SHOW_LINK_LATENCY) {
      return {
        ...option,
        isDisabled: () => !isDisplayOptionActive(SHOW_DATA_LINKS)
      };
    }

    if (option.key === SHOW_LINK_REVERSE_LABEL) {
      return {
        ...option,
        isDisabled: () =>
          !isDisplayOptionActive(SHOW_DATA_LINKS) ||
          (!isDisplayOptionActive(SHOW_LINK_BYTES) &&
            !isDisplayOptionActive(SHOW_LINK_BYTERATE) &&
            !isDisplayOptionActive(SHOW_LINK_LATENCY))
      };
    }

    if (option.key === ROTATE_LINK_LABEL) {
      return {
        ...option,
        isDisabled: () =>
          !isDisplayOptionActive(SHOW_DATA_LINKS) ||
          (!isDisplayOptionActive(SHOW_LINK_BYTES) &&
            !isDisplayOptionActive(SHOW_LINK_BYTERATE) &&
            !isDisplayOptionActive(SHOW_LINK_LATENCY))
      };
    }

    return option;
  });

  return (
    <Stack>
      <StackItem>
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <DisplaySelect
                options={displayOptions}
                onSelect={handleDisplaySelect}
                defaultSelected={displayOptionsSelected}
              />
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
        {!!nodes.length && (
          <GraphComponent
            nodes={nodes}
            edges={edges}
            onClickNode={handleGetSelectedNode}
            saveConfigkey={ZOOM_CACHE_KEY}
          />
        )}

        {!nodes.length && <EmptyData />}
      </StackItem>
    </Stack>
  );
};

export default TopologySite;

function getPrometheusSiteLabel(name?: string, id?: string) {
  if (!id && !name) {
    return '';
  }

  if (!id && name) {
    return name;
  }

  if (!name && id) {
    return id;
  }

  return `${name}${siteNameAndIdSeparator}${id}`;
}
