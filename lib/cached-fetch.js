import AbstractError from './models/AbstractError';
import {isOnline} from './helpers/online';
import Request from './request';
import * as RequestCache from './request-cache';
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
 * Error to indicate that cached fetch has no available cache for request
 */
export class NoCacheForRequestError extends AbstractError {}

/**
 *
 * Acts the same with cachedFetch,
 * but will request versionUrl before
 * and the version will be same with saved cache,
 * will no request url and will take response directly from cache
 *
 * @param {String} url
 * @param {Object} params
 * @param {String} versionUrl
 * @TODO now it works only with json
 * @return {Promise.<object, boolean>} if device status is online will be acts like fetch,
 * if status is offline will be resolved with cached request,
 * if there are no cache for request will be rejected with NoCacheForRequestError
 */
export const versionCachedFetch = (url, params, versionUrl) => {
  const request = new Request(url, params);

  return isOnline().then((status) => {
    if (!status) {
      return RequestCache.getByRequest(request).then((request) => {
        if (!request) {
          throw new NoCacheForRequestError('There are no cache for request');
        }

        return {
          json: () => request.response,
        };
      });
    }

    return getFetch()(versionUrl, params)
      .then((response) => response.json())
      .then((data) => {
        return new Promise((resolve) => {
          RequestCache.getByRequest(request).then((request) => {
            if (request && request.getVersion() === data.version) {
              return resolve({
                json: () => Promise.resolve(request.response),
              });
            }

            return getFetch()(url, params).then((response) => resolve(response));
          }).catch(() => {
            throw new NoCacheForRequestError('There are no cache for request');
          });
        });
      })
      .then((response) => {
        return response.json(); // TODO now it works only with json
      })
      .then((data) => {
        request.setVersion(data.version);
        request.setResponse(data);

        return RequestCache.add(request)
          .then(() => ({
            json: () => Promise.resolve(data), // TODO now it works only with json
          }));
      });
  });
};

/**
 * Wrapper by fetch to provide cached result on internet problems
 *
 * @param {String} url
 * @param {Object} params
 * @TODO now it works only with json
 * @return {Promise.<object, boolean>} if device status is online will be acts like fetch, if status is offline will be resolved with cached request, if there are no cache for request will be rejected with NoCacheForRequestError
 */
export const cachedFetch = (url, params) => {
  const request = new Request(url, params);

  return isOnline()
    .then((status) => {
      if (!status) {
        return RequestCache.getByRequest(request)
          .then((request) => {
            if (!request) {
              throw new NoCacheForRequestError('There are no cache for request');
            }

            return request;
          })
          .then((request) => ({
            json: () => Promise.resolve(request.response), // TODO now it works only with json
          }))
          .catch(() => {
            throw new NoCacheForRequestError('There are no cache for request');
          });
      }

      return getFetch()(url, params);
    })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      request.setResponse(data);

      return RequestCache.add(request)
        .then(() => ({
          json: () => Promise.resolve(data), // TODO now it works only with json
        }));
    });
};
