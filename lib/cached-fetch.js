import { isOnline } from './helpers/online';
import Request from './request';
import * as RequestCache from './request-cache';

/**
 * Error to indicate that cached fetch has no available cache for request
 */
export class NoCacheForRequestError extends Error {}

/**
 *
 * Acts the same with cachedFetch, but will request versionUrl before and the version will be same with saved cache, will no request url and will take response directly from cache
 *
 * @param url
 * @param params
 * @param versionUrl
 * @TODO now it works only with json
 * @returns {Promise.<object, boolean>} if device status is online will be acts like fetch, if status is offline will be resolved with cached request, if there are no cache for request will be rejected with NoCacheForRequestError
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
          json: () => request.response
        };
      });
    }

    return fetch(versionUrl, params)
      .then((response) => response.json())
      .then((data) => {
        return new Promise((resolve) => {
          RequestCache.getByRequest(request).then((request) => {
            if (request && request.getVersion() === data.version) {
              return resolve({
                json: () => Promise.resolve(request.response)
              });
            }

            return fetch(url, params).then((response) => resolve(response));
          }).catch(() => {
            throw new NoCacheForRequestError('There are no cache for request');
          })
        });
      });
  });
};

/**
 * Wrapper by fetch to provide cached result on internet problems
 *
 * @param url
 * @param params
 * @TODO now it works only with json
 * @returns {Promise.<object, boolean>} if device status is online will be acts like fetch, if status is offline will be resolved with cached request, if there are no cache for request will be rejected with NoCacheForRequestError
 */
export const cachedFetch = (url, params) => {
  const request = new Request(url, params);

  return isOnline().then((status) => {
    if (!status) {
      return RequestCache.getByRequest(request).then((request) => ({
        json: () => Promise.resolve(request.response) //TODO now it works only with json
      })).catch(() => {
        throw new NoCacheForRequestError('There are no cache for request');
      });
    }

    return fetch(url, params);
  }).then((responseObj) => {
    return new Promise(resolve => {
      responseObj.json().then(response => {
        request.setResponse(response);

        return RequestCache.add(request)
          .then(() => resolve(responseObj));
      })
    });
  });
};