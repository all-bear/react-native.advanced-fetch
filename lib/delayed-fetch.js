import AbstractError from './models/AbstractError';
import {isOnline, onOnline} from './helpers/online';
import Request from './request';
import * as RequestQuery from './request-query';
import {getSettings} from './helpers/settings';

/**
 * Get fetch instance
 *
 * @return {Function} fetch
 */
const getFetch = () => {
  return getSettings().fetch;
};

/**
 * Error to indicate is request is delayed
 */
export class DelayedRequestError extends AbstractError { };

/**
 *
 * @param {String} url
 * @param {Object} params
 * @param {Object} meta
 * @return {Promise.<object, boolean>} will be resolved with response on success,
 * will be rejected with DelayedRequestError if request is delayed,
 * will be rejected with Error on fetch error
 */
export const delayedFetch = (url, params, meta = {createdAt: Date.now()}) => {
  const request = new Request(url, params, meta);

  return isOnline().then((status) => {
    if (!status) {
      return RequestQuery.add(request).then(() => {
        throw new DelayedRequestError('Request was delayed because of offline connection status');
      });
    }
  }).then(() => {
    return getFetch()(url, params);
  });
};

/**
 * Process delayed requests
 */
const processDelayedFetchQuery = () => {
  const {
    onProcessedDelayedRequest,
    delayedRequestLifetime,
    onExceededDelayedRequestLifetime,
    beforeSendDelayedRequest,
  } = getSettings();

  RequestQuery.load(true)
    .then((requests) => {
      requests.forEach((request) => {
        if (Date.now() > request.meta.createdAt + delayedRequestLifetime) {
          if (onExceededDelayedRequestLifetime) {
            onExceededDelayedRequestLifetime(request);
          }

          return;
        }

        if (beforeSendDelayedRequest) {
          request = beforeSendDelayedRequest(request);
        }

        if (!request) {
          return;
        }

        delayedFetch(request.url, request.params)
          .then((response) => {
            if (onProcessedDelayedRequest) {
              onProcessedDelayedRequest(request);
            }

            return response;
          });
      });
    });
};

/**
 * Run delayed request when device becomes online
 */
const initDelayedFetchWorker = () => {
  onOnline(() => {
    processDelayedFetchQuery();
  });
};

/**
 * Init background processes, like process delayed requests, etc
 */
export const init = () => {
  initDelayedFetchWorker();
};
