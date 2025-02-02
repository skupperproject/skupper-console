import { CHART_CONFIG } from './SkChartArea.constants';
import { skAxisXY } from '../../../types/SkChartArea.interfaces';

/**
 * Calculates tick density based on chart width
 */
const calculateTickDensity = (width: number, baseDensity: number = CHART_CONFIG.TICKS.BASE_DENSITY): number => {
  // Smaller charts get fewer ticks, wider charts get more
  const widthFactor = Math.log(width) / 4; // Logarithmic scaling
  const adjustedDensity = Math.max(
    CHART_CONFIG.TICKS.MIN_COUNT,
    Math.min(CHART_CONFIG.TICKS.MAX_COUNT, baseDensity * widthFactor)
  );

  return adjustedDensity;
};

/**
 * Calculates dynamic left padding based on formatted Y values
 */
const getChartDynamicPaddingLeft = (data: skAxisXY[][], formatY: (y: number) => string | number): number => {
  if (!data || data.length === 0) {
    return CHART_CONFIG.LAYOUT.DEFAULT_PADDING.left / 2;
  }

  const longestFormattedY = data
    .flat()
    .map((point) => formatY(point.y)?.toString() ?? '')
    .reduce((longest, current) => (current.length > longest.length ? current : longest), '');

  return Math.max(CHART_CONFIG.LAYOUT.DEFAULT_PADDING.left / 2, longestFormattedY.length * 6 + 12);
};

export { calculateTickDensity, getChartDynamicPaddingLeft };
