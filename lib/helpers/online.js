import {NetInfo} from 'react-native';
import {getSettings} from './settings';

let isOnlineStatus = false;
let isInitialized = false;

NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => {
  isInitialized = true;
  isOnlineStatus = isConnected;
});

/**
 * @return {Promise.<boolean>}
 */
export const isOnline = () => {
  if (isInitialized) {
    return Promise.resolve(isOnlineStatus);
  }

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (!isInitialized) {
        return;
      }

      clearInterval(interval);
      resolve(isOnlineStatus);
    }, getSettings().waitingForConnectionChangeInterval);
  });
};

/**
 * @param {Function} cb will be called when device becomes online
 */
export const onOnline = (cb) => {
  NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => {
    if (isConnected) {
      cb();
    }
  });
};
