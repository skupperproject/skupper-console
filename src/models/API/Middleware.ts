import axios from 'axios';

import { CONNECTION_TIMEOUT, MSG_TIMEOUT_ERROR } from './REST.constant';

export async function fetchWithTimeout(url: string, options: any = {}) {
  const { timeout = CONNECTION_TIMEOUT } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await axios(url, { ...options, signal: controller.signal });
  clearTimeout(id);

  return response;
}

axios.interceptors.response.use(
  (config) => config,
  (error) => {
    if (!error.response) {
      error.message = MSG_TIMEOUT_ERROR;
    }

    if (error.response.status) {
      const {
        response: { status, statusText },
      } = error;

      error.message = `${status}: ${statusText}`;
      error.httpStatus = status;
    }

    return Promise.reject(error);
  },
);
