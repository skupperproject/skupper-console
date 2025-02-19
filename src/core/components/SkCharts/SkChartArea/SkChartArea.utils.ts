import { CHART_CONFIG } from './SkChartArea.constants';
import { styles } from '../../../../config/styles';
import { skAxisXY } from '../../../../types/SkCharts';

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

// Create a single canvas element for text measurement (outside the function scope for reuse).
const textMeasuringCanvas = document.createElement('canvas');
const textMeasuringContext = textMeasuringCanvas.getContext('2d');

// Create a hidden container element to hold temporary elements (outside the function scope for reuse).
const hiddenContainer = document.createElement('div');
hiddenContainer.style.position = 'absolute';
hiddenContainer.style.top = '-9999px';
hiddenContainer.style.left = '-9999px';
document.body.appendChild(hiddenContainer);

/**
 * Measures the width of a given text string using a specified font.
 */
const measureTextWidth = (text: string, font: string): number => {
  if (!textMeasuringContext) {
    return 0; // Handle the case where the canvas context is not supported.
  }
  textMeasuringContext.font = font;

  return textMeasuringContext.measureText(text).width;
};

/**
 * Finds the longest string in an array of strings.
 */
const findLongestString = (strings: string[]): string =>
  strings.reduce((longest, current) => (current.length > longest.length ? current : longest), '');

/**
 * Creates a temporary DOM element with the specified font styles.
 */
const createTemporaryElement = (): HTMLElement => {
  const tempElement = document.createElement('span');
  tempElement.style.fontSize = styles.default.fontSize.value;
  tempElement.style.fontFamily = styles.default.fontFamily;

  return tempElement;
};

/**
 * Gets the computed font style from a DOM element.
 */
const getComputedFont = (element: HTMLElement): string => {
  hiddenContainer.appendChild(element); // Add to hidden container for styling
  const font = getComputedStyle(element).font;
  hiddenContainer.removeChild(element); // Remove after getting the style

  return font;
};

// Cache the computed font style for performance (assuming font doesn't change frequently).
let cachedFont: string | null = null;

/**
 * Calculates the dynamic left padding for the chart.
 * @param {skAxisXY[][]} data - The chart data.
 * @param {function} formatY - The function to format the Y-axis labels.
 * @returns {number} The calculated left padding in pixels.
 */
const getChartDynamicPaddingLeft = (data: skAxisXY[][], formatY: (y: number) => string | number): number => {
  // If the font is not cached, create a temporary element and get the computed font style.
  if (cachedFont === null) {
    const tempElement = createTemporaryElement();
    cachedFont = getComputedFont(tempElement);
  }

  // Use default padding if there is no data.
  if (!data || data.length === 0) {
    return CHART_CONFIG.LAYOUT.DEFAULT_PADDING.left / 2;
  }

  // Format the Y-axis values and find the longest label.
  const formattedYValues = data.flat().map((point) => formatY(point.y)?.toString() ?? '');
  const longestFormattedY = findLongestString(formattedYValues);

  // Measure the width of the longest label using the cached font.
  const textWidth = measureTextWidth(longestFormattedY, cachedFont!); // cachedFont is never null here

  // Add minimum padding and margin for visual clarity (increased to compensate for potential SVG rendering differences).
  const minPadding = 18;
  const minMargin = 18;

  // Calculate the final padding value, ensuring it's at least the default padding.
  return Math.max(CHART_CONFIG.LAYOUT.DEFAULT_PADDING.left / 2, textWidth + minPadding + minMargin);
};

export { calculateTickDensity, getChartDynamicPaddingLeft };
