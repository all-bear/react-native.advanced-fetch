import { NetInfo } from 'react-native';

let isOnlineStatus = false;

NetInfo.isConnected.addEventListener('change', (isConnected) => {
  isOnlineStatus = isConnected;
});

/**
 * @returns {Promise.<boolean>}
 */
export const isOnline = () => {
  return Promise.resolve(isOnlineStatus);
};

/**
 * @param cb will be called when device become online
 */
export const onOnline = (cb) => {
  NetInfo.isConnected.addEventListener('change', (isConnected) => {
    if (isConnected) {
      cb();
    }
  });
};