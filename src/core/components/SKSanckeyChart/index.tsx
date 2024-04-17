import { FC, useEffect, useState } from 'react';

import { ResponsiveSankey } from '@nivo/sankey';

import { VarColors } from '@config/colors';
import { formatByteRate } from '@core/utils/formatBytes';
import { ThemePreference, getThemePreference } from '@core/utils/isDarkTheme';
import { MetricsLabels } from '@pages/shared/Metrics/Metrics.enum';

import { DEFAULT_SANKEY_CHART_FLOW_VALUE, DEFAULT_SANKEY_CHART_HEIGHT, themeStyle } from './SkSankey.constants';
import { SkSankeyChartNode, SkSankeyChartProps, ThemesProps } from './SkSankeyChart.interfaces';
import EmptyData from '../EmptyData';

/**
 * Returns the theme to be used for the chart.
 * @returns The theme to be used for the chart.
 */
export function getTheme() {
  const selectedTheme = getThemePreference() === ThemePreference.Dark ? themeStyle.dark : themeStyle.light;

  return selectedTheme;
}

/**
 * Adds a listener for changes to the theme class on the document element.
 * @param callback - The function to be called when the theme class changes.
 * @returns A function to disconnect the observer.
 */
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

/**
 * Returns the color of a node in the SkSankeyChart.
 * If the node has a specific color defined, it returns that color.
 * Otherwise, it returns the default color VarColors.Black500.
 * @param nodeColor - The color defined for the node (optional).
 * @returns The color of the node.
 */
export function getColors({ nodeColor }: SkSankeyChartNode): string {
  return nodeColor || VarColors.Black500;
}

/**
 * Formats the given value as a string, using the `formatByteRate` function if the value is not equal to the default flow value.
 * @param value The value to format.
 * @returns The formatted value as a string.
 */
export function valueFormat(value: number): string {
  return value === DEFAULT_SANKEY_CHART_FLOW_VALUE ? '' : formatByteRate(value);
}

/**
 * A Sankey chart component that displays data in a flow diagram format.
 * @param data The data to be displayed in the chart.
 * @returns A React component that displays the Sankey chart.
 */
const SkSankeyChart: FC<{ data: SkSankeyChartProps }> = function ({ data }) {
  const [theme, setTheme] = useState<ThemesProps | null>(null);

  useEffect(() => {
    // Add a listener for theme changes, update the component's theme state when a change is detected
    const cleanup = addThemeChangeListener(() => {
      const selectedTheme = getTheme();
      setTheme(selectedTheme);
    });

    return cleanup;
  }, []);

  if (!data.links.length) {
    return (
      <EmptyData
        message={MetricsLabels.NoMetricFoundTitleMessage}
        description={MetricsLabels.NoMetricFoundDescriptionMessage}
      />
    );
  }

  return (
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
            fontSize: theme?.fontSize,
            fontFamily: theme?.fontFamily
          },
          tooltip: theme?.tooltip
        }}
        labelTextColor={theme?.labelTextColor}
        valueFormat={valueFormat}
        colors={getColors}
      />
    </div>
  );
};

export default SkSankeyChart;
