import { useRef } from 'react';

import { Graph } from '@antv/g6-pc';
import { Button, Popover, Toolbar, ToolbarContent, ToolbarGroup, ToolbarItem, Tooltip } from '@patternfly/react-core';
import { ExpandArrowsAltIcon, ExpandIcon, UndoIcon, SearchMinusIcon, SearchPlusIcon } from '@patternfly/react-icons';

import ProcessLegend from './Legend';
import { GraphController } from './services';

type ZoomControlsProps = {
  graphInstance: Graph;
  onGetZoom?: Function;
  onFitScreen?: Function;
};

const ZOOM_RATIO_OUT = 1.2;
const ZOOM_RATIO_IN = 0.8;

const FIT_SCREEN_CACHE_KEY_SUFFIX = '-fitScreen';
const ZOOM_CACHE_KEY_SUFFIX = '-graphZoom';
const LEGEND_LABEL_NAME = 'Legend';
export const ZOOM_CONFIG = {
  duration: 200,
  easing: 'easeCubic'
};

const MenuControl = function ({ graphInstance, onGetZoom, onFitScreen }: ZoomControlsProps) {
  const popoverRef = useRef<HTMLButtonElement>(null);

  const handleIncreaseZoom = () => {
    const nodeCount = graphInstance.getNodes().length;

    graphInstance;
    graphInstance.zoom(
      ZOOM_RATIO_OUT,
      undefined,
      !GraphController.isPerformanceThresholdExceeded(nodeCount),
      ZOOM_CONFIG
    );

    if (onGetZoom) {
      onGetZoom(ZOOM_RATIO_OUT);
    }

    if (onFitScreen) {
      onFitScreen(0);
    }
  };

  const handleDecreaseZoom = () => {
    const nodeCount = graphInstance.getNodes().length;

    graphInstance.zoom(
      ZOOM_RATIO_IN,
      undefined,
      !GraphController.isPerformanceThresholdExceeded(nodeCount),
      ZOOM_CONFIG
    );

    if (onGetZoom) {
      onGetZoom(ZOOM_RATIO_IN);
    }

    if (onFitScreen) {
      onFitScreen(0);
    }
  };

  const handleZoomToDefault = () => {
    const nodeCount = graphInstance.getNodes().length;

    graphInstance.fitView(20, undefined, !GraphController.isPerformanceThresholdExceeded(nodeCount), ZOOM_CONFIG);

    if (onFitScreen) {
      onFitScreen(1);
    }
  };

  const handleCenter = () => {
    graphInstance.fitCenter(false);
  };

  const handleCleanGraphAndLocalStorage = () => {
    const nodeCount = graphInstance.getNodes().length;

    GraphController.removeAllNodePositions();
    GraphController.cleanControlsFromLocalStorage(FIT_SCREEN_CACHE_KEY_SUFFIX);
    GraphController.cleanControlsFromLocalStorage(ZOOM_CACHE_KEY_SUFFIX);

    graphInstance.getNodes().forEach((node) => {
      const nodeModel = node.getModel();
      nodeModel.x = undefined;
      nodeModel.y = undefined;
      nodeModel.fx = undefined;
      nodeModel.fy = undefined;
    });

    graphInstance.layout();
    setTimeout(
      () =>
        graphInstance.fitView(20, undefined, !GraphController.isPerformanceThresholdExceeded(nodeCount), ZOOM_CONFIG),
      250
    );
  };

  return (
    <Toolbar className="sk-topology-controls">
      <ToolbarContent>
        <ToolbarGroup spaceItems={{ default: 'spaceItemsNone' }}>
          <ToolbarItem>
            <Tooltip content={'zoom in'}>
              <Button
                size="sm"
                variant="tertiary"
                onClick={handleIncreaseZoom}
                icon={<SearchPlusIcon />}
                className="sk-topology-control-bar__button"
              />
            </Tooltip>
          </ToolbarItem>

          <ToolbarItem>
            <Tooltip content={'zoom out'}>
              <Button
                size="sm"
                variant="tertiary"
                onClick={handleDecreaseZoom}
                icon={<SearchMinusIcon />}
                className="sk-topology-control-bar__button"
              />
            </Tooltip>
          </ToolbarItem>

          <ToolbarItem>
            <Tooltip content={'fit view'}>
              <Button
                size="sm"
                variant="tertiary"
                onClick={handleZoomToDefault}
                icon={<ExpandArrowsAltIcon />}
                className="sk-topology-control-bar__button"
              />
            </Tooltip>
          </ToolbarItem>

          <ToolbarItem>
            <Tooltip content={'center'}>
              <Button
                size="sm"
                variant="tertiary"
                onClick={handleCenter}
                icon={<ExpandIcon />}
                className="sk-topology-control-bar__button"
              />
            </Tooltip>
          </ToolbarItem>

          <ToolbarItem>
            <Tooltip content={'reposition'}>
              <Button
                size="sm"
                variant="tertiary"
                onClick={handleCleanGraphAndLocalStorage}
                icon={<UndoIcon />}
                className="sk-topology-control-bar__button"
              />
            </Tooltip>
          </ToolbarItem>

          <ToolbarItem>
            <Popover
              aria-label="Network graph legend"
              hasAutoWidth
              bodyContent={<ProcessLegend />}
              triggerRef={popoverRef}
            />
            <Button ref={popoverRef} size="sm" variant="tertiary" className="sk-topology-control-bar__button">
              {LEGEND_LABEL_NAME}
            </Button>
          </ToolbarItem>
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default MenuControl;
