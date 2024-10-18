import axios, { AxiosError } from 'axios';

import { MSG_TIMEOUT_ERROR } from '../config/config';
import { FetchWithOptions, HTTPError } from '../types/REST.interfaces';

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

export async function axiosFetch<T = unknown>(url: string, options: FetchWithOptions = {}): Promise<T> {
  const response = await axios(url, {
    ...options,
    paramsSerializer: {
      indexes: null // serialize arrays as &samekey=value1&samekey=value2
    }
  });

  return response.data;
}

axios.interceptors.response.use(
  (config) => config,
  (e) => handleStatusError(e)
);
