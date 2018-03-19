export const defaults = {
  fetch,
  waitingForConnectionChangeInterval: 100,
  onProcessedDelayedRequest: null,
  delayedRequestLifetime: Infinity,
  onExceededDelayedRequestLifetime: null,
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
