import { formatToDecimalPlacesIfCents } from './formatToDecimalPlacesIfCents';

/**
 * Formats a number as a percentage of a total, removing cents.
 */
export function convertToPercentage(value: number, total: number) {
  const percentage = (value / total) * 100;

  if (isNaN(percentage)) {
    return null;
  }

  return `${formatToDecimalPlacesIfCents(percentage, 0)}%`;
}
