import {NetInfo} from 'react-native';
import {getSettings} from './settings';

let isOnlineStatus = false;
let isInitialized = false;

/**
 * @param {Function} cb will be called when device online/offline status change
 */
export const onStatusChange = (cb) => {
  if (getSettings().onOnlineOfflineStatusChange) {
    getSettings().onOnlineOfflineStatusChange(cb);

    return;
  }

  NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => {
    cb(isConnected);
  });
};

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
  onStatusChange((isConnected) => {
    if (isConnected) {
      cb();
    }
  });
};

onStatusChange((isConnected) => {
  isInitialized = true;
  isOnlineStatus = isConnected;
});
