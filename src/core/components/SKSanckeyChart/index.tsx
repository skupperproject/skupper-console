import { FC } from 'react';

import { ResponsiveSankey } from '@nivo/sankey';

import { formatByteRate } from '@core/utils/formatBytes';
import { VarColors } from 'colors';

interface SkSankeyChartProps {
  nodes: {
    id: string;
    nodeColor?: string;
  }[];

  links: {
    source: string;
    target: string;
    value: number;
  }[];
}

export const DEFAULT_SANKEY_CHART_FLOW_VALUE = 0.000001;
const DEFAULT_SANKEY_CHART_HEIGHT = '350px';

const SkSankeyChart: FC<{ data: SkSankeyChartProps }> = function ({ data }) {
  return (
    <div style={{ height: DEFAULT_SANKEY_CHART_HEIGHT }}>
      <ResponsiveSankey
        data={data}
        margin={{ top: 10, right: 0, bottom: 10, left: 15 }}
        layout="horizontal"
        align="justify"
        colors={(node) => node?.nodeColor || VarColors.Black500}
        nodeOpacity={0.6}
        nodeHoverOpacity={1}
        nodeHoverOthersOpacity={0.6}
        nodeThickness={15}
        nodeSpacing={24}
        nodeBorderWidth={0}
        animate={false}
        nodeBorderRadius={3}
        linkOpacity={0.3}
        linkHoverOpacity={0.6}
        linkHoverOthersOpacity={0.3}
        linkContract={0}
        enableLinkGradient={true}
        labelPosition="inside"
        labelOrientation="horizontal"
        labelPadding={16}
        labelTextColor={'black'}
        valueFormat={(value) => (value === DEFAULT_SANKEY_CHART_FLOW_VALUE ? '' : formatByteRate(value))}
      />
    </div>
  );
};

export default SkSankeyChart;
