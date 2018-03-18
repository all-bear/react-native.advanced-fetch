import {AsyncStorage} from 'react-native';
import Request from './request';

const STORAGE_KEY = '@AdvancedFetch:cache';

/**
 * @param {String} json
 * @return {Object}
 */
const decode = (json) => {
  if (!json) {
    return {};
  }

  return Object.entries(JSON.parse(json)).reduce((cache, [key, data]) => {
    cache[key] = Request.fromJSON(data);

    return cache;
  }, {});
};

/**
 * @param {Object} cache
 * @return {String}
 */
const encode = (cache) => {
  return JSON.stringify(cache);
};

/**
 * @param {Object} cache
 * @return {Promise.<boolean>}
 */
const save = (cache) => {
  return AsyncStorage.setItem(STORAGE_KEY, encode(cache));
};

/**
 * @return {Promise.<boolean>}
 */
const load = () => {
  return AsyncStorage.getItem(STORAGE_KEY)
    .then((json) => {
      return decode(json);
    });
};

/**
 * @param {Request} request
 * @return {Promise.<Request>}
 */
export const getByRequest = (request) => {
  return load()
    .then((cache) => {
      return cache[request.id];
    });
};

/**
 * @param {Request} request
 * @return {Promise.<boolean>}
 */
export const add = (request) => {
  return load()
    .then((cache) => {
      cache[request.id] = request;

      return cache;
    })
    .then((cache) => {
      return save(cache)
        .then(() => cache);
    });
};
