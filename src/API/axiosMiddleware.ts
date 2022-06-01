import axios from 'axios';

import { CONNECTION_TIMEOUT } from 'config';

import { MSG_TIMEOUT_ERROR } from './REST.constant';
import { FetchWithTimeoutOptions } from './REST.interfaces';

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
    (e) => {
        const error = e;

        if (!error.response) {
            error.message = MSG_TIMEOUT_ERROR;
        }

        if (error.response?.status) {
            const {
                response: { status, statusText },
            } = error;

            error.message = `${status}: ${statusText}`;
            error.httpStatus = status;
        }

        return Promise.reject(error);
    },
);
