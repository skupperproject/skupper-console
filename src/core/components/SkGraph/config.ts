import { ComboOptions, CustomBehaviorOption, EdgeOptions, GraphOptions, NodeOptions } from '@antv/g6';

import { behaviors } from './behaviours';
import { GraphLabels } from './enum';
import componentIcon from '../../../assets/component.svg';
import connectorIcon from '../../../assets/connector.svg';
import kubernetesIcon from '../../../assets/kubernetes.svg';
import listenrIcon from '../../../assets/listener.svg';
import podmanIcon from '../../../assets/podman.svg';
import processIcon from '../../../assets/process.svg';
import routingKeyIcon from '../../../assets/routingkey.svg';
import siteIcon from '../../../assets/site.svg';
import skupperIcon from '../../../assets/skupper.svg';
import { hexColors, styles } from '../../../config/styles';
import { GraphIconsMap } from '../../../types/Graph.interfaces';

export const theme = {
  colors: {
    comboBackgroundDefault: 'transparent',
    comboBorderDefault: hexColors.Black300,
    comboLabelBackgroundDefault: styles.default.darkBackgroundColor,
    comboLabelDefault: styles.default.lightTextColor,
    edgeBadgeBackground: styles.default.darkBackgroundColor,
    edgeBadgeText: styles.default.lightTextColor,
    edgeBorder: hexColors.Black300,
    edgeLabelBackground: styles.default.lightBackgroundColor,
    edgeLabelText: styles.default.darkTextColor,
    edgeLine: styles.default.darkBackgroundColor,
    edgeLineDown: styles.default.errorColor,
    edgeLinePartialDown: styles.default.warningColor,
    edgeSelectLine: styles.default.infoColor,
    edgeTerminal: styles.default.darkBackgroundColor,
    nodeBackground: styles.default.lightBackgroundColor,
    nodeBadgeBackground: styles.default.darkBackgroundColor,
    nodeBadgeText: styles.default.lightTextColor,
    nodeBorder: hexColors.Black300,
    nodeHighlightBorder: styles.default.infoColor,
    nodeLabelBackground: styles.default.lightBackgroundColor,
    nodeLabelText: styles.default.darkTextColor,
    nodeSelectBorder: styles.default.infoColor
  },
  graph: {
    borderWidth: styles.default.borderWidth,
    borderRadius: styles.default.borderRadius,
    borderColor: hexColors.Black300
  },
  node: {
    size: 44,
    iconSize: 22, // NODE size / 2
    badgeSize: 22
  },
  edge: {
    badgeFontSize: 6
  },
  font: {
    family: styles.default.fontFamily,
    labelFontSize: 9
  },
  opacity: {
    inactive: 0.35
  },
  padding: {
    edgeBadgeLabel: [2, 6],
    edgeLabel: [1, 4],
    label: [0, 4]
  }
};

const DEFAULT_NODE_CONFIG: NodeOptions = {
  style: {
    opacity: 1,
    lineWidth: 1,
    size: theme.node.size,
    fill: theme.colors.nodeBackground,
    stroke: theme.colors.nodeBorder,
    labelFill: theme.colors.nodeLabelText,
    labelFontFamily: theme.font.family,
    labelFontSize: theme.font.labelFontSize,
    labelBackgroundFill: theme.colors.edgeLabelBackground,
    labelBackgroundStroke: theme.colors.nodeBorder,
    labelBackground: true,
    labelBackgroundShadowColor: theme.colors.nodeBorder,
    labelBackgroundShadowBlur: 0,
    labelBackgroundShadowOffsetX: 0,
    labelBackgroundShadowOffsetY: 4,
    labelOffsetY: 4,
    labelBackgroundLineWidth: 1,
    labelBackgroundRadius: 2,
    labelBackgroundOpacity: 1,
    labelPadding: theme.padding.label,
    icon: true,
    iconWidth: theme.node.iconSize,
    iconHeight: theme.node.iconSize,
    badgeFontSize: theme.font.labelFontSize + 2,
    badgeFill: theme.colors.nodeBadgeText,
    badgeBackgroundFill: theme.colors.nodeBadgeBackground,
    badgeBackgroundStroke: theme.colors.nodeBorder,
    badgeBackgroundLineWidth: 1,
    badgeBackgroundHeight: theme.font.labelFontSize * 2,
    badgeBackgroundWidth: theme.font.labelFontSize * 2,
    shadowColor: theme.colors.nodeBorder,
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 4
  },

  state: {
    [GraphLabels.HoverNode]: {
      cursor: 'pointer',
      opacity: 1,
      stroke: theme.colors.nodeSelectBorder
    },

    [GraphLabels.Visible]: {
      opacity: 1
    },

    [GraphLabels.Select]: {
      cursor: 'pointer',
      lineWidth: 2,
      stroke: theme.colors.nodeSelectBorder,
      labelBackgroundFill: theme.colors.nodeSelectBorder,
      labelBackgroundStroke: theme.colors.nodeSelectBorder,
      labelFill: theme.colors.nodeBackground
    },

    [GraphLabels.HighlightNode]: {
      stroke: theme.colors.nodeHighlightBorder,
      lineWidth: 2
    },

    [GraphLabels.Hidden]: {
      opacity: theme.opacity.inactive
    },

    [GraphLabels.Exclude]: {
      opacity: theme.opacity.inactive
    }
  }
};

// EDGE
const DEFAULT_DATA_EDGE_CONFIG: EdgeOptions = {
  style: {
    visibility: 'visible',
    opacity: 1,
    haloOpacity: 0.2,
    haloStroke: theme.colors.edgeLine,
    lineWidth: 0.5,
    increasedLineWidthForHitTesting: 20,
    stroke: theme.colors.edgeLine,
    endArrow: true,
    endArrowFill: theme.colors.edgeTerminal,
    labelFontFamily: theme.font.family,
    labelBackground: true,
    labelFontSize: theme.font.labelFontSize,
    labelFill: theme.colors.edgeLabelText,
    labelBackgroundFill: theme.colors.edgeLabelBackground,
    labelBackgroundStroke: theme.colors.edgeBorder,
    labelBackgroundLineWidth: 1,
    labelBackgroundRadius: 2,
    labelBackgroundOpacity: 1,
    labelBackgroundFillOpacity: 1,
    labelPlacement: 'center',
    labelPadding: theme.padding.edgeLabel,
    labelAutoRotate: false,
    badgeFontSize: theme.font.labelFontSize,
    badgePadding: theme.padding.edgeBadgeLabel,
    badgeBackgroundFill: theme.colors.edgeBadgeBackground,
    badgeFill: theme.colors.edgeLabelBackground,
    badgeBackgroundStroke: theme.colors.edgeBorder,
    badgeBackgroundLineWidth: 1
  },

  state: {
    [GraphLabels.Hidden]: {
      visibility: 'hidden'
    },

    [GraphLabels.Exclude]: {
      opacity: theme.opacity.inactive
    },

    [GraphLabels.Select]: {
      cursor: 'pointer',
      lineWidth: 2,
      opacity: 1,
      stroke: theme.colors.edgeSelectLine,
      haloStroke: theme.colors.edgeSelectLine
    },

    [GraphLabels.Visible]: {
      opacity: 1
    },

    [GraphLabels.HoverEdge]: {
      cursor: 'pointer',
      lineWidth: 2,
      haloOpacity: 0.35
    }
  }
};

const DEFAULT_COMBO_CONFIG: ComboOptions = {
  style: {
    fillOpacity: 1,
    lineWidth: 2,
    fill: theme.colors.comboBackgroundDefault,
    stroke: theme.colors.comboBorderDefault,
    radius: 10,
    cursor: 'auto',
    labelFill: theme.colors.comboLabelDefault,
    labelFontFamily: theme.font.family,
    labelPadding: [2, 5],
    labelFontSize: theme.font.labelFontSize + 2,
    labelPosition: 'bottom',
    labelBackground: true,
    labelOffsetY: 15,
    labelBackgroundRadius: 2,
    labelBackgroundFill: theme.colors.comboLabelBackgroundDefault,
    labelBackgroundOpacity: 1
  }
};

export const options: Omit<GraphOptions, 'behaviors'> & { behaviors: CustomBehaviorOption[] } = {
  behaviors,
  autoResize: false,
  animation: false,
  padding: 15,
  ...{
    node: DEFAULT_NODE_CONFIG,
    edge: DEFAULT_DATA_EDGE_CONFIG,
    combo: DEFAULT_COMBO_CONFIG
  }
};

export const iconMapper: GraphIconsMap = {
  component: componentIcon,
  process: processIcon,
  site: siteIcon,
  podman: podmanIcon,
  kubernetes: kubernetesIcon,
  skupper: skupperIcon,
  connector: connectorIcon,
  listener: listenrIcon,
  routingKey: routingKeyIcon
};
