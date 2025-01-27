import axios, { AxiosError, AxiosRequestConfig } from 'axios';

import { mapResponseProperties, mapFiltersToRequestQueryParams } from './REST.utils';
import { MSG_TIMEOUT_ERROR } from '../config/api';
import { QueryFilters, ApiResponse } from '../types/REST.interfaces';

/**
 * Fetches data from the API with support for query parameters and field mapping.
 * Maps the `results` field of the response using the provided field mapping.
 */
export const fetchApiDataWithMapper = async <T>(url: string, options?: QueryFilters): Promise<ApiResponse<T>> => {
  const params = options ? mapFiltersToRequestQueryParams(mapResponseProperties(options, 'toBackend')) : null;
  const data = await fetchApiData<ApiResponse<T>>(url, { params });

  return { ...data, results: mapResponseProperties(data.results, 'toFrontend') };
};

/**
 * Fetches data from the API using the provided URL and options, returning the raw response.
 * Supports parameter serialization for complex query structures.
 */
export async function fetchApiData<T = unknown>(url: string, options: AxiosRequestConfig = {}): Promise<T> {
  const response = await axios(url, {
    ...options,
    paramsSerializer: {
      indexes: null // serialize arrays as &samekey=value1&samekey=value2
    }
  });

  return response.data;
}

// Configure Axios instance with interceptors
axios.interceptors.response.use(
  (config) => config,
  (e) => handleAxiosError(e)
);

/**
 * Handles HTTP errors by mapping them to a consistent structure.
 * Adds meaningful messages for timeout or server errors.
 */

function handleAxiosError(e: AxiosError) {
  const error = { ...e } as AxiosError & { httpStatus?: string };

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
