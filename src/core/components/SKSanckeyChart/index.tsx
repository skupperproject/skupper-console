import { FC, useEffect, useState } from 'react';

import { ResponsiveSankey } from '@nivo/sankey';

import { VarColors } from '@config/colors';
import { DEFAULT_FONT_VAR } from '@config/config';
import { formatByteRate } from '@core/utils/formatBytes';
import { ThemePreference, getThemePreference } from '@core/utils/isDarkTheme';
import { MetricsLabels } from '@pages/shared/Metrics/Metrics.enum';

import EmptyData from '../EmptyData';

interface ThemesProps {
  labelTextColor: VarColors;
  fontFamily: string;
  fontSize: number;
  tooltip: { container: { color: string } };
}

interface Themes {
  [key: string]: ThemesProps;
}

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

const commonStyle = {
  fontSize: 14,
  fontFamily: DEFAULT_FONT_VAR,
  tooltip: { container: { color: VarColors.Black900 } }
};

const themeStyle: Themes = {
  dark: {
    ...commonStyle,
    labelTextColor: VarColors.White
  },

  light: {
    ...commonStyle,
    labelTextColor: VarColors.Black900
  }
};

export const DEFAULT_SANKEY_CHART_FLOW_VALUE = 0.000001;
const DEFAULT_SANKEY_CHART_HEIGHT = '350px';

const SkSankeyChart: FC<{ data: SkSankeyChartProps }> = function ({ data }) {
  const [theme, setTheme] = useState<ThemesProps | null>(null);

  function handleChangeTheme() {
    if (getThemePreference() === ThemePreference.Dark) {
      setTheme(themeStyle.dark);
    } else {
      setTheme(themeStyle.light);
    }
  }

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          handleChangeTheme();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    handleChangeTheme();

    return () => observer.disconnect();
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
        colors={(node) => node?.nodeColor || VarColors.Black500}
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
        valueFormat={(value) => (value === DEFAULT_SANKEY_CHART_FLOW_VALUE ? '' : formatByteRate(value))}
        theme={{
          fontSize: theme?.fontSize,
          fontFamily: theme?.fontFamily,
          tooltip: theme?.tooltip
        }}
        labelTextColor={theme?.labelTextColor}
      />
    </div>
  );
};

export default SkSankeyChart;
