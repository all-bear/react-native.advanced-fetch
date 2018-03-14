export const defaults = {
  fetch,
  waitingForConnectionChangeInterval: 100,
  onProcessedDelayedRequest: null,
};

let settings = {
  ...defaults
};

/**
 * Apply new settings
 *
 * @param newSettings
 */
export function setSettings(newSettings) {
  settings = {
    ...settings,
    ...newSettings
  }
}

/**
 *  Get current settings
 *
 * @returns {{}}
 */
export function getSettings() {
  return settings;
}