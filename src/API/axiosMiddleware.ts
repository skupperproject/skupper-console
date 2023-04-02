import axios, { AxiosError, AxiosResponse } from 'axios';

import { FetchWithTimeoutOptions, HTTPError } from './REST.interfaces';
import { MSG_TIMEOUT_ERROR } from '../config/config';

function handleStatusError(e: AxiosError) {
  const error: HTTPError = { ...e };

  if (!e.response) {
    error.message = MSG_TIMEOUT_ERROR;
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

export async function axiosFetch(url: string, options: FetchWithTimeoutOptions = {}): Promise<AxiosResponse> {
  const response = await axios(url, {
    ...options
  });

  return response;
}

axios.interceptors.response.use(
  (config) => config,
  (e) => handleStatusError(e)
);
