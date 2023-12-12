import { ComponentType, FC, Key, startTransition, useCallback, useEffect, useRef, useState } from 'react';

import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  AlertProps,
  AlertVariant,
  Button,
  Checkbox,
  Divider,
  getUniqueId,
  Stack,
  StackItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import { useQueries } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { RESTApi } from '@API/REST.api';
import { TOAST_VISIBILITY_TIMEOUT, UPDATE_INTERVAL } from '@config/config';
import { siteNameAndIdSeparator } from '@config/prometheus';
import {
  GraphEdge,
  GraphNode,
  GraphReactAdaptorExposedMethods,
  GraphReactAdaptorProps
} from '@core/components/Graph/Graph.interfaces';
import GraphReactAdaptor from '@core/components/Graph/ReactAdaptor';
import NavigationViewLink from '@core/components/NavigationViewLink';
import LoadingPage from '@pages/shared/Loading';
import { QueriesSites, SitesRoutesPaths } from '@pages/Sites/Sites.enum';

import DisplayOptions from './DisplayOptions';
import DisplayResource from './DisplayResources';
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

const DISPLAY_OPTIONS = 'display-site-options';
const DEFAULT_DISPLAY_OPTIONS_ENABLED = [SHOW_ROUTER_LINKS];

const TopologySite: FC<{ id?: string | null; GraphComponent?: ComponentType<GraphReactAdaptorProps> }> = function ({
  GraphComponent = GraphReactAdaptor
}) {
  const navigate = useNavigate();

  const [nodes, setNodes] = useState<GraphNode[] | undefined>();
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [siteIdSelected, setSiteIdSelected] = useState<string | undefined>();
  const [alerts, setAlerts] = useState<Partial<AlertProps>[]>([]);

  const [showOnlyNeighbours, setShowOnlyNeighbours] = useState(false);
  const [moveToNodeSelected, setMoveToNodeSelected] = useState(false);

  const configuration =
    TopologyController.loadDisplayOptionsFromLocalStorage(DISPLAY_OPTIONS) || DEFAULT_DISPLAY_OPTIONS_ENABLED;
  const [displayOptionsSelected, setDisplayOptions] = useState<string[]>(configuration);

  const graphRef = useRef<GraphReactAdaptorExposedMethods>();

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
          refetchInterval: UPDATE_INTERVAL
        }
      ]
    });

  const addAlert = (title: string, variant: AlertProps['variant'], key: Key) => {
    setAlerts((prevAlerts) => [...prevAlerts, { title, variant, key }]);
  };

  const removeAlert = (key: Key) => {
    setAlerts((prevAlerts) => [...prevAlerts.filter((alert) => alert.key !== key)]);
  };

  const addInfoAlert = useCallback((message: string) => {
    addAlert(message, 'info', getUniqueId());
  }, []);

  const handleSaveTopology = useCallback(() => {
    graphRef?.current?.saveNodePositions();
    addInfoAlert(TopologyLabels.ToastSave);
  }, [addInfoAlert]);

  const handleGetSelectedNode = useCallback(
    ({ id: idSelected }: GraphNode) => {
      const site = sites?.find(({ identity }) => identity === idSelected);

      navigate(`${SitesRoutesPaths.Sites}/${site?.name}@${idSelected}`);
    },
    [sites, navigate]
  );

  const handleDisplaySelect = useCallback((options: string[]) => {
    startTransition(() => {
      setDisplayOptions(options);
    });

    localStorage.setItem(DISPLAY_OPTIONS, JSON.stringify(options));
  }, []);

  const handleProcessSelected = useCallback((id?: string) => {
    setSiteIdSelected(id);
  }, []);

  const handleShowOnlyNeighboursChecked = useCallback((checked: boolean) => {
    if (checked) {
      graphRef?.current?.saveNodePositions();
    }

    setShowOnlyNeighbours(checked);
  }, []);

  const handleMoveToNodeSelectedChecked = useCallback((checked: boolean) => {
    setMoveToNodeSelected(checked);
  }, []);

  useEffect(() => {
    if (!sites || !routerLinks || !routers) {
      return;
    }

    const options = {
      showLinkBytes: isDisplayOptionActive(SHOW_LINK_BYTES),
      showLinkByteRate: isDisplayOptionActive(SHOW_LINK_BYTERATE),
      showLinkLatency: isDisplayOptionActive(SHOW_LINK_LATENCY),
      showLinkLabelReverse: isDisplayOptionActive(SHOW_LINK_REVERSE_LABEL),
      rotateLabel: isDisplayOptionActive(ROTATE_LINK_LABEL)
    };

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

    function addMetricsToEdges(prevLinks: GraphEdge[]) {
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
        metrics?.latencyByProcessPairs
      );
    }

    const siteNodes = TopologyController.convertSitesToNodes(sites);
    const siteEdges = addMetricsToEdges(TopologyController.convertPairsToEdges(sitesPairs));
    const siteEdgesWithLabel = TopologyController.configureEdges(siteEdges, options);

    setNodes(siteNodes);
    setEdges(siteEdgesWithLabel);
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

  if (!nodes) {
    return <LoadingPage />;
  }

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

  let filteredLinks = edges;
  let filteredNodes = nodes;

  if (showOnlyNeighbours && siteIdSelected) {
    filteredLinks = edges.filter((edge) => edge.source === siteIdSelected || edge.target === siteIdSelected);
    const idsFromService = filteredLinks.flatMap(({ source, target }) => [source, target]);
    filteredNodes = nodes.filter(({ id }) => idsFromService.includes(id));
  }

  const TopologyToolbar = (
    <Toolbar>
      <ToolbarContent>
        <ToolbarItem>
          <DisplayOptions
            options={displayOptions}
            onSelect={handleDisplaySelect}
            defaultSelected={displayOptionsSelected}
          />
        </ToolbarItem>

        <ToolbarItem variant="separator" />

        <ToolbarGroup>
          <ToolbarItem>
            <DisplayResource
              type={'site'}
              id={siteIdSelected}
              onSelect={handleProcessSelected}
              placeholder={TopologyLabels.DisplaySitesDefaultLabel}
            />
          </ToolbarItem>

          <ToolbarItem>
            <Checkbox
              label={TopologyLabels.CheckboxShowOnlyNeghbours}
              isDisabled={!siteIdSelected}
              isChecked={showOnlyNeighbours}
              onChange={(_, checked) => {
                handleShowOnlyNeighboursChecked(checked);
              }}
              id="showOnlyNeighboursCheckbox"
            />
          </ToolbarItem>

          <ToolbarItem>
            <Checkbox
              label={TopologyLabels.CheckboxMoveToNodeSelected}
              isDisabled={!siteIdSelected}
              isChecked={moveToNodeSelected}
              onChange={(_, checked) => {
                handleMoveToNodeSelectedChecked(checked);
              }}
              id="moveToNodeSelectedCheckbox"
            />
          </ToolbarItem>
        </ToolbarGroup>

        <ToolbarItem variant="separator" />

        <ToolbarItem
          spacer={{
            default: 'spacerSm'
          }}
        >
          <Button onClick={handleSaveTopology} variant="secondary">
            {TopologyLabels.SaveButton}
          </Button>
        </ToolbarItem>

        <ToolbarGroup align={{ default: 'alignRight' }}>
          <ToolbarItem align={{ default: 'alignRight' }}>
            <NavigationViewLink link={SitesRoutesPaths.Sites} linkLabel={TopologyLabels.ListView} iconName="listIcon" />
          </ToolbarItem>
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );

  return (
    <>
      <Stack>
        <StackItem>
          {TopologyToolbar} <Divider />
        </StackItem>
        <StackItem isFilled>
          <GraphComponent
            ref={graphRef}
            nodes={filteredNodes}
            edges={filteredLinks}
            itemSelected={siteIdSelected}
            onClickNode={handleGetSelectedNode}
            moveToSelectedNode={!!moveToNodeSelected && !!siteIdSelected}
          />
        </StackItem>
      </Stack>
      <AlertGroup isToast>
        {alerts.map(({ key, title }) => (
          <Alert
            key={key}
            timeout={TOAST_VISIBILITY_TIMEOUT}
            variant={AlertVariant.info}
            title={title}
            actionClose={<AlertActionCloseButton title={title as string} onClose={() => removeAlert(key as Key)} />}
          />
        ))}
      </AlertGroup>
    </>
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
