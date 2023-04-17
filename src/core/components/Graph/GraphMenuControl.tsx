import { Graph } from '@antv/g6-pc';
import { Button } from '@patternfly/react-core';
import { ExpandIcon, SearchMinusIcon, SearchPlusIcon } from '@patternfly/react-icons';

type ZoomControlsProps = {
  graphInstance: Graph;
};

const ZOOM_DELTA = 0.25;

const GraphMenuControl = function ({ graphInstance }: ZoomControlsProps) {
  const center = graphInstance.getGraphCenterPoint();

  const handleIncreaseZoom = () => {
    const zoom = graphInstance.getZoom();
    const newZoom = zoom + ZOOM_DELTA;
    graphInstance.zoomTo(newZoom, center, true, { duration: 250 });
  };

  const handleDecreaseZoom = () => {
    const zoom = graphInstance.getZoom();
    const newZoom = zoom - ZOOM_DELTA;
    graphInstance.zoomTo(newZoom, center, true, { duration: 250 });
  };

  const handleZoomToDefault = () => {
    graphInstance.fitView(5, undefined, true, { duration: 250 });
  };

  return (
    <span style={{ position: 'absolute', bottom: '5px', right: '5px' }}>
      <Button
        isActive={true}
        className="pf-u-m-xs"
        variant="primary"
        onClick={handleIncreaseZoom}
        icon={<SearchPlusIcon />}
      />

      <Button
        isActive={true}
        className="pf-u-m-xs"
        variant="primary"
        onClick={handleDecreaseZoom}
        icon={<SearchMinusIcon />}
      />

      <Button
        isActive={true}
        className="pf-u-m-xs"
        variant="primary"
        onClick={handleZoomToDefault}
        icon={<ExpandIcon />}
      />
    </span>
  );
};

export default GraphMenuControl;
