import { BehaviorOptions, IPointerEvent } from '@antv/g6';

import { GraphElementStates } from './Graph.enum';

const CLICK_SELECT_BEHAVIOR = {
  key: 'click-select',
  type: 'click-select',
  degree: 1,
  state: GraphElementStates.Select,
  neighborState: GraphElementStates.HoverNode,
  unselectedState: '',
  enable: ({ targetType }: IPointerEvent) => targetType === 'node' || targetType === 'edge'
};

const HOVER_ACTIVATE_BEHAVIOR = {
  HOVER_DEGREE_0_NODE: {
    // state for the node/edge with state hover
    key: 'hover-activate-single-node',
    type: 'hover-activate',
    degree: 0,
    state: GraphElementStates.HoverNode,
    enable: ({ targetType }: IPointerEvent) => targetType === 'node'
  },

  HOVER_DEGREE_1_NODE: {
    // state for the rest of the nodes
    key: 'hover-activate',
    type: 'hover-activate',
    degree: 1,
    state: GraphElementStates.Visible,
    inactiveState: GraphElementStates.Hidden,
    enable: ({ targetType }: IPointerEvent) => targetType === 'node'
  },

  HOVER_DEGREE_0_EDGE: {
    // state for the node/edge with state hover
    key: 'hover-activate-single-edge',
    type: 'hover-activate',
    degree: 0,
    state: GraphElementStates.HoverEdge,
    enable: ({ targetType }: IPointerEvent) => targetType === 'edge'
  }
};

export const behaviors: BehaviorOptions = [
  'drag-canvas',
  'zoom-canvas',
  'drag-element',
  CLICK_SELECT_BEHAVIOR,
  HOVER_ACTIVATE_BEHAVIOR.HOVER_DEGREE_0_NODE,
  HOVER_ACTIVATE_BEHAVIOR.HOVER_DEGREE_0_EDGE,
  HOVER_ACTIVATE_BEHAVIOR.HOVER_DEGREE_1_NODE
];
