import axios, { AxiosError } from 'axios';

import { CONNECTION_TIMEOUT, MSG_TIMEOUT_ERROR } from 'config';

import { FetchWithTimeoutOptions, HTTPError } from './REST.interfaces';

export function handleStatusError(e: AxiosError) {
    const error: HTTPError = { ...e };

    if (!e.response) {
        error.message = MSG_TIMEOUT_ERROR;
    }

    if (error.response?.status) {
        const {
            response: { status, statusText },
        } = error;

        error.message = `${status}: ${statusText}`;
        error.httpStatus = status.toString();
    }

    return Promise.reject(error);
}

export async function fetchWithTimeout(url: string, options: FetchWithTimeoutOptions = {}) {
    const { timeout = CONNECTION_TIMEOUT } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const response = await axios(url, {
        ...options,
        signal: controller.signal,
    });
    clearTimeout(id);

    return response;
}

axios.interceptors.response.use(
    (config) => config,
    (e) => handleStatusError(e),
);
