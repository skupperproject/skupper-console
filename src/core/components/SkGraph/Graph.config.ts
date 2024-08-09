import { GraphOptions } from '@antv/g6';

import componentIcon from '@assets/component.svg';
import kubernetesIcon from '@assets/kubernetes.svg';
import podmanIcon from '@assets/podman.svg';
import processIcon from '@assets/process.svg';
import siteIcon from '@assets/site.svg';
import skupperIcon from '@assets/skupper.svg';
import { GraphIconsMap } from '@sk-types/Graph.interfaces';

import { behaviors } from './behaviours';
import { defaultConfigElements } from './components/CustomElements';

export const graphIconsMap: GraphIconsMap = {
  component: componentIcon,
  process: processIcon,
  site: siteIcon,
  podman: podmanIcon,
  kubernetes: kubernetesIcon,
  skupper: skupperIcon
};

export const DEFAULT_GRAPH_CONFIG: GraphOptions = {
  behaviors,
  autoResize: false,
  animation: false,
  padding: 15,
  ...defaultConfigElements
};
