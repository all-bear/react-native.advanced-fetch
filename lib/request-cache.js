import { AsyncStorage } from 'react-native';
import Request from './request';

const STORAGE_KEY = '@AdvancedFetch:cache';

const decode = (json) => {
  if (!json) {
    return {};
  }

  return Object.entries(JSON.parse(json)).reduce((cache, [key, data]) => {
    cache[key] = new Request(data.url, data.params);

    return cache;
  }, {});
};

const encode = (cache) => {
  return JSON.stringify(cache);
};

const save = (cache) => {
  return AsyncStorage.setItem(STORAGE_KEY, encode(cache));
};

const load = () => {
  return AsyncStorage.getItem(STORAGE_KEY)
    .then((json) => {
      return decode(json);
    });
};

export const getByRequest = (request) => {
  return load()
    .then((cache) => {
      return cache[request.id];
    })
};

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