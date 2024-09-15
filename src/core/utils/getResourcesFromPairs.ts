import { removeDuplicatesFromArrayOfObjects } from './removeDuplicatesFromArrayOfObjects';

/**
 * Maps an array of data to filter options for metrics. Each item is mapped to an object with a destination name (from the key)
 * and optionally a parent name (from the parentKey). The parent name is used to link related filters, e.g., showing only child
 * items (like processes) associated with a selected parent item (like a site).
 */
export function mapDataToMetricFilterOptions<T>(data: T[], key: keyof T, siteKey?: keyof T) {
  return mapAndDeduplicate(data, (item) => ({
    destinationName: item[key] as string,
    siteName: siteKey && (item[siteKey] as string)
  }));
}

type MappingFunction<T, U> = (item: T) => U;

const mapAndDeduplicate = <T, U>(data: T[], mapFn: MappingFunction<T, U>) => {
  const mappedData = data.map(mapFn);

  return removeDuplicatesFromArrayOfObjects<U>(mappedData);
};
