import { useRef } from 'react';

import { Graph } from '@antv/g6';
import {
  Button,
  ButtonVariant,
  Popover,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip
} from '@patternfly/react-core';
import { ExpandArrowsAltIcon, SearchMinusIcon, SearchPlusIcon, ExpandIcon } from '@patternfly/react-icons';

import ProcessLegend from './Legend';
import { GraphLabels } from '../enum';
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
        <ToolbarGroup gap={{ default: 'gapNone' }}>
          <ToolbarItem>
            <Tooltip content={GraphLabels.ZoomIn}>
              <Button
                size="sm"
                variant={ButtonVariant.tertiary}
                onClick={handleIncreaseZoom}
                icon={<SearchPlusIcon />}
                className="sk-topology-control-bar__button"
              />
            </Tooltip>
          </ToolbarItem>

          <ToolbarItem>
            <Tooltip content={GraphLabels.ZoomOut}>
              <Button
                size="sm"
                variant={ButtonVariant.tertiary}
                onClick={handleDecreaseZoom}
                icon={<SearchMinusIcon />}
                className="sk-topology-control-bar__button"
              />
            </Tooltip>
          </ToolbarItem>

          <ToolbarItem>
            <Tooltip content={GraphLabels.Fit}>
              <Button
                size="sm"
                variant={ButtonVariant.tertiary}
                onClick={handleFitView}
                icon={<ExpandArrowsAltIcon />}
                className="sk-topology-control-bar__button"
              />
            </Tooltip>
          </ToolbarItem>

          <ToolbarItem>
            <Tooltip content={GraphLabels.Reset}>
              <Button
                size="sm"
                variant={ButtonVariant.tertiary}
                onClick={handleCleanAllGraphConfigurations}
                icon={<ExpandIcon />}
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
            <Button
              ref={popoverRef}
              size="sm"
              variant={ButtonVariant.tertiary}
              className="sk-topology-control-bar__button"
            >
              {LEGEND_LABEL_NAME}
            </Button>
          </ToolbarItem>
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default ControlBar;
