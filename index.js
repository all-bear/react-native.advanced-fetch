import { versionCachedFetch, cachedFetch, NoCacheForRequestError } from 'lib/cached-fetch';
import { delayedFetch, DelayedRequestError } from 'lib/delayed-fetch';

import { init as initDelayedFetch } from 'lib/delayed-fetch'

export default {
  versionCachedFetch,
  cachedFetch,
  NoCacheForRequestError,
  delayedFetch,
  DelayedRequestError,
  init: (params) => {
    initDelayedFetch(params);
  }
};