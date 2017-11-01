import { NetInfo } from 'react-native';

let isOnlineStatus = false;

NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => {
  isOnlineStatus = isConnected;
});

/**
 * @returns {Promise.<boolean>}
 */
export const isOnline = () => {
  return Promise.resolve(isOnlineStatus);
};

/**
 * @param cb will be called when device becomes online
 */
export const onOnline = (cb) => {
  NetInfo.isConnected.addEventListener('connectionChange', (isConnected) => {
    if (isConnected) {
      cb();
    }
  });
};