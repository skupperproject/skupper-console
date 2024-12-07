import axios, { AxiosError } from 'axios';

import { mapQueryFiltersToQueryParams, responsePropNameMapper } from './REST.utils';
import { MSG_TIMEOUT_ERROR } from '../config/config';
import { FetchWithOptions, HTTPError, QueryFilters, ResponseWrapper } from '../types/REST.interfaces';

function handleStatusError(e: AxiosError) {
  const error: HTTPError = { ...e };

  if (!e.response) {
    error.message = e.message || MSG_TIMEOUT_ERROR;
  }

  if (error.response?.status) {
    const {
      response: { status, statusText }
    } = error;

    error.message = `${status}: ${statusText}`;
    error.httpStatus = status.toString();
  }

  return Promise.reject(error);
}

axios.interceptors.response.use(
  (config) => config,
  (e) => handleStatusError(e)
);

export async function axiosFetch<T = unknown>(url: string, options: FetchWithOptions = {}): Promise<T> {
  const response = await axios(url, {
    ...options,
    paramsSerializer: {
      indexes: null // serialize arrays as &samekey=value1&samekey=value2
    }
  });

  return response.data;
}

/**
 * Maps the data in the response object based on the provided field mapping.
 * This function checks if `response.results` exists and is not empty.
 * If `results` is empty or does not exist, it returns the original response unchanged.
 * Otherwise, it maps the data in the `results` array by transforming each object's
 * keys according to the `fieldMapping`. If a key in the object matches a key in
 * `fieldMapping`, it gets replaced with the mapped value from the `fieldMapping`.
 * Otherwise, the original key is retained.
 */
function mapResponseData<T>(results: T, fieldMapping: Record<string, string>): T {
  // Check if results is an array
  if (Array.isArray(results)) {
    return results.map((item) => {
      const mappedItem: Record<string, keyof T> = {};
      for (const key in item) {
        if (Object.hasOwn(item, key)) {
          const mappedKey = fieldMapping[key] || key;
          mappedItem[mappedKey] = item[key];
        }
      }

      return mappedItem;
    }) as T;
  }

  // If results is a single object (not an array), map it directly
  const mappedItem: Record<string, keyof T> = {}; // Mapping single object fields
  for (const key in results) {
    if (Object.hasOwn(results as Record<string, keyof T>, key)) {
      const mappedKey = fieldMapping[key] || key;
      mappedItem[mappedKey] = results[key] as any;
    }
  }

  return mappedItem as T;
}

export const fetchWithParams = async <T>(
  path: string,
  options?: QueryFilters,
  fieldMapping: Record<string, string> = responsePropNameMapper
): Promise<ResponseWrapper<T>> => {
  const params = options ? mapQueryFiltersToQueryParams(options) : null;
  const data = await axiosFetch<ResponseWrapper<T>>(path, { params });

  return { ...data, results: mapResponseData<T>(data.results, fieldMapping) };
};
