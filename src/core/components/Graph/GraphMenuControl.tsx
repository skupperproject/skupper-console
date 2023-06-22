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

const GraphMenuControl = function ({ graphInstance, onGetZoom, onFitScreen }: ZoomControlsProps) {
  const center = graphInstance.getGraphCenterPoint();
  const navigate = useNavigate();

  const handleIncreaseZoom = () => {
    const zoom = graphInstance.getZoom();
    const newZoom = zoom + ZOOM_DELTA;
    graphInstance.zoomTo(newZoom, center, true, { duration: 250 });

    if (onGetZoom) {
      onGetZoom(newZoom);
    }

    if (onFitScreen) {
      onFitScreen(0);
      localStorage.removeItem;
    }
  };

  const handleDecreaseZoom = () => {
    const zoom = graphInstance.getZoom();
    const newZoom = zoom - ZOOM_DELTA;
    graphInstance.zoomTo(newZoom, center, true, { duration: 250 });

    if (onGetZoom) {
      onGetZoom(newZoom);
    }

    if (onFitScreen) {
      onFitScreen(0);
    }
  };

  const handleZoomToDefault = () => {
    graphInstance.fitView(5, undefined, true, { duration: 250 });

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
    <Toolbar style={{ position: 'absolute', bottom: '5px', right: '5px' }}>
      <ToolbarContent>
        <ToolbarItem>
          <Tooltip content={'zoom in'}>
            <Button isActive={true} variant="primary" onClick={handleIncreaseZoom} icon={<SearchPlusIcon />} />
          </Tooltip>
        </ToolbarItem>

        <ToolbarItem>
          <Tooltip content={'zoom out'}>
            <Button isActive={true} variant="primary" onClick={handleDecreaseZoom} icon={<SearchMinusIcon />} />
          </Tooltip>
        </ToolbarItem>

        <ToolbarItem>
          <Tooltip content={'fit view'}>
            <Button isActive={true} variant="primary" onClick={handleZoomToDefault} icon={<ExpandIcon />} />
          </Tooltip>
        </ToolbarItem>

        <ToolbarItem>
          <Tooltip content={'reposition'}>
            <Button isActive={true} variant="primary" onClick={handleReposition} icon={<MapMarkerIcon />} />
          </Tooltip>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};

export default GraphMenuControl;
