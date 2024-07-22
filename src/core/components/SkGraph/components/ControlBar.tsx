import { useRef } from 'react';

import { Graph } from '@antv/g6';
import { Button, Popover, Toolbar, ToolbarContent, ToolbarGroup, ToolbarItem, Tooltip } from '@patternfly/react-core';
import { ExpandArrowsAltIcon, UndoIcon, SearchMinusIcon, SearchPlusIcon } from '@patternfly/react-icons';

import ProcessLegend from './Legend';
import { GraphController } from '../services';

type ZoomControlsProps = {
  graphInstance: Graph;
};

const ZOOM_RATIO_OUT = 1.2;
const ZOOM_RATIO_IN = 0.8;

const LEGEND_LABEL_NAME = 'Legend';

const ControlBar = function ({ graphInstance }: ZoomControlsProps) {
  const popoverRef = useRef<HTMLButtonElement>(null);

  const handleIncreaseZoom = () => {
    handleZoom(ZOOM_RATIO_OUT);
  };

  const handleDecreaseZoom = () => {
    handleZoom(ZOOM_RATIO_IN);
  };

  const handleZoom = (zoom: number) => {
    graphInstance.zoomBy(zoom);
  };

  const handleFitView = () => {
    graphInstance.fitView();
  };

  const handleCleanAllGraphConfigurations = async () => {
    GraphController.cleanAllLocalNodePositions(graphInstance.getNodeData(), true);
    GraphController.removeAllNodePositionsFromLocalStorage();

    await graphInstance.render();
    graphInstance.fitView();
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
            <Tooltip content={'reset'}>
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

export default ControlBar;
