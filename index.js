import { setSettings } from './lib/helpers/settings'

export { versionCachedFetch, cachedFetch, NoCacheForRequestError } from './lib/cached-fetch';
export { delayedFetch, DelayedRequestError, init as initDelayedFetch } from './lib/delayed-fetch';

export const init = (settings = {}) => {
  setSettings(settings);

  initDelayedFetch();
};