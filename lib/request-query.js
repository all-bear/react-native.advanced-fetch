import { AsyncStorage } from 'react-native';
import Request from './request';

const STORAGE_KEY = '@AdvancedFetch:query';

const decode = (json) => {
  if (!json) {
    return [];
  }

  return JSON.parse(json).map((data) => Request.fromJSON(data));
};

const encode = (query) => {
  return JSON.stringify(query);
};

const save = (query) => {
  return AsyncStorage.setItem(STORAGE_KEY, encode(query));
};

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

export const add = (request) => {
  return load().then((query) => {
      return query.concat([request]);
    }).then((query) => {
      return save(query);
    });
};