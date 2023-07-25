import { useCallback, useEffect, useRef } from 'react';

import { Graph } from '@antv/g6-pc';
import { Button, Toolbar, ToolbarContent, ToolbarGroup, ToolbarItem, Tooltip } from '@patternfly/react-core';
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
  const showLegendRef = useRef(false);
  const legendBtnRef = useRef<HTMLDivElement>();

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

  const handleShowLegend = useCallback(() => {
    const $legend = document.querySelector('.g6-legend-container');
    const displayValue = showLegendRef.current ? 'none' : '';

    $legend?.setAttribute(
      'style',
      `position:absolute; display:${displayValue}; left:${(legendBtnRef?.current?.offsetLeft || 0) / 2}px; bottom:${
        (legendBtnRef?.current?.clientTop || 0) + (legendBtnRef?.current?.clientHeight || 0)
      }px;`
    );
    $legend
      ?.querySelector('canvas')
      ?.setAttribute('style', 'box-shadow:0 1rem 2rem 0 rgba(3, 3, 3, 0.16), 0 0 0.5rem 0 rgba(3, 3, 3, 0.1)');
    showLegendRef.current = !showLegendRef.current;
  }, []);

  useEffect(() => {
    const $legend = document.querySelector('.g6-legend-container');
    $legend?.setAttribute('style', 'display:none; box-shadow: 0 0.5rem 0.5rem -0.375rem rgba(3, 3, 3, 0.18)');
  }, []);

  return (
    <Toolbar style={{ position: 'absolute', bottom: '0', left: '0', background: 'transparent', padding: 0 }}>
      <ToolbarContent>
        <ToolbarGroup spaceItems={{ default: 'spaceItemsSm' }} className="pf-u-background-color-100">
          <ToolbarItem>
            <Tooltip content={'zoom in'}>
              <Button isSmall variant="tertiary" onClick={handleIncreaseZoom} icon={<SearchPlusIcon />} />
            </Tooltip>
          </ToolbarItem>

          <ToolbarItem>
            <Tooltip content={'zoom out'}>
              <Button isSmall variant="tertiary" onClick={handleDecreaseZoom} icon={<SearchMinusIcon />} />
            </Tooltip>
          </ToolbarItem>

          <ToolbarItem>
            <Tooltip content={'fit view'}>
              <Button isSmall variant="tertiary" onClick={handleZoomToDefault} icon={<ExpandIcon />} />
            </Tooltip>
          </ToolbarItem>

          <ToolbarItem>
            <Tooltip content={'reposition'}>
              <Button isSmall variant="tertiary" onClick={handleReposition} icon={<MapMarkerIcon />} />
            </Tooltip>
          </ToolbarItem>

          <ToolbarItem>
            <Button isSmall variant="tertiary" onClick={handleShowLegend} ref={legendBtnRef}>
              Legend
            </Button>
          </ToolbarItem>
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default GraphMenuControl;
