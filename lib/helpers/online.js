import { NetInfo } from 'react-native';

/**
 * @returns {Promise.<boolean>}
 */
export const isOnline = () => {
  return NetInfo.getConnectionInfo().then((connectionInfo) => {
    return connectionInfo.type === 'online';
  });
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