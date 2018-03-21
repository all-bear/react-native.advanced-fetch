export const defaults = {
  fetch,
  waitingForConnectionChangeInterval: 100,
  beforeSendDelayedRequest: null,
  onProcessedDelayedRequest: null,
  delayedRequestLifetime: Infinity,
  onExceededDelayedRequestLifetime: null,
  startDelayedRequestWorker: false,
  onOnlineOfflineStatusChange: null,
};

let settings = {
  ...defaults,
};

/**
 * Apply new settings
 *
 * @param {Object} newSettings
 */
export function setSettings(newSettings) {
  settings = {
    ...settings,
    ...newSettings,
  };
}

/**
 *  Get current settings
 *
 * @return {Object}
 */
export function getSettings() {
  return settings;
}
