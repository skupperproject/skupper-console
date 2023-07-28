import { useRef } from 'react';

import { Graph } from '@antv/g6-pc';
import { Button, Popover, Toolbar, ToolbarContent, ToolbarGroup, ToolbarItem, Tooltip } from '@patternfly/react-core';
import { ExpandArrowsAltIcon, ExpandIcon, SearchMinusIcon, SearchPlusIcon } from '@patternfly/react-icons';
import { useNavigate } from 'react-router-dom';

import ProcessLegend from './Legend';
import { GraphController } from './services';

type ZoomControlsProps = {
  graphInstance: Graph;
  onGetZoom?: Function;
  onFitScreen?: Function;
};

const ZOOM_DELTA = 0.25;
const FIT_SCREEN_CACHE_KEY_SUFFIX = '-fitScreen';
const ZOOM_CACHE_KEY_SUFFIX = '-graphZoom';
const DURATION_ANIMATION_CONTROL_DEFAULT = 250;
const LEGEND_LABEL_NAME = 'Legend';

const GraphMenuControl = function ({ graphInstance, onGetZoom, onFitScreen }: ZoomControlsProps) {
  const popoverRef = useRef<HTMLButtonElement>(null);

  const center = graphInstance.getGraphCenterPoint();
  const navigate = useNavigate();

  const handleIncreaseZoom = () => {
    const zoom = graphInstance.getZoom();
    const newZoom = zoom + ZOOM_DELTA;
    graphInstance.zoomTo(newZoom, center, true, { duration: DURATION_ANIMATION_CONTROL_DEFAULT });

    if (onGetZoom) {
      onGetZoom(newZoom);
    }

    if (onFitScreen) {
      onFitScreen(0);
    }
  };

  const handleDecreaseZoom = () => {
    const zoom = graphInstance.getZoom();
    const newZoom = zoom - ZOOM_DELTA;
    graphInstance.zoomTo(newZoom, center, true, { duration: DURATION_ANIMATION_CONTROL_DEFAULT });

    if (onGetZoom) {
      onGetZoom(newZoom);
    }

    if (onFitScreen) {
      onFitScreen(0);
    }
  };

  const handleZoomToDefault = () => {
    graphInstance.fitView(50, undefined, true, { duration: DURATION_ANIMATION_CONTROL_DEFAULT });
    if (onFitScreen) {
      onFitScreen(1);
    }
  };

  const handleReposition = () => {
    GraphController.cleanPositionsFromLocalStorage();
    GraphController.cleanPositionsControlsFromLocalStorage(FIT_SCREEN_CACHE_KEY_SUFFIX);
    GraphController.cleanPositionsControlsFromLocalStorage(ZOOM_CACHE_KEY_SUFFIX);

    // refresh page
    navigate(0);
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
            <Tooltip content={'reposition'}>
              <Button
                size="sm"
                variant="tertiary"
                onClick={handleReposition}
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
            <Button ref={popoverRef} size="sm" variant="tertiary" className="sk-topology-control-bar__button">
              {LEGEND_LABEL_NAME}
            </Button>
          </ToolbarItem>
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default GraphMenuControl;
