import { isOnline, onOnline } from './helpers/online';
import { NetInfo } from 'react-native';
import Request from './request';
import * as RequestQuery from './request-query';

const DEFAULT_INIT_PARAMS = {
  onProcessedDelayedRequest: null
};

/**
 * Error to indicate is request is delayed
 */
export class DelayedRequestError extends Error {}

/**
 *
 * @param url
 * @param params
 * @returns {Promise.<object, boolean>} will be resolved with response on success, will be rejected with DelayedRequestError if request is delayed, will be rejected with Error on fetch error
 */
export const delayedFetch = (url, params) => {
  const request = new Request(url, params);

  return isOnline().then((status) => {
    if (!status) {
      return RequestQuery.add(request).then(() => {
        throw new DelayedRequestError('Request was delayed because of offline connection status');
      });
    }
  }).then(() => {
    return fetch(url, params);
  });
};

/**
 * Process delayed requests
 * @param successCb
 */
const processDelayedFetchQuery = (successCb) => {
  RequestQuery.load(true)
    .then((requests) => {
      requests.forEach((request) => {
        delayedFetch(request.url, request.params)
          .then((response) => {
            if (successCb) {
              successCb(request);
            }

            return response;
          });
      });
    });
};

/**
 * Run delayed request when device becomes online
 * @param successCb
 */
const initDelayedFetchWorker = (successCb) => {
  onOnline(() => {
    processDelayedFetchQuery(successCb);
  });
};

/**
 * Init background processes, like process delayed requests, etc
 * @param params, for example:
 * {
 *  onProcessedDelayedRequest: cb, which will be called, when some delayed request is processed
 * }
 */
export const init = (params) => {
  const options = Object.assign({}, DEFAULT_INIT_PARAMS, params);

  initDelayedFetchWorker(options.onProcessedDelayedRequest);
};