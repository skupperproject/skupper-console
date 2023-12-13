import { useRef } from 'react';

import { Graph } from '@antv/g6-pc';
import { Button, Popover, Toolbar, ToolbarContent, ToolbarGroup, ToolbarItem, Tooltip } from '@patternfly/react-core';
import { ExpandArrowsAltIcon, ExpandIcon, UndoIcon, SearchMinusIcon, SearchPlusIcon } from '@patternfly/react-icons';

import ProcessLegend from './Legend';
import { GraphController } from './services';

type ZoomControlsProps = {
  graphInstance: Graph;
};

const ZOOM_RATIO_OUT = 1.2;
const ZOOM_RATIO_IN = 0.8;

const LEGEND_LABEL_NAME = 'Legend';
const ZOOM_CONFIG = {
  duration: 200,
  easing: 'easeCubic'
};

const MenuControl = function ({ graphInstance }: ZoomControlsProps) {
  const popoverRef = useRef<HTMLButtonElement>(null);

  const handleIncreaseZoom = () => {
    handleZoom(ZOOM_RATIO_OUT);
  };

  const handleDecreaseZoom = () => {
    handleZoom(ZOOM_RATIO_IN);
  };

  const handleZoom = (zoom: number) => {
    const nodeCount = graphInstance.getNodes().length;
    const centerPoint = graphInstance.getGraphCenterPoint();

    graphInstance.zoom(zoom, centerPoint, !GraphController.isPerformanceThresholdExceeded(nodeCount), ZOOM_CONFIG);
  };

  const handleFitView = () => {
    const nodeCount = graphInstance.getNodes().length;

    graphInstance.fitView(20, undefined, !GraphController.isPerformanceThresholdExceeded(nodeCount), ZOOM_CONFIG);
  };

  const handleCenter = () => {
    graphInstance.fitCenter(false);
  };

  const handleCleanAllGraphConfigurations = () => {
    GraphController.cleanAllLocalNodePositions(graphInstance.getNodes(), true);
    GraphController.removeAllNodePositionsFromLocalStorage();

    graphInstance.layout();
    setTimeout(handleFitView, 250);
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
                onClick={handleFitView}
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
                onClick={handleCleanAllGraphConfigurations}
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
