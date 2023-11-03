import { VarColors } from '@config/colors';
import { DEFAULT_FONT_VAR } from '@config/config';

import { Themes } from './SkSankeyChart.interfaces';

// Constants
export const DEFAULT_SANKEY_CHART_FLOW_VALUE = 0.000001;
export const DEFAULT_SANKEY_CHART_HEIGHT = '350px';

// Themes
const commonStyle = {
  fontSize: 14,
  fontFamily: DEFAULT_FONT_VAR,
  tooltip: { container: { color: VarColors.Black900 } }
};

export const themeStyle: Themes = {
  dark: {
    ...commonStyle,
    labelTextColor: VarColors.White
  },

  light: {
    ...commonStyle,
    labelTextColor: VarColors.Black900
  }
};

//Filters
export const sankeyMetricOptions = [
  { id: 'none', name: 'Display only relationships' },
  { id: 'byterate', name: 'Compare avg. byterate (last hour)' }
];

export const ServiceClientResourceOptions: { name: string; id: 'client' | 'clientSite' }[] = [
  {
    name: 'Client sites',
    id: 'clientSite'
  },
  {
    name: 'Client processes',
    id: 'client'
  }
];

export const ServiceServerResourceOptions: { name: string; id: 'server' | 'serverSite' }[] = [
  {
    name: 'Server sites',
    id: 'serverSite'
  },
  {
    name: 'Server processes',
    id: 'server'
  }
];
