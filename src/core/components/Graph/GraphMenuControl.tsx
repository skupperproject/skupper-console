import { Graph } from '@antv/g6-pc';
import { Button, Toolbar, ToolbarContent, ToolbarItem, Tooltip } from '@patternfly/react-core';
import { ExpandIcon, MapMarkerIcon, SearchMinusIcon, SearchPlusIcon } from '@patternfly/react-icons';
import { useNavigate } from 'react-router-dom';

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

const GraphMenuControl = function ({ graphInstance, onGetZoom, onFitScreen }: ZoomControlsProps) {
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
    <Toolbar style={{ position: 'absolute', bottom: '8px', right: '5px', background: 'transparent' }}>
      <ToolbarContent>
        <ToolbarItem spacer={{ default: 'spacerNone' }}>
          <Tooltip content={'zoom in'}>
            <Button isSmall variant="control" onClick={handleIncreaseZoom} icon={<SearchPlusIcon />} />
          </Tooltip>
        </ToolbarItem>

        <ToolbarItem spacer={{ default: 'spacerNone' }}>
          <Tooltip content={'zoom out'}>
            <Button isSmall variant="control" onClick={handleDecreaseZoom} icon={<SearchMinusIcon />} />
          </Tooltip>
        </ToolbarItem>

        <ToolbarItem spacer={{ default: 'spacerNone' }}>
          <Tooltip content={'fit view'}>
            <Button isSmall variant="control" onClick={handleZoomToDefault} icon={<ExpandIcon />} />
          </Tooltip>
        </ToolbarItem>

        <ToolbarItem spacer={{ default: 'spacerNone' }}>
          <Tooltip content={'reposition'}>
            <Button isSmall variant="control" onClick={handleReposition} icon={<MapMarkerIcon />} />
          </Tooltip>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};

export default GraphMenuControl;
