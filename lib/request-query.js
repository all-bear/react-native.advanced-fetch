import {AsyncStorage} from 'react-native';
import Request from './request';

const STORAGE_KEY = '@AdvancedFetch:query';

/**
 * @param {String} json
 * @return {Object}
 */
const decode = (json) => {
  if (!json) {
    return [];
  }

  return JSON.parse(json).map((data) => Request.fromJSON(data));
};

/**
 * @param {Object} query
 * @return {String}
 */
const encode = (query) => {
  return JSON.stringify(query);
};

/**
 * @param {Object} query
 * @return {Promise.<boolean>}
 */
const save = (query) => {
  return AsyncStorage.setItem(STORAGE_KEY, encode(query));
};

/**
 * @param {boolean} withClear, clear query after load items
 * @return {Promise.<Request[]>}
 */
export const load = (withClear = false) => {
  return AsyncStorage.getItem(STORAGE_KEY)
    .then((json) => {
      return decode(json);
    })
    .then((query) => {
      if (!withClear) {
        return query;
      }

      return save([]).then(() => query);
    });
};

/**
 * @param {Request} request
 * @return {Promise.<boolean>}
 */
export const add = (request) => {
  return load().then((query) => {
      return query.concat([request]);
    }).then((query) => {
      return save(query);
    });
};
