import {
  Circle,
  CircleStyleProps,
  Diamond,
  DiamondStyleProps,
  ExtensionCategory,
  Line,
  LineStyleProps,
  Quadratic,
  QuadraticStyleProps,
  RectCombo,
  RectComboStyleProps,
  register
} from '@antv/g6';

import { SITE_EDGE_CONFIG, COMBO_CONFIG, DATA_EDGE_CONFIG, NODE_CONFIG, REMOTE_NODE_CONFIG } from './Graph.constants';

class SkNode extends Circle {
  render(attrs: Required<CircleStyleProps>) {
    super.render({ ...attrs, ...NODE_CONFIG });
  }
}

class SkNodeUnexposed extends Diamond {
  render(attrs: Required<DiamondStyleProps>) {
    super.render({ ...attrs, ...NODE_CONFIG });
  }
}

class SkNodeRemote extends Circle {
  render(attrs: Required<DiamondStyleProps>) {
    super.render({ ...attrs, ...(REMOTE_NODE_CONFIG.style as DiamondStyleProps) });
  }
}

class SkDataEdge extends Line {
  render(attrs: Required<LineStyleProps>) {
    super.render({ ...attrs, ...DATA_EDGE_CONFIG });
  }
}

class SkSiteEdge extends Line {
  render(attrs: Required<LineStyleProps>) {
    super.render({ ...attrs, ...(SITE_EDGE_CONFIG.style as LineStyleProps) });
  }
}

class SkSiteDataEdge extends Quadratic {
  render(attrs: Required<QuadraticStyleProps>) {
    super.render({ ...attrs, ...DATA_EDGE_CONFIG });
  }
}

class SkLoopEdge extends Line {
  render(attrs: Required<LineStyleProps>) {
    super.render({ ...attrs, ...DATA_EDGE_CONFIG, loop: true });
  }
}

class SkCombo extends RectCombo {
  render(attrs: Required<RectComboStyleProps>) {
    super.render({ ...attrs, ...COMBO_CONFIG });
  }
}

export function registerElements() {
  register(ExtensionCategory.NODE, 'SkNode', SkNode);
  register(ExtensionCategory.NODE, 'SkNodeUnexposed', SkNodeUnexposed);
  register(ExtensionCategory.NODE, 'SkNodeRemote', SkNodeRemote);
  register(ExtensionCategory.EDGE, 'SkDataEdge', SkDataEdge);
  register(ExtensionCategory.EDGE, 'SkSiteEdge', SkSiteEdge);
  register(ExtensionCategory.EDGE, 'SkSiteDataEdge', SkSiteDataEdge);
  register(ExtensionCategory.EDGE, 'SkLoopEdge', SkLoopEdge);
  register(ExtensionCategory.COMBO, 'SkCombo', SkCombo);
}
