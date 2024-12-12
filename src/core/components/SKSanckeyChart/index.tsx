import { FC } from 'react';

import { ResponsiveSankey } from '@nivo/sankey';

import { DEFAULT_SANKEY_CHART_FLOW_VALUE, DEFAULT_SANKEY_CHART_HEIGHT } from './SkSankey.constants';
import SankeyFilter from './SkSankeyFilter';
import { Labels } from '../../../config/labels';
import { styles } from '../../../config/styles';
import { SkSankeyChartLink, SkSankeyChartNode } from '../../../types/SkSankeyChart.interfaces';
import { formatByteRate } from '../../utils/formatBytes';
import SKEmptyData from '../SkEmptyData';

export function addThemeChangeListener(callback: Function) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        callback();
      }
    });
  });

  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  callback();

  return () => observer.disconnect();
}

export function getColors({ nodeColor }: SkSankeyChartNode): string {
  return nodeColor || styles.default.darkBackgroundColor;
}

export function valueFormat(value: number): string {
  return value === DEFAULT_SANKEY_CHART_FLOW_VALUE ? '' : formatByteRate(value);
}

interface SkSankeyChartProps {
  nodes: SkSankeyChartNode[];
  links: SkSankeyChartLink[];
}

const SkSankeyChart: FC<{ data: SkSankeyChartProps; onSearch?: Function }> = function ({ data, onSearch }) {
  return (
    <>
      {!!onSearch && <SankeyFilter onSearch={onSearch} />}

      {!data.links.length && (
        <SKEmptyData message={Labels.NoMetricFound} description={Labels.NoMetricFoundDescription} />
      )}

      {!!data.links.length && (
        <div style={{ height: DEFAULT_SANKEY_CHART_HEIGHT }}>
          <ResponsiveSankey
            data={data}
            margin={{ top: 10, right: 0, bottom: 10, left: 15 }}
            layout="horizontal"
            align="justify"
            nodeOpacity={0.6}
            nodeHoverOpacity={1}
            nodeHoverOthersOpacity={0.6}
            nodeThickness={15}
            nodeSpacing={24}
            nodeBorderWidth={0}
            animate={true}
            linkBlendMode="normal"
            linkOpacity={0.75}
            linkHoverOpacity={0.6}
            linkHoverOthersOpacity={0.3}
            linkContract={0}
            enableLinkGradient={true}
            labelPosition="inside"
            labelOrientation="horizontal"
            labelPadding={16}
            theme={{
              text: {
                fontSize: 14,
                fontFamily: styles.default.fontFamily
              },
              tooltip: { container: { color: styles.default.darkTextColor } }
            }}
            labelTextColor={styles.default.darkTextColor}
            valueFormat={valueFormat}
            colors={getColors}
          />
        </div>
      )}
    </>
  );
};

export default SkSankeyChart;
